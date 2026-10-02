-- Pricing v2 (October 2026): splits pricing into "packages" and "singles",
-- groups items under headings, and replaces the starter price list with
-- Zack Production's real one. Safe to run more than once.
-- Run in Supabase → SQL Editor. (Also included at the end of schema.sql.)

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
