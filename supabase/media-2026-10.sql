-- Media library v2 (October 2026). Safe to run more than once.
--   * categories become a managed table (rename/reorder/hide/cover/kind)
--   * photos/videos link to a category by id; items with no category are
--     "site images" (hero/about/contact pictures) and never show in the gallery
--   * each item stores its real width/height and a tiny blur placeholder so the
--     gallery can lay it out at its true shape without jumping while it loads
--   * `featured` (★) puts an item first in "All"

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  kind text not null default 'both' check (kind in ('photo', 'video', 'both')),
  cover_path text,
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories" on public.categories
  for select using (true);

drop policy if exists "Admin write categories" on public.categories;
create policy "Admin write categories" on public.categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter table public.photos add column if not exists category_id uuid references public.categories(id) on delete set null;
alter table public.photos add column if not exists width integer;
alter table public.photos add column if not exists height integer;
alter table public.photos add column if not exists blur_data text;
alter table public.photos add column if not exists featured boolean not null default false;
alter table public.photos add column if not exists poster_path text;

create index if not exists photos_category_id_idx on public.photos (category_id);

-- One-time move from free-text categories: create a category for each name in
-- use (except the site-image buckets "Featured" and "I am Zack") and link items.
insert into public.categories (name, slug, sort_order)
select name,
       trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')),
       coalesce(array_position(array['Weddings', 'Graduations', 'Food', 'Promotions'], name), 50) * 10
from (select distinct trim(category) as name from public.photos) c
where name <> '' and name not in ('Featured', 'I am Zack', 'Uncategorized')
on conflict (name) do nothing;

update public.photos p
set category_id = c.id
from public.categories c
where p.category_id is null and trim(p.category) = c.name;
