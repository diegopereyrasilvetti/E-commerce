import { beforeEach, describe, expect, it } from 'vitest'
import { como, crearApi, todosLosProductos } from './ayuda.js'

const NUEVO = {
  nombre: 'Mouse Gamer Logitech G203 RGB',
  precio: 45900,
  precioSinImpuestos: 37934,
  descuento: 10,
  garantia: '12 meses',
  imagen: 'images/Productos/Perifericos/mouse-g203.jpg',
  categoriaId: 'perifericos',
}
const SLUG_NUEVO = 'mouse-gamer-logitech-g203-rgb'

describe('quién es quién: GET /api/yo', () => {
  it('sin token -> 401 SIN_SESION', async () => {
    const res = await crearApi().get('/api/yo')
    expect(res.status).toBe(401)
    expect(res.body.error.codigo).toBe('SIN_SESION')
  })

  it('con un token que no existe -> 401 SESION_INVALIDA', async () => {
    const res = await crearApi().get('/api/yo').set(como('token-inventado'))
    expect(res.status).toBe(401)
    expect(res.body.error.codigo).toBe('SESION_INVALIDA')
  })

  it('la cabecera tiene que ser "Bearer <token>"', async () => {
    const res = await crearApi().get('/api/yo').set('Authorization', 'token-admin')
    expect(res.status).toBe(401)
  })

  it('un cliente y un administrador se identifican con su rol', async () => {
    const api = crearApi()
    expect((await api.get('/api/yo').set(como('token-cliente'))).body.datos).toMatchObject({ rol: 'cliente' })
    expect((await api.get('/api/yo').set(como('token-admin'))).body.datos).toMatchObject({ rol: 'admin' })
  })
})

describe('administración de productos', () => {
  let api
  beforeEach(() => { api = crearApi() })

  describe('quién puede escribir', () => {
    it('sin sesión: 401', async () => {
      expect((await api.post('/api/productos').send(NUEVO)).status).toBe(401)
      expect((await api.patch('/api/productos/x').send({ precio: 1 })).status).toBe(401)
      expect((await api.delete('/api/productos/x')).status).toBe(401)
    })

    it('un cliente: 403 en las tres operaciones', async () => {
      const [producto] = await todosLosProductos(api)
      const cliente = como('token-cliente')
      expect((await api.post('/api/productos').set(cliente).send(NUEVO)).status).toBe(403)
      expect((await api.patch('/api/productos/' + producto.slug).set(cliente).send({ precio: 1 })).status).toBe(403)
      expect((await api.delete('/api/productos/' + producto.slug).set(cliente)).status).toBe(403)
      // y el catálogo sigue igual
      expect((await todosLosProductos(api))[0].precio).toBe(producto.precio)
    })
  })

  describe('crear (POST)', () => {
    it('un administrador crea un producto y queda en el catálogo', async () => {
      const res = await api.post('/api/productos').set(como('token-admin')).send(NUEVO)
      expect(res.status).toBe(201)
      expect(res.headers.location).toBe('/api/productos/' + SLUG_NUEVO)
      expect(res.body.datos).toMatchObject({ slug: SLUG_NUEVO, precio: 45900, categoria: 'Periféricos' })
      expect((await api.get('/api/productos')).body.total).toBe(25)
    })

    it('el mismo nombre dos veces -> 409', async () => {
      await api.post('/api/productos').set(como('token-admin')).send(NUEVO)
      const res = await api.post('/api/productos').set(como('token-admin')).send(NUEVO)
      expect(res.status).toBe(409)
      expect(res.body.error.codigo).toBe('PRODUCTO_DUPLICADO')
    })

    it('categoría inexistente -> 400', async () => {
      const res = await api.post('/api/productos').set(como('token-admin')).send({ ...NUEVO, categoriaId: 'no-existe' })
      expect(res.status).toBe(400)
      expect(res.body.error.codigo).toBe('CATEGORIA_INEXISTENTE')
    })

    it.each([
      ['precio negativo', { precio: -5 }],
      ['precio con decimales', { precio: 10.5 }],
      ['precio como texto', { precio: '100' }],
      ['descuento mayor a 100', { descuento: 150 }],
      ['nombre demasiado corto', { nombre: 'Ab' }],
      ['ruta de imagen que sale de la carpeta (..)', { imagen: 'images/../secreto.jpg' }],
      ['imagen fuera de images/', { imagen: 'http://sitio-malo.com/x.jpg' }],
      ['un campo que no existe (rol)', { rol: 'admin' }],
      ['un campo que no se puede elegir al crear (activo)', { activo: false }],
    ])('rechaza %s con un 400', async (_nombre, cambio) => {
      const res = await api.post('/api/productos').set(como('token-admin')).send({ ...NUEVO, ...cambio })
      expect(res.status).toBe(400)
      expect(res.body.error.codigo).toBe('DATOS_INVALIDOS')
    })

    it('el producto no se crea si los datos son inválidos', async () => {
      await api.post('/api/productos').set(como('token-admin')).send({ ...NUEVO, precio: -5 })
      expect((await api.get('/api/productos')).body.total).toBe(24)
    })
  })

  describe('modificar (PATCH)', () => {
    it('cambia solo los campos enviados', async () => {
      await api.post('/api/productos').set(como('token-admin')).send(NUEVO)
      const res = await api.patch('/api/productos/' + SLUG_NUEVO).set(como('token-admin')).send({ precio: 39900 })
      expect(res.status).toBe(200)
      expect(res.body.datos).toMatchObject({ precio: 39900, nombre: NUEVO.nombre, descuento: 10 })
    })

    it('si se cambia el nombre, el identificador no cambia (los enlaces siguen funcionando)', async () => {
      await api.post('/api/productos').set(como('token-admin')).send(NUEVO)
      const res = await api.patch('/api/productos/' + SLUG_NUEVO).set(como('token-admin')).send({ nombre: 'Mouse Logitech nuevo nombre' })
      expect(res.body.datos.slug).toBe(SLUG_NUEVO)
    })

    it('un cuerpo vacío -> 400', async () => {
      const [producto] = await todosLosProductos(api)
      const res = await api.patch('/api/productos/' + producto.slug).set(como('token-admin')).send({})
      expect(res.status).toBe(400)
    })

    it('un producto que no existe -> 404', async () => {
      const res = await api.patch('/api/productos/no-existe').set(como('token-admin')).send({ precio: 1000 })
      expect(res.status).toBe(404)
    })
  })

  describe('borrar (DELETE)', () => {
    it('lo oculta del catálogo: el público ya no lo ve', async () => {
      await api.post('/api/productos').set(como('token-admin')).send(NUEVO)
      expect((await api.delete('/api/productos/' + SLUG_NUEVO).set(como('token-admin'))).status).toBe(204)
      expect((await api.get('/api/productos/' + SLUG_NUEVO)).status).toBe(404)
      expect((await api.get('/api/productos')).body.total).toBe(24)
    })

    it('borrarlo dos veces -> 404', async () => {
      await api.post('/api/productos').set(como('token-admin')).send(NUEVO)
      await api.delete('/api/productos/' + SLUG_NUEVO).set(como('token-admin'))
      expect((await api.delete('/api/productos/' + SLUG_NUEVO).set(como('token-admin'))).status).toBe(404)
    })
  })
})
