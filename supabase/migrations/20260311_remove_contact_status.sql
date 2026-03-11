alter table public.contacts drop column if exists status;
drop index if exists public.contacts_status_idx;
