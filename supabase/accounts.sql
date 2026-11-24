-- Practice Lab: BUET CE accounts, admin / user roles, Threads and their file uploads.
-- Run once after schema.sql: Supabase → SQL Editor → New query → paste this whole file → Run.
-- Safe to run again (it only adds what is missing and replaces the functions and rules).

-- ────────────────────────────────────────────────────────────── who may sign up
-- Only institutional mail: 7-digit student ID @ce.buet.ac.bd (e.g. 2204080@ce.buet.ac.bd).
create or replace function public.is_buet_ce_email(e text)
returns boolean language sql immutable as $$
  select coalesce(lower(e) ~ '^[0-9]{7}@ce\.buet\.ac\.bd$', false)
$$;

-- refuses any new account that is not a BUET CE mail (the sign-in email is never sent to it)
create or replace function public.check_new_user_email()
returns trigger language plpgsql as $$
begin
  if not public.is_buet_ce_email(new.email) then
    raise exception 'Only studentID@ce.buet.ac.bd accounts can sign up';
  end if;
  return new;
end $$;

drop trigger if exists check_buet_email on auth.users;
create trigger check_buet_email before insert on auth.users
  for each row execute function public.check_new_user_email();

-- ────────────────────────────────────────────────────────────── profiles
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null unique,
  student_id   text generated always as (split_part(email, '@', 1)) stored,
  display_name text check (char_length(display_name) <= 60),
  created_at   timestamptz not null default now(),
  last_seen    timestamptz
);
alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, lower(new.email)) on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- people who signed in before this file was run
insert into public.profiles (id, email, created_at)
  select id, lower(email), created_at from auth.users where email is not null
  on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────── roles
-- Admins are kept by email, so an admin can promote someone before their first sign-in.
create table if not exists public.admins (
  email    text primary key check (email = lower(email)),
  added_by text,
  added_at timestamptz not null default now()
);
alter table public.admins enable row level security;

insert into public.admins (email, added_by) values
  ('2204080@ce.buet.ac.bd', 'setup'),
  ('2204038@ce.buet.ac.bd', 'setup')
on conflict (email) do nothing;

-- the signed-in user's email, read from auth (never from anything the browser sends)
create or replace function public.my_email()
returns text language sql stable security definer set search_path = public, auth as $$
  select lower(email) from auth.users where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where email = public.my_email())
$$;

drop policy if exists "admins see admins, users see their own role" on public.admins;
create policy "admins see admins, users see their own role" on public.admins
  for select using (public.is_admin() or email = public.my_email());
-- no insert/delete policies: changes go through add_admin / remove_admin below

drop policy if exists "read own profile, admins read all" on public.profiles;
create policy "read own profile, admins read all" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
-- only the display name can be changed from the browser
revoke update on public.profiles from anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

-- called by the app after sign-in: makes sure the profile exists and stamps last_seen
create or replace function public.touch_profile()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  insert into public.profiles (id, email, last_seen) values (auth.uid(), public.my_email(), now())
  on conflict (id) do update set last_seen = now();
end $$;

create or replace function public.add_admin(target text)
returns void language plpgsql security definer set search_path = public as $$
declare t text := lower(trim(target));
begin
  if not public.is_admin() then raise exception 'Only admins can add admins'; end if;
  if t ~ '^[0-9]{7}$' then t := t || '@ce.buet.ac.bd'; end if;
  if not public.is_buet_ce_email(t) then raise exception 'Not a studentID@ce.buet.ac.bd address'; end if;
  insert into public.admins (email, added_by) values (t, public.my_email()) on conflict (email) do nothing;
end $$;

create or replace function public.remove_admin(target text)
returns void language plpgsql security definer set search_path = public as $$
declare t text := lower(trim(target));
begin
  if not public.is_admin() then raise exception 'Only admins can remove admins'; end if;
  if t ~ '^[0-9]{7}$' then t := t || '@ce.buet.ac.bd'; end if;
  if t = public.my_email() then raise exception 'You cannot remove your own admin role'; end if;
  delete from public.admins where email = t;
end $$;

