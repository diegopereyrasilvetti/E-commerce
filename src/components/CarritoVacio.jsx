import { Link } from 'react-router-dom'
import CategoriasRapidas from './CategoriasRapidas.jsx'
import Destacados from './Destacados.jsx'

// Pantalla del carrito cuando no hay productos: invita a seguir comprando
export default function CarritoVacio() {
  return (
    <main className="flex-1 px-4 py-10 min-[768px]:px-10">
      <div className="mx-auto w-full max-w-[1200px]">
        <section className="mx-auto w-full max-w-[560px] rounded-2xl bg-white p-8 text-center shadow-[0_4px_12px_rgba(15,23,42,0.12)]" aria-labelledby="carrito-vacio-titulo">
          <span className="mx-auto grid size-24 place-items-center rounded-full bg-[rgba(79,70,229,0.1)] text-[2.5rem] text-primary" aria-hidden="true">
            <i className="fa-solid fa-cart-shopping"></i>
          </span>
          <h2 id="carrito-vacio-titulo" className="mt-5 text-[1.5rem] font-bold">Tu carrito está vacío</h2>
          <p className="mt-2 text-[#475569]">Todavía no agregaste nada. Mirá lo que tenemos para armar tu PC.</p>
          <Link
            to="/productos"
            className="mt-6 inline-block rounded-[50px] bg-primary px-6 py-2.5 font-semibold text-white shadow-[0_4px_8px_rgba(0,0,0,0.25)] hover:bg-secondary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-background"
          >
            Ver productos
          </Link>
        </section>

        <Destacados
          className="mt-12"
          titulo="Quizás te interese"
          verTodos={<Link className="shrink-0 text-primary font-semibold text-[0.75rem] hover:underline" to="/productos">Ver todos</Link>}
        />

        <section className="mt-2" aria-labelledby="carrito-categorias-titulo">
          <h2 id="carrito-categorias-titulo" className="mt-10 mb-4 pl-3 border-l-4 border-background text-[length:clamp(0.98rem,2.2vw,1.15rem)] text-secondary">
            Comprá por categoría
          </h2>
          <CategoriasRapidas />
        </section>
      </div>

    </main>
  )
}
