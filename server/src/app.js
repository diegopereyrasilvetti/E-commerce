import cors from 'cors'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import { manejarErrores, noEncontrada } from './middleware/errores.js'
import { rutasCategorias } from './routes/categorias.js'
import { rutasProductos } from './routes/productos.js'
import { rutasSalud } from './routes/salud.js'

// Arma la aplicación. Recibe sus dependencias (repositorios de datos y configuración) para poder probarla con datos falsos.
export function crearApp({ repositorios, corsOrigins = [], produccion = false }) {
  const app = express()

  app.disable('x-powered-by')
  if (produccion) app.set('trust proxy', 1) // detrás del proxy del hosting, para ver la IP real de cada cliente

  // Seguridad: cabeceras HTTP seguras, solo los sitios permitidos pueden usar la API desde el navegador,
  // límite de solicitudes por IP y de tamaño del cuerpo
  app.use(helmet())
  app.use(cors({ origin: corsOrigins, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }))
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: { codigo: 'DEMASIADAS_SOLICITUDES', mensaje: 'Hiciste demasiadas solicitudes. Esperá unos minutos.' } },
    }),
  )
  app.use(express.json({ limit: '10kb' }))

  app.use('/api/salud', rutasSalud())
  app.use('/api/categorias', rutasCategorias(repositorios.categorias))
  app.use('/api/productos', rutasProductos(repositorios.productos))

  app.use(noEncontrada)
  app.use(manejarErrores)
  return app
}
