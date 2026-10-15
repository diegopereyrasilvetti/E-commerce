import { describe, expect, it } from 'vitest'
import { crearApi, todosLosProductos } from './ayuda.js'

describe('GET /api/salud', () => {
  it('responde que el servidor está andando', async () => {
    const res = await crearApi().get('/api/salud')
    expect(res.status).toBe(200)
    expect(res.body.estado).toBe('ok')
  })
})

describe('GET /api/categorias', () => {
  it('lista las 10 categorías en orden', async () => {
    const res = await crearApi().get('/api/categorias')
    expect(res.status).toBe(200)
    expect(res.body.datos).toHaveLength(10)
    expect(res.body.datos[0]).toEqual({ id: 'procesadores', nombre: 'Procesadores' })
  })
})

describe('GET /api/productos', () => {
  it('devuelve el catálogo con su paginación', async () => {
    const res = await crearApi().get('/api/productos')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ total: 24, pagina: 1, limite: 24, paginas: 1 })
    expect(res.body.datos).toHaveLength(24)
  })

  it('cada producto trae precios numéricos, su categoría y un identificador', async () => {
    const [producto] = await todosLosProductos(crearApi())
    expect(producto).toMatchObject({
      slug: expect.stringMatching(/^[a-z0-9-]+$/),
      nombre: expect.any(String),
      precio: expect.any(Number),
      descuento: expect.any(Number),
      imagen: expect.stringMatching(/^images\//),
      categoriaId: expect.any(String),
      categoria: expect.any(String),
    })
  })

  it('filtra por categoría', async () => {
    const res = await crearApi().get('/api/productos?categoria=mothers')
    expect(res.body.total).toBe(4)
    expect(res.body.datos.every((p) => p.categoriaId === 'mothers')).toBe(true)
  })

  it('ordena por precio, de menor a mayor y de mayor a menor', async () => {
    const api = crearApi()
    const asc = (await api.get('/api/productos?categoria=mothers&orden=precio_asc')).body.datos.map((p) => p.precio)
    const desc = (await api.get('/api/productos?categoria=mothers&orden=precio_desc')).body.datos.map((p) => p.precio)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    expect(desc).toEqual([...desc].sort((a, b) => b - a))
  })

  it('busca por palabras en el nombre (sin importar mayúsculas)', async () => {
    const res = await crearApi().get('/api/productos?q=RYZEN%205')
    expect(res.body.total).toBe(3)
    expect(res.body.datos.every((p) => /ryzen/i.test(p.nombre) && /5/.test(p.nombre))).toBe(true)
  })

  it('una búsqueda sin coincidencias devuelve una lista vacía (no un error)', async () => {
    const res = await crearApi().get('/api/productos?q=zzzzzz')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ datos: [], total: 0, paginas: 1 })
  })

  it('pagina los resultados', async () => {
    const api = crearApi()
    const pagina3 = await api.get('/api/productos?limite=10&pagina=3')
    expect(pagina3.body.datos).toHaveLength(4)
    expect(pagina3.body.paginas).toBe(3)
    const todos = new Set()
    for (const n of [1, 2, 3]) (await api.get(`/api/productos?limite=10&pagina=${n}`)).body.datos.forEach((p) => todos.add(p.slug))
    expect(todos.size).toBe(24) // ningún producto se repite ni se pierde entre páginas
  })

  it.each([
    ['limite=500', 'limite'],
    ['limite=0', 'limite'],
    ['pagina=0', 'pagina'],
    ['orden=barato', 'orden'],
    ['categoria=MOTHERS!', 'categoria'],
  ])('rechaza el parámetro inválido %s con un 400 que indica el campo', async (consulta, campo) => {
    const res = await crearApi().get('/api/productos?' + consulta)
    expect(res.status).toBe(400)
    expect(res.body.error.codigo).toBe('DATOS_INVALIDOS')
    expect(res.body.error.detalles.map((d) => d.campo)).toContain(campo)
  })

  it('los mensajes de validación están en español', async () => {
    const res = await crearApi().get('/api/productos?limite=500')
    expect(res.body.error.detalles[0].mensaje).toMatch(/Demasiado grande/)
  })
})

describe('GET /api/productos/:slug', () => {
  it('devuelve un producto', async () => {
    const api = crearApi()
    const [primero] = await todosLosProductos(api)
    const res = await api.get('/api/productos/' + primero.slug)
    expect(res.status).toBe(200)
    expect(res.body.datos.slug).toBe(primero.slug)
  })

  it('404 si no existe', async () => {
    const res = await crearApi().get('/api/productos/no-existe')
    expect(res.status).toBe(404)
    expect(res.body.error.codigo).toBe('PRODUCTO_NO_ENCONTRADO')
  })

  it('400 si el identificador tiene caracteres raros', async () => {
    const res = await crearApi().get('/api/productos/%3Cscript%3E')
    expect(res.status).toBe(400)
  })
})
