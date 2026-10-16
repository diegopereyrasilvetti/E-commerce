import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AddToCartButton, OPCIONES_CUOTAS } from '../cart.jsx'
import { useCatalogo } from '../catalogo.jsx'
import { formatoPesos, porcentajeDe, precioANumero, precioConDescuento, valorCuota } from '../utils/dinero.js'
import { productoPorId } from '../utils/productos.js'
import { useTitulo } from '../utils/useTitulo.js'

const CUOTAS_SIN_INTERES = OPCIONES_CUOTAS.filter((c) => c > 1)

const BOTON_AGREGAR =
  'h-12 w-full cursor-pointer rounded-[50px] bg-primary text-[1rem] font-semibold text-white shadow-[0_4px_8px_rgba(0,0,0,0.25)] hover:bg-secondary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-background'

// Un mensaje centrado dentro de una tarjeta (cargando, error, no existe)
function Aviso({ children }) {
  return (
    <main className="flex-1 px-4 py-10">
      <div className="mx-auto w-full max-w-[560px] rounded-2xl bg-white p-8 text-center shadow-[0_4px_12px_rgba(15,23,42,0.12)]">{children}</div>
    </main>
  )
}

// Página de un producto: la foto en grande a la izquierda y, a la derecha, el precio, el descuento y las cuotas
export default function Producto() {
  const { slug } = useParams()
  const { productos, cargando, error, recargar } = useCatalogo()
  const producto = productoPorId(productos, slug)
  useTitulo(producto ? producto.nombre : 'Producto')

  // Al pasar de un producto a otro (por ejemplo desde el buscador) se vuelve arriba
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (cargando) return <Aviso><p role="status" className="text-[#475569]">Cargando producto…</p></Aviso>

  if (error) {
    return (
      <Aviso>
        <p role="alert" className="font-semibold text-error">{error}</p>
        <button type="button" onClick={recargar} className="mt-4 h-10 cursor-pointer rounded-[50px] bg-primary px-6 text-[0.9rem] font-semibold text-white hover:bg-secondary">
          Reintentar
        </button>
      </Aviso>
    )
  }

  if (!producto) {
    return (
      <Aviso>
        <h2 className="text-[1.5rem] font-bold">No encontramos este producto</h2>
        <p className="mt-2 text-[#475569]">Puede que ya no esté disponible.</p>
        <Link to="/productos" className="mt-5 inline-block rounded-[50px] bg-primary px-6 py-2.5 font-semibold text-white hover:bg-secondary">
          Ver productos
        </Link>
      </Aviso>
    )
  }

  const precio = precioANumero(producto.precio)
  const descuento = porcentajeDe(producto.descuento)
  const precioTransferencia = precioConDescuento(precio, descuento)
  const mayorCuota = CUOTAS_SIN_INTERES[CUOTAS_SIN_INTERES.length - 1]

  return (
    <main className="flex-1 px-4 py-6 min-[768px]:px-10 min-[768px]:py-10">
      <div className="mx-auto w-full max-w-[1100px]">
        <nav aria-label="Ruta de navegación" className="flex flex-wrap items-center gap-x-2 text-[0.85rem] text-[#475569]">
          <Link to="/" className="hover:text-primary hover:underline">Inicio</Link>
          <span aria-hidden="true">/</span>
          <Link to="/productos" className="hover:text-primary hover:underline">Productos</Link>
          <span aria-hidden="true">/</span>
          <Link to={'/productos/' + producto.categoriaId} className="hover:text-primary hover:underline">{producto.categoria}</Link>
        </nav>

        <div className="mt-5 grid gap-6 min-[900px]:grid-cols-2 min-[900px]:items-start min-[900px]:gap-10">
          {/* Izquierda: el producto en grande */}
          <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-4 shadow-[0_4px_12px_rgba(15,23,42,0.12)] min-[600px]:p-8 min-[900px]:sticky min-[900px]:top-[94px]">
            <img className="mx-auto aspect-square w-full max-w-[560px] object-contain" src={'/' + producto.imagen} alt={producto.nombre} />
          </div>

          {/* Derecha: precio, descuento y cuotas */}
          <div className="flex flex-col gap-5">
            <div>
              <Link to={'/productos/' + producto.categoriaId} className="text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-primary hover:underline">
                {producto.categoria}
              </Link>
              <h2 className="mt-1 text-[1.4rem] font-bold leading-[1.3] min-[768px]:text-[1.75rem]">{producto.nombre}</h2>
            </div>

            <div>
              <p className="text-[2.6rem] font-bold leading-none text-primary max-599:text-[2.2rem]">{producto.precio}</p>
              {producto.precioSinImpuestos && (
                <p className="mt-2 text-[0.9rem] text-[#475569]">Precio s/imp. nac. {producto.precioSinImpuestos}</p>
              )}
            </div>

            {descuento > 0 && (
              <section className="rounded-xl bg-[rgba(22,163,74,0.1)] p-4" aria-label="Descuento por transferencia">
                <p className="flex items-center gap-2 text-[0.95rem] font-semibold text-[#166534]">
                  <i className="fa-solid fa-tag" aria-hidden="true"></i>
                  {descuento}% de descuento pagando con depósito o transferencia
                </p>
                <p className="mt-1 text-[1.7rem] font-bold leading-[1.2] text-[#166534]">{formatoPesos(precioTransferencia)}</p>
                <p className="text-[0.85rem] text-[#166534]">Ahorrás {formatoPesos(precio - precioTransferencia)}</p>
              </section>
            )}

            <section className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-4" aria-labelledby="cuotas-titulo">
              <h3 id="cuotas-titulo" className="flex items-center gap-2 text-[0.95rem] font-bold">
                <i className="fa-solid fa-credit-card text-primary" aria-hidden="true"></i>
                Hasta {mayorCuota} cuotas sin interés con tarjeta
              </h3>
              <ul className="mt-3 flex flex-col divide-y divide-[rgba(15,23,42,0.08)]">
                {CUOTAS_SIN_INTERES.map((cuotas) => (
                  <li key={cuotas} className="flex items-baseline justify-between gap-3 py-2 text-[0.95rem]">
                    <span>{cuotas} cuotas de</span>
                    <strong className="text-[1.1rem] text-secondary">{formatoPesos(valorCuota(precio, cuotas))}</strong>
                  </li>
                ))}
              </ul>
            </section>

            {producto.garantia && (
              <p className="flex items-center gap-2 text-[0.9rem] text-[#334155]">
                <i className="fa-solid fa-shield-halved text-primary" aria-hidden="true"></i>
                Garantía - {producto.garantia}
              </p>
            )}

            <AddToCartButton producto={producto} className={BOTON_AGREGAR} />
            <Link to={'/productos/' + producto.categoriaId} className="text-center text-[0.9rem] font-semibold text-primary hover:underline">
              ← Ver más en {producto.categoria}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
