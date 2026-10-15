/* Pruebas del código que habla con Supabase, usando un cliente falso que anota qué se le pidió.
   (Contra la base real se verificó aparte; acá se comprueba la lógica: qué filtros se arman, cómo se traducen los errores, etc.) */

import { describe, expect, it } from 'vitest'
import { crearAutenticador } from '../src/auth.js'
import { ErrorHttp } from '../src/errores.js'
import { aPedido, aProducto, crearRepositorioCategorias, crearRepositorioDirecciones, crearRepositorioPedidos, crearRepositorioProductos } from '../src/repositorios/supabase.js'

// Cliente falso: cada consulta (from(...).select().eq()...) queda registrada y, al esperarla, devuelve la respuesta configurada.
// `respuestas[tabla]` puede ser un objeto (siempre la misma) o un arreglo (una respuesta por consulta, en orden).
function crearSupabaseFalso({ respuestas = {}, getUser, rpc } = {}) {
  const consultas = []
  return {
    consultas,
    from(tabla) {
      const registro = { tabla, pasos: [] }
      consultas.push(registro)
      const cola = respuestas[tabla]
      const respuesta = Array.isArray(cola) ? cola.shift() : cola
      const consulta = new Proxy({}, {
        get(_, metodo) {
          if (metodo === 'then') return (resolver) => resolver(respuesta ?? { data: null, error: null })
          return (...args) => { registro.pasos.push([metodo, ...args]); return consulta }
        },
      })
      return consulta
    },
    auth: { getUser: async (token) => getUser(token) },
    rpc: async (nombre, args) => { consultas.push({ rpc: nombre, args }); return rpc ?? { data: null, error: null } },
  }
}
const paso = (consulta, metodo) => consulta.pasos.filter(([m]) => m === metodo)
const FILA = { id: 'id-1', slug: 'mouse', nombre: 'Mouse', precio: 1000, precio_sin_impuestos: 800, descuento: 10, garantia: '12 meses', imagen: 'images/m.jpg', categoria_id: 'perifericos', categorias: { nombre: 'Periféricos' } }

describe('aProducto', () => {
  it('pasa de las columnas de la base al formato de la API', () => {
    expect(aProducto(FILA)).toEqual({
      id: 'id-1', slug: 'mouse', nombre: 'Mouse', precio: 1000, precioSinImpuestos: 800, descuento: 10,
      garantia: '12 meses', imagen: 'images/m.jpg', categoriaId: 'perifericos', categoria: 'Periféricos',
    })
  })
  it('si no vino la categoría, queda en null', () => {
    expect(aProducto({ ...FILA, categorias: null }).categoria).toBeNull()
  })
})

