/* Carrito de compras.

   Este archivo tiene todo lo necesario:
   - CartProvider ........ guarda el carrito (y lo recuerda en localStorage). Va envolviendo la app (ver main.jsx).
   - useCart() ........... hook para leer y cambiar el carrito desde cualquier componente.
   - AddToCartButton ..... botón "Agregar al carrito" para una tarjeta de producto.
   - CartBadge ........... globito con la cantidad de productos (para el ícono del carrito del header).
   - Cart (export default) página /carrito: productos, cantidades, total, medios de pago y cuotas.

   Un "producto" es un objeto como los que arma src/lib/api.js a partir de la API:
   { nombre, precio: "$ 723.042", imagen: "images/...", categoria, descuento: "10%", garantia: "12 meses" } */

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import { COMPRAS_HABILITADAS } from './config.js'
import CarritoVacio from './components/CarritoVacio.jsx'
import { formatoPesos, precioANumero } from './utils/dinero.js'
import { useTitulo } from './utils/useTitulo.js'

// ---------- Configuración ----------
const CLAVE_STORAGE = 'kodex-carrito'
const CANTIDAD_MAXIMA = 99
// Cuotas sin interés que se ofrecen con tarjeta (1 = pago en un solo pago)
export const OPCIONES_CUOTAS = [1, 6, 12, 18]

// ---------- Ayudas ----------
export { precioANumero, formatoPesos } // se siguen pudiendo importar desde acá

// "10%" -> 10
function porcentaje(texto) {
  return Number(String(texto ?? '').replace(/[^\d.]/g, '')) || 0
}

// ---------- Estado del carrito ----------
export function claveDe(producto) {
  return producto.imagen || producto.nombre
}

// items: [{ clave, producto, cantidad }]. La clave identifica al producto: se usa su imagen porque
// el nombre se puede repetir (hay productos con el mismo nombre y distinto precio).
function reducer(items, accion) {
  switch (accion.tipo) {
    case 'agregar': {
      const clave = claveDe(accion.producto)
      const existe = items.find((i) => i.clave === clave)
      if (existe) {
        return items.map((i) =>
          i.clave === clave ? { ...i, cantidad: Math.min(i.cantidad + accion.cantidad, CANTIDAD_MAXIMA) } : i,
        )
      }
      return [...items, { clave, producto: accion.producto, cantidad: Math.min(accion.cantidad, CANTIDAD_MAXIMA) }]
    }
    case 'cantidad':
      return items
        .map((i) => (i.clave === accion.clave ? { ...i, cantidad: Math.min(accion.cantidad, CANTIDAD_MAXIMA) } : i))
        .filter((i) => i.cantidad > 0)
    case 'quitar':
      return items.filter((i) => i.clave !== accion.clave)
    case 'vaciar':
      return []
    default:
      return items
  }
}

function leerGuardado() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_STORAGE))
    return Array.isArray(guardado) ? guardado : []
  } catch {
    return [] // sin storage o datos dañados: carrito vacío
  }
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], leerGuardado)

  // El carrito se recuerda aunque se recargue la página
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items))
    } catch {
      /* sin storage: el carrito dura mientras la página esté abierta */
    }
  }, [items])

  const valor = useMemo(() => {
    const cantidadTotal = items.reduce((suma, i) => suma + i.cantidad, 0)
    const subtotal = items.reduce((suma, i) => suma + precioANumero(i.producto.precio) * i.cantidad, 0)
    // Descuento de cada producto si se paga con depósito o transferencia
    const ahorroTransferencia = items.reduce(
      (suma, i) => suma + (precioANumero(i.producto.precio) * i.cantidad * porcentaje(i.producto.descuento)) / 100,
      0,
    )
    return {
      items,
      cantidadTotal,
      subtotal,
      ahorroTransferencia,
      totalTransferencia: subtotal - ahorroTransferencia,
      agregar: (producto, cantidad = 1) => dispatch({ tipo: 'agregar', producto, cantidad }),
      cambiarCantidad: (clave, cantidad) => dispatch({ tipo: 'cantidad', clave, cantidad }),
      quitar: (clave) => dispatch({ tipo: 'quitar', clave }),
      vaciar: () => dispatch({ tipo: 'vaciar' }),
    }
  }, [items])

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>
}

export function useCart() {
  const contexto = useContext(CartContext)
  if (!contexto) throw new Error('useCart tiene que usarse dentro de <CartProvider>')
  return contexto
}

