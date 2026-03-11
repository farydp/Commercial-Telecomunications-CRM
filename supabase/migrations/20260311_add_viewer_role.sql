alter table public.profiles drop constraint if exists profiles_role_check;

update public.profiles
set role = 'viewer'
where role = 'user';

alter table public.profiles
alter column role set default 'viewer';

alter table public.profiles
add constraint profiles_role_check check (role in ('admin', 'viewer'));

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
    coalesce(new.raw_user_meta_data ->> 'role', 'viewer')
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = excluded.display_name,
        role = excluded.role;

  return new;
end;
$$;

drop policy if exists "authenticated users can insert contacts" on public.contacts;
drop policy if exists "authenticated users can update contacts" on public.contacts;
drop policy if exists "authenticated users can delete contacts" on public.contacts;
drop policy if exists "users can delete own contacts" on public.contacts;
drop policy if exists "authenticated users can insert contact updates" on public.contact_updates;
drop policy if exists "authenticated users can update contact updates" on public.contact_updates;

create policy "admins can insert contacts"
on public.contacts
for insert
with check (coalesce((select role from public.profiles where id = auth.uid()), 'viewer') = 'admin');

create policy "admins can update contacts"
on public.contacts
for update
using (coalesce((select role from public.profiles where id = auth.uid()), 'viewer') = 'admin')
with check (coalesce((select role from public.profiles where id = auth.uid()), 'viewer') = 'admin');

create policy "admins can delete contacts"
on public.contacts
for delete
using (coalesce((select role from public.profiles where id = auth.uid()), 'viewer') = 'admin');

create policy "admins can insert contact updates"
on public.contact_updates
for insert
with check (coalesce((select role from public.profiles where id = auth.uid()), 'viewer') = 'admin');

create policy "admins can update contact updates"
on public.contact_updates
for update
using (coalesce((select role from public.profiles where id = auth.uid()), 'viewer') = 'admin')
with check (coalesce((select role from public.profiles where id = auth.uid()), 'viewer') = 'admin');
