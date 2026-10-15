/* Cuentas de un pedido. Es una función pura (sin base de datos): recibe los datos y devuelve los importes.
   Las mismas reglas que usa el carrito del sitio, pero acá se calculan con los PRECIOS DE LA BASE:
   lo que diga el navegador no cuenta. */

export const CUOTAS_PERMITIDAS = [1, 6, 12, 18]

// items: [{ slug, cantidad }]; productosPorSlug: Map slug -> producto de la API
export function calcularPedido({ items, productosPorSlug, medioPago, cuotas }) {
  const lineas = items.map(({ slug, cantidad }) => {
    const producto = productosPorSlug.get(slug)
    return {
      productoId: producto.id,
      nombre: producto.nombre,
      precioUnitario: producto.precio,
      descuentoPct: producto.descuento,
      cantidad,
      subtotal: producto.precio * cantidad,
    }
  })

  const subtotal = lineas.reduce((suma, l) => suma + l.subtotal, 0)
  // El descuento de cada producto solo se aplica si se paga con depósito o transferencia
  const descuento =
    medioPago === 'transferencia' ? Math.round(lineas.reduce((suma, l) => suma + (l.subtotal * l.descuentoPct) / 100, 0)) : 0
  const total = subtotal - descuento
  // Las cuotas son solo con tarjeta; la transferencia es un pago único
  const cuotasFinal = medioPago === 'tarjeta' ? cuotas : 1

  return { lineas, subtotal, descuento, total, cuotas: cuotasFinal, valorCuota: Math.ceil(total / cuotasFinal) }
}
