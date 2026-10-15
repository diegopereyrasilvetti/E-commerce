// Levanta la API con datos en memoria (sin Supabase): node test/servidor-de-prueba.js [puerto]
import { crearApp } from '../src/app.js'
import { crearRepositoriosEnMemoria } from './repositorio-memoria.js'

const puerto = Number(process.argv[2]) || 3001
crearApp({ repositorios: crearRepositoriosEnMemoria(), corsOrigins: ['http://localhost:5173', 'http://localhost:5199'] }).listen(puerto, () =>
  console.log(`API de prueba (datos en memoria) en http://localhost:${puerto}`),
)
