import { z } from 'zod'

// Variables de entorno que necesita el servidor. Si falta alguna, el servidor no arranca y dice cuál (ver .env.example).
const esquema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  SUPABASE_URL: z.url({ message: 'tiene que ser la URL de tu proyecto de Supabase' }),
  SUPABASE_SECRET_KEY: z.string().min(20, { message: 'falta la clave secret de Supabase' }),
  // Sitios que pueden llamar a la API desde el navegador, separados por coma
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((texto) => texto.split(',').map((o) => o.trim()).filter(Boolean)),
})

export function leerConfig(env = process.env) {
  const resultado = esquema.safeParse(env)
  if (!resultado.success) {
    const problemas = resultado.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Configuración inválida (revisá server/.env):\n${problemas}`)
  }
  return resultado.data
}
