import { PRODUCTOS } from '../data/productos.js'

// Identificador de un producto para usar en la dirección (?producto=...): el nombre de su imagen, sin la extensión
export function idDe(producto) {
  return producto.imagen.split('/').pop().replace(/\.[^.]+$/, '')
}

export function productoPorId(id) {
  return id ? PRODUCTOS.find((p) => idDe(p) === id) : undefined
}

// Dirección de la página de un producto: su categoría con el detalle abierto
export function rutaDe(producto) {
  return `/productos/${producto.categoriaId}?producto=${encodeURIComponent(idDe(producto))}`
}

// Para comparar textos al buscar: sin tildes ni mayúsculas ("Refrigeración" -> "refrigeracion")
export function normalizar(texto) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

// Productos que coinciden con lo escrito: todas las palabras tienen que estar en el nombre o en la categoría.
// Los que coinciden por el nombre van primero.
export function buscarProductos(consulta, limite = 8) {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean)
  if (!palabras.length) return []
  return PRODUCTOS.map((p) => ({ p, nombre: normalizar(p.nombre), todo: normalizar(p.nombre + ' ' + p.categoria) }))
    .filter((x) => palabras.every((w) => x.todo.includes(w)))
    .sort((a, b) => Number(palabras.every((w) => b.nombre.includes(w))) - Number(palabras.every((w) => a.nombre.includes(w))))
    .slice(0, limite)
    .map((x) => x.p)
}
