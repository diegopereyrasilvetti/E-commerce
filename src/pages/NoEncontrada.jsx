import { Link } from 'react-router-dom'
import { useTitulo } from '../utils/useTitulo.js'

// Se muestra cuando la dirección no existe
export default function NoEncontrada() {
  useTitulo('Página no encontrada')
  return (
    <main className="flex-1 grid place-items-center px-4 py-16">
      <div className="w-full max-w-[480px] rounded-2xl bg-white p-8 text-center shadow-[0_4px_12px_rgba(15,23,42,0.12)]">
        <p className="text-[3rem] font-bold leading-none text-primary">404</p>
        <h2 className="mt-3 text-[1.5rem] font-bold">Esta página no existe</h2>
        <p className="mt-2 text-[#475569]">Puede que la dirección esté mal escrita o que el producto ya no esté.</p>
        <Link to="/" className="mt-5 inline-block rounded-[50px] bg-primary px-6 py-2.5 font-semibold text-white hover:bg-secondary">
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
