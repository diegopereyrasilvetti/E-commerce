import { useState } from 'react'
import { Link } from 'react-router-dom'
import Carrusel from '../components/Carrusel.jsx'
import Destacados from '../components/Destacados.jsx'
import ProductoDetalle from '../components/ProductoDetalle.jsx'
import CategoriasRapidas from '../components/CategoriasRapidas.jsx'
import { useTitulo } from '../utils/useTitulo.js'

const BENEFICIOS = [
  { icono: 'fa-truck-fast', negrita: 'Envío gratis', resto: ' a toda la Argentina' },
  { icono: 'fa-credit-card', negrita: '6 a 18 cuotas', resto: ' sin interés' },
  { icono: 'fa-shield-halved', negrita: 'Compra segura', resto: ' y protegida' },
  { icono: 'fa-box', negrita: 'Productos', resto: ' originales' },
]

export default function Inicio() {
  const [detalle, setDetalle] = useState(null)
  useTitulo()

  return (
    <main className="flex-1">
      <Carrusel />

      {/* Calculadora de cuello de botella: banner con un resultado de ejemplo */}
      <section className="w-full mb-6" aria-label="Calculadora de cuello de botella">
        <Link
          to="/calculadora"
          className="flex items-center gap-4 px-4 min-[768px]:px-10 py-4 bg-[linear-gradient(135deg,#011833,#0B2A5C)] text-white focus-visible:outline-3 focus-visible:outline-background focus-visible:-outline-offset-3"
          aria-label="Calculadora de cuello de botella: analizá si tus componentes son compatibles. Probar calculadora"
        >
          <div className="relative size-14 shrink-0" aria-hidden="true">
            <svg viewBox="0 0 56 56" className="size-full -rotate-90">
              <circle cx="28" cy="28" r="22" fill="none" strokeWidth="6" className="stroke-[rgba(255,255,255,0.15)]" />
              <circle cx="28" cy="28" r="22" fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-background" style={{ strokeDasharray: 138.23, strokeDashoffset: 8.29 }} />
            </svg>
            <span className="absolute inset-0 grid place-content-center text-[0.9rem] font-bold leading-none">94%</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[0.95rem] min-[768px]:text-[1.25rem] font-bold leading-[1.2] min-[768px]:whitespace-nowrap">
              Calculadora de <span className="text-background">cuello de botella</span>
            </h2>
            <p className="hidden min-[900px]:block min-[1280px]:hidden text-[0.8rem] text-[#CBD5E1] whitespace-nowrap">
              Analizá si tu procesador y tu placa de video son compatibles antes de comprar.
            </p>
          </div>

          <div className="hidden min-[1280px]:flex items-center gap-4 ml-auto" aria-hidden="true">
            <span className="px-3 py-1 rounded-full bg-[rgba(22,163,74,0.2)] text-[#86EFAC] text-[0.75rem] font-bold whitespace-nowrap">Muy equilibrado</span>
            <span className="flex items-center gap-2 text-[0.75rem] font-semibold">
              CPU<span className="w-16 h-2 rounded-full bg-[rgba(255,255,255,0.12)] overflow-hidden"><span className="block h-full rounded-full bg-primary" style={{ width: '90%' }} /></span>90%
            </span>
            <span className="flex items-center gap-2 text-[0.75rem] font-semibold">
              GPU<span className="w-16 h-2 rounded-full bg-[rgba(255,255,255,0.12)] overflow-hidden"><span className="block h-full rounded-full bg-background" style={{ width: '85%' }} /></span>85%
            </span>
            <span className="text-[0.6rem] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">Ejemplo</span>
          </div>

          <span className="ml-auto min-[1280px]:ml-0 shrink-0 inline-flex items-center gap-2 px-4 min-[768px]:px-5 py-2 rounded-full bg-primary text-white text-[0.8rem] min-[768px]:text-[0.9rem] font-semibold whitespace-nowrap">
            Probar<span className="hidden min-[768px]:inline"> calculadora</span>
            <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </span>
        </Link>
      </section>

      <Destacados
        className="w-full px-4 min-[768px]:px-10"
        onAbrir={setDetalle}
        verTodos={<Link className="shrink-0 text-primary font-semibold text-[0.75rem] hover:underline" to="/productos">Ver todos</Link>}
      />

      <section className="w-full max-w-[1200px] mx-auto px-4 mt-6 min-[768px]:px-10" aria-label="Beneficios">
        <ul className="grid grid-cols-[repeat(2,1fr)] gap-2 min-[768px]:grid-cols-[repeat(4,1fr)]">
          {BENEFICIOS.map((b) => (
            <li key={b.icono} className="flex items-center gap-2 px-3 py-2 bg-white border border-[rgba(15,23,42,0.08)] rounded-[10px] text-[0.78rem] leading-[1.25] shadow-[0_2px_6px_rgba(15,23,42,0.06)] [transition:transform_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! hover:[transform:translateY(-2px)] hover:shadow-[0_6px_14px_rgba(15,23,42,0.12)]">
              <i className={'fa-solid ' + b.icono} aria-hidden="true"></i>
              <span><strong>{b.negrita}</strong>{b.resto}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="w-full max-w-[1200px] mx-auto px-4 min-[768px]:px-10" aria-labelledby="categorias-home-titulo">
        <h2 id="categorias-home-titulo" className="mt-10 mb-4 pl-3 border-l-4 border-background text-[length:clamp(1.3rem,3vw,1.7rem)] text-secondary">
          Comprá por categoría
        </h2>
        <CategoriasRapidas />
      </section>

      <Link
        to="/productos"
        className="block w-[calc(100%-32px)] max-w-[1200px] my-10 mx-auto rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(15,23,42,0.25)] [transition:transform_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! hover:[transform:translateY(-3px)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.35)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-[3px] min-[768px]:w-[calc(100%-80px)] text-white"
      >
        <img className="w-full" src="/images/marketing/marketing3.png" alt="6 a 18 cuotas sin interés y envío gratis a toda la Argentina. Ver productos" />
      </Link>

      <ProductoDetalle producto={detalle} onCerrar={() => setDetalle(null)} />
    </main>
  )
}
