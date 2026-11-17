import { useEffect, useRef, useState } from 'react'
import { HARDWARE } from '../data/hardware.js'
import { useTitulo } from '../utils/useTitulo.js'

const CAMPO =
  'w-full h-11 px-4 bg-white text-secondary text-[0.95rem] border border-[rgba(15,23,42,0.2)] rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.1)] [transition:border-color_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(79,70,229,0.3)] appearance-none pr-10 cursor-pointer'
const TARJETA = 'bg-white border border-[rgba(15,23,42,0.08)] rounded-2xl shadow-[0_4px_12px_rgba(15,23,42,0.12)]'
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

  let veredicto, clases, detalle, trazo, borde, icono
  if (cuello <= 0.1) {
    veredicto = 'Muy equilibrado'; clases = 'bg-[rgba(22,163,74,0.12)] text-[#166534]'; trazo = 'stroke-success'; borde = 'border-t-success'; icono = 'fa-circle-check'
    detalle = 'El procesador y la placa de video rinden parecido: ninguno desperdicia al otro.'
  } else if (cuello <= 0.2) {
    veredicto = 'Bueno'; clases = 'bg-[rgba(22,163,74,0.12)] text-[#166534]'; trazo = 'stroke-success'; borde = 'border-t-success'; icono = 'fa-thumbs-up'
    detalle = limite === 'cpu'
      ? 'El procesador queda un poco por debajo de la placa de video, pero la diferencia es chica.'
      : 'La placa de video queda un poco por debajo del procesador. En juegos es la situación más común y no es un problema.'
  } else if (cuello <= 0.35) {
    veredicto = 'Aceptable'; clases = 'bg-[rgba(245,158,11,0.15)] text-[#92400E]'; trazo = 'stroke-warning'; borde = 'border-t-warning'; icono = 'fa-triangle-exclamation'
    detalle = limite === 'cpu'
      ? 'El procesador limita a la placa de video: puede que no aproveches toda su potencia, sobre todo a resoluciones bajas.'
      : 'La placa de video limita al conjunto. Para jugar es aceptable; el procesador te queda de sobra.'
  } else {
    veredicto = 'Desbalanceado'; clases = 'bg-[rgba(220,38,38,0.1)] text-[#991B1B]'; trazo = 'stroke-error'; borde = 'border-t-error'; icono = 'fa-circle-exclamation'
    detalle = limite === 'cpu'
      ? 'Hay un cuello de botella fuerte en el procesador: la placa de video queda muy desaprovechada. Conviene un procesador más potente.'
      : 'Hay un cuello de botella fuerte en la placa de video: el procesador rinde mucho más de lo que la placa puede aprovechar.'
  }

  const texto =
    `${cpu.nombre} + ${gpu.nombre} a ${res.nombre}: ${detalle}` +
    (cuello > 0.1 ? ` Cuello de botella estimado: ${pct(cuello)}% en ${limite === 'cpu' ? 'el procesador' : 'la placa de video'}.` : '')

  return {
    compat, veredicto, clases, trazo, borde, icono, texto, limite,
    hayCuello: cuello > 0.1,
    resNombre: res.nombre, cpuPct: pct(Math.min(cpuRel, 1)), gpuPct: pct(Math.min(gpuRel, 1)),
  }
}

function Opciones({ lista }) {
  return lista.map((c, i) => <option key={c.nombre} value={i}>{c.nombre}</option>)
}

// Un desplegable con su ícono y la flechita a la derecha
function Selector({ id, etiqueta, icono, valor, alCambiar, lista }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-center gap-2 text-[0.9rem] font-semibold">
        <i className={'fa-solid w-5 text-center text-primary ' + icono} aria-hidden="true"></i>
        {etiqueta}
      </label>
      <div className="relative">
        <select id={id} value={valor} onChange={(e) => alCambiar(Number(e.target.value))} className={CAMPO}><Opciones lista={lista} /></select>
        <i className="fa-solid fa-chevron-down pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[0.75rem] text-[#64748B]" aria-hidden="true"></i>
      </div>
    </div>
  )
}

