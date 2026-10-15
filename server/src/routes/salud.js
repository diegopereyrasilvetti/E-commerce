import { Router } from 'express'

// GET /api/salud: sirve para comprobar que el servidor está andando (y para que el hosting lo vigile)
export function rutasSalud() {
  const router = Router()
  router.get('/', (req, res) => {
    res.json({ estado: 'ok', hora: new Date().toISOString() })
  })
  return router
}