// ---------- Botón "Agregar al carrito" ----------
// Sin usuario con sesión iniciada lleva al login (como en el sitio original).
// `className` reemplaza el estilo de arranque (ESTILO_AGREGAR) si la tarjeta necesita otro tamaño.
export const ESTILO_AGREGAR =
  'h-11 w-full cursor-pointer rounded-[50px] bg-primary text-[0.95rem] font-semibold text-white shadow-[0_4px_8px_rgba(0,0,0,0.25)] hover:bg-secondary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-background'

export function AddToCartButton({ producto, className = ESTILO_AGREGAR }) {
  const { agregar } = useCart()
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const [agregado, setAgregado] = useState(false)

  function alTocar(e) {
    e.stopPropagation() // si el botón está dentro de una tarjeta, no abre la página del producto
    if (!usuario) {
      navegar('/login?desde=agregar')
      return
    }
    agregar(producto)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={alTocar}
      className={className}
    >
      {agregado ? '¡Agregado!' : 'Agregar al carrito'}
    </button>
  )
}

// ---------- Globito con la cantidad (para el ícono del carrito) ----------
export function CartBadge() {
  const { cantidadTotal } = useCart()
  if (cantidadTotal === 0) return null
  return (
    <span
      className="absolute -right-2.5 -top-2 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[0.65rem] font-bold leading-5 text-white"
      aria-label={`${cantidadTotal} productos en el carrito`}
    >
      {cantidadTotal > 99 ? '99+' : cantidadTotal}
    </span>
  )
}

