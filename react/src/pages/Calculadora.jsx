import { HARDWARE } from '../data/hardware.js'

export default function Calculadora() {
  return (
    <main className="flex-1 px-4 py-10">
      <div className="mx-auto w-full max-w-[720px]">
        <h2 className="text-[1.5rem] font-bold">Calculadora de cuello de botella</h2>
        <p className="mt-2 text-[#475569]">
          Esta página todavía no se pasó a React. La versión original está en <code>calculate.html</code>, en la raíz del proyecto.
        </p>
        <p className="mt-4">Datos cargados desde <code>src/data/hardware.js</code>: <strong>{HARDWARE.procesadores.length}</strong> procesadores y <strong>{HARDWARE.placas.length}</strong> placas de video.</p>
      </div>
    </main>
  )
}
