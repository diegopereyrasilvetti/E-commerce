import { ErrorHttp } from '../errores.js'

// Todas las respuestas de error tienen la misma forma: { error: { codigo, mensaje, detalles? } }
function respuesta(res, estado, codigo, mensaje, detalles) {
  return res.status(estado).json({ error: { codigo, mensaje, ...(detalles && { detalles }) } })
}

// Ninguna ruta coincidió
export function noEncontrada(req, res) {
  return respuesta(res, 404, 'RUTA_NO_ENCONTRADA', `No existe ${req.method} ${req.path}`)
}

// Se ejecuta cuando una ruta falla (Express 5 también captura los errores de funciones async)
// eslint-disable-next-line no-unused-vars
export function manejarErrores(error, req, res, next) {
  if (error instanceof ErrorHttp) return respuesta(res, error.estado, error.codigo, error.message, error.detalles)
  // JSON mal formado o demasiado grande
  if (error.type === 'entity.parse.failed') return respuesta(res, 400, 'JSON_INVALIDO', 'El cuerpo de la solicitud no es un JSON válido.')
  if (error.type === 'entity.too.large') return respuesta(res, 413, 'CUERPO_DEMASIADO_GRANDE', 'El cuerpo de la solicitud es demasiado grande.')
  // Fallo inesperado: se registra en el servidor pero al cliente no se le muestran detalles internos
  console.error(error)
  return respuesta(res, 500, 'ERROR_INTERNO', 'Algo salió mal en el servidor.')
}
