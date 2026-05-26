create table if not exists public.user_blocks (
  blocker_id uuid not null references public.users(id) on delete cascade,
  blocked_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table public.user_blocks enable row level security;

drop policy if exists "blocks own read" on public.user_blocks;
create policy "blocks own read" on public.user_blocks
for select
using (blocker_id = auth.uid() or blocked_id = auth.uid() or public.is_admin());

drop policy if exists "blocks own insert" on public.user_blocks;
create policy "blocks own insert" on public.user_blocks
for insert
with check (blocker_id = auth.uid());

drop policy if exists "blocks own delete" on public.user_blocks;
create policy "blocks own delete" on public.user_blocks
for delete
using (blocker_id = auth.uid() or public.is_admin());

drop policy if exists "meetings participant delete" on public.meeting_requests;
create policy "meetings participant delete" on public.meeting_requests
for delete
using (
  investor_id = auth.uid()
  or public.is_admin()
  or exists(select 1 from public.entrepreneur_profiles p where p.id = entrepreneur_id and p.user_id = auth.uid())
);
