-- Esquema de la base de datos (PostgreSQL en Supabase).
-- Para recrearlo en un proyecto nuevo: Supabase -> SQL Editor -> pegar este archivo y ejecutarlo.
-- La seguridad se apoya en RLS (Row Level Security): cada usuario solo ve y modifica sus propias filas.

-- =====================================================================
-- perfiles: una fila por usuario (el id es el mismo que el de su cuenta)
-- =====================================================================
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  telefono text,
  creado_en timestamptz not null default now()
);

alter table public.perfiles enable row level security;

grant select, update on public.perfiles to authenticated;

create policy "Cada usuario ve su perfil"
  on public.perfiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Cada usuario edita su perfil"
  on public.perfiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Al registrarse un usuario se crea su perfil solo (con el nombre que mandó el formulario)
create function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, new.raw_user_meta_data ->> 'nombre');
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- =====================================================================
-- direcciones: direcciones de envío (muchas por usuario)
-- =====================================================================
create table public.direcciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users (id) on delete cascade,
  alias text not null,
  destinatario text not null,
  calle text not null,
  numero text not null,
  piso_depto text,
  ciudad text not null,
  provincia text not null,
  codigo_postal text not null,
  telefono text,
  es_principal boolean not null default false,
  creado_en timestamptz not null default now()
);

create index direcciones_usuario_idx on public.direcciones (usuario_id);

-- Como máximo UNA dirección principal por usuario
create unique index una_principal_por_usuario
  on public.direcciones (usuario_id)
  where es_principal;

alter table public.direcciones enable row level security;

grant select, insert, update, delete on public.direcciones to authenticated;

create policy "Ver mis direcciones"
  on public.direcciones for select to authenticated
  using ((select auth.uid()) = usuario_id);

create policy "Crear mis direcciones"
  on public.direcciones for insert to authenticated
  with check ((select auth.uid()) = usuario_id);

create policy "Editar mis direcciones"
  on public.direcciones for update to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);

create policy "Borrar mis direcciones"
  on public.direcciones for delete to authenticated
  using ((select auth.uid()) = usuario_id);