// ---------- Página del carrito ----------
export default function Cart() {
  useTitulo('Carrito')
  const { items, cantidadTotal, subtotal, ahorroTransferencia, totalTransferencia, cambiarCantidad, quitar, vaciar } = useCart()
  const [medio, setMedio] = useState('tarjeta') // 'tarjeta' | 'transferencia'
  const [cuotas, setCuotas] = useState(OPCIONES_CUOTAS[OPCIONES_CUOTAS.length - 1])
  const [aviso, setAviso] = useState('')

  const total = medio === 'transferencia' ? totalTransferencia : subtotal
  const valorCuota = Math.ceil(total / cuotas)

  if (items.length === 0) return <CarritoVacio />

  return (
    <main className="flex-1 px-4 py-8 min-[768px]:px-10">
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[1.5rem] font-bold">
            Carrito <span className="text-[1rem] font-normal text-[#475569]">({cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'})</span>
          </h2>
          <button type="button" onClick={vaciar} className="cursor-pointer text-[0.85rem] font-semibold text-primary hover:underline">
            Vaciar carrito
          </button>
        </div>

        <div className="mt-5 grid gap-6 min-[900px]:grid-cols-[1fr_360px] min-[900px]:items-start">
          {/* Productos */}
          <ul className="flex flex-col gap-3">
            {items.map(({ clave, producto, cantidad }) => (
              <li key={clave} className="flex gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-3 shadow-[0_2px_6px_rgba(15,23,42,0.08)] min-[600px]:gap-4 min-[600px]:p-4">
                <img src={'/' + producto.imagen} alt="" className="size-20 shrink-0 object-contain min-[600px]:size-24" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[0.9rem] font-semibold leading-[1.3]">{producto.nombre}</h3>
                    <button
                      type="button"
                      onClick={() => quitar(clave)}
                      aria-label={`Quitar ${producto.nombre} del carrito`}
                      className="shrink-0 cursor-pointer text-[#64748B] hover:text-error"
                    >
                      <i className="fa-solid fa-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center overflow-hidden rounded-full border border-[rgba(15,23,42,0.2)]">
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(clave, cantidad - 1)}
                        aria-label="Quitar una unidad"
                        className="size-8 cursor-pointer hover:bg-[#E2E8F0]"
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center text-[0.9rem] font-semibold" aria-live="polite">{cantidad}</span>
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(clave, cantidad + 1)}
                        aria-label="Agregar una unidad"
                        className="size-8 cursor-pointer hover:bg-[#E2E8F0]"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-[1.1rem] font-bold text-primary">{formatoPesos(precioANumero(producto.precio) * cantidad)}</p>
                      {cantidad > 1 && <p className="text-[0.75rem] text-[#64748B]">{producto.precio} c/u</p>}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Resumen, medios de pago y cuotas */}
          <aside className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-5 shadow-[0_4px_12px_rgba(15,23,42,0.12)] min-[900px]:sticky min-[900px]:top-[94px]">
            <h3 className="text-[1.1rem] font-bold">Resumen</h3>

            <fieldset className="mt-4 flex flex-col gap-2">
              <legend className="text-[0.85rem] font-semibold">Medio de pago</legend>
              <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[rgba(15,23,42,0.15)] p-3 text-[0.9rem] has-[:checked]:border-primary has-[:checked]:bg-[rgba(79,70,229,0.06)]">
                <input type="radio" name="medio" checked={medio === 'tarjeta'} onChange={() => setMedio('tarjeta')} className="mt-1 accent-primary" />
                <span><strong>Tarjeta</strong><br /><span className="text-[#475569]">Hasta {OPCIONES_CUOTAS[OPCIONES_CUOTAS.length - 1]} cuotas sin interés</span></span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-[rgba(15,23,42,0.15)] p-3 text-[0.9rem] has-[:checked]:border-primary has-[:checked]:bg-[rgba(79,70,229,0.06)]">
                <input type="radio" name="medio" checked={medio === 'transferencia'} onChange={() => setMedio('transferencia')} className="mt-1 accent-primary" />
                <span><strong>Depósito o transferencia</strong><br /><span className="text-[#475569]">Con descuento en cada producto</span></span>
              </label>
            </fieldset>

            {medio === 'tarjeta' && (
              <div className="mt-4 flex flex-col gap-1.5">
                <label htmlFor="cuotas" className="text-[0.85rem] font-semibold">Cuotas</label>
                <select
                  id="cuotas"
                  value={cuotas}
                  onChange={(e) => setCuotas(Number(e.target.value))}
                  className="h-11 w-full cursor-pointer rounded-xl border border-[rgba(15,23,42,0.2)] bg-white px-4 text-[0.95rem] focus:border-primary focus:shadow-[0_0_0_3px_rgba(79,70,229,0.3)] focus:outline-none"
                >
                  {OPCIONES_CUOTAS.map((n) => (
                    <option key={n} value={n}>
                      {n === 1 ? '1 pago' : `${n} cuotas sin interés`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <dl className="mt-5 flex flex-col gap-2 border-t border-[rgba(15,23,42,0.1)] pt-4 text-[0.9rem]">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatoPesos(subtotal)}</dd></div>
              {medio === 'transferencia' && ahorroTransferencia > 0 && (
                <div className="flex justify-between text-[#166534]"><dt>Descuento por transferencia</dt><dd>− {formatoPesos(ahorroTransferencia)}</dd></div>
              )}
              <div className="flex justify-between text-[1.15rem] font-bold"><dt>Total</dt><dd>{formatoPesos(total)}</dd></div>
            </dl>

            {medio === 'tarjeta' && (
              <p className="mt-3 rounded-xl bg-[rgba(22,163,74,0.1)] p-3 text-[0.9rem] font-semibold text-[#166534]">
                {cuotas === 1 ? `Un solo pago de ${formatoPesos(total)}` : `${cuotas} cuotas de ${formatoPesos(valorCuota)} sin interés`}
              </p>
            )}

            <button
              type="button"
              disabled={!COMPRAS_HABILITADAS}
              aria-describedby={COMPRAS_HABILITADAS ? undefined : 'compras-aviso'}
              onClick={() => setAviso('Todavía no hay un medio de pago conectado: el pedido no se envía a ningún lado.')}
              className="mt-5 h-11 w-full cursor-pointer rounded-[50px] bg-primary text-[0.95rem] font-semibold text-white shadow-[0_4px_8px_rgba(0,0,0,0.25)] hover:bg-secondary disabled:cursor-not-allowed disabled:bg-[#E2E8F0] disabled:text-[#475569] disabled:shadow-none disabled:hover:bg-[#E2E8F0]"
            >
              Finalizar compra
            </button>
            {!COMPRAS_HABILITADAS && (
              <p id="compras-aviso" className="mt-3 text-center text-[0.8rem] text-[#475569]">
                Las compras todavía no están habilitadas. Este sitio es un proyecto de demostración.
              </p>
            )}
            {aviso && <p role="status" className="mt-3 rounded-xl bg-[#F1F5F9] p-3 text-[0.85rem] text-[#475569]">{aviso}</p>}
          </aside>
        </div>
      </div>
    </main>
  )
}
