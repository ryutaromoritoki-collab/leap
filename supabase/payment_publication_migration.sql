alter table public.entrepreneur_profiles
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists payment_transfer_name text,
  add column if not exists payment_plan_id text,
  add column if not exists payment_plan_label text,
  add column if not exists payment_plan_months int,
  add column if not exists payment_plan_amount numeric,
  add column if not exists payment_requested_at timestamptz,
  add column if not exists paid_at timestamptz,
  add column if not exists subscription_ends_at timestamptz,
  add column if not exists meeting_ticket_balance int not null default 0,
  add column if not exists meeting_ticket_plan text,
  add column if not exists meeting_ticket_requested_count int not null default 0,
  add column if not exists meeting_ticket_requested_amount numeric,
  add column if not exists meeting_ticket_payment_status text not null default 'unpaid',
  add column if not exists meeting_ticket_transfer_name text;

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
  add column if not exists confirmed_at timestamptz,
  add column if not exists final_meeting_at timestamptz,
  add column if not exists meeting_admin_report text;

alter table public.users
  add column if not exists available_roles public.user_role[] not null default '{}',
  add column if not exists phone text,
  add column if not exists notification_email_enabled boolean not null default true,
  add column if not exists last_login_at timestamptz;

update public.users
set available_roles = array[role]
where available_roles = '{}';

alter table public.investor_profiles
  add column if not exists document_type text,
  add column if not exists document_file_path text,
  add column if not exists document_status text not null default 'unsubmitted',
  add column if not exists document_submitted_at timestamptz;

insert into storage.buckets (id, name, public)
values ('compliance-documents', 'compliance-documents', false)
on conflict (id) do nothing;

create table if not exists public.contact_suspicions (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.users(id) on delete set null,
  receiver_id uuid references public.users(id) on delete set null,
  body text not null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

alter table public.contact_suspicions enable row level security;

do $$ begin
  create policy "contact suspicions logged insert" on public.contact_suspicions
    for insert with check (auth.uid() is not null);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "contact suspicions admin read" on public.contact_suspicions
    for select using (public.is_admin());
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "contact suspicions admin update" on public.contact_suspicions
    for update using (public.is_admin());
exception
  when duplicate_object then null;
end $$;

create table if not exists public.automated_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  reminder_type text not null,
  day_offset int not null,
  sent_at timestamptz not null default now(),
  unique(user_id, reminder_type, day_offset)
);

alter table public.automated_reminders enable row level security;

grant select, insert, update, delete on public.contact_suspicions to authenticated;
grant select, insert, update, delete on public.automated_reminders to authenticated;

do $$ begin
  create policy "compliance documents owner upload" on storage.objects
    for insert with check (bucket_id = 'compliance-documents' and auth.uid()::text = (storage.foldername(name))[1]);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "compliance documents owner read" on storage.objects
    for select using (bucket_id = 'compliance-documents' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin()));
exception
  when duplicate_object then null;
end $$;

create or replace function public.run_automated_reminders()
returns void language plpgsql security definer set search_path = public as $$
declare
  day_value int;
  user_row record;
begin
  foreach day_value in array array[3, 7, 14, 30, 90] loop
    for user_row in
      select u.id
      from public.users u
      join public.investor_profiles ip on ip.user_id = u.id
      where ip.document_file_path is null
        and u.created_at <= now() - make_interval(days => day_value)
        and not exists (
          select 1 from public.automated_reminders ar
          where ar.user_id = u.id and ar.reminder_type = 'investor_document' and ar.day_offset = day_value
        )
    loop
      insert into public.contact_inquiries (user_id, category, body)
      values (user_row.id, 'system_message', '投資家確認書類の提出をお願いします。法人は直近3ヶ月以内の登記簿謄本、個人事業主は開業届または直近の確定申告書をご提出ください。');
      insert into public.automated_reminders (user_id, reminder_type, day_offset)
      values (user_row.id, 'investor_document', day_value)
      on conflict do nothing;
    end loop;

    for user_row in
      select u.id
      from public.users u
      join public.entrepreneur_profiles ep on ep.user_id = u.id
      where ep.is_hidden = true
        and ep.payment_status <> 'paid'
        and ep.created_at <= now() - make_interval(days => day_value)
        and not exists (
          select 1 from public.automated_reminders ar
          where ar.user_id = u.id and ar.reminder_type = 'entrepreneur_payment' and ar.day_offset = day_value
        )
    loop
      insert into public.contact_inquiries (user_id, category, body)
      values (user_row.id, 'system_message', '現在プロフィールは非公開です。月額費用のお支払い確認後、投資家の検索結果とフィードへ公開されます。');
      insert into public.automated_reminders (user_id, reminder_type, day_offset)
      values (user_row.id, 'entrepreneur_payment', day_value)
      on conflict do nothing;
    end loop;
  end loop;
end;
$$;

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
