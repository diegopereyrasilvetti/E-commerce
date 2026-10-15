import { Link } from 'react-router-dom'
import { CATEGORIAS } from '../data/categorias.js'

// Tarjetas con todas las categorías de la tienda (se usan en Inicio y en el carrito vacío)
export default function CategoriasRapidas() {
  return (
    <ul className="grid grid-cols-[repeat(2,1fr)] gap-3 min-[768px]:grid-cols-[repeat(5,1fr)] min-[768px]:gap-4">
      {CATEGORIAS.map((c) => (
        <li key={c.id}>
          <Link
            to={'/productos/' + c.id}
            className="flex flex-col items-center gap-2.5 h-full px-3 py-5 bg-white text-secondary border border-[rgba(15,23,42,0.08)] rounded-xl shadow-[0_2px_6px_rgba(15,23,42,0.08)] text-center font-semibold text-[0.95rem] [transition:background-color_0.2s,color_0.2s,border-color_0.2s,transform_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! hover:[transform:translateY(-3px)] hover:bg-primary hover:border-primary hover:shadow-[0_8px_18px_rgba(79,70,229,0.35)] hover:text-white focus-visible:[transform:translateY(-3px)] focus-visible:bg-primary focus-visible:border-primary focus-visible:shadow-[0_8px_18px_rgba(79,70,229,0.35)] focus-visible:text-white focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2"
          >
            <i className={'fa-solid ' + c.icono} aria-hidden="true"></i>
            <span>{c.nombre}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
