import { Router } from 'express'

// GET /api/yo: quién soy según el servidor (id, email y rol). Sirve para saber si hay que mostrar opciones de administrador.
export function rutasYo(sesion) {
  const router = Router()
  router.get('/', sesion, (req, res) => {
    res.json({ datos: req.usuario })
  })
  return router
}
