-- Run this in the Supabase SQL editor to add an abstract field to research
-- papers and clarify that the link points at the paper itself (the
-- certificate already has its own entry in the Certifications list).

alter table public.research_papers rename column url to paper_url;
alter table public.research_papers add column if not exists abstract text;
