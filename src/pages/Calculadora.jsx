import { useEffect, useRef, useState } from 'react'
import { HARDWARE } from '../data/hardware.js'
import { useTitulo } from '../utils/useTitulo.js'

const CAMPO =
  'w-full h-11 px-4 bg-white text-secondary text-[0.95rem] border border-[rgba(15,23,42,0.2)] rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.1)] [transition:border-color_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(79,70,229,0.3)] pr-8 cursor-pointer'
const LARGO = 2 * Math.PI * 52 // circunferencia del círculo (radio 52)

const pct = (n) => Math.round(n * 100)

// Compara el rendimiento estimado del procesador y de la placa de video según la resolución.
// Con el mismo índice, procesador y placa están equilibrados a 1080p; a mayor resolución la placa
// trabaja más, así que "rinde menos" para la misma exigencia.
function calcular(cpu, gpu, res) {
  const cpuRel = cpu.rendimiento / 100
  const gpuRel = gpu.rendimiento / 100 / res.exigencia

  // Diferencia entre ambos, respecto del que más rinde (0 = equilibrados)
  const limite = cpuRel < gpuRel ? 'cpu' : 'gpu'
  const cuello = Math.abs(cpuRel - gpuRel) / Math.max(cpuRel, gpuRel)
  const compat = 1 - cuello

  let veredicto, clases, detalle, trazo
  if (cuello <= 0.1) {
    veredicto = 'Muy equilibrado'; clases = 'bg-[rgba(22,163,74,0.12)] text-[#166534]'; trazo = 'stroke-success'
    detalle = 'El procesador y la placa de video rinden parecido: ninguno desperdicia al otro.'
  } else if (cuello <= 0.2) {
    veredicto = 'Bueno'; clases = 'bg-[rgba(22,163,74,0.12)] text-[#166534]'; trazo = 'stroke-success'
    detalle = limite === 'cpu'
      ? 'El procesador queda un poco por debajo de la placa de video, pero la diferencia es chica.'
      : 'La placa de video queda un poco por debajo del procesador. En juegos es la situación más común y no es un problema.'
  } else if (cuello <= 0.35) {
    veredicto = 'Aceptable'; clases = 'bg-[rgba(245,158,11,0.15)] text-[#92400E]'; trazo = 'stroke-warning'
    detalle = limite === 'cpu'
      ? 'El procesador limita a la placa de video: puede que no aproveches toda su potencia, sobre todo a resoluciones bajas.'
      : 'La placa de video limita al conjunto. Para jugar es aceptable; el procesador te queda de sobra.'
  } else {
    veredicto = 'Desbalanceado'; clases = 'bg-[rgba(220,38,38,0.1)] text-[#991B1B]'; trazo = 'stroke-error'
    detalle = limite === 'cpu'
      ? 'Hay un cuello de botella fuerte en el procesador: la placa de video queda muy desaprovechada. Conviene un procesador más potente.'
      : 'Hay un cuello de botella fuerte en la placa de video: el procesador rinde mucho más de lo que la placa puede aprovechar.'
  }

  const texto =
    `${cpu.nombre} + ${gpu.nombre} a ${res.nombre}: ${detalle}` +
    (cuello > 0.1 ? ` Cuello de botella estimado: ${pct(cuello)}% en ${limite === 'cpu' ? 'el procesador' : 'la placa de video'}.` : '')

  return { compat, veredicto, clases, trazo, texto, resNombre: res.nombre, cpuPct: pct(Math.min(cpuRel, 1)), gpuPct: pct(Math.min(gpuRel, 1)) }
}

function Opciones({ lista }) {
  return lista.map((c, i) => <option key={c.nombre} value={i}>{c.nombre}</option>)
}

