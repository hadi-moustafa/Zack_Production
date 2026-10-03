-- Video preview images (October 2026): each video can have a still frame
-- ("poster") shown in the gallery, so the video itself only downloads when a
-- visitor taps play. Safe to run more than once.
-- Run in Supabase → SQL Editor. (Also included at the end of schema.sql.)

alter table public.photos add column if not exists poster_path text;
