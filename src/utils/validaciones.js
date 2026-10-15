/* Reglas de validación de los formularios. Cada una recibe el valor y devuelve el mensaje de error,
   o '' si el valor es válido. Se usan con useFormulario (ver utils/useFormulario.js). */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const nombre = (valor) => {
  const v = valor.trim()
  if (!v) return 'Ingresá tu nombre.'
  if (v.length < 2) return 'El nombre tiene que tener al menos 2 letras.'
  return ''
}

export const email = (valor) => {
  const v = valor.trim()
  if (!v) return 'Ingresá tu email.'
  if (!EMAIL.test(v)) return 'El email no es válido. Ejemplo: nombre@correo.com'
  return ''
}

// Inicio de sesión: solo se pide que no esté vacía (la contraseña real la verifica el servidor)
export const passwordIngreso = (valor) => {
  if (!valor) return 'Ingresá tu contraseña.'
  if (valor.length < 6) return 'La contraseña tiene al menos 6 caracteres.'
  return ''
}

// Registro: la contraseña nueva tiene que ser razonablemente segura
export const passwordNueva = (valor) => {
  if (!valor) return 'Elegí una contraseña.'
  if (valor.length < 8) return 'Tiene que tener al menos 8 caracteres.'
  if (!/[a-zA-Z]/.test(valor) || !/\d/.test(valor)) return 'Tiene que incluir al menos una letra y un número.'
  return ''
}

export const repetirPassword = (valor, todos) => {
  if (!valor) return 'Repetí la contraseña.'
  if (valor !== todos.password) return 'Las contraseñas no coinciden.'
  return ''
}

export const aceptado = (valor) => (valor ? '' : 'Tenés que aceptar los términos para crear la cuenta.')
