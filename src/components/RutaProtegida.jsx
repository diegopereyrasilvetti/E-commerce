import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

// Solo muestra la página si hay un usuario con sesión; si no, lo manda a iniciar sesión.
// `motivo` es el aviso que se muestra en el login (?desde=carrito).
export default function RutaProtegida({ children, motivo = 'carrito' }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <main className="flex-1" aria-busy="true" />
  if (!usuario) return <Navigate to={'/login?desde=' + motivo} replace />
  return children
}
