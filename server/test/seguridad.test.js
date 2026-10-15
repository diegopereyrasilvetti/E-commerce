import { afterEach, describe, expect, it, vi } from 'vitest'
import { crearRepositoriosEnMemoria } from './repositorio-memoria.js'
import { como, crearApi } from './ayuda.js'

describe('cabeceras y CORS', () => {
  it('Helmet agrega cabeceras de seguridad y no se anuncia el servidor', async () => {
    const res = await crearApi().get('/api/salud')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['strict-transport-security']).toBeDefined()
    expect(res.headers['x-powered-by']).toBeUndefined()
  })

  it('un sitio permitido recibe permiso de CORS', async () => {
    const res = await crearApi().get('/api/salud').set('Origin', 'http://localhost:5173')
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  })

  it('un sitio NO permitido no recibe permiso de CORS', async () => {
    const res = await crearApi().get('/api/salud').set('Origin', 'https://sitio-malo.com')
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('informa el límite de solicitudes restantes', async () => {
    const res = await crearApi().get('/api/salud')
    expect(res.headers.ratelimit).toMatch(/limit=300/)
  })
})

describe('errores', () => {
  afterEach(() => vi.restoreAllMocks())

  it('una ruta que no existe -> 404 con el formato de error de la API', async () => {
    const res = await crearApi().get('/api/lo-que-sea')
    expect(res.status).toBe(404)
    expect(res.body.error.codigo).toBe('RUTA_NO_ENCONTRADA')
  })

  it('un JSON mal formado -> 400', async () => {
    const res = await crearApi().post('/api/productos').set('Content-Type', 'application/json').send('{rot')
    expect(res.status).toBe(400)
    expect(res.body.error.codigo).toBe('JSON_INVALIDO')
  })

  it('un cuerpo demasiado grande -> 413', async () => {
    const res = await crearApi().post('/api/productos').set(como('token-admin')).send({ nombre: 'x'.repeat(20000) })
    expect(res.status).toBe(413)
    expect(res.body.error.codigo).toBe('CUERPO_DEMASIADO_GRANDE')
  })

  it('un fallo interno -> 500 sin mostrar detalles al cliente', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const repositorios = crearRepositoriosEnMemoria()
    repositorios.productos.listar = async () => { throw new Error('clave-secreta-de-la-base-123') }
    const res = await crearApi({ repositorios }).get('/api/productos')
    expect(res.status).toBe(500)
    expect(res.body.error.codigo).toBe('ERROR_INTERNO')
    expect(JSON.stringify(res.body)).not.toContain('clave-secreta')
    expect(console.error).toHaveBeenCalled() // pero sí queda registrado en el servidor
  })

  it('un token con un largo absurdo se rechaza sin consultar a nadie', async () => {
    const res = await crearApi().get('/api/yo').set(como('x'.repeat(5000)))
    expect(res.status).toBe(401)
  })
})

describe('límite de solicitudes', () => {
  it('las escrituras tienen un límite de 60 cada 15 minutos por IP', async () => {
    const api = crearApi()
    const respuestas = []
    for (let i = 0; i < 61; i++) respuestas.push((await api.post('/api/productos').set(como('token-admin')).send({})).status)
    expect(respuestas.slice(0, 60).every((s) => s === 400)).toBe(true) // los primeros 60 llegan hasta la validación
    expect(respuestas[60]).toBe(429)
  })

  it('los pedidos tienen un límite de 20 cada 15 minutos por IP', async () => {
    const api = crearApi()
    const respuestas = []
    for (let i = 0; i < 21; i++) respuestas.push((await api.post('/api/pedidos').set(como('token-cliente')).send({})).status)
    expect(respuestas[19]).toBe(400)
    expect(respuestas[20]).toBe(429)
  })

  it('la respuesta de límite excedido tiene el formato de error de la API', async () => {
    const api = crearApi()
    let ultima
    for (let i = 0; i < 61; i++) ultima = await api.post('/api/productos').set(como('token-admin')).send({})
    expect(ultima.body.error.codigo).toBe('DEMASIADAS_SOLICITUDES')
  })
})
