import { Router } from 'express'

// GET /api/categorias: todas las categorías, en el orden en que se muestran
export function rutasCategorias(repositorio) {
  const router = Router()
  router.get('/', async (req, res) => {
    res.json({ datos: await repositorio.listar() })
  })
  return router
}
