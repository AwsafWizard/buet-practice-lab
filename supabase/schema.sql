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

-- live updates from a user's other devices
do $$
begin
  alter publication supabase_realtime add table public.progress;
exception when duplicate_object then null;
end $$;
