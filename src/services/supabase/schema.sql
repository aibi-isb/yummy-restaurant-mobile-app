-- YUMMY canonical Supabase schema
--
-- Run this file in the Supabase SQL Editor. It is safe to run repeatedly:
-- tables, columns, indexes, functions, grants, and policies are created or
-- repaired without disabling Row Level Security.

begin;

create extension if not exists pgcrypto;

create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  username text unique,
  phone text,
  address text,
  affiliation_address text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin', 'super_admin')),
  primary_network text,
  card_holder text,
  card_last4 text,
  card_expiry text,
  seed_tag text,
  seed_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  name text not null,
  image text,
  icon text,
  color text,
  sort_order integer not null default 0,
  active boolean not null default true,
  seed_tag text,
  seed_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.foods (
  id text primary key,
  name text not null,
  description text not null default '',
  category text not null default 'Food',
  categories text[] not null default '{}',
  price numeric(12, 2) not null default 0 check (price >= 0),
  image text not null default '',
  featured boolean not null default false,
  popular boolean not null default false,
  available boolean not null default true,
  orders integer not null default 0 check (orders >= 0),
  seed_tag text,
  seed_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  food_id text not null references public.foods(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, food_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  customer_name text not null default '',
  phone text not null default '',
  address text not null default '',
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  tax numeric(12, 2) not null default 0 check (tax >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  status text not null default 'Pending' check (status in ('Pending', 'Payment Received', 'Preparing', 'Ready', 'Delivered')),
  payment_status text not null default 'Unpaid' check (payment_status in ('Unpaid', 'Pending Verification', 'Approved', 'Rejected')),
  estimated_delivery_at timestamptz,
  delivery_partner_name text,
  delivery_partner_phone text,
  seed_tag text,
  seed_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  food_id text references public.foods(id) on delete set null,
  food_name text not null default '',
  price numeric(12, 2) not null default 0 check (price >= 0),
  quantity integer not null default 1 check (quantity > 0),
  image text not null default '',
  seed_tag text,
  seed_key text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  method text not null check (method in ('mobile_money', 'credit_card', 'cash')),
  provider text,
  phone text,
  card_last4 text,
  status text not null default 'Pending Verification' check (status in ('Pending Verification', 'Approved', 'Rejected')),
  seed_tag text,
  seed_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  message text not null default '',
  type text not null default 'system' check (type in ('order', 'payment', 'admin', 'system')),
  read boolean not null default false,
  order_id uuid references public.orders(id) on delete set null,
  seed_tag text,
  seed_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  food_id text not null references public.foods(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, food_id)
);

create table if not exists public.payment_config (
  id text primary key,
  payment_methods jsonb not null default '[]'::jsonb,
  mobile_networks jsonb not null default '[]'::jsonb,
  info_text text not null default '',
  security_badge_text text not null default '',
  progress_steps jsonb not null default '[]'::jsonb,
  tracking_step_labels jsonb not null default '[]'::jsonb,
  demo_origin jsonb not null default '{}'::jsonb,
  demo_destination jsonb not null default '{}'::jsonb,
  tracking_toast_message text not null default '',
  seed_tag text,
  seed_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add columns used by existing installations that predate this canonical file.
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists primary_network text;
alter table public.profiles add column if not exists card_holder text;
alter table public.profiles add column if not exists card_last4 text;
alter table public.profiles add column if not exists card_expiry text;
alter table public.profiles add column if not exists affiliation_address text;
alter table public.profiles add column if not exists seed_tag text;
alter table public.profiles add column if not exists seed_key text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

alter table public.categories add column if not exists icon text;
alter table public.categories add column if not exists color text;
alter table public.categories add column if not exists sort_order integer not null default 0;
alter table public.categories add column if not exists active boolean not null default true;
alter table public.categories add column if not exists seed_tag text;
alter table public.categories add column if not exists seed_key text;
alter table public.categories add column if not exists created_at timestamptz not null default now();
alter table public.categories add column if not exists updated_at timestamptz not null default now();

alter table public.foods add column if not exists seed_tag text;
alter table public.foods add column if not exists seed_key text;
alter table public.foods add column if not exists created_at timestamptz not null default now();
alter table public.foods add column if not exists updated_at timestamptz not null default now();

alter table public.cart_items add column if not exists created_at timestamptz not null default now();
alter table public.cart_items add column if not exists updated_at timestamptz not null default now();

alter table public.orders add column if not exists seed_tag text;
alter table public.orders add column if not exists seed_key text;
alter table public.orders add column if not exists estimated_delivery_at timestamptz;
alter table public.orders add column if not exists delivery_partner_name text;
alter table public.orders add column if not exists delivery_partner_phone text;
alter table public.orders add column if not exists created_at timestamptz not null default now();
alter table public.orders add column if not exists updated_at timestamptz not null default now();

alter table public.order_items add column if not exists seed_tag text;
alter table public.order_items add column if not exists seed_key text;
alter table public.order_items add column if not exists created_at timestamptz not null default now();

alter table public.payments add column if not exists seed_tag text;
alter table public.payments add column if not exists seed_key text;
alter table public.payments add column if not exists created_at timestamptz not null default now();
alter table public.payments add column if not exists updated_at timestamptz not null default now();

alter table public.notifications add column if not exists seed_tag text;
alter table public.notifications add column if not exists seed_key text;
alter table public.notifications add column if not exists created_at timestamptz not null default now();
alter table public.notifications add column if not exists updated_at timestamptz not null default now();

alter table public.favorites add column if not exists seed_tag text;
alter table public.favorites add column if not exists seed_key text;

alter table public.payment_config add column if not exists seed_tag text;
alter table public.payment_config add column if not exists seed_key text;
alter table public.payment_config add column if not exists created_at timestamptz not null default now();
alter table public.payment_config add column if not exists updated_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_created_at_idx on public.profiles(created_at desc);
create index if not exists categories_active_sort_idx on public.categories(active, sort_order, name);
create index if not exists foods_category_idx on public.foods(category);
create index if not exists foods_available_idx on public.foods(available);
create index if not exists foods_orders_idx on public.foods(orders desc);
create index if not exists cart_items_user_idx on public.cart_items(user_id, created_at);
create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_idx on public.orders(status, created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists payments_user_created_idx on public.payments(user_id, created_at desc);
create index if not exists payments_status_idx on public.payments(status, created_at desc);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists favorites_user_idx on public.favorites(user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Trusted role helpers
-- ---------------------------------------------------------------------------

create or replace function private.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role' in ('admin', 'super_admin'),
    false
  );
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to anon, authenticated, service_role;
grant execute on function private.is_admin() to anon, authenticated, service_role;

create or replace function public.resolve_login_email(login_username text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.email
  from public.profiles p
  where lower(p.username) = lower(btrim(login_username))
  limit 1;
$$;

revoke all on function public.resolve_login_email(text) from public;
grant execute on function public.resolve_login_email(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Data API grants
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;
grant select on public.categories, public.foods, public.payment_config to anon, authenticated;
grant select on public.profiles, public.cart_items, public.orders, public.order_items,
  public.payments, public.notifications, public.favorites to authenticated;
grant insert, update on public.profiles to authenticated;
grant insert, update, delete on public.categories, public.foods, public.cart_items to authenticated;
grant insert, update on public.orders, public.order_items, public.payments, public.notifications to authenticated;
grant insert, update, delete on public.favorites to authenticated;
grant all privileges on public.profiles, public.categories, public.foods, public.cart_items,
  public.orders, public.order_items, public.payments, public.notifications, public.favorites,
  public.payment_config to service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.foods enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.favorites enable row level security;
alter table public.payment_config enable row level security;

-- Remove policy names from older schema revisions so their broader rules
-- cannot be combined with the canonical policies below.
drop policy if exists "cart owner access" on public.cart_items;
drop policy if exists "categories readable" on public.categories;
drop policy if exists "foods readable" on public.foods;
drop policy if exists "order items customer insert" on public.order_items;
drop policy if exists "orders customer insert" on public.orders;
drop policy if exists "payments customer insert" on public.payments;
drop policy if exists "profiles update own" on public.profiles;

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles for select using (
  auth.uid() = id or private.is_admin()
);

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert with check (
  auth.uid() = id
);

drop policy if exists "profiles update own or admin" on public.profiles;
create policy "profiles update own or admin" on public.profiles for update using (
  auth.uid() = id or private.is_admin()
) with check (
  auth.uid() = id or private.is_admin()
);

drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select using (coalesce(active, true) or private.is_admin());

drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories for all using (
  private.is_admin()
) with check (
  private.is_admin()
);

drop policy if exists "foods public read" on public.foods;
create policy "foods public read" on public.foods for select using (true);

drop policy if exists "foods admin write" on public.foods;
create policy "foods admin write" on public.foods for all using (
  private.is_admin()
) with check (
  private.is_admin()
);

drop policy if exists "cart items owner read" on public.cart_items;
create policy "cart items owner read" on public.cart_items for select using (auth.uid() = user_id);

drop policy if exists "cart items owner insert" on public.cart_items;
create policy "cart items owner insert" on public.cart_items for insert with check (auth.uid() = user_id);

drop policy if exists "cart items owner update" on public.cart_items;
create policy "cart items owner update" on public.cart_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "cart items owner delete" on public.cart_items;
create policy "cart items owner delete" on public.cart_items for delete using (auth.uid() = user_id);

drop policy if exists "orders read owner or admin" on public.orders;
create policy "orders read owner or admin" on public.orders for select using (
  auth.uid() = user_id or private.is_admin()
);

drop policy if exists "orders owner insert" on public.orders;
create policy "orders owner insert" on public.orders for insert with check (auth.uid() = user_id);

drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update" on public.orders for update using (
  private.is_admin()
) with check (
  private.is_admin()
);

drop policy if exists "order items read via order" on public.order_items;
create policy "order items read via order" on public.order_items for select using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and (o.user_id = auth.uid() or private.is_admin())
  )
);

drop policy if exists "order items owner insert" on public.order_items;
create policy "order items owner insert" on public.order_items for insert with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id and o.user_id = auth.uid()
  )
);

drop policy if exists "order items admin update" on public.order_items;
create policy "order items admin update" on public.order_items for update using (
  private.is_admin()
) with check (
  private.is_admin()
);

drop policy if exists "payments read owner or admin" on public.payments;
create policy "payments read owner or admin" on public.payments for select using (
  auth.uid() = user_id or private.is_admin()
);

drop policy if exists "payments owner insert" on public.payments;
create policy "payments owner insert" on public.payments for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.orders o
    where o.id = payments.order_id and o.user_id = auth.uid()
  )
);

