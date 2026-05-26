drop policy if exists "posts owner/admin delete" on public.progress_posts;
create policy "posts owner/admin delete" on public.progress_posts
for delete
using (user_id = auth.uid() or public.is_admin());
