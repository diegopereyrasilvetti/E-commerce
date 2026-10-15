import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTitulo } from '../utils/useTitulo.js'

// Si se llegó desde el carrito o desde "Agregar al carrito", se avisa por qué se pide iniciar sesión
const AVISOS = {
  carrito: 'Iniciá sesión para ver tu carrito.',
  agregar: 'Iniciá sesión para agregar productos al carrito.',
}

const CAMPO =
  'w-full h-11 px-4 bg-white text-secondary text-[0.95rem] border border-[rgba(15,23,42,0.2)] rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.1)] [transition:border-color_0.2s,box-shadow_0.2s] motion-reduce:[transition:none]! placeholder:text-[#64748B] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(79,70,229,0.3)]'

export default function Login() {
  useTitulo('Iniciar sesión')
  const [params] = useSearchParams()
  const aviso = AVISOS[params.get('desde')]
  const [verPassword, setVerPassword] = useState(false)
  const [estado, setEstado] = useState('')

  // Todavía no hay servidor: se valida el formulario pero no se envía a ningún lado
  function enviar(e) {
    e.preventDefault()
    setEstado('Formulario completo. El inicio de sesión todavía no está conectado a un servidor.')
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-[420px] p-6 min-[600px]:p-8 bg-white text-secondary border border-[rgba(15,23,42,0.08)] rounded-2xl shadow-[0_4px_12px_rgba(15,23,42,0.12)]" aria-labelledby="login-titulo">
        <h2 id="login-titulo" className="text-[1.5rem] font-bold">Iniciar sesión</h2>
        <p className="mt-1 text-[0.9rem] text-[#475569]">Ingresá con tu cuenta para comprar y ver tus pedidos.</p>

        {aviso && (
          <p role="status" className="mt-4 p-3 rounded-xl bg-[rgba(79,70,229,0.1)] text-primary text-[0.85rem] font-semibold">{aviso}</p>
        )}

        <form className="mt-6 flex flex-col gap-4" onSubmit={enviar}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="usuario" className="text-[0.9rem] font-semibold">Usuario o email</label>
            <input id="usuario" name="usuario" type="text" autoComplete="username" required placeholder="usuario / @email.com" className={CAMPO} />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="password" className="text-[0.9rem] font-semibold">Contraseña</label>
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                className="text-[0.8rem] font-semibold text-primary cursor-pointer hover:underline focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2"
                aria-controls="password"
                aria-pressed={verPassword}
              >
                {verPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input id="password" name="password" type={verPassword ? 'text' : 'password'} autoComplete="current-password" required minLength={6} placeholder="Tu contraseña" className={CAMPO} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[0.85rem]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="recordarme" className="size-4 accent-primary cursor-pointer" />
              Recordarme
            </label>
            <a href="#" className="text-primary font-semibold hover:underline">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className="w-full h-11 rounded-[50px] bg-primary text-white text-[0.95rem] font-semibold cursor-pointer shadow-[0_4px_8px_rgba(0,0,0,0.25)] [transition:background-color_0.2s,transform_0.2s] motion-reduce:[transition:none]! hover:bg-secondary hover:[transform:translateY(-1px)] focus-visible:outline-3 focus-visible:outline-background focus-visible:outline-offset-2">
            Iniciar sesión
          </button>

          {estado && <p role="status" className="p-3 rounded-xl bg-[#F1F5F9] text-[0.85rem] text-[#475569] text-center">{estado}</p>}
        </form>

        <p className="mt-6 text-center text-[0.9rem]">¿No tenés cuenta? <Link to="/login" className="text-primary font-semibold hover:underline">Registrate</Link></p>
      </section>
    </main>
  )
}
