/* Acceso a los datos de la cuenta del usuario: perfil y direcciones de envío (tablas `perfiles` y `direcciones`).

   Cada función devuelve { data, error } como supabase-js. No hace falta indicar de quién son los datos al leer:
   las políticas RLS de la base (ver README) hacen que cada usuario solo vea y toque los suyos. */

import { supabase } from './supabase.js'

// ---------- Perfil ----------
export function obtenerPerfil(usuarioId) {
  return supabase.from('perfiles').select('nombre, telefono').eq('id', usuarioId).maybeSingle()
}

export async function guardarPerfil(usuarioId, { nombre, telefono }) {
  const { error } = await supabase.from('perfiles').update({ nombre, telefono: telefono || null }).eq('id', usuarioId)
  if (error) return { error }
  // El header lee el nombre de la cuenta (no de la tabla), así que se actualiza también ahí
  return supabase.auth.updateUser({ data: { nombre } })
}

// ---------- Direcciones ----------
// La principal primero y después por orden de creación
export function listarDirecciones() {
  return supabase.from('direcciones').select('*').order('es_principal', { ascending: false }).order('creado_en')
}

// Solo puede haber una principal por usuario (lo garantiza la base): antes de marcar una, se desmarca la anterior
async function quitarPrincipal(usuarioId, exceptoId) {
  let consulta = supabase.from('direcciones').update({ es_principal: false }).eq('usuario_id', usuarioId).eq('es_principal', true)
  if (exceptoId) consulta = consulta.neq('id', exceptoId)
  return consulta
}

export async function crearDireccion(usuarioId, datos) {
  if (datos.es_principal) {
    const { error } = await quitarPrincipal(usuarioId)
    if (error) return { error }
  }
  return supabase.from('direcciones').insert({ ...datos, usuario_id: usuarioId })
}

export async function actualizarDireccion(usuarioId, id, datos) {
  if (datos.es_principal) {
    const { error } = await quitarPrincipal(usuarioId, id)
    if (error) return { error }
  }
  return supabase.from('direcciones').update(datos).eq('id', id)
}

export async function marcarPrincipal(usuarioId, id) {
  const { error } = await quitarPrincipal(usuarioId, id)
  if (error) return { error }
  return supabase.from('direcciones').update({ es_principal: true }).eq('id', id)
}

export function borrarDireccion(id) {
  return supabase.from('direcciones').delete().eq('id', id)
}
