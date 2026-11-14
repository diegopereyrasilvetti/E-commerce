// Tarjetas "fantasma" que se muestran mientras llegan los productos de la API.
// El contenedor avisa a los lectores de pantalla; las tarjetas en sí se ocultan para ellos.
export default function EsqueletoTarjetas({ cantidad = 4, className = '' }) {
  return (
    <div role="status" aria-label="Cargando productos" className={className}>
      {Array.from({ length: cantidad }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="flex flex-col gap-2 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-3 animate-pulse motion-reduce:animate-none"
        >
          <div className="aspect-square w-full rounded-lg bg-[#E2E8F0]" />
          <div className="h-3 w-1/3 rounded-full bg-[#E2E8F0]" />
          <div className="h-4 w-full rounded-full bg-[#E2E8F0]" />
          <div className="h-4 w-2/3 rounded-full bg-[#E2E8F0]" />
          <div className="mt-2 h-6 w-1/2 rounded-full bg-[#E2E8F0]" />
          <div className="h-9 w-full rounded-full bg-[#E2E8F0]" />
        </div>
      ))}
    </div>
  )
}
