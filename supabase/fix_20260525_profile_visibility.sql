update public.entrepreneur_profiles
set is_hidden = false
where is_hidden is null;

update public.progress_posts
set is_hidden = false
where is_hidden is null;

update public.post_comments
set is_hidden = false
where is_hidden is null;

drop policy if exists "entrepreneur public read" on public.entrepreneur_profiles;
create policy "entrepreneur public read" on public.entrepreneur_profiles
for select
using (coalesce(is_hidden, false) = false or user_id = auth.uid() or public.is_admin());

drop policy if exists "posts readable" on public.progress_posts;
create policy "posts readable" on public.progress_posts
for select
using (coalesce(is_hidden, false) = false or user_id = auth.uid() or public.is_admin());

drop policy if exists "comments readable" on public.post_comments;
create policy "comments readable" on public.post_comments
for select
using (coalesce(is_hidden, false) = false or user_id = auth.uid() or public.is_admin());
