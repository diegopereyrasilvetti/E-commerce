import { useCallback, useEffect, useState } from 'react'
import CampoFormulario from '../components/CampoFormulario.jsx'
import FormularioDireccion from '../components/FormularioDireccion.jsx'
import { useAuth } from '../auth.jsx'
import {
  actualizarDireccion, borrarDireccion, crearDireccion, guardarPerfil,
  listarDirecciones, marcarPrincipal, obtenerPerfil,
} from '../lib/cuenta.js'
import { useFormulario } from '../utils/useFormulario.js'
import { useTitulo } from '../utils/useTitulo.js'
import { nombre, telefonoOpcional } from '../utils/validaciones.js'

const ERROR_GUARDAR = 'No pudimos guardar los cambios. Revisá tu conexión e intentá de nuevo.'

const BOTON_CHICO =
  'cursor-pointer rounded-lg px-3 py-1.5 text-[0.85rem] font-semibold text-primary hover:bg-[rgba(79,70,229,0.08)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-background'

// ---------- Datos personales ----------
function FormularioPerfil({ usuario, inicial }) {
  const { campo, enviar } = useFormulario(
    { nombre: inicial.nombre ?? '', telefono: inicial.telefono ?? '' },
    { nombre, telefono: telefonoOpcional },
  )
  const [guardando, setGuardando] = useState(false)
  const [resultado, setResultado] = useState(null) // { ok, texto }

  async function alEnviar(valores) {
    setResultado(null)
    setGuardando(true)
    const { error } = await guardarPerfil(usuario.id, { nombre: valores.nombre.trim(), telefono: valores.telefono.trim() })
    setGuardando(false)
    setResultado(error ? { ok: false, texto: ERROR_GUARDAR } : { ok: true, texto: 'Cambios guardados.' })
  }

  return (
    <form onSubmit={enviar(alEnviar)} noValidate className="mt-4 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-[0.9rem] font-semibold">Email</span>
        <p className="flex h-11 items-center rounded-xl bg-[#F1F5F9] px-4 text-[0.95rem] text-[#475569]">{usuario.email}</p>
      </div>
      <CampoFormulario label="Nombre" autoComplete="name" {...campo('nombre')} />
      <CampoFormulario label="Teléfono" type="tel" placeholder="Opcional" autoComplete="tel" {...campo('telefono')} />

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={guardando} className="h-11 cursor-pointer rounded-[50px] bg-primary px-6 text-[0.95rem] font-semibold text-white shadow-[0_4px_8px_rgba(0,0,0,0.25)] hover:bg-secondary disabled:cursor-wait disabled:opacity-60">
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {resultado && (
          <p role={resultado.ok ? 'status' : 'alert'} className={'text-[0.85rem] font-semibold ' + (resultado.ok ? 'text-[#166534]' : 'text-error')}>
            {resultado.texto}
          </p>
        )}
      </div>
    </form>
  )
}

// ---------- Una dirección guardada ----------
function TarjetaDireccion({ direccion, ocupada, confirmando, onEditar, onPrincipal, onPedirBorrar, onCancelarBorrar, onBorrar }) {
  const d = direccion
  return (
    <li className={'flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-[0_2px_6px_rgba(15,23,42,0.08)] ' + (d.es_principal ? 'border-primary' : 'border-[rgba(15,23,42,0.08)]')}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[1rem] font-bold">{d.alias}</h3>
        {d.es_principal && <span className="rounded-full bg-[rgba(79,70,229,0.1)] px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.04em] text-primary">Principal</span>}
      </div>
      <address className="text-[0.9rem] not-italic leading-[1.5] text-[#334155]">
        {d.destinatario}<br />
        {d.calle} {d.numero}{d.piso_depto ? `, ${d.piso_depto}` : ''}<br />
        {d.ciudad}, {d.provincia} ({d.codigo_postal})
        {d.telefono && <><br />Tel. {d.telefono}</>}
      </address>

      {confirmando ? (
        <div className="mt-auto flex flex-wrap items-center gap-2 text-[0.85rem]">
          <span className="font-semibold">¿Eliminar esta dirección?</span>
          <button type="button" disabled={ocupada} onClick={onBorrar} className="cursor-pointer rounded-lg bg-error px-3 py-1.5 font-semibold text-white disabled:opacity-60">Sí, eliminar</button>
          <button type="button" onClick={onCancelarBorrar} className={BOTON_CHICO}>No</button>
        </div>
      ) : (
        <div className="mt-auto flex flex-wrap gap-1 -ml-3">
          <button type="button" onClick={onEditar} disabled={ocupada} className={BOTON_CHICO}>Editar</button>
          {!d.es_principal && <button type="button" onClick={onPrincipal} disabled={ocupada} className={BOTON_CHICO}>Usar como principal</button>}
          <button type="button" onClick={onPedirBorrar} disabled={ocupada} className={BOTON_CHICO + ' text-error hover:bg-[rgba(220,38,38,0.08)]'}>Eliminar</button>
        </div>
      )}
    </li>
  )
}

