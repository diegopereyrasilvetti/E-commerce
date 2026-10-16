// "$ 723.042" -> 723042
export function precioANumero(texto) {
  return Number(String(texto).replace(/[^\d]/g, '')) || 0
}

// 723042 -> "$ 723.042"
export function formatoPesos(numero) {
  return '$ ' + Math.round(numero).toLocaleString('es-AR')
}

// Precio después de aplicar un descuento en porcentaje: (723042, 10) -> 650738
export function precioConDescuento(precio, porcentaje) {
  return Math.round(precio - (precio * porcentaje) / 100)
}

// Valor de cada cuota, redondeado hacia arriba para que las cuotas nunca sumen menos que el total
export function valorCuota(total, cuotas) {
  return Math.ceil(total / cuotas)
}

// "10%" -> 10 ("" o undefined -> 0)
export function porcentajeDe(texto) {
  return Number(String(texto ?? '').replace(/\D/g, '')) || 0
}
