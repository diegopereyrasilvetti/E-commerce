// Levanta la API con datos en memoria y usuarios falsos (sin Supabase): node test/servidor-de-prueba.js [puerto]
// Tokens de prueba: "token-admin" (rol admin), "token-cliente" y "token-cliente2" (rol cliente).
// Con el tercer argumento "sin-pedidos" los pedidos quedan deshabilitados (como en producción).
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { crearApp } from '../src/app.js'
import { crearRepositoriosEnMemoria } from './repositorio-memoria.js'

const USUARIOS = {
  'token-admin': { id: 'u-admin', email: 'admin@prueba.com', rol: 'admin' },
  'token-cliente': { id: 'u-cliente', email: 'cliente@prueba.com', rol: 'cliente' },
  'token-cliente2': { id: 'u-cliente2', email: 'cliente2@prueba.com', rol: 'cliente' },
}
export const autenticadorDePrueba = { verificar: async (token) => USUARIOS[token] ?? null }

if (fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const puerto = Number(process.argv[2]) || 3001
  crearApp({
    repositorios: crearRepositoriosEnMemoria(),
    autenticador: autenticadorDePrueba,
    corsOrigins: ['http://localhost:5173', 'http://localhost:5199'],
    pedidosHabilitados: process.argv[3] !== 'sin-pedidos',
  }).listen(puerto, () => console.log(`API de prueba (datos en memoria) en http://localhost:${puerto}`))
}
