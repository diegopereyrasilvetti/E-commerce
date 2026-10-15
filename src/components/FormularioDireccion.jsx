import CampoFormulario from './CampoFormulario.jsx'
import { PROVINCIAS } from '../data/provincias.js'
import { useFormulario } from '../utils/useFormulario.js'
import { codigoPostal, obligatorio, telefonoOpcional } from '../utils/validaciones.js'

const VACIA = {
  alias: '', destinatario: '', calle: '', numero: '', piso_depto: '',
  ciudad: '', provincia: '', codigo_postal: '', telefono: '', es_principal: false,
}

const REGLAS = {
  alias: obligatorio('Poné un nombre para reconocerla. Ejemplo: Casa'),
  destinatario: obligatorio('Ingresá quién recibe el pedido.'),
  calle: obligatorio('Ingresá la calle.'),
  numero: obligatorio('Ingresá el número.'),
  piso_depto: () => '',
  ciudad: obligatorio('Ingresá la ciudad.'),
  provincia: obligatorio('Elegí la provincia.'),
  codigo_postal: codigoPostal,
  telefono: telefonoOpcional,
  es_principal: () => '',
}

// Formulario para crear o editar una dirección. `inicial` es la dirección a editar (o nada para una nueva).
// Se monta de nuevo (con `key`) cada vez que cambia la dirección, así arranca con sus valores.
export default function FormularioDireccion({ inicial, guardando, error, onGuardar, onCancelar }) {
  const { campo, enviar } = useFormulario({ ...VACIA, ...limpiar(inicial) }, REGLAS)
  const principal = campo('es_principal')

  return (
    <form
      onSubmit={enviar((v) => onGuardar(normalizar(v)))}
      noValidate
      className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-5 shadow-[0_4px_12px_rgba(15,23,42,0.12)] min-[600px]:p-6"
      aria-label={inicial ? 'Editar dirección' : 'Nueva dirección'}
    >
      <h3 className="text-[1.1rem] font-bold">{inicial ? 'Editar dirección' : 'Nueva dirección'}</h3>

      <div className="mt-4 grid gap-4 min-[600px]:grid-cols-2">
        <CampoFormulario label="Nombre de la dirección" placeholder="Casa, Trabajo…" autoComplete="off" {...campo('alias')} />
        <CampoFormulario label="Quién recibe" placeholder="Nombre y apellido" autoComplete="name" {...campo('destinatario')} />
        <CampoFormulario label="Calle" autoComplete="address-line1" {...campo('calle')} />
        <div className="grid grid-cols-2 gap-4">
          <CampoFormulario label="Número" inputMode="numeric" {...campo('numero')} />
          <CampoFormulario label="Piso / Depto" placeholder="Opcional" autoComplete="address-line2" {...campo('piso_depto')} />
        </div>
        <CampoFormulario label="Ciudad" autoComplete="address-level2" {...campo('ciudad')} />
        <CampoFormulario label="Provincia" opciones={PROVINCIAS} placeholder="Elegí una provincia" autoComplete="address-level1" {...campo('provincia')} />
        <CampoFormulario label="Código postal" placeholder="1425 o C1425ABC" autoComplete="postal-code" {...campo('codigo_postal')} />
        <CampoFormulario label="Teléfono de contacto" type="tel" placeholder="Opcional" autoComplete="tel" {...campo('telefono')} />
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-[0.9rem]">
        <input
          type="checkbox"
          name={principal.name}
          checked={principal.value}
          onChange={principal.onChange}
          className="size-4 cursor-pointer accent-primary"
        />
        Usar como mi dirección principal
      </label>

      {error && <p role="alert" className="mt-4 rounded-xl bg-[rgba(220,38,38,0.08)] p-3 text-center text-[0.85rem] font-semibold text-error">{error}</p>}

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancelar} className="h-11 cursor-pointer rounded-[50px] border border-[rgba(15,23,42,0.2)] px-6 text-[0.95rem] font-semibold hover:bg-[rgba(15,23,42,0.05)]">
          Cancelar
        </button>
        <button type="submit" disabled={guardando} className="h-11 cursor-pointer rounded-[50px] bg-primary px-6 text-[0.95rem] font-semibold text-white shadow-[0_4px_8px_rgba(0,0,0,0.25)] hover:bg-secondary disabled:cursor-wait disabled:opacity-60">
          {guardando ? 'Guardando…' : 'Guardar dirección'}
        </button>
      </div>
    </form>
  )
}

// Los campos opcionales vacíos vienen como null desde la base: en el formulario son texto vacío
function limpiar(direccion) {
  if (!direccion) return {}
  return Object.fromEntries(Object.keys(VACIA).map((k) => [k, direccion[k] ?? VACIA[k]]))
}

// Para guardar: sin espacios de más y los opcionales vacíos como null
function normalizar(v) {
  const t = (s) => s.trim()
  return {
    alias: t(v.alias), destinatario: t(v.destinatario), calle: t(v.calle), numero: t(v.numero),
    piso_depto: t(v.piso_depto) || null, ciudad: t(v.ciudad), provincia: v.provincia,
    codigo_postal: t(v.codigo_postal).toUpperCase(), telefono: t(v.telefono) || null, es_principal: v.es_principal,
  }
}
