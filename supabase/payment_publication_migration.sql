alter table public.entrepreneur_profiles
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists payment_transfer_name text,
  add column if not exists payment_plan_id text,
  add column if not exists payment_plan_label text,
  add column if not exists payment_plan_months int,
  add column if not exists payment_plan_amount numeric,
  add column if not exists payment_requested_at timestamptz,
  add column if not exists paid_at timestamptz;

do $$ begin
  alter table public.entrepreneur_profiles
    add constraint entrepreneur_profiles_payment_status_check
    check (payment_status in ('unpaid', 'pending_review', 'paid'));
exception
  when duplicate_object then null;
end $$;

alter table public.entrepreneur_profiles
  alter column is_hidden set default true;

update public.entrepreneur_profiles
set is_hidden = true
where payment_status <> 'paid';

alter table public.meeting_requests
  add column if not exists ticket_plan text,
  add column if not exists ticket_count int not null default 1,
  add column if not exists ticket_amount numeric not null default 11000,
  add column if not exists ticket_payment_status text not null default 'unpaid',
  add column if not exists confirmed_at timestamptz;

alter table public.users
  add column if not exists notification_email_enabled boolean not null default true;

create table if not exists public.email_notification_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  notification_id uuid references public.notifications(id) on delete cascade,
  event_type text not null,
  subject text not null,
  body text not null,
  status text not null default 'pending',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.email_notification_queue enable row level security;

do $$ begin
  create policy "email queue own/admin read" on public.email_notification_queue
    for select using (user_id = auth.uid() or public.is_admin());
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "email queue admin update" on public.email_notification_queue
    for update using (public.is_admin());
exception
  when duplicate_object then null;
end $$;

grant select, insert, update, delete on public.email_notification_queue to authenticated;

create or replace function public.queue_comment_message_email()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  email_enabled boolean;
begin
  if new.type not in ('comment', 'message') then
    return new;
  end if;

  select coalesce(notification_email_enabled, true)
  into email_enabled
  from public.users
  where id = new.user_id and is_suspended = false;

  if email_enabled then
    insert into public.email_notification_queue (user_id, notification_id, event_type, subject, body)
    values (
      new.user_id,
      new.id,
      new.type,
      case when new.type = 'comment' then 'Leapでコメントが届きました' else 'Leapでメッセージが届きました' end,
      new.body
    );
  end if;

  return new;
end;
$$;

drop trigger if exists queue_comment_message_email_trigger on public.notifications;
create trigger queue_comment_message_email_trigger
after insert on public.notifications
for each row execute function public.queue_comment_message_email();
