alter table public.users
  add column if not exists following_visible boolean not null default true,
  add column if not exists followers_visible boolean not null default true;

drop policy if exists "contact admin delete" on public.contact_inquiries;
create policy "contact admin delete" on public.contact_inquiries
for delete
using (public.is_admin());
