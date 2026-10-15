import { useId, useState } from 'react'

const ESTILO =
  'w-full h-11 px-4 bg-white text-secondary text-[0.95rem] border rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.1)] [transition:border-color_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! placeholder:text-[#64748B] focus:outline-none'
const NORMAL = 'border-[rgba(15,23,42,0.2)] focus:border-primary focus:shadow-[0_0_0_3px_rgba(79,70,229,0.3)]'
const CON_ERROR = 'border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(220,38,38,0.25)]'

// Campo de formulario con su etiqueta y el mensaje de error.
// - Si el tipo es "password" agrega el botón Mostrar / Ocultar.
// - Si se pasa `opciones` (lista de textos) es un desplegable; `placeholder` es la opción vacía.
// `error` es el texto del error ('' si no hay); `ayuda` es un texto chico debajo del campo.
export default function CampoFormulario({ label, type = 'text', error = '', ayuda, opciones, placeholder, ...props }) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const esPassword = type === 'password'
  const accesibilidad = {
    id,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': error ? id + '-error' : ayuda ? id + '-ayuda' : undefined,
    className: ESTILO + ' ' + (error ? CON_ERROR : NORMAL),
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[0.9rem] font-semibold">{label}</label>
        {esPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="text-[0.8rem] font-semibold text-primary cursor-pointer hover:underline focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2"
            aria-controls={id}
            aria-pressed={visible}
          >
            {visible ? 'Ocultar' : 'Mostrar'}
          </button>
        )}
      </div>
      {opciones ? (
        <select {...accesibilidad} className={accesibilidad.className + ' pr-8 cursor-pointer'} {...props}>
          <option value="">{placeholder || 'Elegí una opción'}</option>
          {opciones.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input type={esPassword && visible ? 'text' : type} placeholder={placeholder} {...accesibilidad} {...props} />
      )}
      {error ? (
        <p id={id + '-error'} role="alert" className="text-[0.8rem] font-semibold text-error">{error}</p>
      ) : (
        ayuda && <p id={id + '-ayuda'} className="text-[0.8rem] text-[#475569]">{ayuda}</p>
      )}
    </div>
  )
}
