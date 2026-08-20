-- Run this in the Supabase SQL editor to add the published books table.

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

-- Uses the same project-media storage bucket (already created by schema.sql)
-- for cover images, under a books/ prefix.
