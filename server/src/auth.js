/* Quién está haciendo cada solicitud.

   El frontend manda el token de sesión de Supabase en la cabecera "Authorization: Bearer <token>".
   El servidor NO confía en lo que diga el cliente: le pregunta a Supabase si el token es válido (y de quién es)
   y lee el rol de la tabla `perfiles`. */

export function crearAutenticador(supabase) {
  return {
    // Devuelve { id, email, rol } o null si el token no es válido o venció
    async verificar(token) {
      const { data, error } = await supabase.auth.getUser(token)
      if (error || !data.user) return null
      const { data: perfil, error: errorPerfil } = await supabase.from('perfiles').select('rol').eq('id', data.user.id).maybeSingle()
      if (errorPerfil) throw errorPerfil
      return { id: data.user.id, email: data.user.email, rol: perfil?.rol ?? 'cliente' }
    },
  }
}
