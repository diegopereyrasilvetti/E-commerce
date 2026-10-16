// Ayudas para trabajar con la lista de productos que trae la API (ver catalogo.jsx)

// Identificador de un producto para usar en la dirección (?producto=...)
export function idDe(producto) {
  return producto.slug
}

export function productoPorId(productos, id) {
  return id ? productos.find((p) => p.slug === id) : undefined
}

// Dirección de la página de un producto
export function rutaDe(producto) {
  return `/producto/${encodeURIComponent(producto.slug)}`
}

// Para comparar textos al buscar: sin tildes ni mayúsculas ("Refrigeración" -> "refrigeracion")
export function normalizar(texto) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

// Productos que coinciden con lo escrito: todas las palabras tienen que estar en el nombre o en la categoría.
// Los que coinciden por el nombre van primero.
export function buscarProductos(productos, consulta, limite = 8) {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean)
  if (!palabras.length) return []
  return productos
    .map((p) => ({ p, nombre: normalizar(p.nombre), todo: normalizar(p.nombre + ' ' + p.categoria) }))
    .filter((x) => palabras.every((w) => x.todo.includes(w)))
    .sort((a, b) => Number(palabras.every((w) => b.nombre.includes(w))) - Number(palabras.every((w) => a.nombre.includes(w))))
    .slice(0, limite)
    .map((x) => x.p)
}
