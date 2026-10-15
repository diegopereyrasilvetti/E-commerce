-- Migración 004: pedidos (pedidos y pedido_items) y la función que los crea.
-- Se ejecuta en Supabase -> SQL Editor.
--
-- Igual que el catálogo, estas tablas solo las usa la API (clave secret): RLS activado y sin políticas.
-- La API es la que decide quién puede ver qué pedido (cada usuario solo ve los suyos).

-- =====================================================================
-- pedidos: un pedido por compra
-- =====================================================================
create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  -- "restrict": no se puede borrar un usuario que tiene pedidos (el historial de compras no se pierde)
  usuario_id uuid not null references auth.users (id) on delete restrict,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')),
  medio_pago text not null check (medio_pago in ('tarjeta', 'transferencia')),
  cuotas smallint not null default 1 check (cuotas in (1, 6, 12, 18)),
  subtotal integer not null check (subtotal > 0),
  descuento integer not null default 0 check (descuento >= 0),
  total integer not null check (total > 0),
  valor_cuota integer not null check (valor_cuota > 0),
  -- La dirección se COPIA al pedido (no se referencia): si el usuario edita o borra su dirección después,
  -- el pedido conserva a dónde se mandó.
  envio_destinatario text not null,
  envio_calle text not null,
  envio_numero text not null,
  envio_piso_depto text,
  envio_ciudad text not null,
  envio_provincia text not null,
  envio_codigo_postal text not null,
  envio_telefono text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  -- La base también verifica que las cuentas cierren
  constraint pedidos_total_coherente check (total = subtotal - descuento),
  constraint pedidos_cuotas_coherentes check (valor_cuota * cuotas >= total and (medio_pago = 'tarjeta' or cuotas = 1))
);

create index pedidos_usuario_idx on public.pedidos (usuario_id, creado_en desc);

create trigger pedidos_actualizado_en
  before update on public.pedidos
  for each row execute function public.tocar_actualizado_en();

-- =====================================================================
-- pedido_items: los productos de cada pedido
-- =====================================================================
create table public.pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  -- Si algún día se borra el producto, el renglón se conserva (con su nombre y precio de ese momento)
  producto_id uuid references public.productos (id) on delete set null,
  nombre text not null,                       -- copia del nombre al momento de comprar
  precio_unitario integer not null check (precio_unitario > 0),   -- copia del precio al momento de comprar
  descuento_pct smallint not null default 0 check (descuento_pct between 0 and 100),
  cantidad smallint not null check (cantidad between 1 and 99),
  subtotal integer not null check (subtotal = precio_unitario * cantidad)
);

create index pedido_items_pedido_idx on public.pedido_items (pedido_id);

-- =====================================================================
-- Seguridad
-- =====================================================================
alter table public.pedidos enable row level security;
alter table public.pedido_items enable row level security;

grant all on public.pedidos to service_role;
grant all on public.pedido_items to service_role;

-- Al crear un pedido, la API lee la dirección de envío del usuario (y verifica que sea suya)
grant select on public.direcciones to service_role;

-- =====================================================================
-- crear_pedido: guarda el pedido y todos sus renglones JUNTOS.
-- Una función se ejecuta dentro de una transacción: o se guarda todo o no se guarda nada
-- (nunca queda un pedido sin renglones). Los importes ya vienen calculados por la API.
-- =====================================================================
create function public.crear_pedido(p_usuario_id uuid, p_pedido jsonb, p_items jsonb)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_id uuid;
begin
  insert into public.pedidos (
    usuario_id, medio_pago, cuotas, subtotal, descuento, total, valor_cuota,
    envio_destinatario, envio_calle, envio_numero, envio_piso_depto,
    envio_ciudad, envio_provincia, envio_codigo_postal, envio_telefono
  ) values (
    p_usuario_id, p_pedido ->> 'medio_pago', (p_pedido ->> 'cuotas')::smallint,
    (p_pedido ->> 'subtotal')::integer, (p_pedido ->> 'descuento')::integer,
    (p_pedido ->> 'total')::integer, (p_pedido ->> 'valor_cuota')::integer,
    p_pedido ->> 'envio_destinatario', p_pedido ->> 'envio_calle', p_pedido ->> 'envio_numero',
    p_pedido ->> 'envio_piso_depto', p_pedido ->> 'envio_ciudad', p_pedido ->> 'envio_provincia',
    p_pedido ->> 'envio_codigo_postal', p_pedido ->> 'envio_telefono'
  )
  returning id into v_id;

  insert into public.pedido_items (pedido_id, producto_id, nombre, precio_unitario, descuento_pct, cantidad, subtotal)
  select
    v_id, (i ->> 'producto_id')::uuid, i ->> 'nombre', (i ->> 'precio_unitario')::integer,
    (i ->> 'descuento_pct')::smallint, (i ->> 'cantidad')::smallint, (i ->> 'subtotal')::integer
  from jsonb_array_elements(p_items) as i;

  return v_id;
end;
$$;

-- Solo la API (clave secret) puede ejecutarla; el navegador no
revoke execute on function public.crear_pedido(uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.crear_pedido(uuid, jsonb, jsonb) to service_role;
