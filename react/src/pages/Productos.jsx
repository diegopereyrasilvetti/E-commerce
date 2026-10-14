import { PRODUCTOS } from '../data/productos.js'

const categorias = [...new Set(PRODUCTOS.map((p) => p.categoria))]

export default function Productos() {
  return (
    <main className="flex-1 px-4 py-10">
      <div className="mx-auto w-full max-w-[720px]">
        <h2 className="text-[1.5rem] font-bold">Productos</h2>
        <p className="mt-2 text-[#475569]">
          Esta página todavía no se pasó a React. La versión original está en <code>productos.html</code>, en la raíz del proyecto.
        </p>
        <p className="mt-4">Categorías con productos: <strong>{categorias.join(', ')}</strong></p>
      </div>
    </main>
  )
}
