import { createClient } from '@supabase/supabase-js'
import { ErrorHttp } from '../errores.js'
import { slugDe } from '../slug.js'

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

// De los datos que manda un administrador (camelCase) a las columnas de la tabla (solo los campos presentes)
function aColumnas(datos) {
  const columnas = {}
  const mapa = { nombre: 'nombre', precio: 'precio', precioSinImpuestos: 'precio_sin_impuestos', descuento: 'descuento', garantia: 'garantia', imagen: 'imagen', categoriaId: 'categoria_id', activo: 'activo' }
  for (const [campo, columna] of Object.entries(mapa)) if (datos[campo] !== undefined) columnas[columna] = datos[campo]
  return columnas
}

// Errores de la base que el cliente puede entender (nombre repetido, categoría que no existe); el resto sigue como error interno
function traducirError(error) {
  if (error.code === '23505') return new ErrorHttp(409, 'PRODUCTO_DUPLICADO', 'Ya existe un producto con ese nombre.')
  if (error.code === '23503') return new ErrorHttp(400, 'CATEGORIA_INEXISTENTE', 'La categoría indicada no existe.')
  return error
}

const CON_CATEGORIA = '*, categorias(nombre)'

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
      const { data, error } = await supabase.from('productos').select(CON_CATEGORIA).eq('slug', slug).eq('activo', true).maybeSingle()
      if (error) throw error
      return data ? aProducto(data) : null
    },

    // Crea un producto al final de la lista. El identificador (slug) sale del nombre.
    async crear(datos) {
      const { data: ultimo, error: errorUltimo } = await supabase.from('productos').select('posicion').order('posicion', { ascending: false }).limit(1).maybeSingle()
      if (errorUltimo) throw errorUltimo
      const fila = { ...aColumnas(datos), slug: slugDe(datos.nombre), posicion: (ultimo?.posicion ?? -1) + 1 }
      const { data, error } = await supabase.from('productos').insert(fila).select(CON_CATEGORIA).single()
      if (error) throw traducirError(error)
      return aProducto(data)
    },

    // Modifica los campos enviados. Devuelve el producto actualizado o null si no existe.
    async actualizar(slug, cambios) {
      const { data, error } = await supabase.from('productos').update(aColumnas(cambios)).eq('slug', slug).select(CON_CATEGORIA).maybeSingle()
      if (error) throw traducirError(error)
      return data ? aProducto(data) : null
    },

    // Lo oculta del catálogo (no lo borra). Devuelve false si no existía o ya estaba oculto.
    async desactivar(slug) {
      const { data, error } = await supabase.from('productos').update({ activo: false }).eq('slug', slug).eq('activo', true).select('slug').maybeSingle()
      if (error) throw error
      return Boolean(data)
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
