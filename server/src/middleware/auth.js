import { ErrorHttp } from '../errores.js'

// Exige un usuario con sesión iniciada. Deja sus datos en req.usuario ({ id, email, rol }).
export function requerirSesion(autenticador) {
  return async (req, res, next) => {
    const [tipo, token] = (req.get('authorization') ?? '').split(' ')
    if (tipo !== 'Bearer' || !token) throw new ErrorHttp(401, 'SIN_SESION', 'Tenés que iniciar sesión.')
    if (token.length > 4096) throw new ErrorHttp(401, 'SESION_INVALIDA', 'Tu sesión no es válida. Iniciá sesión de nuevo.')
    const usuario = await autenticador.verificar(token)
    if (!usuario) throw new ErrorHttp(401, 'SESION_INVALIDA', 'Tu sesión no es válida o venció. Iniciá sesión de nuevo.')
    req.usuario = usuario
    next()
  }
}

// Exige que el usuario tenga uno de esos roles (se usa después de requerirSesion)
export function requerirRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) throw new ErrorHttp(403, 'SIN_PERMISO', 'No tenés permiso para hacer esto.')
    next()
  }
}
