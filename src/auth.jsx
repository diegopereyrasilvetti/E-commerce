/* Autenticación con Supabase.

   - AuthProvider ... guarda el usuario con sesión iniciada (y lo recuerda al recargar la página).
                      Va envolviendo la app (ver main.jsx).
   - useAuth() ...... hook para leer el usuario y para registrarse, iniciar y cerrar sesión.
   - mensajeDeError . traduce los errores de Supabase a mensajes para mostrar. */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = todavía se está comprobando si hay una sesión guardada
  const [sesion, setSesion] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))
    // Se ejecuta al iniciar o cerrar sesión (también desde otra pestaña) y cuando se renueva el acceso
    const { data } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => setSesion(nuevaSesion))
    return () => data.subscription.unsubscribe()
  }, [])

  const valor = useMemo(
    () => ({
      usuario: sesion?.user ?? null,
      cargando: sesion === undefined,
      iniciarSesion: (email, password) => supabase.auth.signInWithPassword({ email, password }),
      registrar: (nombre, email, password) =>
        supabase.auth.signUp({ email, password, options: { data: { nombre } } }),
      cerrarSesion: () => supabase.auth.signOut(),
      // Manda un correo con un enlace que lleva a /nueva-contrasena (y deja una sesión temporal para cambiarla)
      recuperarPassword: (email) =>
        supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/nueva-contrasena' }),
      cambiarPassword: (password) => supabase.auth.updateUser({ password }),
    }),
    [sesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth tiene que usarse dentro de <AuthProvider>')
  return contexto
}

// Nombre para mostrar del usuario: el que puso al registrarse o, si no, el principio de su email
export function nombreDe(usuario) {
  return usuario?.user_metadata?.nombre || usuario?.email?.split('@')[0] || ''
}

// Primer nombre con la primera letra en mayúscula: "diego pereyra" -> "Diego"
export function primerNombre(usuario) {
  const primero = nombreDe(usuario).trim().split(/\s+/)[0] || ''
  return primero.charAt(0).toUpperCase() + primero.slice(1)
}

const MENSAJES = {
  invalid_credentials: 'El email o la contraseña no son correctos.',
  email_not_confirmed: 'Todavía no confirmaste tu email. Revisá tu correo y tocá el enlace que te enviamos.',
  user_already_exists: 'Ya existe una cuenta con ese email.',
  weak_password: 'La contraseña es muy débil. Probá con una más larga.',
  same_password: 'La nueva contraseña tiene que ser distinta de la anterior.',
  session_not_found: 'El enlace venció. Pedí uno nuevo para cambiar tu contraseña.',
  not_authenticated: 'El enlace venció. Pedí uno nuevo para cambiar tu contraseña.',
  over_email_send_rate_limit: 'Se enviaron demasiados correos. Esperá un rato y volvé a intentar.',
  over_request_rate_limit: 'Hiciste demasiados intentos. Esperá un momento y volvé a intentar.',
}

export function mensajeDeError(error) {
  if (!error) return ''
  if (error.name === 'AuthRetryableFetchError') return 'No pudimos conectar con el servidor. Revisá tu conexión e intentá de nuevo.'
  return MENSAJES[error.code] || 'Algo salió mal. Intentá de nuevo en un momento.'
}
