import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Destacados from '../components/Destacados.jsx'
import ProductoCard from '../components/ProductoCard.jsx'
import ProductoDetalle from '../components/ProductoDetalle.jsx'
import { CATEGORIAS } from '../data/categorias.js'
import { PRODUCTOS } from '../data/productos.js'
import { claveDe, precioANumero } from '../cart.jsx'
import { useTitulo } from '../utils/useTitulo.js'

// Tarjetas de categoría: las grandes (desplegable "Categorías") y las chicas (siempre visibles)
const CATEGORIA_GRANDE =
  'group/cat flex flex-col items-center justify-center gap-3 h-full min-h-[150px] px-2 min-[600px]:px-4 min-[768px]:px-2 min-[1100px]:px-4 py-8 bg-white text-secondary text-center border border-[rgba(15,23,42,0.08)] rounded-2xl shadow-[0_4px_12px_rgba(15,23,42,0.12)] text-[0.9rem] max-400:text-[0.85rem] min-[600px]:text-[1.05rem] min-[768px]:text-[0.85rem] min-[900px]:text-[0.9rem] min-[1100px]:text-[1.05rem] leading-[1.25] font-bold [transition:background-color_0.2s,color_0.2s,border-color_0.2s,transform_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! hover:[transform:translateY(-4px)] hover:bg-primary hover:border-primary hover:shadow-[0_10px_24px_rgba(79,70,229,0.4)] hover:text-white focus-visible:[transform:translateY(-4px)] focus-visible:bg-primary focus-visible:border-primary focus-visible:shadow-[0_10px_24px_rgba(79,70,229,0.4)] focus-visible:text-white focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2'
const ICONO_GRANDE =
  'text-[2.25rem] min-[600px]:text-[2.75rem] min-[768px]:text-[2.25rem] min-[1100px]:text-[2.75rem] text-primary group-hover/cat:text-white group-focus-visible/cat:text-white'
const CATEGORIA_CHICA =
  'group/cat flex flex-col items-center justify-center gap-2 h-full min-h-[84px] px-3 max-400:px-2 min-[768px]:px-2 min-[900px]:px-3 py-4 bg-white text-secondary text-center border border-[rgba(15,23,42,0.08)] rounded-xl shadow-[0_2px_6px_rgba(15,23,42,0.08)] text-[0.9rem] max-400:text-[0.85rem] min-[768px]:text-[0.8rem] min-[900px]:text-[0.9rem] leading-[1.25] font-semibold [transition:background-color_0.2s,color_0.2s,border-color_0.2s,transform_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! hover:[transform:translateY(-2px)] hover:bg-primary hover:border-primary hover:shadow-[0_6px_14px_rgba(79,70,229,0.35)] hover:text-white focus-visible:[transform:translateY(-2px)] focus-visible:bg-primary focus-visible:border-primary focus-visible:shadow-[0_6px_14px_rgba(79,70,229,0.35)] focus-visible:text-white focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2'
const ICONO_CHICO = 'text-[1.4rem] text-primary group-hover/cat:text-white group-focus-visible/cat:text-white'

const sinAnimaciones = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Una categoría con sus productos, ordenables por precio
function Categoria({ categoria, productos, onAbrir }) {
  const [orden, setOrden] = useState('original')
  const lista = [...productos]
  if (orden === 'menor') lista.sort((a, b) => precioANumero(a.precio) - precioANumero(b.precio))
  if (orden === 'mayor') lista.sort((a, b) => precioANumero(b.precio) - precioANumero(a.precio))

  return (
    <section className="mt-6" id={categoria.id}>
      <h2 className="pb-2 border-b-2 border-primary text-[1.4rem] text-secondary">{categoria.nombre}</h2>
      <div className="flex items-center justify-end gap-2 mt-3 text-[0.9rem] max-599:text-[0.8rem] text-secondary">
        <label htmlFor={'orden-' + categoria.id}>Ordenar por</label>
        <select
          id={'orden-' + categoria.id}
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="pt-2 pr-8 pb-2 pl-[14px] max-599:pt-1.5 max-599:pr-7 max-599:pb-1.5 max-599:pl-3 border border-[rgba(15,23,42,0.2)] rounded-[999px] bg-white text-secondary cursor-pointer focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2"
        >
          <option value="original">Más relevantes</option>
          <option value="menor">Menor precio</option>
          <option value="mayor">Mayor precio</option>
        </select>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5 mt-4 max-599:grid-cols-[repeat(2,minmax(0,1fr))] max-599:gap-2.5 min-[900px]:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        {lista.length === 0 && (
          <p className="col-[1/-1] p-5 rounded-2xl bg-white text-center text-[#475569]">Todavía no hay productos en esta categoría.</p>
        )}
        {lista.map((p) => (
          <ProductoCard key={claveDe(p)} producto={p} onAbrir={onAbrir} />
        ))}
      </div>
    </section>
  )
}

