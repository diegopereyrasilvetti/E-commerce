import { useEffect, useRef, useState } from 'react'
import { primerNombre } from '../auth.jsx'

// Círculo con la inicial del usuario
export function Avatar({ usuario, className = '' }) {
  return (
    <span
      className={'grid size-8 shrink-0 place-items-center rounded-full bg-primary text-[0.9rem] font-bold uppercase text-white ' + className}
      aria-hidden="true"
    >
      {primerNombre(usuario).charAt(0)}
    </span>
  )
}

// Menú del usuario para la barra de escritorio: su nombre y, al tocarlo, una lista con las acciones de la cuenta
export default function MenuUsuario({ usuario, onCerrarSesion }) {
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef(null)
  const boton = useRef(null)

  // Se cierra al tocar fuera o con Esc (y el foco vuelve al botón)
  useEffect(() => {
    if (!abierto) return
    const fuera = (e) => {
      if (!contenedor.current.contains(e.target)) setAbierto(false)
    }
    const escape = (e) => {
      if (e.key === 'Escape') {
        setAbierto(false)
        boton.current.focus()
      }
    }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', escape)
    }
  }, [abierto])

  return (
    <div ref={contenedor} className="relative">
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        className="flex cursor-pointer items-center gap-2 rounded-full py-1 pr-3 pl-1 text-[18px] font-semibold text-secondary [transition:background-color_0.2s] motion-reduce:[transition:none]! hover:bg-[rgba(15,23,42,0.06)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Avatar usuario={usuario} />
        <span className="max-w-[140px] truncate">{primerNombre(usuario)}</span>
        <i className={'fa-solid fa-chevron-down text-[0.7rem] [transition:transform_0.2s] motion-reduce:[transition:none]! ' + (abierto ? 'rotate-180' : '')} aria-hidden="true"></i>
      </button>

      {abierto && (
        <div role="menu" className="absolute right-0 top-full z-30 mt-2 w-60 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.2)]">
          <div className="px-3 py-2">
            <p className="truncate text-[0.9rem] font-semibold text-secondary">{usuario.user_metadata?.nombre || primerNombre(usuario)}</p>
            <p className="truncate text-[0.8rem] text-[#475569]">{usuario.email}</p>
          </div>
          <hr className="my-1 border-[rgba(15,23,42,0.08)]" />
          <button
            type="button"
            role="menuitem"
            onClick={onCerrarSesion}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[0.9rem] font-semibold text-secondary hover:bg-[rgba(15,23,42,0.06)] focus-visible:bg-[rgba(15,23,42,0.06)] focus-visible:outline-none"
          >
            <i className="fa-solid fa-right-from-bracket text-[0.85rem]" aria-hidden="true"></i>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
