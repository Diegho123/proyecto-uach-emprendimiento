-- =============================================================================
--  Integra Pyme — esquema base
--
--  Ejecutar en el SQL Editor de Supabase (o con `supabase db push`).
--  Cada negocio pertenece a un usuario de auth.users; las políticas RLS
--  garantizan que nadie vea datos de otro negocio.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────────
do $$ begin
  create type perfil_negocio as enum ('restaurant', 'minimarket', 'services');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tipo_cuenta_flujo as enum ('ingreso', 'egreso');
exception when duplicate_object then null; end $$;

-- ── Perfiles de usuario ──────────────────────────────────────────────────────
-- Supabase guarda las credenciales en auth.users, que no se toca desde el
-- cliente. Esta tabla espeja los datos visibles del usuario (nombre, teléfono)
-- para poder consultarlos y editarlos con RLS normal.
create table if not exists public.perfiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nombre      text,
  email       text,
  telefono    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Al registrarse se crea el perfil solo, tomando el nombre del formulario
-- (viaja en raw_user_meta_data desde signUp).
create or replace function public.crear_perfil_al_registrarse()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.crear_perfil_al_registrarse();

-- ── Negocios ─────────────────────────────────────────────────────────────────
create table if not exists public.negocios (
  id                          uuid primary key default gen_random_uuid(),
  owner_id                    uuid not null references auth.users (id) on delete cascade,
  nombre                      text not null,
  perfil                      perfil_negocio not null,
  porcentaje_merma_global     numeric(5, 2)  not null default 5     check (porcentaje_merma_global >= 0 and porcentaje_merma_global <= 100),
  margen_objetivo_porcentaje  numeric(5, 2)  not null default 40    check (margen_objetivo_porcentaje > 0  and margen_objetivo_porcentaje < 100),
  saldo_inicial_caja          numeric(14, 2) not null default 0,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists negocios_owner_idx on public.negocios (owner_id);

-- ── Restaurante: insumos y recetas ───────────────────────────────────────────
create table if not exists public.insumos (
  id               uuid primary key default gen_random_uuid(),
  negocio_id       uuid not null references public.negocios (id) on delete cascade,
  nombre           text not null,
  proveedor        text,
  unidad           text not null default 'un',
  costo_por_unidad numeric(14, 4) not null check (costo_por_unidad >= 0),
  created_at       timestamptz not null default now()
);

create index if not exists insumos_negocio_idx on public.insumos (negocio_id);

create table if not exists public.recetas (
  id               uuid primary key default gen_random_uuid(),
  negocio_id       uuid not null references public.negocios (id) on delete cascade,
  nombre           text not null,
  precio_venta     numeric(14, 2) not null default 0 check (precio_venta >= 0),
  costo_total      numeric(14, 2) not null default 0 check (costo_total >= 0),
  ventas_estimadas integer        not null default 0 check (ventas_estimadas >= 0),
  created_at       timestamptz not null default now()
);

create index if not exists recetas_negocio_idx on public.recetas (negocio_id);

create table if not exists public.receta_ingredientes (
  id             uuid primary key default gen_random_uuid(),
  receta_id      uuid not null references public.recetas (id) on delete cascade,
  insumo_id      uuid not null references public.insumos (id) on delete restrict,
  cantidad_usada numeric(14, 4) not null check (cantidad_usada > 0),
  unique (receta_id, insumo_id)
);

create index if not exists receta_ingredientes_receta_idx on public.receta_ingredientes (receta_id);

-- ── Minimarket / ferretería: catálogo, inventario y capas LIFO ───────────────
create table if not exists public.productos_catalogo (
  id              uuid primary key default gen_random_uuid(),
  negocio_id      uuid not null references public.negocios (id) on delete cascade,
  nombre          text not null,
  categoria       text not null default 'General',
  costo_mayorista numeric(14, 2) not null check (costo_mayorista >= 0),
  precio_sugerido numeric(14, 2) not null check (precio_sugerido >= 0),
  unidad          text not null default 'un'
);

create index if not exists productos_catalogo_negocio_idx on public.productos_catalogo (negocio_id);

create table if not exists public.inventario (
  id               uuid primary key default gen_random_uuid(),
  negocio_id       uuid not null references public.negocios (id) on delete cascade,
  sku              text not null,
  nombre           text not null,
  categoria        text,
  costo_compra     numeric(14, 2) not null check (costo_compra >= 0),
  precio_venta     numeric(14, 2) not null check (precio_venta >= 0),
  ventas_mensuales integer        not null default 0 check (ventas_mensuales >= 0),
  stock_actual     integer        not null default 0 check (stock_actual >= 0),
  lead_time_dias   integer        not null default 3 check (lead_time_dias  >  0),
  merma_esperada   numeric(5, 2)  not null default 0 check (merma_esperada  >= 0),
  punto_reorden    integer        not null default 0 check (punto_reorden   >= 0),
  created_at       timestamptz not null default now(),
  unique (negocio_id, sku)
);

create index if not exists inventario_negocio_idx on public.inventario (negocio_id);

-- Cada compra abre una capa de costo. El despacho LIFO consume primero la más
-- reciente, que es la que refleja el costo real de reposición.
create table if not exists public.lotes_lifo (
  id                   uuid primary key default gen_random_uuid(),
  negocio_id           uuid not null references public.negocios (id) on delete cascade,
  sku                  text not null,
  producto             text not null,
  fecha                date not null default current_date,
  cantidad_comprada    integer not null check (cantidad_comprada > 0),
  cantidad_disponible  integer not null check (cantidad_disponible >= 0),
  costo_unitario       numeric(14, 2) not null check (costo_unitario >= 0),
  created_at           timestamptz not null default now(),
  constraint lotes_lifo_saldo_valido check (cantidad_disponible <= cantidad_comprada)
);

create index if not exists lotes_lifo_negocio_sku_idx on public.lotes_lifo (negocio_id, sku, fecha desc);

-- ── Servicios: recursos y proyectos ──────────────────────────────────────────
create table if not exists public.recursos (
  id               uuid primary key default gen_random_uuid(),
  negocio_id       uuid not null references public.negocios (id) on delete cascade,
  nombre           text not null,
  tipo             text not null default 'Personal',
  unidad           text not null default 'hora',
  costo_por_unidad numeric(14, 2) not null check (costo_por_unidad >= 0)
);

create index if not exists recursos_negocio_idx on public.recursos (negocio_id);

create table if not exists public.servicios (
  id               uuid primary key default gen_random_uuid(),
  negocio_id       uuid not null references public.negocios (id) on delete cascade,
  nombre           text not null,
  precio_venta     numeric(14, 2) not null default 0 check (precio_venta >= 0),
  costo_total      numeric(14, 2) not null default 0 check (costo_total  >= 0),
  ventas_mensuales integer        not null default 0 check (ventas_mensuales >= 0),
  created_at       timestamptz not null default now()
);

create index if not exists servicios_negocio_idx on public.servicios (negocio_id);

create table if not exists public.servicio_elementos (
  id             uuid primary key default gen_random_uuid(),
  servicio_id    uuid not null references public.servicios (id) on delete cascade,
  recurso_id     uuid not null references public.recursos (id) on delete restrict,
  cantidad_usada numeric(14, 4) not null check (cantidad_usada > 0),
  unique (servicio_id, recurso_id)
);

create index if not exists servicio_elementos_servicio_idx on public.servicio_elementos (servicio_id);

-- ── Estructura de costos transversal ─────────────────────────────────────────
create table if not exists public.costos_variables (
  id               uuid primary key default gen_random_uuid(),
  negocio_id       uuid not null references public.negocios (id) on delete cascade,
  nombre           text not null,
  costo_por_unidad numeric(14, 2) not null check (costo_por_unidad >= 0)
);

create index if not exists costos_variables_negocio_idx on public.costos_variables (negocio_id);

create table if not exists public.costos_fijos (
  id         uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  nombre     text not null,
  monto      numeric(14, 2) not null check (monto >= 0)
);

create index if not exists costos_fijos_negocio_idx on public.costos_fijos (negocio_id);

create table if not exists public.causales_merma (
  id         uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  motivo     text not null,
  porcentaje numeric(5, 2) not null check (porcentaje >= 0 and porcentaje <= 100)
);

create index if not exists causales_merma_negocio_idx on public.causales_merma (negocio_id);

-- Doce posiciones, una por mes calendario.
create table if not exists public.cuentas_flujo_caja (
  id         uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  tipo       tipo_cuenta_flujo not null,
  nombre     text not null,
  valores    numeric(14, 2)[] not null default array_fill(0::numeric, array[12]),
  orden      integer not null default 0,
  constraint cuentas_flujo_doce_meses check (array_length(valores, 1) = 12)
);

create index if not exists cuentas_flujo_negocio_idx on public.cuentas_flujo_caja (negocio_id, orden);

-- ── updated_at automático ────────────────────────────────────────────────────
create or replace function public.tocar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists negocios_updated_at on public.negocios;
create trigger negocios_updated_at
  before update on public.negocios
  for each row execute function public.tocar_updated_at();

drop trigger if exists perfiles_updated_at on public.perfiles;
create trigger perfiles_updated_at
  before update on public.perfiles
  for each row execute function public.tocar_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Un negocio es visible solo para su dueño; todas las tablas hijas heredan ese
-- permiso comprobando la pertenencia del negocio_id.

alter table public.perfiles            enable row level security;
alter table public.negocios            enable row level security;
alter table public.insumos             enable row level security;
alter table public.recetas             enable row level security;
alter table public.receta_ingredientes enable row level security;
alter table public.productos_catalogo  enable row level security;
alter table public.inventario          enable row level security;
alter table public.lotes_lifo          enable row level security;
alter table public.recursos            enable row level security;
alter table public.servicios           enable row level security;
alter table public.servicio_elementos  enable row level security;
alter table public.costos_variables    enable row level security;
alter table public.costos_fijos        enable row level security;
alter table public.causales_merma      enable row level security;
alter table public.cuentas_flujo_caja  enable row level security;

-- Cada usuario ve y edita únicamente su propio perfil.
drop policy if exists "perfil propio" on public.perfiles;
create policy "perfil propio" on public.perfiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "negocios propios" on public.negocios;
create policy "negocios propios" on public.negocios
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ¿El negocio indicado pertenece al usuario en sesión?
create or replace function public.es_mi_negocio(negocio uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.negocios n
    where n.id = negocio and n.owner_id = auth.uid()
  );
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'insumos', 'recetas', 'productos_catalogo', 'inventario', 'lotes_lifo',
    'recursos', 'servicios', 'costos_variables', 'costos_fijos',
    'causales_merma', 'cuentas_flujo_caja'
  ]
  loop
    execute format('drop policy if exists "acceso por negocio" on public.%I', t);
    execute format(
      'create policy "acceso por negocio" on public.%I for all
         using (public.es_mi_negocio(negocio_id))
         with check (public.es_mi_negocio(negocio_id))', t);
  end loop;
end $$;

-- Las tablas de detalle se acotan por su cabecera.
drop policy if exists "acceso por receta" on public.receta_ingredientes;
create policy "acceso por receta" on public.receta_ingredientes
  for all
  using (exists (
    select 1 from public.recetas r
    where r.id = receta_id and public.es_mi_negocio(r.negocio_id)
  ))
  with check (exists (
    select 1 from public.recetas r
    where r.id = receta_id and public.es_mi_negocio(r.negocio_id)
  ));

drop policy if exists "acceso por servicio" on public.servicio_elementos;
create policy "acceso por servicio" on public.servicio_elementos
  for all
  using (exists (
    select 1 from public.servicios s
    where s.id = servicio_id and public.es_mi_negocio(s.negocio_id)
  ))
  with check (exists (
    select 1 from public.servicios s
    where s.id = servicio_id and public.es_mi_negocio(s.negocio_id)
  ));

-- ── Despacho LIFO transaccional ──────────────────────────────────────────────
-- El cálculo también existe en el cliente (src/lib/calculations.ts) para dar
-- respuesta inmediata. Esta función es la versión autoritativa: al correr
-- dentro de una transacción, evita que dos despachos simultáneos del mismo SKU
-- consuman la misma capa.
create or replace function public.despachar_lifo(
  p_negocio_id uuid,
  p_sku        text,
  p_unidades   integer
)
returns table (cmv_total numeric, costo_unitario_efectivo numeric)
language plpgsql
security invoker
as $$
declare
  v_restante integer := p_unidades;
  v_cmv      numeric := 0;
  v_capa     record;
  v_toma     integer;
begin
  if p_unidades <= 0 then
    raise exception 'Las unidades a despachar deben ser mayores que cero';
  end if;

  if (
    select coalesce(sum(cantidad_disponible), 0)
    from public.lotes_lifo
    where negocio_id = p_negocio_id and sku = p_sku
  ) < p_unidades then
    raise exception 'Stock insuficiente en las capas registradas para %', p_sku;
  end if;

  for v_capa in
    select id, cantidad_disponible, costo_unitario
    from public.lotes_lifo
    where negocio_id = p_negocio_id and sku = p_sku and cantidad_disponible > 0
    order by fecha desc, created_at desc
    for update
  loop
    exit when v_restante = 0;

    v_toma := least(v_capa.cantidad_disponible, v_restante);
    v_cmv := v_cmv + (v_toma * v_capa.costo_unitario);
    v_restante := v_restante - v_toma;

    update public.lotes_lifo
    set cantidad_disponible = cantidad_disponible - v_toma
    where id = v_capa.id;
  end loop;

  return query select v_cmv, round(v_cmv / p_unidades, 2);
end;
$$;
