/* Repositorios falsos que guardan los datos en memoria (a partir de la semilla). Imitan a los de Supabase,
   así se puede probar la API sin conexión a la base de datos. */

import { filasDesdeSeed } from '../seed/filas.js'
import { PRODUCTOS } from '../seed/productos.js'
import { aProducto } from '../src/repositorios/supabase.js'

export const CATEGORIAS_DE_PRUEBA = [
  ['procesadores', 'Procesadores'], ['mothers', 'Mothers'], ['placas-de-video', 'Placas de Video'],
  ['memorias-ram', 'Memorias RAM'], ['almacenamiento', 'Almacenamiento'], ['refrigeracion', 'Refrigeración'],
  ['gabinetes', 'Gabinetes'], ['fuentes', 'Fuentes'], ['monitores', 'Monitores'], ['perifericos', 'Periféricos'],
].map(([id, nombre], i) => ({ id, nombre, orden: i + 1 }))

export function crearRepositoriosEnMemoria() {
  const nombreDe = Object.fromEntries(CATEGORIAS_DE_PRUEBA.map((c) => [c.id, c.nombre]))
  const filas = filasDesdeSeed(PRODUCTOS).map((f, i) => ({ id: `id-${i}`, ...f, categorias: { nombre: nombreDe[f.categoria_id] } }))

  return {
    productos: {
      async listar({ categoria, q, orden, pagina, limite }) {
        const palabras = (q ?? '').toLowerCase().split(/\s+/).filter(Boolean)
        let lista = filas.filter((f) => f.activo)
        if (categoria) lista = lista.filter((f) => f.categoria_id === categoria)
        lista = lista.filter((f) => palabras.every((w) => f.nombre.toLowerCase().includes(w)))
        if (orden === 'precio_asc') lista.sort((a, b) => a.precio - b.precio)
        else if (orden === 'precio_desc') lista.sort((a, b) => b.precio - a.precio)
        else lista.sort((a, b) => a.posicion - b.posicion)
        const desde = (pagina - 1) * limite
        return { productos: lista.slice(desde, desde + limite).map(aProducto), total: lista.length }
      },
      async obtener(slug) {
        const fila = filas.find((f) => f.slug === slug && f.activo)
        return fila ? aProducto(fila) : null
      },
    },
    categorias: {
      async listar() {
        return CATEGORIAS_DE_PRUEBA.map(({ id, nombre }) => ({ id, nombre }))
      },
    },
  }
}
