// Ayudas para los tests: una API completa con datos en memoria y usuarios falsos (sin Supabase ni internet).
import request from 'supertest'
import { crearApp } from '../src/app.js'
import { crearRepositoriosEnMemoria } from './repositorio-memoria.js'
import { autenticadorDePrueba } from './servidor-de-prueba.js'

// Cada llamada crea una API nueva con los datos de partida (así un test no afecta a otro)
export function crearApi(opciones = {}) {
  const repositorios = opciones.repositorios ?? crearRepositoriosEnMemoria()
  const app = crearApp({
    repositorios,
    autenticador: autenticadorDePrueba,
    corsOrigins: ['http://localhost:5173'],
    pedidosHabilitados: true,
    ...opciones,
  })
  return request(app)
}

// Cabecera de sesión para un usuario de prueba: 'token-admin', 'token-cliente' o 'token-cliente2'
export const como = (token) => ({ Authorization: `Bearer ${token}` })

// Direcciones de los usuarios de prueba (ver test/repositorio-memoria.js)
export const DIRECCION_CLIENTE = '11111111-1111-4111-8111-111111111111'
export const DIRECCION_CLIENTE2 = '33333333-3333-4333-8333-333333333333'

export async function todosLosProductos(api) {
  return (await api.get('/api/productos?limite=100')).body.datos
}
