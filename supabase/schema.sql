-- Photographer one-page site — Supabase schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`) after creating the project.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Photos (and videos) in the portfolio/gallery
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  category text not null default 'Uncategorized',
  caption text not null default '',
  sort_order integer not null default 0,
  media_type text not null default 'photo', -- 'photo' | 'video'
  created_at timestamptz not null default now()
);

-- Adds the column for projects created before video support existed.
alter table public.photos add column if not exists media_type text not null default 'photo';

-- Pricing packages shown in the Pricing section
create table if not exists public.pricing_packages (
  id uuid primary key default gen_random_uuid(),
  section text not null default 'packages', -- 'packages' | 'singles'
  group_name text not null default '',       -- heading, e.g. 'Wedding Packages'
  name text not null,
  price text not null,
  features jsonb not null default '[]'::jsonb, -- array of strings
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Simple key/value store for editable page copy (hero tagline, about bio, etc.)
create table if not exists public.page_content (
  key text primary key,
  value text not null default ''
);

-- Social media links
create table if not exists public.social_links (
  platform text primary key, -- e.g. 'instagram', 'facebook'
  url text not null default ''
);

-- Messages submitted through the public contact form. Phone is required and
-- email is optional at the application layer (not enforced here, so this
-- migration is safe to run even with pre-existing rows).
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

-- Relaxes email for projects created before it became optional.
alter table public.contact_submissions alter column email drop not null;

-- ---------------------------------------------------------------------------
-- Seed default content rows so the site has something to render immediately
-- ---------------------------------------------------------------------------
insert into public.page_content (key, value) values
  ('photographer_name', 'Zack'),
  ('brand_subtitle', 'PRODUCTION'),
  ('location_text', 'City, Country'),
  ('hero_headline', 'Real Moments'),
  ('hero_tagline', 'Capturing moments that last a lifetime'),
  ('hero_script_tagline', 'Every frame tells a story'),
  ('capability_words', 'Photos · Videos · Stories'),
  ('signature_credit', '— Zack'),
  ('about_bio', 'Write a short bio about the photographer here. Edit this from the admin dashboard.'),
  ('about_photo_caption', 'Behind the lens'),
  ('pricing_description', 'Choose the package that fits your needs, or get in touch for something custom.'),
  ('contact_description', 'Have a project in mind? Reach out and let''s talk.'),
  ('contact_phone', ''),
  ('hero_photo_path', ''),
  ('about_photo_path', ''),
  ('contact_photo_path', ''),
  ('footer_email', 'contact@example.com'),
  ('footer_tagline', 'We Entertain People.')
on conflict (key) do nothing;

insert into public.social_links (platform, url) values
  ('instagram', ''),
  ('facebook', ''),
  ('tiktok', ''),
  ('whatsapp', ''),
  ('youtube', ''),
  ('twitter', '')
on conflict (platform) do nothing;

-- The real price list is seeded by the pricing section at the end of this file.

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.photos enable row level security;
alter table public.pricing_packages enable row level security;
alter table public.page_content enable row level security;
alter table public.social_links enable row level security;
alter table public.contact_submissions enable row level security;

-- Public (anon + authenticated) read access on content tables
drop policy if exists "Public read photos" on public.photos;
create policy "Public read photos" on public.photos
  for select using (true);

drop policy if exists "Public read pricing" on public.pricing_packages;
create policy "Public read pricing" on public.pricing_packages
  for select using (true);

drop policy if exists "Public read content" on public.page_content;
create policy "Public read content" on public.page_content
  for select using (true);

drop policy if exists "Public read social links" on public.social_links;
create policy "Public read social links" on public.social_links
  for select using (true);

-- Only authenticated (the single admin user) may write to content tables
drop policy if exists "Admin write photos" on public.photos;
create policy "Admin write photos" on public.photos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Admin write pricing" on public.pricing_packages;
create policy "Admin write pricing" on public.pricing_packages
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Admin write content" on public.page_content;
create policy "Admin write content" on public.page_content
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Admin write social links" on public.social_links;
create policy "Admin write social links" on public.social_links
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Anyone can submit a contact message (insert only); only the admin can read/manage them
drop policy if exists "Public insert contact submissions" on public.contact_submissions;
create policy "Public insert contact submissions" on public.contact_submissions
  for insert with check (true);

drop policy if exists "Admin read contact submissions" on public.contact_submissions;
create policy "Admin read contact submissions" on public.contact_submissions
  for select using (auth.role() = 'authenticated');

drop policy if exists "Admin delete contact submissions" on public.contact_submissions;
create policy "Admin delete contact submissions" on public.contact_submissions
  for delete using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Storage: public "photos" bucket for portfolio images
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read photo files" on storage.objects;
create policy "Public read photo files" on storage.objects
  for select using (bucket_id = 'photos');

drop policy if exists "Admin upload photo files" on storage.objects;
create policy "Admin upload photo files" on storage.objects
  for insert with check (bucket_id = 'photos' and auth.role() = 'authenticated');

drop policy if exists "Admin update photo files" on storage.objects;
create policy "Admin update photo files" on storage.objects
  for update using (bucket_id = 'photos' and auth.role() = 'authenticated');

drop policy if exists "Admin delete photo files" on storage.objects;
create policy "Admin delete photo files" on storage.objects
  for delete using (bucket_id = 'photos' and auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Instagram API token for the "latest reel" spot in the Follow Along section.
-- It's a secret, so there is deliberately no public read policy: the public
-- site reads it server-side with SUPABASE_SECRET_KEY, and the admin manages
-- it from the dashboard. Single row (id = 1).
-- ---------------------------------------------------------------------------
create table if not exists public.instagram_account (
  id int primary key default 1 check (id = 1),
  access_token text not null,
  username text not null default '',
  refreshed_at timestamptz not null default now()
);

alter table public.instagram_account enable row level security;

drop policy if exists "Admin manage instagram" on public.instagram_account;
create policy "Admin manage instagram" on public.instagram_account
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Pricing v2 (October 2026): splits pricing into "packages" and "singles",
-- groups items under headings, and replaces the starter price list with
-- Zack Production's real one. Safe to run more than once.

alter table public.pricing_packages add column if not exists section text not null default 'packages';
alter table public.pricing_packages add column if not exists group_name text not null default '';

alter table public.pricing_packages drop constraint if exists pricing_packages_section_check;
alter table public.pricing_packages
  add constraint pricing_packages_section_check check (section in ('packages', 'singles'));

-- Only replace the list if it hasn't been set up yet (no grouped rows), so
-- re-running this never wipes edits made in the admin dashboard.
do $$
begin
  if not exists (select 1 from public.pricing_packages where group_name <> '') then
    delete from public.pricing_packages;

    insert into public.pricing_packages (section, group_name, name, price, features, sort_order) values
      ('packages', 'Wedding Packages', 'Silver', '',
        '["One photographer", "Two videographers (run-in)", "Movie editing + trailer"]'::jsonb, 20),
      ('packages', 'Wedding Packages', 'Gold', '',
        '["One photographer", "Two videographers (run-in)", "Flycam", "Cinematic Zack trailer cam", "Pre-wedding shoot", "Movie editing + cinematic trailer"]'::jsonb, 30),
      ('packages', 'Wedding Packages', 'Platinum', '',
        '["Two photographers", "Two videographers (run-in)", "Cinematic Zack trailer cam", "Luma", "Flycam", "Pre-wedding shoot", "Movie editing + cinematic trailer"]'::jsonb, 40),

      ('packages', 'Pre-wedding Packages', 'Cinematic trailer reel', '$200', '[]'::jsonb, 110),
      ('packages', 'Pre-wedding Packages', 'Cinematic trailer', '$400', '[]'::jsonb, 120),
      ('packages', 'Pre-wedding Packages', 'Cinematic trailer reel + flycam', '$400', '[]'::jsonb, 130),
      ('packages', 'Pre-wedding Packages', 'Cinematic trailer + flycam', '$500', '[]'::jsonb, 140),

      ('singles', 'Photography Sessions', '10 edited pictures + printout', '$150', '[]'::jsonb, 210),
      ('singles', 'Photography Sessions', '15 edited pictures + printout', '$170', '[]'::jsonb, 220),
      ('singles', 'Photography Sessions', '20 edited pictures + printout', '$220', '[]'::jsonb, 230),
      ('singles', 'Photography Sessions', '30 edited pictures + printout', '$320', '[]'::jsonb, 240),

      ('singles', 'Special Requests', 'Zaffe shooting', '$150', '[]'::jsonb, 310),
      ('singles', 'Special Requests', 'Content creator & assistance', '$200', '[]'::jsonb, 320),
      ('singles', 'Special Requests', 'Full-day request', '$300', '[]'::jsonb, 330),
      ('singles', 'Special Requests', 'Cinematic reel trailer', '$300', '[]'::jsonb, 340),
      ('singles', 'Special Requests', 'FPV flycam', '$400', '[]'::jsonb, 350),
      ('singles', 'Special Requests', 'Cinematic flycam 4K', '$500', '[]'::jsonb, 360),
      ('singles', 'Special Requests', 'Luma new 4K', '$600', '[]'::jsonb, 370),
      ('singles', 'Special Requests', 'Cable cam', '$700', '[]'::jsonb, 380),
      ('singles', 'Special Requests', 'Black Magic 6K', '$900', '[]'::jsonb, 390),

      ('singles', 'Additional Services', 'Fireworks (all kinds)', '', '[]'::jsonb, 410),
      ('singles', 'Additional Services', 'Planning & managing', '', '[]'::jsonb, 420),
      ('singles', 'Additional Services', 'Decoration (all kinds)', '', '[]'::jsonb, 430),
      ('singles', 'Additional Services', 'Dry ice', '', '[]'::jsonb, 440),
      ('singles', 'Additional Services', 'Zaffe fire show', '', '[]'::jsonb, 450),
      ('singles', 'Additional Services', 'Cake shows', '', '[]'::jsonb, 460),
      ('singles', 'Additional Services', 'Entertainment shows', '', '[]'::jsonb, 470),
      ('singles', 'Additional Services', 'Catering', '', '[]'::jsonb, 480);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Video preview images (see supabase/video-posters-2026-10.sql)
alter table public.photos add column if not exists poster_path text;

-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Category descriptions (October 2026): a short line shown under a category's
-- title on the site, so names can stay short. Safe to run more than once.

alter table public.categories add column if not exists description text not null default '';

-- ---------------------------------------------------------------------------
-- Pricing badges (October 2026): an optional label on a price item (e.g.
-- "Recommended", "Up to 20% off") and a highlight flag that gives its card a
-- gold border. Safe to run more than once.

alter table public.pricing_packages add column if not exists badge text not null default '';
alter table public.pricing_packages add column if not exists highlighted boolean not null default false;
