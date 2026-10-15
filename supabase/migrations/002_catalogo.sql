-- Migración 002: catálogo de productos (categorias y productos).
-- Se ejecuta en Supabase -> SQL Editor. Después se cargan los productos con: npm --prefix server run cargar-productos
--
-- A diferencia de perfiles y direcciones, estas tablas NO las lee el navegador directamente: las lee la API (server/)
-- con la clave secret. Por eso se activa RLS sin ninguna política: con la clave pública nadie puede ver ni tocar nada.

-- =====================================================================
-- categorias
-- =====================================================================
create table public.categorias (
  id text primary key,              -- el mismo que usan las direcciones del sitio: "placas-de-video"
  nombre text not null,
  orden smallint not null unique    -- posición en la que se muestran
);

insert into public.categorias (id, nombre, orden) values
  ('procesadores',    'Procesadores',    1),
  ('mothers',         'Mothers',         2),
  ('placas-de-video', 'Placas de Video', 3),
  ('memorias-ram',    'Memorias RAM',    4),
  ('almacenamiento',  'Almacenamiento',  5),
  ('refrigeracion',   'Refrigeración',   6),
  ('gabinetes',       'Gabinetes',       7),
  ('fuentes',         'Fuentes',         8),
  ('monitores',       'Monitores',       9),
  ('perifericos',     'Periféricos',    10);

-- =====================================================================
-- productos
-- =====================================================================
create table public.productos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),      -- identificador para las direcciones: "mother-asus-rog"
  nombre text not null,
  precio integer not null check (precio > 0),                    -- en pesos, sin decimales
  precio_sin_impuestos integer check (precio_sin_impuestos > 0),
  descuento smallint not null default 0 check (descuento between 0 and 100),   -- % por pago con transferencia
  garantia text,
  imagen text not null,                                          -- ruta dentro de public/ del frontend
  categoria_id text not null references public.categorias (id),
  activo boolean not null default true,                          -- false = el producto se oculta sin borrarlo
  posicion integer not null default 0,                           -- orden de "más relevantes"
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- Para buscar rápido los productos de una categoría
create index productos_categoria_idx on public.productos (categoria_id) where activo;

-- actualizado_en se renueva solo cada vez que se modifica un producto
create function public.tocar_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create trigger productos_actualizado_en
  before update on public.productos
  for each row execute function public.tocar_actualizado_en();

-- =====================================================================
-- Seguridad
-- =====================================================================
alter table public.categorias enable row level security;
alter table public.productos enable row level security;

-- Solo el rol del servidor (clave secret) accede a estas tablas
grant all on public.categorias to service_role;
grant all on public.productos to service_role;
