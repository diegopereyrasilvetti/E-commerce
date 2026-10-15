import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalogo } from '../catalogo.jsx'

const INTERVALO = 8000 // cambia cada 8 segundos

// Mezcla la lista y toma `n`, evitando repetir los que ya se ven si alcanzan los demás
function elegir(n, actuales, catalogo) {
  let pool = catalogo.filter((p) => !actuales.includes(p))
  if (pool.length < n) pool = catalogo.slice()
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(n, pool.length))
}

const sinAnimaciones = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// "Productos destacados": tarjetas al azar que se renuevan solas.
// `verTodos` es el enlace que va a la derecha del título; `titulo` y `className` ajustan el texto y el margen de la sección.
export default function Destacados({ onAbrir, verTodos, titulo = 'Productos destacados', className = '' }) {
  const { productos: catalogo } = useCatalogo()
  const grilla = useRef(null)
  const [productos, setProductos] = useState([])
  const [visible, setVisible] = useState(true)
  const actuales = useRef([])
  const pausado = useRef(false)

  // Cuántas tarjetas mostrar: las que entran en una fila (en celular, 2 filas de 2 columnas)
  const cantidad = useCallback(() => {
    const columnas = getComputedStyle(grilla.current).gridTemplateColumns.split(' ').length
    return columnas > 2 ? columnas : 4
  }, [])

  const renovar = useCallback(() => {
    actuales.current = elegir(cantidad(), actuales.current, catalogo)
    setProductos(actuales.current)
  }, [cantidad, catalogo])

  useEffect(() => {
    if (!catalogo.length) return // todavía no llegaron los productos de la API
    renovar()
    let espera
    const timer = sinAnimaciones()
      ? null
      : setInterval(() => {
          if (pausado.current) return
          setVisible(false) // se desvanece, cambia y vuelve a aparecer
          espera = setTimeout(() => { renovar(); setVisible(true) }, 300)
        }, INTERVALO)

    // Si cambia el ancho de la pantalla puede cambiar cuántas tarjetas entran
    let ajuste
    const alCambiarTamano = () => {
      clearTimeout(ajuste)
      ajuste = setTimeout(() => { if (cantidad() !== actuales.current.length) renovar() }, 150)
    }
    window.addEventListener('resize', alCambiarTamano)
    return () => {
      clearInterval(timer)
      clearTimeout(espera)
      clearTimeout(ajuste)
      window.removeEventListener('resize', alCambiarTamano)
    }
  }, [renovar, cantidad, catalogo])

  if (!catalogo.length) return null

  // Se pausa mientras el mouse o el foco del teclado están sobre las tarjetas
  const pausar = () => { pausado.current = true }
  const seguir = () => { pausado.current = false }

  return (
    <section className={className} aria-labelledby="destacados-titulo">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="destacados-titulo" className="mt-0 mb-4 pl-3 border-l-4 border-background text-[length:clamp(0.98rem,2.2vw,1.15rem)] text-secondary">
          {titulo}
        </h2>
        {verTodos}
      </div>
      <div
        ref={grilla}
        onMouseEnter={pausar}
        onMouseLeave={seguir}
        onFocus={pausar}
        onBlur={seguir}
        style={{ opacity: visible ? undefined : 0 }}
        className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2.5 min-[768px]:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] min-[768px]:gap-4 [transition:opacity_0.3s_ease] motion-reduce:[transition:none]!"
      >
        {productos.map((p) => (
          <Link
            key={p.imagen}
            to={'/productos/' + p.categoriaId}
            onClick={(e) => { e.preventDefault(); onAbrir(p) }}
            className="flex flex-col gap-1.5 p-2.5 min-[768px]:gap-2 min-[768px]:p-3.5 bg-white text-secondary border border-[rgba(15,23,42,0.08)] rounded-xl shadow-[0_2px_6px_rgba(15,23,42,0.08)] [transition:transform_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! hover:[transform:translateY(-3px)] hover:shadow-[0_8px_18px_rgba(15,23,42,0.18)] focus-visible:[transform:translateY(-3px)] focus-visible:shadow-[0_8px_18px_rgba(15,23,42,0.18)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2"
          >
            <img className="w-full aspect-square object-contain bg-white rounded-lg" src={'/' + p.imagen} alt="" loading="lazy" />
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.04em] text-primary">{p.categoria}</span>
            <h3 className="line-clamp-3 text-[0.8rem] min-[768px]:text-[0.9rem] font-semibold leading-[1.3]">{p.nombre}</h3>
            <span className="mt-auto text-[1.1rem] min-[768px]:text-[1.3rem] font-bold text-primary">{p.precio}</span>
            <span className="p-2 rounded-[50px] bg-primary text-white text-center text-[0.78rem] min-[768px]:text-[0.85rem] font-semibold">Ver producto</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
