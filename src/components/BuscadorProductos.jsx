import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCatalogo } from '../catalogo.jsx'
import { buscarProductos, idDe, rutaDe } from '../utils/productos.js'

const MINIMO = 2 // letras que hay que escribir para que aparezcan sugerencias

// Buscador del header: mientras se escribe sugiere productos y, al elegir uno, abre la página de ese producto.
// Funciona con el teclado (flechas, Enter y Esc) y avisa su estado a los lectores de pantalla (patrón "combobox").
export default function BuscadorProductos() {
  const navegar = useNavigate()
  const { productos: catalogo, cargando } = useCatalogo()
  const id = useId()
  const contenedor = useRef(null)
  const [consulta, setConsulta] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(-1) // posición de la sugerencia resaltada con el teclado

  const escribiendo = consulta.trim().length >= MINIMO
  const resultados = useMemo(() => (escribiendo ? buscarProductos(catalogo, consulta) : []), [catalogo, consulta, escribiendo])
  const visible = abierto && escribiendo

  // Se cierra al tocar fuera
  useEffect(() => {
    const fuera = (e) => {
      if (!contenedor.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [])

  function elegir(producto) {
    navegar(rutaDe(producto))
    setConsulta('')
    setAbierto(false)
    setActivo(-1)
    document.activeElement?.blur()
  }

  function alTeclear(e) {
    if (e.key === 'Escape') {
      setAbierto(false)
      setActivo(-1)
    } else if (e.key === 'ArrowDown' && resultados.length) {
      e.preventDefault()
      setAbierto(true)
      setActivo((a) => (a + 1) % resultados.length)
    } else if (e.key === 'ArrowUp' && resultados.length) {
      e.preventDefault()
      setActivo((a) => (a <= 0 ? resultados.length - 1 : a - 1))
    } else if (e.key === 'Enter' && visible && resultados.length) {
      e.preventDefault()
      elegir(resultados[activo >= 0 ? activo : 0])
    }
  }

  return (
    <div
      ref={contenedor}
      className="w-[180px] max-1099:absolute max-1099:top-1/2 max-1099:left-1/2 max-1099:[transform:translate(-50%,-50%)] max-400:w-[110px] min-[768px]:w-[240px] min-[1100px]:relative min-[1100px]:w-[200px] min-[1100px]:mx-auto min-[1280px]:w-[340px]"
    >
      <input
        type="search"
        role="combobox"
        aria-expanded={visible}
        aria-controls={id + '-lista'}
        aria-autocomplete="list"
        aria-activedescendant={visible && activo >= 0 ? `${id}-${activo}` : undefined}
        aria-label="Buscar productos"
        autoComplete="off"
        placeholder="Buscar..."
        value={consulta}
        onChange={(e) => {
          setConsulta(e.target.value)
          setAbierto(true)
          setActivo(-1)
        }}
        onFocus={() => setAbierto(true)}
        onKeyDown={alTeclear}
        className="bg-white text-secondary border border-[rgba(15,23,42,0.2)] rounded-[999px] px-[14px] w-full h-9 text-[0.9rem] shadow-[0_1px_3px_rgba(15,23,42,0.1)] [transition:border-color_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! placeholder:text-[#64748B] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(79,70,229,0.3)]"
      />

      {visible && (
        <div className="absolute top-full left-1/2 z-30 mt-2 w-[min(380px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-xl border border-[rgba(15,23,42,0.08)] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.2)] min-[1100px]:left-0 min-[1100px]:translate-x-0 min-[1100px]:w-[max(100%,380px)]">
          {resultados.length === 0 ? (
            <p className="px-4 py-3 text-[0.9rem] text-[#475569]" role="status">
              {cargando ? 'Cargando productos…' : `No encontramos productos para “${consulta.trim()}”.`}
            </p>
          ) : (
            <ul id={id + '-lista'} role="listbox" aria-label="Productos sugeridos" className="max-h-[min(70vh,440px)] overflow-y-auto p-1.5">
              {resultados.map((p, i) => (
                <li
                  key={idDe(p)}
                  id={`${id}-${i}`}
                  role="option"
                  aria-selected={i === activo}
                  onMouseDown={(e) => e.preventDefault()} // no le saca el foco al campo
                  onClick={() => elegir(p)}
                  onMouseEnter={() => setActivo(i)}
                  className={'flex cursor-pointer items-center gap-3 rounded-lg p-2 ' + (i === activo ? 'bg-[rgba(79,70,229,0.08)]' : '')}
                >
                  <img className="size-12 shrink-0 rounded-md bg-white object-contain" src={'/' + p.imagen} alt="" loading="lazy" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.04em] text-primary">{p.categoria}</span>
                    <span className="line-clamp-2 block text-[0.85rem] font-semibold leading-[1.25] text-secondary">{p.nombre}</span>
                  </span>
                  <span className="shrink-0 text-[0.9rem] font-bold text-primary">{p.precio}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
