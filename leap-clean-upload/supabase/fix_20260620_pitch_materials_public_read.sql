-- Allow visitors and logged-in users to open pitch/business-plan files shown on public profiles.
-- Upload/update remain restricted to the owner or admin by the existing policies.

update storage.buckets
set public = true
where id = 'pitch-materials';

drop policy if exists "pitch materials owner read" on storage.objects;
drop policy if exists "pitch materials public read" on storage.objects;

create policy "pitch materials public read" on storage.objects
for select
using (bucket_id = 'pitch-materials');
