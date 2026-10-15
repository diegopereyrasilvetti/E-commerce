import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import CampoFormulario from '../components/CampoFormulario.jsx'
import { mensajeDeError, useAuth } from '../auth.jsx'
import { useFormulario } from '../utils/useFormulario.js'
import { useTitulo } from '../utils/useTitulo.js'
import { aceptado, email, nombre, passwordNueva, repetirPassword } from '../utils/validaciones.js'

export default function Registro() {
  useTitulo('Crear cuenta')
  const { usuario, registrar } = useAuth()
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [pendiente, setPendiente] = useState('') // email al que se mandó el enlace para confirmar la cuenta
  const { campo, enviar } = useFormulario(
    { nombre: '', email: '', password: '', repetir: '', terminos: false },
    { nombre, email, password: passwordNueva, repetir: repetirPassword, terminos: aceptado },
  )
  const terminos = campo('terminos')

  async function alEnviar(valores) {
    setError('')
    setEnviando(true)
    const correo = valores.email.trim()
    const { data, error } = await registrar(valores.nombre.trim(), correo, valores.password)
    setEnviando(false)
    if (error) return setError(mensajeDeError(error))
    // Si el email ya estaba registrado, Supabase no da error: devuelve un usuario sin identidades
    if (data.user?.identities?.length === 0) return setError(mensajeDeError({ code: 'user_already_exists' }))
    // Sin sesión = hay que confirmar el email; con sesión ya quedó adentro (y esta página redirige sola)
    if (!data.session) setPendiente(correo)
  }

  if (usuario) return <Navigate to="/" replace />

  if (pendiente) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <section className="w-full max-w-[420px] p-6 min-[600px]:p-8 bg-white text-secondary border border-[rgba(15,23,42,0.08)] rounded-2xl shadow-[0_4px_12px_rgba(15,23,42,0.12)] text-center" aria-labelledby="registro-titulo">
          <i className="fa-solid fa-envelope-circle-check text-[2.5rem] text-primary" aria-hidden="true"></i>
          <h2 id="registro-titulo" className="mt-3 text-[1.5rem] font-bold">Revisá tu correo</h2>
          <p className="mt-2 text-[0.95rem] text-[#475569]">
            Te enviamos un enlace a <strong className="text-secondary">{pendiente}</strong> para confirmar tu cuenta. Cuando lo toques, ya vas a poder iniciar sesión.
          </p>
          <Link to="/login" className="mt-6 inline-block rounded-[50px] bg-primary px-6 py-2.5 font-semibold text-white hover:bg-secondary">Ir a iniciar sesión</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-[420px] p-6 min-[600px]:p-8 bg-white text-secondary border border-[rgba(15,23,42,0.08)] rounded-2xl shadow-[0_4px_12px_rgba(15,23,42,0.12)]" aria-labelledby="registro-titulo">
        <h2 id="registro-titulo" className="text-[1.5rem] font-bold">Crear cuenta</h2>
        <p className="mt-1 text-[0.9rem] text-[#475569]">Registrate para comprar, guardar tu carrito y ver tus pedidos.</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={enviar(alEnviar)} noValidate>
          <CampoFormulario label="Nombre" autoComplete="name" placeholder="Tu nombre" {...campo('nombre')} />
          <CampoFormulario label="Email" type="email" autoComplete="email" placeholder="nombre@correo.com" {...campo('email')} />
          <CampoFormulario
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            ayuda="Al menos 8 caracteres, con una letra y un número."
            {...campo('password')}
          />
          <CampoFormulario label="Repetir contraseña" type="password" autoComplete="new-password" placeholder="Repetí la contraseña" {...campo('repetir')} />

          <div className="flex flex-col gap-1.5">
            <label className="flex items-start gap-2 text-[0.85rem] cursor-pointer">
              <input
                type="checkbox"
                name={terminos.name}
                checked={terminos.value}
                onChange={terminos.onChange}
                onBlur={terminos.onBlur}
                aria-invalid={terminos.error ? 'true' : undefined}
                className="mt-1 size-4 shrink-0 accent-primary cursor-pointer"
              />
              <span>Acepto los términos y condiciones y la política de privacidad.</span>
            </label>
            {terminos.error && <p role="alert" className="text-[0.8rem] font-semibold text-error">{terminos.error}</p>}
          </div>

          <button type="submit" disabled={enviando} className="w-full h-11 rounded-[50px] bg-primary text-white text-[0.95rem] font-semibold cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.25)] [transition:background-color_0.2s,transform_0.2s] motion-reduce:[transition:none]! hover:bg-secondary hover:[transform:translateY(-1px)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-wait">
            {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>

          {error && <p role="alert" className="p-3 rounded-xl bg-[rgba(220,38,38,0.08)] text-[0.85rem] font-semibold text-error text-center">{error}</p>}
        </form>

        <p className="mt-6 text-center text-[0.9rem]">¿Ya tenés cuenta? <Link to="/login" className="text-primary font-semibold hover:underline">Iniciá sesión</Link></p>
      </section>
    </main>
  )
}
