-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tenants
create table if not exists public.tenants (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

-- Tenant members (admins)
create table if not exists public.tenant_members (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','staff')),
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

-- Categories
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  unique (tenant_id, slug)
);

-- Products
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  brand text,
  size text,
  code text,
  description text,
  details text,
  extras text,
  price numeric(12,2) not null default 0,
  images jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active','draft','archived')),
  inventory_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_email text,
  items jsonb not null,
  subtotal numeric(12,2) not null,
  shipping numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.tenants enable row level security;
alter table public.tenant_members enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Read policies (public storefront)
create policy if not exists "public read products" on public.products for select using (status = 'active');
create policy if not exists "public read categories" on public.categories for select using (true);

-- Admin only write policies
create policy if not exists "admins manage products" on public.products for all using (
  exists (
    select 1 from public.tenant_members tm
    where tm.tenant_id = products.tenant_id and tm.user_id = auth.uid() and tm.role in ('admin','staff')
  )
) with check (
  exists (
    select 1 from public.tenant_members tm
    where tm.tenant_id = products.tenant_id and tm.user_id = auth.uid() and tm.role in ('admin','staff')
  )
);

create policy if not exists "admins manage categories" on public.categories for all using (
  exists (
    select 1 from public.tenant_members tm
    where tm.tenant_id = categories.tenant_id and tm.user_id = auth.uid() and tm.role in ('admin','staff')
  )
) with check (
  exists (
    select 1 from public.tenant_members tm
    where tm.tenant_id = categories.tenant_id and tm.user_id = auth.uid() and tm.role in ('admin','staff')
  )
);

create policy if not exists "admins manage orders" on public.orders for all using (
  exists (
    select 1 from public.tenant_members tm
    where tm.tenant_id = orders.tenant_id and tm.user_id = auth.uid() and tm.role in ('admin','staff')
  )
) with check (
  exists (
    select 1 from public.tenant_members tm
    where tm.tenant_id = orders.tenant_id and tm.user_id = auth.uid() and tm.role in ('admin','staff')
  )
);

-- Manage tenant_members only by service role (no policies) or explicit admin function

-- Allow users to read their own tenant memberships
create policy if not exists "users can read own memberships" on public.tenant_members 
for select using (auth.uid() = user_id);

-- Helpful function to get tenant by slug
create or replace function public.get_tenant_id_by_slug(slug_input text)
returns uuid language sql stable as $$
  select id from public.tenants where slug = slug_input;
$$;

-- Allow an authenticated user to create a tenant for themselves and become admin
create or replace function public.create_tenant_self(p_name text, p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tenant_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.tenants (name, slug)
  values (p_name, p_slug)
  returning id into v_tenant_id;

  insert into public.tenant_members (tenant_id, user_id, role)
  values (v_tenant_id, v_user_id, 'admin');
end;
$$;

revoke all on function public.create_tenant_self(text, text) from public;
grant execute on function public.create_tenant_self(text, text) to authenticated; 