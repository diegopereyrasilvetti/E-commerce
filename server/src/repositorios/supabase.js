import { createClient } from '@supabase/supabase-js'

// Conexión del servidor a la base de datos. Usa la clave SECRET: tiene acceso total, por eso vive solo en el servidor
// (nunca en el frontend) y por eso las reglas de quién puede qué se programan acá, en la API.
export function crearClienteSupabase({ url, claveSecreta }) {
  return createClient(url, claveSecreta, { auth: { persistSession: false, autoRefreshToken: false } })
}

// De una fila de la tabla `productos` (con su categoría) al objeto que devuelve la API
export function aProducto(fila) {
  return {
    id: fila.id,
    slug: fila.slug,
    nombre: fila.nombre,
    precio: fila.precio,
    precioSinImpuestos: fila.precio_sin_impuestos,
    descuento: fila.descuento,
    garantia: fila.garantia,
    imagen: fila.imagen,
    categoriaId: fila.categoria_id,
    categoria: fila.categorias?.nombre ?? null,
  }
}

// Texto buscado: sin los caracteres que tienen significado especial en un LIKE (% _ \)
function limpiarBusqueda(texto) {
  return texto.replace(/[%_\\]/g, ' ').trim()
}

export function crearRepositorioProductos(supabase) {
  return {
    async listar({ categoria, q, orden, pagina, limite }) {
      let consulta = supabase.from('productos').select('*, categorias(nombre)', { count: 'exact' }).eq('activo', true)
      if (categoria) consulta = consulta.eq('categoria_id', categoria)
      // Cada palabra tiene que aparecer en el nombre (sin importar mayúsculas)
      for (const palabra of limpiarBusqueda(q ?? '').split(/\s+/).filter(Boolean)) {
        consulta = consulta.ilike('nombre', `%${palabra}%`)
      }
      if (orden === 'precio_asc') consulta = consulta.order('precio', { ascending: true })
      else if (orden === 'precio_desc') consulta = consulta.order('precio', { ascending: false })
      else consulta = consulta.order('posicion', { ascending: true })

      const desde = (pagina - 1) * limite
      const { data, count, error } = await consulta.range(desde, desde + limite - 1)
      if (error) throw error
      return { productos: data.map(aProducto), total: count ?? 0 }
    },

    async obtener(slug) {
      const { data, error } = await supabase
        .from('productos')
        .select('*, categorias(nombre)')
        .eq('slug', slug)
        .eq('activo', true)
        .maybeSingle()
      if (error) throw error
      return data ? aProducto(data) : null
    },
  }
}

export function crearRepositorioCategorias(supabase) {
  return {
    async listar() {
      const { data, error } = await supabase.from('categorias').select('id, nombre').order('orden', { ascending: true })
      if (error) throw error
      return data
    },
  }
}
