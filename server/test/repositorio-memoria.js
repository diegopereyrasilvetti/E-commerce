/* Repositorios falsos que guardan los datos en memoria (a partir de la semilla). Imitan a los de Supabase,
   así se puede probar la API sin conexión a la base de datos. */

import { filasDesdeSeed } from '../seed/filas.js'
import { PRODUCTOS } from '../seed/productos.js'
import { ErrorHttp } from '../src/errores.js'
import { aProducto } from '../src/repositorios/supabase.js'
import { slugDe } from '../src/slug.js'

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
      async crear(datos) {
        const slug = slugDe(datos.nombre)
        if (filas.some((f) => f.slug === slug)) throw new ErrorHttp(409, 'PRODUCTO_DUPLICADO', 'Ya existe un producto con ese nombre.')
        if (!nombreDe[datos.categoriaId]) throw new ErrorHttp(400, 'CATEGORIA_INEXISTENTE', 'La categoría indicada no existe.')
        const fila = {
          id: 'id-' + filas.length, slug, nombre: datos.nombre, precio: datos.precio, precio_sin_impuestos: datos.precioSinImpuestos ?? null,
          descuento: datos.descuento, garantia: datos.garantia ?? null, imagen: datos.imagen, categoria_id: datos.categoriaId, activo: true,
          posicion: filas.length, categorias: { nombre: nombreDe[datos.categoriaId] },
        }
        filas.push(fila)
        return aProducto(fila)
      },
      async actualizar(slug, cambios) {
        const fila = filas.find((f) => f.slug === slug)
        if (!fila) return null
        if (cambios.categoriaId && !nombreDe[cambios.categoriaId]) throw new ErrorHttp(400, 'CATEGORIA_INEXISTENTE', 'La categoría indicada no existe.')
        const mapa = { nombre: 'nombre', precio: 'precio', precioSinImpuestos: 'precio_sin_impuestos', descuento: 'descuento', garantia: 'garantia', imagen: 'imagen', categoriaId: 'categoria_id', activo: 'activo' }
        for (const [campo, columna] of Object.entries(mapa)) if (cambios[campo] !== undefined) fila[columna] = cambios[campo]
        fila.categorias = { nombre: nombreDe[fila.categoria_id] }
        return aProducto(fila)
      },
      async desactivar(slug) {
        const fila = filas.find((f) => f.slug === slug && f.activo)
        if (!fila) return false
        fila.activo = false
        return true
      },
    },
    categorias: {
      async listar() {
        return CATEGORIAS_DE_PRUEBA.map(({ id, nombre }) => ({ id, nombre }))
      },
    },
  }
}
