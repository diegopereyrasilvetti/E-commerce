import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import CampoFormulario from '../components/CampoFormulario.jsx'
import { mensajeDeError, useAuth } from '../auth.jsx'
import { useFormulario } from '../utils/useFormulario.js'
import { useTitulo } from '../utils/useTitulo.js'
import { email, passwordIngreso } from '../utils/validaciones.js'

// Si se llegó desde el carrito o desde "Agregar al carrito", se avisa por qué se pide iniciar sesión
// y, después de iniciar sesión, se vuelve a donde se quería ir
const MOTIVOS = {
  carrito: { aviso: 'Iniciá sesión para ver tu carrito.', destino: '/carrito' },
  agregar: { aviso: 'Iniciá sesión para agregar productos al carrito.', destino: '/productos' },
  cuenta: { aviso: 'Iniciá sesión para ver tu cuenta.', destino: '/cuenta' },
}

export default function Login() {
  useTitulo('Iniciar sesión')
  const [params] = useSearchParams()
  const motivo = MOTIVOS[params.get('desde')]
  const { usuario, iniciarSesion } = useAuth()
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { campo, enviar } = useFormulario({ email: '', password: '' }, { email, password: passwordIngreso })

  async function alEnviar(valores) {
    setError('')
    setEnviando(true)
    const { error } = await iniciarSesion(valores.email.trim(), valores.password)
    setEnviando(false)
    if (error) setError(mensajeDeError(error))
  }

  // Con la sesión iniciada no tiene sentido ver el login: se va a donde se quería ir
  if (usuario) return <Navigate to={motivo?.destino ?? '/'} replace />

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-[420px] p-6 min-[600px]:p-8 bg-white text-secondary border border-[rgba(15,23,42,0.08)] rounded-2xl shadow-[0_4px_12px_rgba(15,23,42,0.12)]" aria-labelledby="login-titulo">
        <h2 id="login-titulo" className="text-[1.5rem] font-bold">Iniciar sesión</h2>
        <p className="mt-1 text-[0.9rem] text-[#475569]">Ingresá con tu cuenta para comprar y ver tus pedidos.</p>

        {motivo && (
          <p role="status" className="mt-4 p-3 rounded-xl bg-[rgba(79,70,229,0.1)] text-primary text-[0.85rem] font-semibold">{motivo.aviso}</p>
        )}

        <form className="mt-6 flex flex-col gap-4" onSubmit={enviar(alEnviar)} noValidate>
          <CampoFormulario label="Email" type="email" autoComplete="email" placeholder="nombre@correo.com" {...campo('email')} />
          <CampoFormulario label="Contraseña" type="password" autoComplete="current-password" placeholder="Tu contraseña" {...campo('password')} />

          <div className="text-right text-[0.85rem]">
            <Link to="/recuperar" className="text-primary font-semibold hover:underline">¿Olvidaste tu contraseña?</Link>
          </div>

          <button type="submit" disabled={enviando} className="w-full h-11 rounded-[50px] bg-primary text-white text-[0.95rem] font-semibold cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.25)] [transition:background-color_0.2s,transform_0.2s] motion-reduce:[transition:none]! hover:bg-secondary hover:[transform:translateY(-1px)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-wait">
            {enviando ? 'Ingresando…' : 'Iniciar sesión'}
          </button>

          {error && <p role="alert" className="p-3 rounded-xl bg-[rgba(220,38,38,0.08)] text-[0.85rem] font-semibold text-error text-center">{error}</p>}
        </form>

        <p className="mt-6 text-center text-[0.9rem]">¿No tenés cuenta? <Link to="/registro" className="text-primary font-semibold hover:underline">Registrate</Link></p>
      </section>
    </main>
  )
}
