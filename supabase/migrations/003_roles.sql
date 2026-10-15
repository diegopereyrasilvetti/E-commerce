-- Migración 003: roles de usuario (cliente / admin).
-- Se ejecuta en Supabase -> SQL Editor.

-- 1) Cada perfil tiene un rol. Todos arrancan como "cliente".
alter table public.perfiles
  add column rol text not null default 'cliente'
  check (rol in ('cliente', 'admin'));

-- 2) IMPORTANTE: que nadie pueda cambiarse el rol a sí mismo.
--    La política de perfiles deja que cada usuario EDITE SU FILA, y con la clave pública del navegador
--    alguien podría mandar "rol = admin" para su propia fila. Para evitarlo se le quita el permiso de
--    escribir en la tabla entera y se le devuelve solo sobre las columnas que sí puede cambiar.
revoke update on public.perfiles from authenticated;
grant update (nombre, telefono) on public.perfiles to authenticated;

-- 3) La API (que usa la clave secret, es decir el rol service_role) tiene que poder leer el rol de cada usuario.
grant select on public.perfiles to service_role;

-- 4) Para que un usuario sea administrador se hace a mano, desde el SQL Editor (que corre con permisos de dueño).
--    Reemplazá el email por el de la cuenta y ejecutá solo esta parte:
--
--    update public.perfiles
--    set rol = 'admin'
--    where id = (select id from auth.users where email = 'TU-EMAIL@correo.com');
