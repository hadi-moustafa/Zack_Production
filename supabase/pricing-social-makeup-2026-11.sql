-- Pricing (November 2026): a short description line for price-list rows, and
-- two new package groups — Social Media Management (Silver / Gold cards) and
-- Professional Makeup Shoot (price list). Safe to run more than once: each
-- group is only inserted if it isn't there yet, so admin edits are kept.

alter table public.pricing_packages add column if not exists description text not null default '';

insert into public.pricing_packages (section, group_name, name, price, features, highlighted, sort_order)
select v.section, v.group_name, v.name, v.price, v.features::jsonb, v.highlighted, v.sort_order
from (values
  ('packages', 'Social Media Management', 'Silver', '$600',
    '["Full page management", "Account security and protection", "Ad boosting (ad budget paid by the client)", "Page colour palette and styling", "Production: 5 edited reels", "Graphic design: 10 posts"]',
    false, 510),
  ('packages', 'Social Media Management', 'Gold', '$900',
    '["Full page management", "Account security and protection", "Post boosting", "Page colour palette and styling", "Production: 8 edited reels", "Graphic design: 15 posts", "Regular client check-ups"]',
    true, 520)
) as v(section, group_name, name, price, features, highlighted, sort_order)
where not exists (select 1 from public.pricing_packages where group_name = 'Social Media Management');

insert into public.pricing_packages (section, group_name, name, description, price, features, sort_order)
select 'packages', 'Professional Makeup Shoot', v.name, v.description, v.price, '[]'::jsonb, v.sort_order
from (values
  ('Shoot package', '6 teaser videos + 8 photos', '$500', 610),
  ('Drone footage', 'FPV drone shots', '$350', 620),
  ('Makeup session', '$25 per photo', '$25 / photo', 630),
  ('Fashion session', '15 outfits', '$300', 640),
  ('Bridal session', '10 wedding dresses', '$300', 650),
  ('Reel video', 'Edited short-form video', '$200', 660),
  ('Cinematic reel', 'Premium cinematic production', '$500', 670)
) as v(name, description, price, sort_order)
where not exists (select 1 from public.pricing_packages where group_name = 'Professional Makeup Shoot');
