-- Run this in the Supabase SQL editor to add an authors field to research papers.

alter table public.research_papers add column if not exists authors text;
