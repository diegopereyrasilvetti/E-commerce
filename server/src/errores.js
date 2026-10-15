import { z } from 'zod'

z.config(z.locales.es()) // los mensajes de validación de Zod en español

// Error que se muestra al cliente con su código HTTP. Cualquier otro error se considera un fallo interno (500).
export class ErrorHttp extends Error {
  constructor(estado, codigo, mensaje, detalles) {
    super(mensaje)
    this.estado = estado
    this.codigo = codigo
    this.detalles = detalles
  }
}

// Valida datos con un esquema de Zod: devuelve los datos ya convertidos y limpios o lanza un 400 con el detalle
export function validar(esquema, datos) {
  const resultado = esquema.safeParse(datos)
  if (resultado.success) return resultado.data
  const detalles = resultado.error.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message }))
  throw new ErrorHttp(400, 'DATOS_INVALIDOS', 'Los datos enviados no son válidos.', detalles)
}
