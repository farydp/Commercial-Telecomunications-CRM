create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  phone text,
  email text,
  company text,
  role text,
  city text,
  instagram text,
  linkedin text,
  interest text,
  status text default 'nuevo',
  source text,
  raw_capture text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_updates (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  note text not null,
  interaction_type text,
  next_action text,
  due_date date,
  completed boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.success_cases (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.contacts(id) on delete set null,
  title text not null,
  summary text,
  outcome text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists contacts_status_idx on public.contacts(status);
create index if not exists contacts_phone_idx on public.contacts(phone);
create index if not exists contacts_created_at_idx on public.contacts(created_at desc);
create index if not exists contact_updates_contact_id_idx on public.contact_updates(contact_id, created_at desc);
create index if not exists contact_updates_due_date_idx on public.contact_updates(due_date) where completed = false;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    coalesce(new.email, concat(new.id::text, '@local')),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'usuario'), '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'user')
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = excluded.display_name,
        role = excluded.role;

  return new;
end;
$$;

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
before update on public.contacts
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.contact_updates enable row level security;
alter table public.success_cases enable row level security;

create policy "authenticated users can read profiles"
on public.profiles
for select
using (auth.role() = 'authenticated');

create policy "authenticated users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "authenticated users can read contacts"
on public.contacts
for select
using (auth.role() = 'authenticated');

create policy "authenticated users can insert contacts"
on public.contacts
for insert
with check (auth.uid() = created_by);

create policy "authenticated users can update contacts"
on public.contacts
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "authenticated users can read contact updates"
on public.contact_updates
for select
using (auth.role() = 'authenticated');

create policy "authenticated users can insert contact updates"
on public.contact_updates
for insert
with check (auth.uid() = created_by);

create policy "authenticated users can update contact updates"
on public.contact_updates
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "authenticated users can read success cases"
on public.success_cases
for select
using (auth.role() = 'authenticated');

create policy "admins can manage success cases"
on public.success_cases
for all
using (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin')
with check (coalesce((select role from public.profiles where id = auth.uid()), 'user') = 'admin');

