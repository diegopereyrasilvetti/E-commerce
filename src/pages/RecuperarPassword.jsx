import { useState } from 'react'
import { Link } from 'react-router-dom'
import CampoFormulario from '../components/CampoFormulario.jsx'
import { mensajeDeError, useAuth } from '../auth.jsx'
import { useFormulario } from '../utils/useFormulario.js'
import { useTitulo } from '../utils/useTitulo.js'
import { email } from '../utils/validaciones.js'

// Paso 1 de recuperar la contraseña: se pide el email y se manda un enlace
export default function RecuperarPassword() {
  useTitulo('Recuperar contraseña')
  const { recuperarPassword } = useAuth()
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState('') // email al que se mandó el enlace
  const { campo, enviar } = useFormulario({ email: '' }, { email })

  async function alEnviar(valores) {
    setError('')
    setEnviando(true)
    const correo = valores.email.trim()
    const { error } = await recuperarPassword(correo)
    setEnviando(false)
    if (error) return setError(mensajeDeError(error))
    setEnviado(correo)
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-[420px] p-6 min-[600px]:p-8 bg-white text-secondary border border-[rgba(15,23,42,0.08)] rounded-2xl shadow-[0_4px_12px_rgba(15,23,42,0.12)]" aria-labelledby="recuperar-titulo">
        {enviado ? (
          <div className="text-center">
            <i className="fa-solid fa-envelope-circle-check text-[2.5rem] text-primary" aria-hidden="true"></i>
            <h2 id="recuperar-titulo" className="mt-3 text-[1.5rem] font-bold">Revisá tu correo</h2>
            {/* No se dice si el email existe o no, para no revelar quién tiene cuenta */}
            <p className="mt-2 text-[0.95rem] text-[#475569]">
              Si hay una cuenta con <strong className="text-secondary">{enviado}</strong>, te enviamos un enlace para elegir una contraseña nueva. Puede tardar unos minutos.
            </p>
            <Link to="/login" className="mt-6 inline-block rounded-[50px] bg-primary px-6 py-2.5 font-semibold text-white hover:bg-secondary">Volver a iniciar sesión</Link>
          </div>
        ) : (
          <>
            <h2 id="recuperar-titulo" className="text-[1.5rem] font-bold">Recuperar contraseña</h2>
            <p className="mt-1 text-[0.9rem] text-[#475569]">Ingresá el email de tu cuenta y te enviamos un enlace para elegir una contraseña nueva.</p>

            <form className="mt-6 flex flex-col gap-4" onSubmit={enviar(alEnviar)} noValidate>
              <CampoFormulario label="Email" type="email" autoComplete="email" placeholder="nombre@correo.com" {...campo('email')} />

              <button type="submit" disabled={enviando} className="w-full h-11 rounded-[50px] bg-primary text-white text-[0.95rem] font-semibold cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.25)] [transition:background-color_0.2s,transform_0.2s] motion-reduce:[transition:none]! hover:bg-secondary hover:[transform:translateY(-1px)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-wait">
                {enviando ? 'Enviando…' : 'Enviar enlace'}
              </button>

              {error && <p role="alert" className="p-3 rounded-xl bg-[rgba(220,38,38,0.08)] text-[0.85rem] font-semibold text-error text-center">{error}</p>}
            </form>

            <p className="mt-6 text-center text-[0.9rem]"><Link to="/login" className="text-primary font-semibold hover:underline">Volver a iniciar sesión</Link></p>
          </>
        )}
      </section>
    </main>
  )
}