export default function Calculadora() {
  useTitulo('Calculadora de cuello de botella')
  const [cpu, setCpu] = useState(0)
  const [gpu, setGpu] = useState(0)
  const [res, setRes] = useState(0)
  const [resultado, setResultado] = useState(null)
  const [arco, setArco] = useState(LARGO) // el círculo arranca vacío y se llena con una animación
  const caja = useRef(null)

  function enviar(e) {
    e.preventDefault()
    setResultado(calcular(HARDWARE.procesadores[cpu], HARDWARE.placas[gpu], HARDWARE.resoluciones[res]))
    setArco(LARGO)
  }

  // Después de mostrar el resultado se llena el círculo y se baja hasta verlo
  useEffect(() => {
    if (!resultado) return
    const cuadro = requestAnimationFrame(() => setArco(LARGO * (1 - resultado.compat)))
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    caja.current.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'nearest' })
    return () => cancelAnimationFrame(cuadro)
  }, [resultado])

  return (
    <main className="flex-1 px-4 py-8">
      <div className="w-full max-w-[720px] mx-auto">
        <h2 className="text-[1.5rem] min-[600px]:text-[1.9rem] font-bold leading-[1.2]">Calculadora de cuello de botella</h2>
        <p className="mt-2 text-[0.95rem] text-[#475569]">
          Elegí tu procesador, tu placa de video y la resolución en la que jugás. Estimamos qué tan equilibrados están según su rendimiento.
        </p>

        <form onSubmit={enviar} className="mt-6 flex flex-col gap-5 p-5 min-[600px]:p-6 bg-white border border-[rgba(15,23,42,0.08)] rounded-2xl shadow-[0_4px_12px_rgba(15,23,42,0.12)]" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="calc-cpu" className="text-[0.9rem] font-semibold">Procesador</label>
            <select id="calc-cpu" value={cpu} onChange={(e) => setCpu(Number(e.target.value))} className={CAMPO}><Opciones lista={HARDWARE.procesadores} /></select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="calc-gpu" className="text-[0.9rem] font-semibold">Placa de video</label>
            <select id="calc-gpu" value={gpu} onChange={(e) => setGpu(Number(e.target.value))} className={CAMPO}><Opciones lista={HARDWARE.placas} /></select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="calc-res" className="text-[0.9rem] font-semibold">Resolución</label>
            <select id="calc-res" value={res} onChange={(e) => setRes(Number(e.target.value))} className={CAMPO}><Opciones lista={HARDWARE.resoluciones} /></select>
          </div>
          <button type="submit" className="w-full h-11 rounded-[50px] bg-primary text-white text-[0.95rem] font-semibold cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.25)] [transition:background-color_0.2s,transform_0.2s] motion-reduce:[transition:none]! hover:bg-secondary hover:[transform:translateY(-1px)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2">
            Calcular
          </button>
        </form>

        <section ref={caja} hidden={!resultado} className="mt-6 p-5 min-[600px]:p-6 bg-white border border-[rgba(15,23,42,0.08)] rounded-2xl shadow-[0_4px_12px_rgba(15,23,42,0.12)]" aria-live="polite" aria-labelledby="calc-resultado-titulo">
          <h3 id="calc-resultado-titulo" className="text-[1.1rem] font-bold">Resultado</h3>
          {resultado && (
            <>
              <div className="mt-4 flex flex-col items-center gap-5 min-[600px]:flex-row min-[600px]:gap-8">
                <div className="relative size-[150px] shrink-0" role="img" aria-label={`Compatibilidad: ${pct(resultado.compat)}%`}>
                  <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
                    <circle cx="60" cy="60" r="52" fill="none" strokeWidth="12" className="stroke-[#E2E8F0]" />
                    <circle
                      cx="60" cy="60" r="52" fill="none" strokeWidth="12" strokeLinecap="round"
                      className={'[transition:stroke-dashoffset_0.6s_ease,stroke_0.3s] motion-reduce:[transition:none]! ' + resultado.trazo}
                      style={{ strokeDasharray: LARGO, strokeDashoffset: arco }}
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-content-center text-center" aria-hidden="true">
                    <span className="text-[2rem] font-bold leading-none">{pct(resultado.compat)}%</span>
                    <span className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.04em] text-[#475569]">compatibles</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 min-[600px]:items-start text-center min-[600px]:text-left">
                  <span className={'px-3 py-1 rounded-full text-[0.85rem] font-bold ' + resultado.clases}>{resultado.veredicto}</span>
                  <p className="text-[0.95rem]">{resultado.texto}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3" aria-hidden="true">
                <div>
                  <div className="flex justify-between text-[0.8rem] font-semibold"><span>Procesador</span><span>{resultado.cpuPct}%</span></div>
                  <div className="mt-1 h-3 rounded-full bg-[#E2E8F0] overflow-hidden"><div className="h-full rounded-full bg-primary [transition:width_0.4s] motion-reduce:[transition:none]!" style={{ width: resultado.cpuPct + '%' }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[0.8rem] font-semibold"><span>Placa de video <span className="font-normal text-[#475569]">a {resultado.resNombre}</span></span><span>{resultado.gpuPct}%</span></div>
                  <div className="mt-1 h-3 rounded-full bg-[#E2E8F0] overflow-hidden"><div className="h-full rounded-full bg-background [transition:width_0.4s] motion-reduce:[transition:none]!" style={{ width: resultado.gpuPct + '%' }} /></div>
                </div>
              </div>
              <p className="mt-4 text-[0.8rem] text-[#475569]">La barra más corta es la que limita al conjunto.</p>
            </>
          )}
        </section>

        <section className="mt-6 p-5 rounded-2xl bg-[rgba(79,70,229,0.06)] text-[0.85rem] text-[#334155]" aria-labelledby="calc-como">
          <h3 id="calc-como" className="text-[0.95rem] font-bold text-secondary">Cómo se calcula</h3>
          <p className="mt-2">Comparamos el rendimiento estimado del procesador con el de la placa de video. A la placa de video se le exige más a mayor resolución. Si un lado rinde bastante menos que el otro, ese es el cuello de botella.</p>
          <p className="mt-2">Es una estimación orientativa, no son FPS reales: depende del juego, de la memoria RAM y de la configuración.</p>
        </section>
      </div>
    </main>
  )
}
