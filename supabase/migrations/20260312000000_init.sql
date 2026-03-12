create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create type if not exists public.project_status as enum ('Idea', 'Building', 'Launched');

create table if not exists public.profiles (
  id uuid primary key,
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status public.project_status not null default 'Idea',
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  owner_id uuid references public.profiles (id) on delete set null,
  owner_name text,
  is_demo boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  event text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_updates enable row level security;

create policy "profiles select authenticated"
on public.profiles
for select
to authenticated
using (true);

create policy "profiles upsert own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "projects select authenticated"
on public.projects
for select
to authenticated
using (auth.uid() is not null);

create policy "projects insert from auth"
on public.projects
for insert
to authenticated
with check (auth.uid() is not null);

create policy "projects update own"
on public.projects
for update
to authenticated
using (owner_id = auth.uid() or is_demo)
with check (owner_id = auth.uid() or is_demo);

create policy "updates select authenticated"
on public.project_updates
for select
to authenticated
using (auth.uid() is not null);

create policy "updates insert from auth"
on public.project_updates
for insert
to authenticated
with check (auth.uid() is not null);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Guest'))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