describe('repositorio de productos', () => {
  it('listar: solo activos, por relevancia y con la primera página', async () => {
    const supabase = crearSupabaseFalso({ respuestas: { productos: { data: [FILA], count: 1, error: null } } })
    const { productos, total } = await crearRepositorioProductos(supabase).listar({ pagina: 1, limite: 24, orden: 'relevancia' })
    const [c] = supabase.consultas
    expect(paso(c, 'eq')).toContainEqual(['eq', 'activo', true])
    expect(paso(c, 'order')[0]).toEqual(['order', 'posicion', { ascending: true }])
    expect(paso(c, 'range')[0]).toEqual(['range', 0, 23])
    expect(total).toBe(1)
    expect(productos[0].slug).toBe('mouse')
  })

  it('listar: aplica categoría, una condición por palabra, orden por precio y la página pedida', async () => {
    const supabase = crearSupabaseFalso({ respuestas: { productos: { data: [], count: 0, error: null } } })
    await crearRepositorioProductos(supabase).listar({ categoria: 'mothers', q: 'asus rog', orden: 'precio_desc', pagina: 3, limite: 10 })
    const [c] = supabase.consultas
    expect(paso(c, 'eq')).toContainEqual(['eq', 'categoria_id', 'mothers'])
    expect(paso(c, 'ilike')).toEqual([['ilike', 'nombre', '%asus%'], ['ilike', 'nombre', '%rog%']])
    expect(paso(c, 'order')[0]).toEqual(['order', 'precio', { ascending: false }])
    expect(paso(c, 'range')[0]).toEqual(['range', 20, 29])
  })

  it('listar: los comodines de LIKE (% _ \\) que escriba el usuario no se interpretan', async () => {
    const supabase = crearSupabaseFalso({ respuestas: { productos: { data: [], count: 0, error: null } } })
    await crearRepositorioProductos(supabase).listar({ q: '100%_\\x', orden: 'relevancia', pagina: 1, limite: 24 })
    const patrones = paso(supabase.consultas[0], 'ilike').map(([, , patron]) => patron)
    for (const patron of patrones) expect(patron.slice(1, -1)).not.toMatch(/[%_\\]/)
  })

  it('listar: si la base falla, el error sube (la API responde 500)', async () => {
    const supabase = crearSupabaseFalso({ respuestas: { productos: { data: null, error: new Error('base caída') } } })
    await expect(crearRepositorioProductos(supabase).listar({ orden: 'relevancia', pagina: 1, limite: 24 })).rejects.toThrow('base caída')
  })

  it('obtener: devuelve el producto activo o null', async () => {
    const con = crearSupabaseFalso({ respuestas: { productos: { data: FILA, error: null } } })
    expect((await crearRepositorioProductos(con).obtener('mouse')).slug).toBe('mouse')
    const sin = crearSupabaseFalso({ respuestas: { productos: { data: null, error: null } } })
    expect(await crearRepositorioProductos(sin).obtener('x')).toBeNull()
  })

  it('obtenerVarios: pide solo los activos con esos identificadores', async () => {
    const supabase = crearSupabaseFalso({ respuestas: { productos: { data: [FILA], error: null } } })
    const lista = await crearRepositorioProductos(supabase).obtenerVarios(['mouse', 'otro'])
    expect(paso(supabase.consultas[0], 'in')[0]).toEqual(['in', 'slug', ['mouse', 'otro']])
    expect(lista).toHaveLength(1)
  })

  describe('crear', () => {
    const datos = { nombre: 'Mouse Gamer', precio: 1000, precioSinImpuestos: 800, descuento: 5, garantia: null, imagen: 'images/m.jpg', categoriaId: 'perifericos' }

    it('arma el identificador desde el nombre y lo agrega al final de la lista', async () => {
      const supabase = crearSupabaseFalso({ respuestas: { productos: [{ data: { posicion: 23 }, error: null }, { data: { ...FILA, slug: 'mouse-gamer' }, error: null }] } })
      const producto = await crearRepositorioProductos(supabase).crear(datos)
      const [insertar] = paso(supabase.consultas[1], 'insert')
      expect(insertar[1]).toMatchObject({ slug: 'mouse-gamer', posicion: 24, nombre: 'Mouse Gamer', precio: 1000, precio_sin_impuestos: 800, categoria_id: 'perifericos' })
      expect(producto.slug).toBe('mouse-gamer')
    })

    it('si la tabla está vacía, la posición es 0', async () => {
      const supabase = crearSupabaseFalso({ respuestas: { productos: [{ data: null, error: null }, { data: FILA, error: null }] } })
      await crearRepositorioProductos(supabase).crear(datos)
      expect(paso(supabase.consultas[1], 'insert')[0][1].posicion).toBe(0)
    })

    it('un nombre repetido (error 23505 de la base) -> 409', async () => {
      const supabase = crearSupabaseFalso({ respuestas: { productos: [{ data: null, error: null }, { data: null, error: { code: '23505' } }] } })
      await expect(crearRepositorioProductos(supabase).crear(datos)).rejects.toMatchObject({ estado: 409, codigo: 'PRODUCTO_DUPLICADO' })
    })

    it('una categoría que no existe (error 23503) -> 400', async () => {
      const supabase = crearSupabaseFalso({ respuestas: { productos: [{ data: null, error: null }, { data: null, error: { code: '23503' } }] } })
      const error = await crearRepositorioProductos(supabase).crear(datos).catch((e) => e)
      expect(error).toBeInstanceOf(ErrorHttp)
      expect(error).toMatchObject({ estado: 400, codigo: 'CATEGORIA_INEXISTENTE' })
    })

    it('cualquier otro error de la base no se disfraza: sube tal cual', async () => {
      const raro = { code: 'XX000', message: 'algo raro' }
      const supabase = crearSupabaseFalso({ respuestas: { productos: [{ data: null, error: null }, { data: null, error: raro }] } })
      await expect(crearRepositorioProductos(supabase).crear(datos)).rejects.toBe(raro)
    })
  })

  it('actualizar: solo manda a la base los campos que se enviaron', async () => {
    const supabase = crearSupabaseFalso({ respuestas: { productos: { data: FILA, error: null } } })
    await crearRepositorioProductos(supabase).actualizar('mouse', { precio: 900, categoriaId: 'monitores' })
    expect(paso(supabase.consultas[0], 'update')[0][1]).toEqual({ precio: 900, categoria_id: 'monitores' })
  })

  it('actualizar: un producto que no existe devuelve null', async () => {
    const supabase = crearSupabaseFalso({ respuestas: { productos: { data: null, error: null } } })
    expect(await crearRepositorioProductos(supabase).actualizar('x', { precio: 1 })).toBeNull()
  })

  it('desactivar: marca activo=false y dice si existía', async () => {
    const existia = crearSupabaseFalso({ respuestas: { productos: { data: { slug: 'mouse' }, error: null } } })
    expect(await crearRepositorioProductos(existia).desactivar('mouse')).toBe(true)
    expect(paso(existia.consultas[0], 'update')[0][1]).toEqual({ activo: false })
    const noExistia = crearSupabaseFalso({ respuestas: { productos: { data: null, error: null } } })
    expect(await crearRepositorioProductos(noExistia).desactivar('x')).toBe(false)
  })
})

