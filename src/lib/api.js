/* Cliente de la API propia (carpeta server/).
   En desarrollo las llamadas a /api las redirige Vite al servidor local (ver vite.config.js).
   En producción, VITE_API_URL tiene la dirección donde está publicado el servidor. */

import { formatoPesos } from '../utils/dinero.js'

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

async function pedir(ruta) {
  let respuesta
  try {
    respuesta = await fetch(BASE + ruta)
  } catch {
    throw new Error('No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.')
  }
  const cuerpo = await respuesta.json().catch(() => null)
  if (!respuesta.ok) throw new Error(cuerpo?.error?.mensaje ?? 'El servidor no pudo responder. Intentá de nuevo.')
  return cuerpo
}

// La API devuelve números; el sitio muestra textos con formato ("$ 723.042", "10%")
function adaptarProducto(p) {
  return {
    id: p.id,
    slug: p.slug,
    nombre: p.nombre,
    precio: formatoPesos(p.precio),
    precioSinImpuestos: p.precioSinImpuestos ? formatoPesos(p.precioSinImpuestos) : '',
    descuento: p.descuento ? p.descuento + '%' : '',
    garantia: p.garantia ?? '',
    imagen: p.imagen,
    categoria: p.categoria,
    categoriaId: p.categoriaId,
  }
}

// El catálogo es chico (24 productos), así que se trae completo una sola vez y el filtrado y la búsqueda son instantáneos
export async function listarProductos() {
  const { datos } = await pedir('/api/productos?limite=100')
  return datos.map(adaptarProducto)
}
