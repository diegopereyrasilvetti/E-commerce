import { beforeEach, describe, expect, it } from 'vitest'
import { DIRECCION_CLIENTE, DIRECCION_CLIENTE2, como, crearApi, todosLosProductos } from './ayuda.js'

describe('pedidos', () => {
  let api, A, B, pedidoBase, subtotal, descuento
  const cliente = como('token-cliente'), cliente2 = como('token-cliente2'), admin = como('token-admin')

  beforeEach(async () => {
    api = crearApi()
    const productos = await todosLosProductos(api)
    ;[A, B] = productos
    pedidoBase = { items: [{ slug: A.slug, cantidad: 2 }, { slug: B.slug, cantidad: 1 }], medioPago: 'tarjeta', cuotas: 12, direccionId: DIRECCION_CLIENTE }
    subtotal = A.precio * 2 + B.precio
    descuento = Math.round((A.precio * 2 * A.descuento) / 100 + (B.precio * B.descuento) / 100)
  })

  const crear = (cuerpo = pedidoBase, quien = cliente) => api.post('/api/pedidos').set(quien).send(cuerpo)

  describe('crear', () => {
    it('sin sesión: 401', async () => {
      expect((await api.post('/api/pedidos').send(pedidoBase)).status).toBe(401)
    })

    it('con tarjeta calcula el subtotal y la cuota con los precios de la base', async () => {
      const res = await crear()
      expect(res.status).toBe(201)
      expect(res.headers.location).toBe('/api/pedidos/' + res.body.datos.id)
      expect(res.body.datos).toMatchObject({
        estado: 'pendiente', medioPago: 'tarjeta', cuotas: 12, subtotal, descuento: 0, total: subtotal, valorCuota: Math.ceil(subtotal / 12),
      })
    })

    it('con transferencia aplica el descuento de cada producto', async () => {
      const res = await crear({ ...pedidoBase, medioPago: 'transferencia', cuotas: 1 })
      expect(res.status).toBe(201)
      expect(res.body.datos).toMatchObject({ descuento, total: subtotal - descuento, cuotas: 1 })
    })

    it('guarda una copia de cada producto (nombre y precio de ese momento)', async () => {
      const { items } = (await crear()).body.datos
      expect(items).toHaveLength(2)
      expect(items[0]).toMatchObject({ nombre: A.nombre, precioUnitario: A.precio, cantidad: 2, subtotal: A.precio * 2 })
    })

    it('guarda una copia de la dirección de envío', async () => {
      const { envio } = (await crear()).body.datos
      expect(envio).toMatchObject({ destinatario: 'Cliente Uno', calle: 'Av. Siempre Viva', numero: '742', ciudad: 'Springfield' })
    })

    it('al cliente no se le muestra el usuarioId', async () => {
      expect((await crear()).body.datos).not.toHaveProperty('usuarioId')
    })
  })

  describe('lo que no se puede confiar del navegador', () => {
    it.each([
      ['un total propio', { total: 1 }],
      ['un precio propio en el pedido', { precioTotal: 1 }],
      ['transferencia en cuotas', { medioPago: 'transferencia', cuotas: 6 }],
      ['cuotas que no se ofrecen', { cuotas: 7 }],
      ['un medio de pago inexistente', { medioPago: 'bitcoin' }],
      ['una dirección con formato inválido', { direccionId: 'no-es-un-uuid' }],
      ['un pedido sin productos', { items: [] }],
      ['más de 50 renglones', { items: Array.from({ length: 51 }, (_, i) => ({ slug: 'p' + i, cantidad: 1 })) }],
    ])('rechaza %s con un 400', async (_nombre, cambio) => {
      const res = await crear({ ...pedidoBase, ...cambio })
      expect(res.status).toBe(400)
    })

    it.each([
      ['cantidad 0', [{ slug: 'x', cantidad: 0 }]],
      ['cantidad 100', [{ slug: 'x', cantidad: 100 }]],
      ['cantidad con decimales', [{ slug: 'x', cantidad: 1.5 }]],
      ['un precio propio dentro de un renglón', [{ slug: 'x', cantidad: 1, precio: 1 }]],
    ])('rechaza un renglón con %s', async (_nombre, items) => {
      const res = await crear({ ...pedidoBase, items })
      expect(res.status).toBe(400)
    })

    it('rechaza productos repetidos', async () => {
      const res = await crear({ ...pedidoBase, items: [{ slug: A.slug, cantidad: 1 }, { slug: A.slug, cantidad: 1 }] })
      expect(res.status).toBe(400)
    })

    it('un producto que no existe -> 400 PRODUCTO_NO_DISPONIBLE', async () => {
      const res = await crear({ ...pedidoBase, items: [{ slug: 'no-existe', cantidad: 1 }] })
      expect(res.status).toBe(400)
      expect(res.body.error.codigo).toBe('PRODUCTO_NO_DISPONIBLE')
    })

    it('un producto que el administrador ocultó ya no se puede comprar', async () => {
      await api.delete('/api/productos/' + A.slug).set(admin)
      expect((await crear()).body.error.codigo).toBe('PRODUCTO_NO_DISPONIBLE')
    })

    it('no se puede usar la dirección de otro usuario (404)', async () => {
      const res = await crear({ ...pedidoBase, direccionId: DIRECCION_CLIENTE2 })
      expect(res.status).toBe(404)
      expect(res.body.error.codigo).toBe('DIRECCION_NO_ENCONTRADA')
    })

    it('el precio sale de la base aunque el catálogo cambie después', async () => {
      const antes = (await crear()).body.datos
      await api.patch('/api/productos/' + A.slug).set(admin).send({ precio: A.precio + 5000 })
      const despues = (await api.get('/api/pedidos/' + antes.id).set(cliente)).body.datos
      expect(despues.items[0].precioUnitario).toBe(A.precio) // el pedido conserva el precio de cuando se compró
      expect((await crear()).body.datos.subtotal).toBe(subtotal + 2 * 5000) // un pedido nuevo usa el precio nuevo
    })
  })

  describe('privacidad entre usuarios', () => {
    it('cada cliente ve solo sus pedidos', async () => {
      await crear()
      await crear({ ...pedidoBase, medioPago: 'transferencia', cuotas: 1 })
      expect((await api.get('/api/pedidos').set(cliente)).body.total).toBe(2)
      expect((await api.get('/api/pedidos').set(cliente2)).body.total).toBe(0)
    })

    it('pedir el pedido de otro responde 404 (no revela que existe)', async () => {
      const { id } = (await crear()).body.datos
      expect((await api.get('/api/pedidos/' + id).set(cliente2)).status).toBe(404)
      expect((await api.get('/api/pedidos/' + id).set(cliente)).status).toBe(200)
    })

    it('el listado de todos los pedidos es solo para administradores', async () => {
      const { id } = (await crear()).body.datos
      expect((await api.get('/api/pedidos?todos=true').set(cliente)).status).toBe(403)
      const res = await api.get('/api/pedidos?todos=true').set(admin)
      expect(res.status).toBe(200)
      expect(res.body.datos.map((p) => p.id)).toContain(id)
      expect(res.body.datos[0]).toHaveProperty('usuarioId') // el administrador sí ve de quién es
    })

    it('un administrador puede ver cualquier pedido', async () => {
      const { id } = (await crear()).body.datos
      expect((await api.get('/api/pedidos/' + id).set(admin)).status).toBe(200)
    })

    it('un id con formato inválido -> 400', async () => {
      expect((await api.get('/api/pedidos/no-es-uuid').set(cliente)).status).toBe(400)
    })

    it('sin sesión no se ve ningún pedido', async () => {
      expect((await api.get('/api/pedidos')).status).toBe(401)
    })
  })

  describe('estados', () => {
    let id
    beforeEach(async () => { id = (await crear()).body.datos.id })

    it('el dueño cancela su pedido mientras esté pendiente', async () => {
      const res = await api.post(`/api/pedidos/${id}/cancelar`).set(cliente)
      expect(res.status).toBe(200)
      expect(res.body.datos.estado).toBe('cancelado')
    })

    it('otro cliente no puede cancelar el pedido (404)', async () => {
      expect((await api.post(`/api/pedidos/${id}/cancelar`).set(cliente2)).status).toBe(404)
    })

    it('un administrador no cancela por el cliente con esa ruta (403)', async () => {
      expect((await api.post(`/api/pedidos/${id}/cancelar`).set(admin)).status).toBe(403)
    })

    it('solo un administrador cambia el estado', async () => {
      expect((await api.patch(`/api/pedidos/${id}/estado`).set(cliente).send({ estado: 'pagado' })).status).toBe(403)
    })

    it('recorre el camino pendiente -> pagado -> enviado -> entregado', async () => {
      for (const estado of ['pagado', 'enviado', 'entregado']) {
        const res = await api.patch(`/api/pedidos/${id}/estado`).set(admin).send({ estado })
        expect(res.status).toBe(200)
        expect(res.body.datos.estado).toBe(estado)
      }
    })

    it('no permite saltear pasos ni volver atrás (409)', async () => {
      const salto = await api.patch(`/api/pedidos/${id}/estado`).set(admin).send({ estado: 'entregado' })
      expect(salto.status).toBe(409)
      expect(salto.body.error.codigo).toBe('TRANSICION_INVALIDA')
      await api.patch(`/api/pedidos/${id}/estado`).set(admin).send({ estado: 'pagado' })
      expect((await api.patch(`/api/pedidos/${id}/estado`).set(admin).send({ estado: 'pendiente' })).status).toBe(409)
    })

    it('un pedido ya pagado no se puede cancelar desde la cuenta del cliente (409)', async () => {
      await api.patch(`/api/pedidos/${id}/estado`).set(admin).send({ estado: 'pagado' })
      expect((await api.post(`/api/pedidos/${id}/cancelar`).set(cliente)).status).toBe(409)
    })

    it('un pedido cancelado no se reabre', async () => {
      await api.post(`/api/pedidos/${id}/cancelar`).set(cliente)
      expect((await api.patch(`/api/pedidos/${id}/estado`).set(admin).send({ estado: 'pagado' })).status).toBe(409)
    })

    it('rechaza un estado que no existe', async () => {
      expect((await api.patch(`/api/pedidos/${id}/estado`).set(admin).send({ estado: 'volando' })).status).toBe(400)
    })
  })

  describe('interruptor de demostración', () => {
    it('con PEDIDOS_HABILITADOS=false la API no acepta pedidos (503)', async () => {
      const apagada = crearApi({ pedidosHabilitados: false })
      const res = await apagada.post('/api/pedidos').set(cliente).send(pedidoBase)
      expect(res.status).toBe(503)
      expect(res.body.error.codigo).toBe('PEDIDOS_DESHABILITADOS')
    })

    it('el resto de la API sigue funcionando', async () => {
      const apagada = crearApi({ pedidosHabilitados: false })
      expect((await apagada.get('/api/productos')).status).toBe(200)
      expect((await apagada.get('/api/pedidos').set(cliente)).status).toBe(200)
    })
  })
})
