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

    // Los productos activos con esos identificadores (los que no existan o estén ocultos simplemente no vuelven)
    async obtenerVarios(slugs) {
      const { data, error } = await supabase.from('productos').select(CON_CATEGORIA).in('slug', slugs).eq('activo', true)
      if (error) throw error
      return data.map(aProducto)
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

// De una fila de la tabla `pedidos` (con sus renglones) al objeto que devuelve la API
export function aPedido(fila) {
  return {
    id: fila.id,
    usuarioId: fila.usuario_id,
    estado: fila.estado,
    medioPago: fila.medio_pago,
    cuotas: fila.cuotas,
    subtotal: fila.subtotal,
    descuento: fila.descuento,
    total: fila.total,
    valorCuota: fila.valor_cuota,
    envio: {
      destinatario: fila.envio_destinatario,
      calle: fila.envio_calle,
      numero: fila.envio_numero,
      pisoDepto: fila.envio_piso_depto,
      ciudad: fila.envio_ciudad,
      provincia: fila.envio_provincia,
      codigoPostal: fila.envio_codigo_postal,
      telefono: fila.envio_telefono,
    },
    items: (fila.pedido_items ?? []).map((i) => ({
      productoId: i.producto_id,
      nombre: i.nombre,
      precioUnitario: i.precio_unitario,
      descuentoPct: i.descuento_pct,
      cantidad: i.cantidad,
      subtotal: i.subtotal,
    })),
    creadoEn: fila.creado_en,
  }
}

const CON_ITEMS = '*, pedido_items(*)'

export function crearRepositorioPedidos(supabase) {
  return {
    // Guarda el pedido y sus renglones de una sola vez (función crear_pedido de la base, que es una transacción)
    async crear({ usuarioId, pedido, items }) {
      const { data: id, error } = await supabase.rpc('crear_pedido', { p_usuario_id: usuarioId, p_pedido: pedido, p_items: items })
      if (error) throw error
      return this.obtener(id)
    },

    async obtener(id) {
      const { data, error } = await supabase.from('pedidos').select(CON_ITEMS).eq('id', id).maybeSingle()
      if (error) throw error
      return data ? aPedido(data) : null
    },

    // Los pedidos de un usuario (o de todos si usuarioId es null), del más nuevo al más viejo
    async listar({ usuarioId, pagina, limite }) {
      let consulta = supabase.from('pedidos').select(CON_ITEMS, { count: 'exact' }).order('creado_en', { ascending: false })
      if (usuarioId) consulta = consulta.eq('usuario_id', usuarioId)
      const desde = (pagina - 1) * limite
      const { data, count, error } = await consulta.range(desde, desde + limite - 1)
      if (error) throw error
      return { pedidos: data.map(aPedido), total: count ?? 0 }
    },

    // Cambia el estado solo si todavía está en el estado anterior (evita pisar un cambio hecho en el mismo momento).
    // Devuelve el pedido actualizado o null.
    async cambiarEstado(id, desde, hacia) {
      const { data, error } = await supabase.from('pedidos').update({ estado: hacia }).eq('id', id).eq('estado', desde).select(CON_ITEMS).maybeSingle()
      if (error) throw error
      return data ? aPedido(data) : null
    },
  }
}

export function crearRepositorioDirecciones(supabase) {
  return {
    // Una dirección, pero solo si es de ese usuario
    async obtenerDeUsuario(id, usuarioId) {
      const { data, error } = await supabase.from('direcciones').select('*').eq('id', id).eq('usuario_id', usuarioId).maybeSingle()
      if (error) throw error
      return data
    },
  }
}
