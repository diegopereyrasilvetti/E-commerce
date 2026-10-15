import { Router } from 'express'
import { z } from 'zod'
import { ErrorHttp, validar } from '../errores.js'
import { CUOTAS_PERMITIDAS, calcularPedido } from '../pedidos/calculo.js'

const slug = z.string().regex(/^[a-z0-9-]{1,120}$/, 'identificador de producto inválido')

const esquemaPedido = z
  .object({
    items: z.array(z.object({ slug, cantidad: z.number().int().min(1).max(99) }).strict()).min(1).max(50),
    medioPago: z.enum(['tarjeta', 'transferencia']),
    cuotas: z.number().int().refine((c) => CUOTAS_PERMITIDAS.includes(c), `las cuotas permitidas son ${CUOTAS_PERMITIDAS.join(', ')}`).default(1),
    direccionId: z.uuid('dirección inválida'),
  })
  .strict()
  .superRefine((datos, ctx) => {
    if (datos.medioPago === 'transferencia' && datos.cuotas !== 1) {
      ctx.addIssue({ code: 'custom', path: ['cuotas'], message: 'La transferencia es un pago único: no admite cuotas.' })
    }
    const repetidos = datos.items.filter((item, i) => datos.items.findIndex((o) => o.slug === item.slug) !== i)
    if (repetidos.length) ctx.addIssue({ code: 'custom', path: ['items'], message: 'Hay productos repetidos: sumá la cantidad en un solo renglón.' })
  })

const esquemaId = z.uuid('identificador de pedido inválido')

const esquemaListado = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(50).default(10),
  todos: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
})

// Para pasar de un estado a otro (lo hace un administrador). "cancelado" y "entregado" son finales.
const TRANSICIONES = {
  pendiente: ['pagado', 'cancelado'],
  pagado: ['enviado', 'cancelado'],
  enviado: ['entregado'],
  entregado: [],
  cancelado: [],
}
const esquemaEstado = z.object({ estado: z.enum(Object.keys(TRANSICIONES)) }).strict()