// ---------- Página ----------
export default function Cuenta() {
  useTitulo('Mi cuenta')
  const { usuario } = useAuth()
  const [perfil, setPerfil] = useState(null)
  const [direcciones, setDirecciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [editando, setEditando] = useState(null) // 'nueva' | id de la dirección | null
  const [confirmando, setConfirmando] = useState(null) // id de la dirección que se está por borrar
  const [ocupada, setOcupada] = useState(false) // hay una operación en curso
  const [errorDireccion, setErrorDireccion] = useState('')

  const cargarDirecciones = useCallback(async () => {
    const { data, error } = await listarDirecciones()
    if (error) setErrorCarga('No pudimos cargar tus direcciones.')
    else setDirecciones(data)
  }, [])

  useEffect(() => {
    let activo = true
    async function cargar() {
      const [p, d] = await Promise.all([obtenerPerfil(usuario.id), listarDirecciones()])
      if (!activo) return
      if (p.error || d.error) setErrorCarga('No pudimos cargar tus datos. Revisá tu conexión e intentá de nuevo.')
      setPerfil(p.data ?? {})
      setDirecciones(d.data ?? [])
      setCargando(false)
    }
    cargar()
    return () => { activo = false }
  }, [usuario.id])

  // Ejecuta una operación sobre las direcciones y después vuelve a leer la lista
  async function operar(accion, alTerminar) {
    setErrorDireccion('')
    setOcupada(true)
    const { error } = await accion()
    if (error) setErrorDireccion(ERROR_GUARDAR)
    else {
      await cargarDirecciones()
      alTerminar?.()
    }
    setOcupada(false)
  }

  function guardarDireccion(datos) {
    // La primera dirección que se carga queda como principal
    const conPrincipal = direcciones.length === 0 ? { ...datos, es_principal: true } : datos
    const accion = editando === 'nueva'
      ? () => crearDireccion(usuario.id, conPrincipal)
      : () => actualizarDireccion(usuario.id, editando, datos)
    return operar(accion, () => setEditando(null))
  }

  // Si se borra la principal, la siguiente pasa a serlo para no quedarse sin principal
  async function borrar(direccion) {
    const resultado = await borrarDireccion(direccion.id)
    const siguiente = direcciones.find((d) => d.id !== direccion.id)
    if (resultado.error || !direccion.es_principal || !siguiente) return resultado
    return marcarPrincipal(usuario.id, siguiente.id)
  }

  const enEdicion = editando && editando !== 'nueva' ? direcciones.find((d) => d.id === editando) : undefined

  return (
    <main className="flex-1 px-4 py-8 min-[768px]:px-10">
      <div className="mx-auto w-full max-w-[1000px]">
        <h2 className="text-[1.5rem] font-bold min-[600px]:text-[1.9rem]">Mi cuenta</h2>

        {cargando ? (
          <p className="mt-6 text-[#475569]" role="status">Cargando tus datos…</p>
        ) : (
          <>
            {errorCarga && <p role="alert" className="mt-4 rounded-xl bg-[rgba(220,38,38,0.08)] p-3 text-[0.85rem] font-semibold text-error">{errorCarga}</p>}

            <section className="mt-6 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-5 shadow-[0_4px_12px_rgba(15,23,42,0.12)] min-[600px]:p-6" aria-labelledby="datos-titulo">
              <h3 id="datos-titulo" className="text-[1.1rem] font-bold">Datos personales</h3>
              <FormularioPerfil usuario={usuario} inicial={perfil} />
            </section>

            <section className="mt-8" aria-labelledby="direcciones-titulo">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 id="direcciones-titulo" className="border-l-4 border-background pl-3 text-[1.15rem] font-bold">Direcciones de envío</h3>
                {!editando && (
                  <button type="button" onClick={() => { setEditando('nueva'); setErrorDireccion('') }} className="h-10 cursor-pointer rounded-[50px] bg-primary px-5 text-[0.9rem] font-semibold text-white shadow-[0_4px_8px_rgba(0,0,0,0.25)] hover:bg-secondary">
                    <i className="fa-solid fa-plus mr-2" aria-hidden="true"></i>Agregar dirección
                  </button>
                )}
              </div>

              {errorDireccion && !editando && <p role="alert" className="mt-4 rounded-xl bg-[rgba(220,38,38,0.08)] p-3 text-[0.85rem] font-semibold text-error">{errorDireccion}</p>}

              {editando ? (
                <div className="mt-4">
                  <FormularioDireccion
                    key={editando}
                    inicial={enEdicion}
                    guardando={ocupada}
                    error={errorDireccion}
                    onGuardar={guardarDireccion}
                    onCancelar={() => { setEditando(null); setErrorDireccion('') }}
                  />
                </div>
              ) : direcciones.length === 0 ? (
                <p className="mt-4 rounded-2xl bg-white p-6 text-center text-[#475569]">Todavía no guardaste ninguna dirección. Agregá una para tenerla lista cuando compres.</p>
              ) : (
                <ul className="mt-4 grid gap-4 min-[700px]:grid-cols-2">
                  {direcciones.map((d) => (
                    <TarjetaDireccion
                      key={d.id}
                      direccion={d}
                      ocupada={ocupada}
                      confirmando={confirmando === d.id}
                      onEditar={() => { setEditando(d.id); setErrorDireccion('') }}
                      onPrincipal={() => operar(() => marcarPrincipal(usuario.id, d.id))}
                      onPedirBorrar={() => setConfirmando(d.id)}
                      onCancelarBorrar={() => setConfirmando(null)}
                      onBorrar={() => operar(() => borrar(d), () => setConfirmando(null))}
                    />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
