import { PRODUCTOS } from '../data/productos.js'

export default function Inicio() {
  return (
    <main className="flex-1 px-4 py-10">
      <div className="mx-auto w-full max-w-[720px]">
        <h2 className="text-[1.5rem] font-bold">Inicio</h2>
        <p className="mt-2 text-[#475569]">
          Esta página todavía no se pasó a React. La versión original está en <code>index.html</code>, en la raíz del proyecto.
        </p>
        <p className="mt-4">Productos cargados desde <code>src/data/productos.js</code>: <strong>{PRODUCTOS.length}</strong></p>
      </div>
    </main>
  )
}
