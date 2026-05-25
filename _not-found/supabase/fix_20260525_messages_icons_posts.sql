alter table public.entrepreneur_profiles
  add column if not exists avatar_url text;

alter table public.investor_profiles
  add column if not exists avatar_url text;

insert into storage.buckets (id, name, public)
values ('profile-icons', 'profile-icons', true)
on conflict (id) do nothing;

drop policy if exists "contact admin read" on public.contact_inquiries;
create policy "contact admin read" on public.contact_inquiries
for select
using (public.is_admin() or user_id = auth.uid());

drop policy if exists "profile icons owner upload" on storage.objects;
create policy "profile icons owner upload" on storage.objects
for insert
with check (bucket_id = 'profile-icons' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "profile icons public read" on storage.objects;
create policy "profile icons public read" on storage.objects
for select
using (bucket_id = 'profile-icons');

drop policy if exists "profile icons owner update" on storage.objects;
create policy "profile icons owner update" on storage.objects
for update
using (bucket_id = 'profile-icons' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'profile-icons' and auth.uid()::text = (storage.foldername(name))[1]);
