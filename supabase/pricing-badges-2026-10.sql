-- Pricing badges (October 2026): an optional label on a price item (e.g.
-- "Recommended", "Up to 20% off") and a highlight flag that gives its card a
-- gold border. Safe to run more than once.

alter table public.pricing_packages add column if not exists badge text not null default '';
alter table public.pricing_packages add column if not exists highlighted boolean not null default false;
