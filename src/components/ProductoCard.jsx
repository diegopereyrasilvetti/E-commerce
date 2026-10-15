import { AddToCartButton } from '../cart.jsx'

// Tarjeta de producto de la lista de una categoría. Al tocarla (o con Enter / espacio) se abre el detalle.
export default function ProductoCard({ producto, onAbrir }) {
  return (
    <article
      tabIndex={0}
      aria-haspopup="dialog"
      onClick={() => onAbrir(producto)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
          e.preventDefault()
          onAbrir(producto)
        }
      }}
      className="article flex flex-col gap-2.5 max-599:gap-2 w-full p-5 max-599:p-2.5 bg-white text-secondary border border-[rgba(15,23,42,0.08)] rounded-2xl max-599:rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.12)] [transition:transform_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! hover:[transform:translateY(-4px)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.2)] cursor-pointer focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2"
    >
      <img className="w-full max-w-[250px] aspect-square object-contain self-center" src={'/' + producto.imagen} alt="" />
      <h3 className="text-[1rem] leading-[1.4] max-599:text-[0.8rem] max-599:leading-[1.3] max-599:[overflow-wrap:anywhere]">
        <strong className="font-semibold">{producto.nombre}</strong>
      </h3>
      <span className="precio text-[1.6rem] max-599:text-[1.1rem] font-bold text-primary">{producto.precio}</span>
      <p className="text-[12px] leading-[1.5] max-599:text-[10px] max-599:leading-[1.4] text-[#475569]">
        Incluye {producto.descuento} de descuento por pago con depósito o transferencia. Precio s/imp. nac. {producto.precioSinImpuestos}
      </p>
      <span className="text-[0.85rem] max-599:text-[0.7rem] text-[#475569]">Garantía - {producto.garantia}</span>
      <AddToCartButton
        producto={producto}
        className="cursor-pointer w-full h-[42px] max-599:h-[34px] mt-auto rounded-[50px] bg-primary text-white text-[0.95rem] max-599:text-[0.78rem] font-semibold shadow-[0_4px_8px_rgba(0,0,0,0.25)] [transition:background-color_0.2s,transform_0.2s] motion-reduce:[transition:none]! hover:bg-secondary hover:[transform:translateY(-1px)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2"
      />
    </article>
  )
}