drop policy if exists "payments admin update" on public.payments;
create policy "payments admin update" on public.payments for update using (
  private.is_admin()
) with check (
  private.is_admin()
);

drop policy if exists "notifications read owner all or admin" on public.notifications;
create policy "notifications read owner all or admin" on public.notifications for select using (
  user_id = 'all' or user_id = auth.uid()::text or private.is_admin()
);

drop policy if exists "notifications owner update read" on public.notifications;
create policy "notifications owner update read" on public.notifications for update using (
  user_id = auth.uid()::text or private.is_admin()
) with check (
  user_id = auth.uid()::text or private.is_admin()
);

drop policy if exists "notifications admin insert" on public.notifications;
create policy "notifications admin insert" on public.notifications for insert with check (
  private.is_admin()
);

drop policy if exists "favorites owner read" on public.favorites;
create policy "favorites owner read" on public.favorites for select using (auth.uid() = user_id);

drop policy if exists "favorites owner insert" on public.favorites;
create policy "favorites owner insert" on public.favorites for insert with check (auth.uid() = user_id);

drop policy if exists "favorites owner delete" on public.favorites;
create policy "favorites owner delete" on public.favorites for delete using (auth.uid() = user_id);

drop policy if exists "payment config public read" on public.payment_config;
create policy "payment config public read" on public.payment_config for select using (true);

drop policy if exists "payment config admin write" on public.payment_config;
create policy "payment config admin write" on public.payment_config for all using (
  private.is_admin()
) with check (
  private.is_admin()
);

-- ---------------------------------------------------------------------------
-- Storage policies
-- ---------------------------------------------------------------------------

drop policy if exists "category images admin write" on storage.objects;
create policy "category images admin write" on storage.objects for all using (
  bucket_id = 'category-images' and private.is_admin()
) with check (
  bucket_id = 'category-images' and private.is_admin()
);

drop policy if exists "food images admin write" on storage.objects;
create policy "food images admin write" on storage.objects for all using (
  bucket_id = 'food-images' and private.is_admin()
) with check (
  bucket_id = 'food-images' and private.is_admin()
);

drop policy if exists "avatar owner write" on storage.objects;
create policy "avatar owner write" on storage.objects for all using (
  bucket_id = 'avatars'
  and (name like (auth.uid()::text || '/%') or private.is_admin())
) with check (
  bucket_id = 'avatars'
  and (name like (auth.uid()::text || '/%') or private.is_admin())
);

commit;
