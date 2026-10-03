-- Category descriptions (October 2026): a short line shown under a category's
-- title on the site, so names can stay short. Safe to run more than once.

alter table public.categories add column if not exists description text not null default '';
