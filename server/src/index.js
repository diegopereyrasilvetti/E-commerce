import { crearApp } from './app.js'
import { leerConfig } from './config.js'
import {
  crearClienteSupabase,
  crearRepositorioCategorias,
  crearRepositorioProductos,
} from './repositorios/supabase.js'

const config = leerConfig()
const supabase = crearClienteSupabase({ url: config.SUPABASE_URL, claveSecreta: config.SUPABASE_SECRET_KEY })

const app = crearApp({
  repositorios: {
    productos: crearRepositorioProductos(supabase),
    categorias: crearRepositorioCategorias(supabase),
  },
  corsOrigins: config.CORS_ORIGINS,
  produccion: config.NODE_ENV === 'production',
})

app.listen(config.PORT, () => {
  console.log(`API de Kodex lista en http://localhost:${config.PORT} (${config.NODE_ENV})`)
})
