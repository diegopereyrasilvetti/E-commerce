// La sesión se guarda en localStorage con la clave "kodex-usuario" (cuando el login esté
// conectado a un servidor, tiene que guardar ahí el usuario al iniciar sesión).
export function haySesion() {
  try {
    return !!localStorage.getItem('kodex-usuario')
  } catch {
    return false // navegación privada: sin sesión
  }
}

// Ícono del carrito del header: sin usuario lleva al login
export function rutaCarrito() {
  return haySesion() ? '#' : '/login?desde=carrito' // todavía no hay página del carrito
}