describe('repositorio de categorías y direcciones', () => {
  it('categorías: las pide por orden', async () => {
    const supabase = crearSupabaseFalso({ respuestas: { categorias: { data: [{ id: 'mothers', nombre: 'Mothers' }], error: null } } })
    expect(await crearRepositorioCategorias(supabase).listar()).toEqual([{ id: 'mothers', nombre: 'Mothers' }])
    expect(paso(supabase.consultas[0], 'order')[0]).toEqual(['order', 'orden', { ascending: true }])
  })

  it('direcciones: busca por id Y por dueño (nunca solo por id)', async () => {
    const supabase = crearSupabaseFalso({ respuestas: { direcciones: { data: { id: 'd1' }, error: null } } })
    await crearRepositorioDirecciones(supabase).obtenerDeUsuario('d1', 'u1')
    expect(paso(supabase.consultas[0], 'eq')).toEqual([['eq', 'id', 'd1'], ['eq', 'usuario_id', 'u1']])
  })
})

describe('repositorio de pedidos', () => {
  const FILA_PEDIDO = {
    id: 'p1', usuario_id: 'u1', estado: 'pendiente', medio_pago: 'tarjeta', cuotas: 6, subtotal: 600, descuento: 0, total: 600, valor_cuota: 100,
    envio_destinatario: 'Ana', envio_calle: 'Calle', envio_numero: '1', envio_piso_depto: null, envio_ciudad: 'CABA', envio_provincia: 'Buenos Aires', envio_codigo_postal: '1000', envio_telefono: null,
    creado_en: '2026-01-01T00:00:00Z', pedido_items: [{ producto_id: 'x', nombre: 'Mouse', precio_unitario: 300, descuento_pct: 0, cantidad: 2, subtotal: 600 }],
  }

  it('aPedido: pasa al formato de la API, agrupando la dirección y los renglones', () => {
    const pedido = aPedido(FILA_PEDIDO)
    expect(pedido).toMatchObject({ id: 'p1', usuarioId: 'u1', medioPago: 'tarjeta', valorCuota: 100, envio: { destinatario: 'Ana', codigoPostal: '1000' } })
    expect(pedido.items).toEqual([{ productoId: 'x', nombre: 'Mouse', precioUnitario: 300, descuentoPct: 0, cantidad: 2, subtotal: 600 }])
  })

  it('aPedido: un pedido sin renglones tiene una lista vacía', () => {
    expect(aPedido({ ...FILA_PEDIDO, pedido_items: undefined }).items).toEqual([])
  })

  it('crear: guarda con la función de la base (una transacción) y devuelve el pedido completo', async () => {
    const supabase = crearSupabaseFalso({ respuestas: { pedidos: { data: FILA_PEDIDO, error: null } }, rpc: { data: 'p1', error: null } })
    const pedido = await crearRepositorioPedidos(supabase).crear({ usuarioId: 'u1', pedido: { total: 600 }, items: [{ nombre: 'Mouse' }] })
    expect(supabase.consultas[0]).toEqual({ rpc: 'crear_pedido', args: { p_usuario_id: 'u1', p_pedido: { total: 600 }, p_items: [{ nombre: 'Mouse' }] } })
    expect(pedido.id).toBe('p1')
  })

  it('crear: si la función de la base falla, el error sube', async () => {
    const supabase = crearSupabaseFalso({ rpc: { data: null, error: new Error('violates check constraint') } })
    await expect(crearRepositorioPedidos(supabase).crear({ usuarioId: 'u1', pedido: {}, items: [] })).rejects.toThrow('check constraint')
  })

  it('listar: filtra por usuario, del más nuevo al más viejo', async () => {
    const supabase = crearSupabaseFalso({ respuestas: { pedidos: { data: [FILA_PEDIDO], count: 1, error: null } } })
    await crearRepositorioPedidos(supabase).listar({ usuarioId: 'u1', pagina: 2, limite: 10 })
    const [c] = supabase.consultas
    expect(paso(c, 'eq')).toContainEqual(['eq', 'usuario_id', 'u1'])
    expect(paso(c, 'order')[0]).toEqual(['order', 'creado_en', { ascending: false }])
    expect(paso(c, 'range')[0]).toEqual(['range', 10, 19])
  })

  it('listar sin usuario (administrador) no filtra por dueño', async () => {
    const supabase = crearSupabaseFalso({ respuestas: { pedidos: { data: [], count: 0, error: null } } })
    await crearRepositorioPedidos(supabase).listar({ usuarioId: null, pagina: 1, limite: 10 })
    expect(paso(supabase.consultas[0], 'eq')).toEqual([])
  })

  it('cambiarEstado: solo cambia si el pedido sigue en el estado anterior', async () => {
    const supabase = crearSupabaseFalso({ respuestas: { pedidos: { data: { ...FILA_PEDIDO, estado: 'pagado' }, error: null } } })
    const pedido = await crearRepositorioPedidos(supabase).cambiarEstado('p1', 'pendiente', 'pagado')
    const [c] = supabase.consultas
    expect(paso(c, 'update')[0][1]).toEqual({ estado: 'pagado' })
    expect(paso(c, 'eq')).toEqual([['eq', 'id', 'p1'], ['eq', 'estado', 'pendiente']])
    expect(pedido.estado).toBe('pagado')
  })

  it('cambiarEstado: si el pedido ya cambió, devuelve null', async () => {
    const supabase = crearSupabaseFalso({ respuestas: { pedidos: { data: null, error: null } } })
    expect(await crearRepositorioPedidos(supabase).cambiarEstado('p1', 'pendiente', 'pagado')).toBeNull()
  })
})

