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

// Campos de un producto (lo que manda un administrador). Cualquier campo que no figure acá se rechaza.
const campos = {
  nombre: z.string().trim().min(3).max(200),
  precio: z.number().int().min(1).max(100_000_000),
  precioSinImpuestos: z.number().int().min(1).max(100_000_000).nullable(),
  descuento: z.number().int().min(0).max(100),
  garantia: z.string().trim().max(60).nullable(),
  // Ruta de una imagen dentro de public/ del frontend (por ejemplo "images/Productos/Cooler/coolerx3.jpg")
  imagen: z.string().trim().max(300).regex(/^images\/[A-Za-z0-9 _.()\-/]+$/, 'ruta de imagen inválida').refine((s) => !s.includes('..'), 'ruta de imagen inválida'),
  categoriaId: z.string().regex(/^[a-z0-9-]{1,40}$/, 'categoría inválida'),
}

const esquemaCrear = z
  .object({
    nombre: campos.nombre,
    precio: campos.precio,
    precioSinImpuestos: campos.precioSinImpuestos.optional(),
    descuento: campos.descuento.default(0),
    garantia: campos.garantia.optional(),
    imagen: campos.imagen,
    categoriaId: campos.categoriaId,
  })
  .strict()

const esquemaEditar = z
  .object({ ...campos, activo: z.boolean() })
  .partial()
  .strict()
  .refine((datos) => Object.keys(datos).length > 0, 'Enviá al menos un campo para modificar.')

// `sesion` y `soloAdmin` son los middlewares que exigen sesión iniciada y rol de administrador;
// `limitarEscrituras` limita cuántos cambios puede hacer una misma IP.
export function rutasProductos(repositorio, { sesion, soloAdmin, limitarEscrituras }) {
  const router = Router()

  // ---------- Públicas ----------

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

  // ---------- Solo administradores ----------

  // POST /api/productos
  router.post('/', limitarEscrituras, sesion, soloAdmin, async (req, res) => {
    const datos = validar(esquemaCrear, req.body)
    const producto = await repositorio.crear(datos)
    res.status(201).location(`/api/productos/${producto.slug}`).json({ datos: producto })
  })

  // PATCH /api/productos/:slug (solo los campos que se envían; el identificador no cambia aunque cambie el nombre)
  router.patch('/:slug', limitarEscrituras, sesion, soloAdmin, async (req, res) => {
    const slug = validar(esquemaSlug, req.params.slug)
    const cambios = validar(esquemaEditar, req.body)
    const producto = await repositorio.actualizar(slug, cambios)
    if (!producto) throw new ErrorHttp(404, 'PRODUCTO_NO_ENCONTRADO', 'No existe ese producto.')
    res.json({ datos: producto })
  })

  // DELETE /api/productos/:slug (lo oculta del catálogo; no lo borra de la base, así se puede recuperar)
  router.delete('/:slug', limitarEscrituras, sesion, soloAdmin, async (req, res) => {
    const slug = validar(esquemaSlug, req.params.slug)
    const existia = await repositorio.desactivar(slug)
    if (!existia) throw new ErrorHttp(404, 'PRODUCTO_NO_ENCONTRADO', 'No existe ese producto.')
    res.status(204).end()
  })

  return router
}