// Barra de rendimiento; la que limita al conjunto lleva una etiqueta
function Barra({ nombre, detalle, valor, color, limita }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-[0.8rem] font-semibold">
        <span className="flex items-center gap-2">
          {nombre}
          {detalle && <span className="font-normal text-[#475569]">{detalle}</span>}
          {limita && <span className="rounded-full bg-[rgba(245,158,11,0.15)] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.04em] text-[#92400E]">Limita</span>}
        </span>
        <span>{valor}%</span>
      </div>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-[#E2E8F0]">
        <div className={'h-full rounded-full [transition:width_0.4s] motion-reduce:[transition:none]! ' + color} style={{ width: valor + '%' }} />
      </div>
    </div>
  )
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
    <main className="flex-1 px-4 py-8 min-[768px]:px-10">
      <div className="w-full max-w-[1000px] mx-auto">
        <header className="relative overflow-hidden rounded-2xl bg-secondary bg-[radial-gradient(circle_at_88%_35%,rgba(79,70,229,0.55),transparent_55%),radial-gradient(circle_at_98%_95%,rgba(6,182,212,0.4),transparent_45%)] p-6 text-white min-[600px]:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.1)] px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.05em]">
            <i className="fa-solid fa-gauge-high" aria-hidden="true"></i>
            Herramienta gratis
          </span>
          <h2 className="mt-4 max-w-[34rem] text-[1.6rem] min-[600px]:text-[2.2rem] font-bold leading-[1.2]">
            Calculadora de <span className="text-background">cuello de botella</span>
          </h2>
          <p className="mt-3 max-w-[34rem] text-[0.95rem] min-[600px]:text-[1.05rem] text-[#CBD5E1]">
            Elegí tu procesador, tu placa de video y la resolución en la que jugás. Estimamos qué tan equilibrados están según su rendimiento.
          </p>
        </header>

        <div className="mt-6 grid gap-6 min-[900px]:grid-cols-[360px_1fr] min-[900px]:items-start">
          <form onSubmit={enviar} className={'flex flex-col gap-5 p-5 min-[600px]:p-6 ' + TARJETA} noValidate>
            <Selector id="calc-cpu" etiqueta="Procesador" icono="fa-microchip" valor={cpu} alCambiar={setCpu} lista={HARDWARE.procesadores} />
            <Selector id="calc-gpu" etiqueta="Placa de video" icono="fa-gamepad" valor={gpu} alCambiar={setGpu} lista={HARDWARE.placas} />
            <Selector id="calc-res" etiqueta="Resolución" icono="fa-desktop" valor={res} alCambiar={setRes} lista={HARDWARE.resoluciones} />
            <button type="submit" className="flex w-full h-11 items-center justify-center gap-2 rounded-[50px] bg-primary text-white text-[0.95rem] font-semibold cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.25)] [transition:background-color_0.2s,transform_0.2s] motion-reduce:[transition:none]! hover:bg-secondary hover:[transform:translateY(-1px)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2">
              Calcular
              <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
          </form>

          <div className="min-w-0">
            {!resultado && (
              <div className="grid place-items-center gap-3 rounded-2xl border-2 border-dashed border-[rgba(15,23,42,0.2)] p-8 text-center text-[0.95rem] text-[#475569] min-[900px]:min-h-[300px] min-[900px]:content-center">
                <i className="fa-solid fa-gauge-high text-[2.5rem] text-primary" aria-hidden="true"></i>
                <p className="max-w-[20rem]">Elegí tus componentes y tocá <strong>Calcular</strong> para ver qué tan equilibrados están.</p>
              </div>
            )}

            <section ref={caja} hidden={!resultado} className={'border-t-4 p-5 min-[600px]:p-6 ' + TARJETA + ' ' + (resultado ? resultado.borde : '')} aria-live="polite" aria-labelledby="calc-resultado-titulo">
              <h3 id="calc-resultado-titulo" className="text-[1.1rem] font-bold">Resultado</h3>
              {resultado && (
                <>
                  <div className="mt-4 flex flex-col items-center gap-5 min-[600px]:flex-row min-[600px]:gap-8">
                    <div className="relative size-[160px] shrink-0" role="img" aria-label={`Compatibilidad: ${pct(resultado.compat)}%`}>
                      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
                        <circle cx="60" cy="60" r="52" fill="none" strokeWidth="12" className="stroke-[#E2E8F0]" />
                        <circle
                          cx="60" cy="60" r="52" fill="none" strokeWidth="12" strokeLinecap="round"
                          className={'[transition:stroke-dashoffset_0.6s_ease,stroke_0.3s] motion-reduce:[transition:none]! ' + resultado.trazo}
                          style={{ strokeDasharray: LARGO, strokeDashoffset: arco }}
                        />
                      </svg>
                      <div className="absolute inset-0 grid place-content-center text-center" aria-hidden="true">
                        <span className="text-[2.2rem] font-bold leading-none">{pct(resultado.compat)}%</span>
                        <span className="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.04em] text-[#475569]">compatibles</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-3 min-[600px]:items-start text-center min-[600px]:text-left">
                      <span className={'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[0.85rem] font-bold ' + resultado.clases}>
                        <i className={'fa-solid ' + resultado.icono} aria-hidden="true"></i>
                        {resultado.veredicto}
                      </span>
                      <p className="text-[0.95rem]">{resultado.texto}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3" aria-hidden="true">
                    <Barra nombre="Procesador" valor={resultado.cpuPct} color="bg-primary" limita={resultado.hayCuello && resultado.limite === 'cpu'} />
                    <Barra nombre="Placa de video" detalle={'a ' + resultado.resNombre} valor={resultado.gpuPct} color="bg-background" limita={resultado.hayCuello && resultado.limite === 'gpu'} />
                  </div>
                  <p className="mt-4 text-[0.8rem] text-[#475569]">La barra más corta es la que limita al conjunto.</p>
                </>
              )}
            </section>
          </div>
        </div>

        <section className="mt-6 flex gap-4 rounded-2xl border-l-4 border-primary bg-[rgba(79,70,229,0.06)] p-5 text-[0.85rem] text-[#334155]" aria-labelledby="calc-como">
          <i className="fa-solid fa-circle-info mt-0.5 text-[1.2rem] text-primary" aria-hidden="true"></i>
          <div>
            <h3 id="calc-como" className="text-[0.95rem] font-bold text-secondary">Cómo se calcula</h3>
            <p className="mt-2">Comparamos el rendimiento estimado del procesador con el de la placa de video. A la placa de video se le exige más a mayor resolución. Si un lado rinde bastante menos que el otro, ese es el cuello de botella.</p>
            <p className="mt-2">Es una estimación orientativa, no son FPS reales: depende del juego, de la memoria RAM y de la configuración.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
