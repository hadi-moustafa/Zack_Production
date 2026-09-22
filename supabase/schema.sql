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

-- Messages submitted through the public contact form
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

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
  ('footer_tagline', 'Capturing real moments, one frame at a time.')
on conflict (key) do nothing;

insert into public.social_links (platform, url) values
  ('instagram', ''),
  ('facebook', ''),
  ('tiktok', ''),
  ('whatsapp', ''),
  ('youtube', ''),
  ('twitter', '')
on conflict (platform) do nothing;

-- Seed a starter set of pricing packages only if none exist yet, so a fresh
-- project has something to show without blocking on admin data entry.
insert into public.pricing_packages (name, price, features, sort_order)
select * from (values
  ('Basic', '$250', '["1 hour session", "20 edited photos", "Online gallery"]'::jsonb, 0),
  ('Standard', '$450', '["2 hour session", "50 edited photos", "Online gallery", "Print release"]'::jsonb, 1),
  ('Premium', '$750', '["4 hour session", "100 edited photos", "Online gallery", "Print release", "Second shooter"]'::jsonb, 2),
  ('Custom', '', '["Events", "Weddings", "Commercial", "Real Estate"]'::jsonb, 3)
) as seed(name, price, features, sort_order)
where not exists (select 1 from public.pricing_packages);

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
