import { Router } from 'express'
import { z } from 'zod'
import { ErrorHttp, validar } from '../errores.js'

// Parámetros que se aceptan en GET /api/productos (todo lo que no figure acá se ignora)
const esquemaListado = z.object({
  categoria: z.string().regex(/^[a-z0-9-]{1,40}$/, 'categoría inválida').optional(),
  q: z.string().trim().max(80, 'la búsqueda es demasiado larga').optional(),
  orden: z.enum(['relevancia', 'precio_asc', 'precio_desc']).default('relevancia'),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(24),
})

const esquemaSlug = z.string().regex(/^[a-z0-9-]{1,120}$/, 'identificador inválido')

export function rutasProductos(repositorio) {
  const router = Router()

  // GET /api/productos?categoria=mothers&q=asus&orden=precio_asc&pagina=1&limite=24
  router.get('/', async (req, res) => {
    const filtros = validar(esquemaListado, req.query)
    const { productos, total } = await repositorio.listar(filtros)
    res.json({
      datos: productos,
      total,
      pagina: filtros.pagina,
      limite: filtros.limite,
      paginas: Math.max(1, Math.ceil(total / filtros.limite)),
    })
  })

  // GET /api/productos/:slug
  router.get('/:slug', async (req, res) => {
    const slug = validar(esquemaSlug, req.params.slug)
    const producto = await repositorio.obtener(slug)
    if (!producto) throw new ErrorHttp(404, 'PRODUCTO_NO_ENCONTRADO', 'No existe ese producto.')
    res.json({ datos: producto })
  })

  return router
}