// /productos -> destacados y categorías. /productos/:categoria -> solo los productos de esa categoría.
export default function Productos() {
  const { categoria: categoriaId } = useParams()
  const categoria = CATEGORIAS.find((c) => c.id === categoriaId)
  useTitulo(categoria ? categoria.nombre : 'Productos')
  const [categoriasAbiertas, setCategoriasAbiertas] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const desplegable = useRef(null)
  const seccion = useRef(null)

  // Al elegir una categoría se cierra el desplegable y se baja hasta sus productos
  useEffect(() => {
    setCategoriasAbiertas(false)
    if (categoria) seccion.current?.scrollIntoView({ behavior: sinAnimaciones() ? 'auto' : 'smooth', block: 'start' })
  }, [categoria])

  function verTodos(e) {
    e.preventDefault()
    setCategoriasAbiertas(true)
    desplegable.current.scrollIntoView({ behavior: sinAnimaciones() ? 'auto' : 'smooth', block: 'start' })
  }

  const miniNav = (
    <nav className="mt-4 min-[900px]:col-span-2" aria-label="Categorías de productos">
      <ul className="grid grid-cols-2 min-[768px]:grid-cols-5 gap-3">
        {CATEGORIAS.map((c) => (
          <li key={c.id}>
            <Link to={'/productos/' + c.id} className={CATEGORIA_CHICA}>
              <i className={`fa-solid ${c.icono} ${ICONO_CHICO}`} aria-hidden="true"></i>
              <span className="min-w-0 break-words">{c.nombre}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )

  return (
    <main className="flex-1 flex flex-col w-full max-w-[1200px] mx-auto px-4 pb-8 min-[900px]:grid min-[900px]:gap-8 min-[900px]:[align-items:start] min-[900px]:px-10 min-[900px]:pb-12">
      <details
        ref={desplegable}
        open={categoriasAbiertas}
        onToggle={(e) => setCategoriasAbiertas(e.currentTarget.open)}
        className="group w-full mt-6 min-[900px]:col-span-2"
      >
        <summary className="w-full max-w-[320px] mx-auto flex items-center justify-between px-5 py-3 rounded-[50px] bg-primary text-white font-semibold cursor-pointer [list-style:none] [&::-webkit-details-marker]:hidden after:content-['▾'] after:[transition:transform_0.2s] group-open:after:[transform:rotate(180deg)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2">
          Categorías
        </summary>
        <ul className="mt-4 grid grid-cols-2 min-[768px]:grid-cols-5 gap-3">
          {CATEGORIAS.map((c) => (
            <li key={c.id}>
              <Link to={'/productos/' + c.id} className={CATEGORIA_GRANDE}>
                <i className={`fa-solid ${c.icono} ${ICONO_GRANDE}`} aria-hidden="true"></i>
                <span className="min-w-0 break-words">{c.nombre}</span>
              </Link>
            </li>
          ))}
        </ul>
      </details>

      {categoria ? (
        <>
          <div ref={seccion} className="min-w-0 min-[900px]:col-span-2">
            <Categoria
              key={categoria.id}
              categoria={categoria}
              productos={PRODUCTOS.filter((p) => p.categoriaId === categoria.id)}
              onAbrir={setDetalle}
            />
          </div>
          {miniNav}
        </>
      ) : (
        <>
          <Destacados
            className="mt-6 min-[900px]:col-span-2 w-full"
            onAbrir={setDetalle}
            verTodos={<a className="shrink-0 text-primary font-semibold text-[0.75rem] hover:underline" href="#" onClick={verTodos}>Ver todos</a>}
          />
          <section
            className="relative overflow-hidden mt-6 min-[900px]:col-span-2 min-h-[220px] flex flex-col justify-center p-6 min-[600px]:p-8 bg-secondary bg-[radial-gradient(circle_at_88%_35%,rgba(79,70,229,0.55),transparent_55%),radial-gradient(circle_at_98%_95%,rgba(6,182,212,0.4),transparent_45%)] text-white border border-[rgba(99,102,241,0.4)] rounded-2xl shadow-[0_0_24px_rgba(79,70,229,0.35)]"
            aria-labelledby="bienvenida-titulo"
          >
            <div className="flex items-center gap-4">
              <img className="w-14 h-14 object-contain" src="/images/Imagen_de_ChatGPT_2_oct_2026_12_39_50_p.m.png" alt="" />
              <span className="inline-block px-4 py-1.5 rounded-full bg-[rgba(255,255,255,0.1)] text-[0.75rem] font-bold uppercase tracking-[0.05em]">Kodex Store</span>
            </div>
            <h2 id="bienvenida-titulo" className="mt-5 max-w-[26rem] text-[1.75rem] min-[600px]:text-[2.25rem] font-bold leading-[1.2]">
              ¡Bienvenido a tu <span className="text-background">próxima evolución!</span>
            </h2>
            <p className="mt-3 max-w-[26rem] text-[0.95rem] min-[600px]:text-[1.05rem] text-[#CBD5E1]">
              Explorá componentes de alto rendimiento y llevá tu setup al siguiente nivel.
            </p>
          </section>
          {miniNav}
          <p className="mt-6 p-5 rounded-2xl bg-white text-center text-[#475569] min-[900px]:col-span-2">Elegí una categoría para ver sus productos.</p>
        </>
      )}

      <ProductoDetalle producto={detalle} onCerrar={() => setDetalle(null)} />
    </main>
  )
}
