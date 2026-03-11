drop policy if exists "authenticated users can delete contacts" on public.contacts;

create policy "users can delete own contacts"
on public.contacts
for delete
using (auth.uid() = created_by);
