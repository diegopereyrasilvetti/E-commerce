/* Convierte los productos de seed/productos.js (con textos como "$ 723.042") en filas para la tabla `productos`.
   Lo usan el script que carga la base y los tests, así los dos trabajan con los mismos datos. */

import { slugDe } from '../src/slug.js'

// "$ 723.042" -> 723042
const aPesos = (texto) => Number(String(texto).replace(/\D/g, '')) || null
// "10%" -> 10
const aPorcentaje = (texto) => Number(String(texto ?? '').replace(/\D/g, '')) || 0

export function filasDesdeSeed(productos) {
  const filas = productos.map((p, i) => ({
    slug: slugDe(p.nombre),
    nombre: p.nombre,
    precio: aPesos(p.precio),
    precio_sin_impuestos: aPesos(p.precioSinImpuestos),
    descuento: aPorcentaje(p.descuento),
    garantia: p.garantia ?? null,
    imagen: p.imagen,
    categoria_id: p.categoriaId,
    activo: true,
    posicion: i,
  }))
  // Dos productos no pueden compartir identificador
  const repetidos = filas.filter((f, i) => filas.findIndex((o) => o.slug === f.slug) !== i)
  if (repetidos.length) throw new Error('Hay productos con nombres demasiado parecidos (mismo identificador): ' + repetidos.map((r) => r.slug).join(', '))
  return filas
}
