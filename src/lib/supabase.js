import { createClient } from '@supabase/supabase-js'

// La URL y la clave pública (publishable) se leen de .env.local (ver .env.example).
// Esa clave se puede usar en el navegador: lo que protege los datos son las reglas del servidor (RLS).
const url = import.meta.env.VITE_SUPABASE_URL
const clave = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !clave) {
  throw new Error('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. Copiá .env.example como .env.local y completalo.')
}

// Por defecto Supabase guarda la sesión en el navegador y la renueva sola
export const supabase = createClient(url, clave)