-- admins: everyone who has signed in, with their role
create or replace function public.list_members()
returns table (email text, student_id text, display_name text, created_at timestamptz, last_seen timestamptz, is_admin boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Only admins can list members'; end if;
  return query
    select p.email, p.student_id, p.display_name, p.created_at, p.last_seen, (a.email is not null)
    from public.profiles p left join public.admins a on a.email = p.email
    order by p.last_seen desc nulls last;
end $$;

revoke execute on function public.add_admin(text), public.remove_admin(text), public.list_members(), public.touch_profile() from anon;

-- ────────────────────────────────────────────────────────────── threads
-- A thread belongs to one course ('all' = shown in every course) and can be tagged with topics
-- (topic ids such as 'pc-law' or 'ild'); tagged threads also show on those topics' pages.
-- Anyone can read; only admins write.
create table if not exists public.threads (
  id          uuid primary key default gen_random_uuid(),
  course      text not null check (course in ('all', 'ce311', 'ce315', 'ce341', 'ce301', 'ce331', 'ce104')),
  title       text not null check (char_length(title) between 1 and 200),
  pinned      boolean not null default false,
  topics      text[] not null default '{}' check (cardinality(topics) <= 60),
  author_id   uuid references auth.users (id) on delete set null,
  author_name text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
-- added after the first version of this file
alter table public.threads add column if not exists topics text[] not null default '{}';
-- CE 331 added 17 Nov 2026: widen the course check on an existing table (re-runnable)
alter table public.threads drop constraint if exists threads_course_check;
alter table public.threads add constraint threads_course_check check (course in ('all', 'ce311', 'ce315', 'ce341', 'ce301', 'ce331', 'ce104'));

create table if not exists public.thread_posts (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references public.threads (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 100000),
  author_id   uuid references auth.users (id) on delete set null,
  author_name text,
  created_at  timestamptz not null default now(),
  edited_at   timestamptz
);
create index if not exists thread_posts_thread on public.thread_posts (thread_id, created_at);

alter table public.threads enable row level security;
alter table public.thread_posts enable row level security;

-- the author is stamped from the session, not from what the browser sends
create or replace function public.stamp_author()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.author_id := auth.uid();
    new.author_name := coalesce(
      (select nullif(trim(display_name), '') from public.profiles where id = auth.uid()),
      split_part(public.my_email(), '@', 1));
    new.created_at := now();
    if tg_table_name = 'threads' then new.updated_at := now(); end if;
  else
    new.author_id := old.author_id;
    new.author_name := old.author_name;
    new.created_at := old.created_at;
    if tg_table_name = 'thread_posts' then
      if new.body is distinct from old.body then new.edited_at := now(); end if;
      new.thread_id := old.thread_id;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists stamp_thread on public.threads;
create trigger stamp_thread before insert or update on public.threads
  for each row execute function public.stamp_author();
drop trigger if exists stamp_post on public.thread_posts;
create trigger stamp_post before insert or update on public.thread_posts
  for each row execute function public.stamp_author();

-- a new post moves its thread to the top of "latest activity"
create or replace function public.bump_thread()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.threads set updated_at = now() where id = new.thread_id;
  return new;
end $$;
drop trigger if exists bump_thread on public.thread_posts;
create trigger bump_thread after insert on public.thread_posts
  for each row execute function public.bump_thread();

drop policy if exists "anyone reads threads" on public.threads;
create policy "anyone reads threads" on public.threads for select using (true);
drop policy if exists "admins write threads" on public.threads;
create policy "admins write threads" on public.threads for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "anyone reads posts" on public.thread_posts;
create policy "anyone reads posts" on public.thread_posts for select using (true);
drop policy if exists "admins write posts" on public.thread_posts;
create policy "admins write posts" on public.thread_posts for all
  using (public.is_admin()) with check (public.is_admin());

-- live updates: a new post shows up without a reload
do $$
begin
  alter publication supabase_realtime add table public.threads;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.thread_posts;
exception when duplicate_object then null;
end $$;

-- ────────────────────────────────────────────────────────────── files attached to posts
-- Public bucket (anyone with the link can download); only admins upload or delete. 25 MB per file.
insert into storage.buckets (id, name, public, file_size_limit)
  values ('thread-files', 'thread-files', true, 26214400)
  on conflict (id) do update set public = true, file_size_limit = 26214400;

drop policy if exists "admins upload thread files" on storage.objects;
create policy "admins upload thread files" on storage.objects for insert to authenticated
  with check (bucket_id = 'thread-files' and public.is_admin());
drop policy if exists "admins change thread files" on storage.objects;
create policy "admins change thread files" on storage.objects for update to authenticated
  using (bucket_id = 'thread-files' and public.is_admin());
drop policy if exists "admins delete thread files" on storage.objects;
create policy "admins delete thread files" on storage.objects for delete to authenticated
  using (bucket_id = 'thread-files' and public.is_admin());
