import { crearApp } from './app.js'
import { crearAutenticador } from './auth.js'
import { leerConfig } from './config.js'
import {
  crearClienteSupabase,
  crearRepositorioCategorias,
  crearRepositorioDirecciones,
  crearRepositorioPedidos,
  crearRepositorioProductos,
} from './repositorios/supabase.js'

const config = leerConfig()
const supabase = crearClienteSupabase({ url: config.SUPABASE_URL, claveSecreta: config.SUPABASE_SECRET_KEY })

const app = crearApp({
  autenticador: crearAutenticador(supabase),
  repositorios: {
    productos: crearRepositorioProductos(supabase),
    categorias: crearRepositorioCategorias(supabase),
    pedidos: crearRepositorioPedidos(supabase),
    direcciones: crearRepositorioDirecciones(supabase),
  },
  corsOrigins: config.CORS_ORIGINS,
  produccion: config.NODE_ENV === 'production',
  pedidosHabilitados: config.PEDIDOS_HABILITADOS,
})

app.listen(config.PORT, () => {
  console.log(`API de Kodex lista en http://localhost:${config.PORT} (${config.NODE_ENV}, pedidos ${config.PEDIDOS_HABILITADOS ? 'habilitados' : 'deshabilitados'})`)
})
