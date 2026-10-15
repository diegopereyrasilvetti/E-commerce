import { useEffect, useRef } from 'react'
import { AddToCartButton } from '../cart.jsx'

// Ventana con el detalle de un producto (imagen, precios, descuento y garantía).
// Se muestra cuando `producto` tiene un valor; `onCerrar` se llama al cerrarla (X, fondo oscuro o Esc).
export default function ProductoDetalle({ producto, onCerrar }) {
  const ref = useRef(null)

  useEffect(() => {
    const ventana = ref.current
    if (producto && !ventana.open) ventana.showModal()
    if (!producto && ventana.open) ventana.close()
  }, [producto])

  return (
    <dialog
      ref={ref}
      aria-labelledby="detalle-titulo"
      onClose={onCerrar}
      onClick={(e) => { if (e.target === ref.current) ref.current.close() }} // clic en el fondo oscuro = cerrar
      className="m-auto w-[min(860px,calc(100vw-24px))] max-h-[calc(100dvh-24px)] overflow-auto p-0 rounded-2xl bg-white text-secondary shadow-[0_20px_50px_rgba(15,23,42,0.45)] backdrop:bg-[rgba(15,23,42,0.65)]"
    >
      {producto && (
        <>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => ref.current.close()}
            className="absolute top-3 right-3 z-10 grid place-items-center size-9 rounded-full bg-[rgba(15,23,42,0.08)] text-secondary text-[1.1rem] cursor-pointer hover:bg-[rgba(15,23,42,0.16)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2"
          >
            ✕
          </button>
          <div className="relative grid grid-cols-1 min-[700px]:grid-cols-2">
            <div className="flex items-center justify-center p-6 bg-white">
              <img className="w-full max-w-[360px] aspect-square object-contain" src={'/' + producto.imagen} alt={producto.nombre} />
            </div>
            <div className="flex flex-col gap-3 p-6 min-[700px]:pr-14">
              {producto.categoria && (
                <span className="text-[0.75rem] font-semibold uppercase tracking-[0.04em] text-primary">{producto.categoria}</span>
              )}
              <h2 id="detalle-titulo" className="text-[1.25rem] min-[700px]:text-[1.4rem] font-bold leading-[1.3]">{producto.nombre}</h2>
              <span className="text-[2rem] font-bold text-primary">{producto.precio}</span>
              {producto.descuento && (
                <p className="p-3 rounded-xl bg-[rgba(22,163,74,0.1)] text-[#166534] text-[0.9rem] font-semibold">
                  Incluye {producto.descuento} de descuento por pago con depósito o transferencia.
                </p>
              )}
              {producto.precioSinImpuestos && (
                <p className="text-[0.9rem] text-[#475569]">Precio s/imp. nac. {producto.precioSinImpuestos}</p>
              )}
              {producto.garantia && <p className="flex items-center gap-2 text-[0.9rem]">Garantía - {producto.garantia}</p>}
              <AddToCartButton
                producto={producto}
                className="mt-auto w-full h-11 rounded-[50px] bg-primary text-white text-[0.95rem] font-semibold cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.25)] hover:bg-secondary focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2"
              />
            </div>
          </div>
        </>
      )}
    </dialog>
  )
}
