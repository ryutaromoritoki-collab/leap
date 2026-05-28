alter table public.progress_posts
  add column if not exists attachment_url text,
  add column if not exists attachment_name text,
  add column if not exists attachment_type text;

alter table public.messages
  add column if not exists attachment_url text,
  add column if not exists attachment_name text,
  add column if not exists attachment_type text;

insert into storage.buckets (id, name, public)
values ('post-attachments', 'post-attachments', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('message-attachments', 'message-attachments', true)
on conflict (id) do nothing;

drop policy if exists "post attachments owner upload" on storage.objects;
create policy "post attachments owner upload" on storage.objects
for insert
with check (bucket_id = 'post-attachments' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "post attachments public read" on storage.objects;
create policy "post attachments public read" on storage.objects
for select
using (bucket_id = 'post-attachments');

drop policy if exists "message attachments owner upload" on storage.objects;
create policy "message attachments owner upload" on storage.objects
for insert
with check (bucket_id = 'message-attachments' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "message attachments participants read" on storage.objects;
create policy "message attachments participants read" on storage.objects
for select
using (bucket_id = 'message-attachments');
