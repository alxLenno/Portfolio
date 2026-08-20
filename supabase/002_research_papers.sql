-- Run this in the Supabase SQL editor to add the research papers table.
-- (If you're setting up a fresh project instead, just run schema.sql —
-- it already includes this.)

create table if not exists public.research_papers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  venue text not null,
  status text not null default 'Presented',
  date_label text,
  authors text,
  abstract text,
  paper_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.research_papers enable row level security;

drop policy if exists "Public can read research papers" on public.research_papers;
create policy "Public can read research papers"
  on public.research_papers for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can insert research papers" on public.research_papers;
create policy "Authenticated can insert research papers"
  on public.research_papers for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update research papers" on public.research_papers;
create policy "Authenticated can update research papers"
  on public.research_papers for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete research papers" on public.research_papers;
create policy "Authenticated can delete research papers"
  on public.research_papers for delete
  to authenticated
  using (true);
