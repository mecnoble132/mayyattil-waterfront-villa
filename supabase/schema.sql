-- Mayyattil Waterfront Villa — availability storage.
-- Run once in Supabase Dashboard > SQL Editor.
-- A row = one occupied NIGHT (the check-out day itself stays free for a new check-in).

create table if not exists public.blocked_dates (
  date date primary key,
  note text,
  created_at timestamptz not null default now()
);

alter table public.blocked_dates enable row level security;

-- Everyone (website visitors) may read which dates are blocked.
drop policy if exists "public read blocked dates" on public.blocked_dates;
create policy "public read blocked dates"
  on public.blocked_dates for select
  to anon, authenticated
  using (true);

-- Only the logged-in owner may change them.
drop policy if exists "owner insert blocked dates" on public.blocked_dates;
create policy "owner insert blocked dates"
  on public.blocked_dates for insert
  to authenticated
  with check (true);

drop policy if exists "owner update blocked dates" on public.blocked_dates;
create policy "owner update blocked dates"
  on public.blocked_dates for update
  to authenticated
  using (true) with check (true);

drop policy if exists "owner delete blocked dates" on public.blocked_dates;
create policy "owner delete blocked dates"
  on public.blocked_dates for delete
  to authenticated
  using (true);

-- Live updates on open guest pages.
alter publication supabase_realtime add table public.blocked_dates;
