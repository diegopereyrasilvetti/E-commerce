/* Carga (o actualiza) los productos de server/seed/productos.js en la tabla `productos` de Supabase.
   Se puede ejecutar todas las veces que haga falta: los que ya existen se actualizan y no se duplican.
   Uso: npm --prefix server run cargar-productos */

import { leerConfig } from '../src/config.js'
import { crearClienteSupabase } from '../src/repositorios/supabase.js'
import { filasDesdeSeed } from '../seed/filas.js'
import { PRODUCTOS } from '../seed/productos.js'

const config = leerConfig()
const supabase = crearClienteSupabase({ url: config.SUPABASE_URL, claveSecreta: config.SUPABASE_SECRET_KEY })
const filas = filasDesdeSeed(PRODUCTOS)

const { error } = await supabase.from('productos').upsert(filas, { onConflict: 'slug' })
if (error) {
  console.error('No se pudieron cargar los productos:', error.message)
  process.exit(1)
}

const { count } = await supabase.from('productos').select('*', { count: 'exact', head: true })
console.log(`Listo: ${filas.length} productos cargados (la tabla tiene ${count}).`)
