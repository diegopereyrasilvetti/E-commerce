import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import CampoFormulario from '../components/CampoFormulario.jsx'
import { mensajeDeError, useAuth } from '../auth.jsx'
import { useFormulario } from '../utils/useFormulario.js'
import { useTitulo } from '../utils/useTitulo.js'
import { passwordNueva, repetirPassword } from '../utils/validaciones.js'

// Paso 2 de recuperar la contraseña: se llega desde el enlace del correo, que deja una sesión temporal.
// Sin esa sesión (enlace vencido o página abierta a mano) no se puede cambiar nada.
export default function NuevaPassword() {
  useTitulo('Nueva contraseña')
  const { usuario, cargando, cambiarPassword } = useAuth()
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState(false)
  const { campo, enviar } = useFormulario({ password: '', repetir: '' }, { password: passwordNueva, repetir: repetirPassword })

  async function alEnviar(valores) {
    setError('')
    setEnviando(true)
    const { error } = await cambiarPassword(valores.password)
    setEnviando(false)
    if (error) return setError(mensajeDeError(error))
    setListo(true)
  }

  if (cargando) return <main className="flex-1" aria-busy="true" />
  if (listo) return <Navigate to="/" replace />

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-[420px] p-6 min-[600px]:p-8 bg-white text-secondary border border-[rgba(15,23,42,0.08)] rounded-2xl shadow-[0_4px_12px_rgba(15,23,42,0.12)]" aria-labelledby="nueva-titulo">
        {usuario ? (
          <>
            <h2 id="nueva-titulo" className="text-[1.5rem] font-bold">Elegí tu nueva contraseña</h2>
            <p className="mt-1 text-[0.9rem] text-[#475569]">Va a reemplazar a la anterior.</p>

            <form className="mt-6 flex flex-col gap-4" onSubmit={enviar(alEnviar)} noValidate>
              <CampoFormulario
                label="Contraseña nueva"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                ayuda="Al menos 8 caracteres, con una letra y un número."
                {...campo('password')}
              />
              <CampoFormulario label="Repetir contraseña" type="password" autoComplete="new-password" placeholder="Repetí la contraseña" {...campo('repetir')} />

              <button type="submit" disabled={enviando} className="w-full h-11 rounded-[50px] bg-primary text-white text-[0.95rem] font-semibold cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.25)] [transition:background-color_0.2s,transform_0.2s] motion-reduce:[transition:none]! hover:bg-secondary hover:[transform:translateY(-1px)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-wait">
                {enviando ? 'Guardando…' : 'Guardar contraseña'}
              </button>

              {error && <p role="alert" className="p-3 rounded-xl bg-[rgba(220,38,38,0.08)] text-[0.85rem] font-semibold text-error text-center">{error}</p>}
            </form>
          </>
        ) : (
          <div className="text-center">
            <h2 id="nueva-titulo" className="text-[1.5rem] font-bold">El enlace no es válido</h2>
            <p className="mt-2 text-[0.95rem] text-[#475569]">Puede que haya vencido o que ya lo hayas usado. Pedí uno nuevo para cambiar tu contraseña.</p>
            <Link to="/recuperar" className="mt-6 inline-block rounded-[50px] bg-primary px-6 py-2.5 font-semibold text-white hover:bg-secondary">Pedir otro enlace</Link>
          </div>
        )}
      </section>
    </main>
  )
}
