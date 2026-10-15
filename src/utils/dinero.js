// "$ 723.042" -> 723042
export function precioANumero(texto) {
  return Number(String(texto).replace(/[^\d]/g, '')) || 0
}

// 723042 -> "$ 723.042"
export function formatoPesos(numero) {
  return '$ ' + Math.round(numero).toLocaleString('es-AR')
}
