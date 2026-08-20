-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Sets up the projects table, row-level security, and the storage bucket
-- used for project screenshots/videos uploaded from the admin page.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  tech text[] not null default '{}',
  live_url text,
  github_url text,
  image_url text,
  video_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects"
  on public.projects for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can insert projects" on public.projects;
create policy "Authenticated can insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update projects" on public.projects;
create policy "Authenticated can update projects"
  on public.projects for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete projects" on public.projects;
create policy "Authenticated can delete projects"
  on public.projects for delete
  to authenticated
  using (true);

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

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  authors text,
  status text not null default 'Published',
  year_label text,
  cover_url text,
  link text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.books enable row level security;

drop policy if exists "Public can read books" on public.books;
create policy "Public can read books"
  on public.books for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can insert books" on public.books;
create policy "Authenticated can insert books"
  on public.books for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update books" on public.books;
create policy "Authenticated can update books"
  on public.books for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete books" on public.books;
create policy "Authenticated can delete books"
  on public.books for delete
  to authenticated
  using (true);

-- Storage bucket for screenshots/videos uploaded from the admin page.
-- Also used for research paper PDFs (papers/ prefix) and book covers
-- (books/ prefix) — the policies below already cover the whole bucket
-- regardless of folder.
insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', true)
on conflict (id) do nothing;

drop policy if exists "Public can view project media" on storage.objects;
create policy "Public can view project media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-media');

drop policy if exists "Authenticated can upload project media" on storage.objects;
create policy "Authenticated can upload project media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-media');

drop policy if exists "Authenticated can update project media" on storage.objects;
create policy "Authenticated can update project media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-media');

drop policy if exists "Authenticated can delete project media" on storage.objects;
create policy "Authenticated can delete project media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-media');