describe('autenticador', () => {
  it('un token que Supabase rechaza -> null', async () => {
    const supabase = crearSupabaseFalso({ getUser: async () => ({ data: { user: null }, error: new Error('jwt inválido') }) })
    expect(await crearAutenticador(supabase).verificar('malo')).toBeNull()
  })

  it('un token válido -> id, email y el rol que figura en perfiles', async () => {
    const supabase = crearSupabaseFalso({
      getUser: async () => ({ data: { user: { id: 'u1', email: 'a@b.com' } }, error: null }),
      respuestas: { perfiles: { data: { rol: 'admin' }, error: null } },
    })
    expect(await crearAutenticador(supabase).verificar('bueno')).toEqual({ id: 'u1', email: 'a@b.com', rol: 'admin' })
    expect(paso(supabase.consultas[0], 'eq')[0]).toEqual(['eq', 'id', 'u1'])
  })

  it('si el usuario todavía no tiene perfil, se lo trata como cliente (nunca como admin)', async () => {
    const supabase = crearSupabaseFalso({
      getUser: async () => ({ data: { user: { id: 'u1', email: 'a@b.com' } }, error: null }),
      respuestas: { perfiles: { data: null, error: null } },
    })
    expect((await crearAutenticador(supabase).verificar('bueno')).rol).toBe('cliente')
  })

  it('si falla la lectura del perfil, el error sube (no se asume un rol)', async () => {
    const supabase = crearSupabaseFalso({
      getUser: async () => ({ data: { user: { id: 'u1', email: 'a@b.com' } }, error: null }),
      respuestas: { perfiles: { data: null, error: new Error('permission denied') } },
    })
    await expect(crearAutenticador(supabase).verificar('bueno')).rejects.toThrow('permission denied')
  })
})
