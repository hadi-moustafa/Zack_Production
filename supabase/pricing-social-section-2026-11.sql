-- Social Media section (November 2026): social media management packages move
-- out of Packages & Pricing into a section of their own. Adds 'social' as a
-- pricing part and moves the Social Media Management group there. Safe to run
-- more than once.

alter table public.pricing_packages drop constraint if exists pricing_packages_section_check;
alter table public.pricing_packages
  add constraint pricing_packages_section_check check (section in ('packages', 'singles', 'social'));

update public.pricing_packages set section = 'social'
where group_name = 'Social Media Management' and section <> 'social';
