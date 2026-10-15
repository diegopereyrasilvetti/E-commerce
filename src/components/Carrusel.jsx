import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const SLIDES = [
  { imagen: '/images/marketing/marketing1.png', alt: 'Los mejores productos de computación. Ver productos' },
  { imagen: '/images/marketing/marketing2.png', alt: 'Coolers y water cooling de alto rendimiento. Ver productos' },
]
const INTERVALO = 4000 // cambia cada 4 segundos

const FLECHA =
  'absolute top-1/2 z-[2] w-10 h-10 max-767:w-8 max-767:h-8 [transform:translateY(-50%)] rounded-[50%] bg-[rgba(15,23,42,0.7)] text-white text-[1.1rem] max-767:text-[0.9rem] cursor-pointer [transition:background-color_0.2s] motion-reduce:[transition:none]! hover:bg-primary focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2'

// Carrusel de promociones: cambia solo, se pausa con el mouse o el foco encima
export default function Carrusel() {
  const [actual, setActual] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [reinicio, setReinicio] = useState(0) // al tocar una flecha se reinicia la cuenta de los 4 segundos

  useEffect(() => {
    if (pausado || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setActual((a) => (a + 1) % SLIDES.length), INTERVALO)
    return () => clearInterval(timer)
  }, [pausado, reinicio])

  function ir(indice) {
    setActual((indice + SLIDES.length) % SLIDES.length)
    setReinicio((r) => r + 1)
  }

  return (
    <section className="w-full" id="marketing" aria-label="Promociones">
      <div
        className="relative w-full"
        role="group"
        aria-roledescription="carrusel"
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
        onFocus={() => setPausado(true)}
        onBlur={() => setPausado(false)}
      >
        <button type="button" className={FLECHA + ' left-2'} aria-label="Imagen anterior" onClick={() => ir(actual - 1)}>&#10094;</button>
        <div className="overflow-hidden">
          <div
            className="flex [transition:transform_0.5s_ease] motion-reduce:[transition:none]!"
            style={{ transform: `translateX(-${actual * 100}%)` }}
          >
            {SLIDES.map((s, i) => (
              <Link
                key={s.imagen}
                to="/productos"
                className="block flex-[0_0_100%] text-white"
                inert={i !== actual} // las imágenes fuera de vista no reciben foco con el teclado
                aria-hidden={i !== actual}
              >
                <img className="w-full" src={s.imagen} alt={s.alt} />
              </Link>
            ))}
          </div>
        </div>
        <button type="button" className={FLECHA + ' right-2'} aria-label="Imagen siguiente" onClick={() => ir(actual + 1)}>&#10095;</button>
      </div>
    </section>
  )
}
