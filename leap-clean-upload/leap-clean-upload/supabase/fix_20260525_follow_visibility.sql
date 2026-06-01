drop policy if exists "investor own/admin read" on public.investor_profiles;
create policy "investor own/admin read" on public.investor_profiles
for select
using (true);
