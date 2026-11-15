-- Practice Lab: per-device progress rows for signed-in users.
-- Paste this whole file into Supabase → SQL Editor → New query → Run (once).

create table if not exists public.progress (
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  device_id  text not null,
  state      text not null,            -- the device's progress as JSON (merged client-side)
  updated_at timestamptz not null default now(),
  primary key (user_id, device_id)
);

-- each user sees and writes only their own rows
alter table public.progress enable row level security;

drop policy if exists "read own progress" on public.progress;
create policy "read own progress" on public.progress
  for select using (auth.uid() = user_id);

drop policy if exists "insert own progress" on public.progress;
create policy "insert own progress" on public.progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own progress" on public.progress;
create policy "update own progress" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own progress" on public.progress;
create policy "delete own progress" on public.progress
  for delete using (auth.uid() = user_id);

-- No Realtime for progress: every change used to send the whole row (up to 140 KB) to each open tab,
-- and each tab then downloaded every row again (7 GB of egress on 15 Nov 2026). Clients now fetch
-- on start, on return to the tab and every few minutes, asking only for rows changed since last time.
do $$
begin
  if exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'progress') then
    alter publication supabase_realtime drop table public.progress;
  end if;
end $$;

-- the server stamps updated_at, so "changed since" never depends on a device's clock
create or replace function public.progress_touch() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists progress_touch on public.progress;
create trigger progress_touch before insert or update on public.progress
  for each row execute function public.progress_touch();
