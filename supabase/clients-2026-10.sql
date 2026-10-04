-- Clients (October 2026): brands and well-known people Zack Production has
-- worked with, shown by the Headliner design and managed in Admin → Clients.
-- Images live in the existing public "photos" bucket under clients/.
-- Safe to run more than once.

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'brand' check (kind in ('brand', 'person')),
  role text not null default '',
  image_path text,
  logo_mono boolean not null default true,
  url text not null default '',
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;

drop policy if exists "Public read clients" on public.clients;
create policy "Public read clients" on public.clients
  for select using (true);

drop policy if exists "Admin write clients" on public.clients;
create policy "Admin write clients" on public.clients
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