// Los pedidos son de cada usuario: nadie ve ni toca los de otro (un administrador sí puede verlos y cambiar su estado).
export function rutasPedidos({ pedidos, productos, direcciones }, { sesion, soloAdmin, limitarPedidos, pedidosHabilitados }) {
  const router = Router()

  // Al cliente no se le muestra de quién es el pedido (siempre es suyo); al administrador sí
  const presentar = (pedido, usuario) => {
    if (usuario.rol === 'admin') return pedido
    const { usuarioId, ...resto } = pedido // eslint-disable-line no-unused-vars
    return resto
  }

  // Devuelve el pedido solo si es del usuario (o si es administrador). Si no, responde "no existe" para no revelar que existe.
  async function pedidoVisible(id, usuario) {
    const pedido = await pedidos.obtener(id)
    if (!pedido || (pedido.usuarioId !== usuario.id && usuario.rol !== 'admin')) {
      throw new ErrorHttp(404, 'PEDIDO_NO_ENCONTRADO', 'No existe ese pedido.')
    }
    return pedido
  }

  // POST /api/pedidos  { items: [{ slug, cantidad }], medioPago, cuotas?, direccionId }
  router.post('/', limitarPedidos, async (req, res, next) => {
    if (!pedidosHabilitados) {
      return next(new ErrorHttp(503, 'PEDIDOS_DESHABILITADOS', 'Las compras todavía no están habilitadas: este sitio es un proyecto de demostración.'))
    }
    next()
  }, sesion, async (req, res) => {
    const datos = validar(esquemaPedido, req.body)

    // La dirección tiene que ser de este usuario
    const direccion = await direcciones.obtenerDeUsuario(datos.direccionId, req.usuario.id)
    if (!direccion) throw new ErrorHttp(404, 'DIRECCION_NO_ENCONTRADA', 'No existe esa dirección de envío.')

    // Los precios salen de la base, nunca del navegador
    const encontrados = await productos.obtenerVarios(datos.items.map((i) => i.slug))
    const productosPorSlug = new Map(encontrados.map((p) => [p.slug, p]))
    const faltantes = datos.items.filter((i) => !productosPorSlug.has(i.slug)).map((i) => i.slug)
    if (faltantes.length) {
      throw new ErrorHttp(400, 'PRODUCTO_NO_DISPONIBLE', 'Algunos productos ya no están disponibles.', faltantes.map((s) => ({ campo: 'items', mensaje: s })))
    }

    const cuenta = calcularPedido({ items: datos.items, productosPorSlug, medioPago: datos.medioPago, cuotas: datos.cuotas })

    const pedido = await pedidos.crear({
      usuarioId: req.usuario.id,
      pedido: {
        medio_pago: datos.medioPago,
        cuotas: cuenta.cuotas,
        subtotal: cuenta.subtotal,
        descuento: cuenta.descuento,
        total: cuenta.total,
        valor_cuota: cuenta.valorCuota,
        envio_destinatario: direccion.destinatario,
        envio_calle: direccion.calle,
        envio_numero: direccion.numero,
        envio_piso_depto: direccion.piso_depto,
        envio_ciudad: direccion.ciudad,
        envio_provincia: direccion.provincia,
        envio_codigo_postal: direccion.codigo_postal,
        envio_telefono: direccion.telefono,
      },
      items: cuenta.lineas.map((l) => ({
        producto_id: l.productoId,
        nombre: l.nombre,
        precio_unitario: l.precioUnitario,
        descuento_pct: l.descuentoPct,
        cantidad: l.cantidad,
        subtotal: l.subtotal,
      })),
    })
    res.status(201).location(`/api/pedidos/${pedido.id}`).json({ datos: presentar(pedido, req.usuario) })
  })

  // GET /api/pedidos?pagina=1&limite=10  (con ?todos=true, un administrador ve los de todos)
  router.get('/', sesion, async (req, res) => {
    const { pagina, limite, todos } = validar(esquemaListado, req.query)
    if (todos && req.usuario.rol !== 'admin') throw new ErrorHttp(403, 'SIN_PERMISO', 'No tenés permiso para hacer esto.')
    const { pedidos: lista, total } = await pedidos.listar({ usuarioId: todos ? null : req.usuario.id, pagina, limite })
    res.json({ datos: lista.map((p) => presentar(p, req.usuario)), total, pagina, limite, paginas: Math.max(1, Math.ceil(total / limite)) })
  })

  // GET /api/pedidos/:id
  router.get('/:id', sesion, async (req, res) => {
    const id = validar(esquemaId, req.params.id)
    res.json({ datos: presentar(await pedidoVisible(id, req.usuario), req.usuario) })
  })

  // POST /api/pedidos/:id/cancelar: el dueño cancela su pedido mientras siga pendiente
  router.post('/:id/cancelar', sesion, async (req, res) => {
    const id = validar(esquemaId, req.params.id)
    const pedido = await pedidoVisible(id, req.usuario)
    if (pedido.usuarioId !== req.usuario.id) throw new ErrorHttp(403, 'SIN_PERMISO', 'Solo el dueño del pedido puede cancelarlo.')
    const cancelado = await pedidos.cambiarEstado(id, 'pendiente', 'cancelado')
    if (!cancelado) throw new ErrorHttp(409, 'TRANSICION_INVALIDA', 'Solo se puede cancelar un pedido pendiente.')
    res.json({ datos: presentar(cancelado, req.usuario) })
  })

  // PATCH /api/pedidos/:id/estado  { estado }  (solo administradores)
  router.patch('/:id/estado', sesion, soloAdmin, async (req, res) => {
    const id = validar(esquemaId, req.params.id)
    const { estado } = validar(esquemaEstado, req.body)
    const pedido = await pedidoVisible(id, req.usuario)
    if (!TRANSICIONES[pedido.estado].includes(estado)) {
      throw new ErrorHttp(409, 'TRANSICION_INVALIDA', `Un pedido ${pedido.estado} no puede pasar a ${estado}.`)
    }
    const actualizado = await pedidos.cambiarEstado(id, pedido.estado, estado)
    if (!actualizado) throw new ErrorHttp(409, 'TRANSICION_INVALIDA', 'El pedido cambió mientras lo modificabas. Volvé a intentar.')
    res.json({ datos: actualizado })
  })

  return router
}
