create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('entrepreneur', 'investor', 'admin');
exception
  when duplicate_object then null;
end $$;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role public.user_role not null,
  available_roles public.user_role[] not null default '{}',
  phone text,
  profile_completed boolean not null default false,
  is_suspended boolean not null default false,
  notification_email_enabled boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users
  add column if not exists available_roles public.user_role[] not null default '{}',
  add column if not exists phone text,
  add column if not exists notification_email_enabled boolean not null default true,
  add column if not exists last_login_at timestamptz;

create table public.entrepreneur_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  account_name text,
  company_name text not null,
  founder_name text not null,
  location text,
  industry text,
  founded_month text,
  employee_count int,
  employee_size text,
  annual_revenue_scale text,
  tagline text,
  overview text,
  problem text,
  solution text,
  target_customer text,
  business_model text,
  advantage text,
  current_phase text,
  fundraising_amount numeric,
  fund_usage text,
  investor_support text,
  verified_identity boolean not null default false,
  verified_corporate boolean not null default false,
  verified_interview boolean not null default false,
  verified_revenue boolean not null default false,
  is_fast_growing boolean not null default false,
  is_hidden boolean not null default false,
  payment_status text not null default 'paid' check (payment_status in ('unpaid', 'pending_review', 'paid')),
  total_investment_amount numeric not null default 0,
  payment_transfer_name text,
  payment_plan_id text,
  payment_plan_label text,
  payment_plan_months int,
  payment_plan_amount numeric,
  payment_requested_at timestamptz,
  paid_at timestamptz,
  subscription_ends_at timestamptz,
  meeting_ticket_balance int not null default 0,
  meeting_ticket_plan text,
  meeting_ticket_requested_count int not null default 0,
  meeting_ticket_requested_amount numeric,
  meeting_ticket_payment_status text not null default 'unpaid',
  meeting_ticket_transfer_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.entrepreneur_profiles
  add column if not exists account_name text,
  add column if not exists employee_size text,
  add column if not exists annual_revenue_scale text,
  add column if not exists payment_status text not null default 'paid',
  add column if not exists total_investment_amount numeric not null default 0,
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

alter table public.entrepreneur_profiles
  alter column is_hidden set default false;

alter table public.entrepreneur_profiles
  alter column payment_status set default 'paid';

create table public.investor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  account_name text,
  full_name text not null,
  company_name text,
  position text,
  location text,
  founded_month text,
  employee_size text,
  annual_revenue_scale text,
  investment_fields text,
  investable_amount numeric,
  interested_phases text,
  past_investments text,
  support_areas text,
  purpose text[],
  investor_type text,
  corporate_number text,
  license_file_path text,
  total_investment_amount numeric not null default 0,
  document_type text,
  document_file_path text,
  document_status text not null default 'unsubmitted',
  document_submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.investor_profiles
  add column if not exists account_name text,
  add column if not exists founded_month text,
  add column if not exists employee_size text,
  add column if not exists annual_revenue_scale text,
  add column if not exists investor_type text,
  add column if not exists corporate_number text,
  add column if not exists license_file_path text,
  add column if not exists total_investment_amount numeric not null default 0,
  add column if not exists document_type text,
  add column if not exists document_file_path text,
  add column if not exists document_status text not null default 'unsubmitted',
  add column if not exists document_submitted_at timestamptz;

create table public.startup_kpis (
  id uuid primary key default gen_random_uuid(),
  entrepreneur_id uuid not null references public.entrepreneur_profiles(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  kpi_month date not null,
  monthly_revenue numeric,
  customer_count int,
  mau int,
  retention_rate numeric,
  gross_margin numeric,
  created_at timestamptz not null default now()
);

create table public.progress_posts (
  id uuid primary key default gen_random_uuid(),
  entrepreneur_id uuid not null references public.entrepreneur_profiles(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  post_type text not null default 'progress',
  title text,
  body text,
  did_today text not null,
  metric_change text,
  issue text,
  next_action text,
  related_kpi text,
  tags text[],
  visibility text not null default 'public',
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.progress_posts
  add column if not exists post_type text not null default 'progress',
  add column if not exists title text,
  add column if not exists body text;

create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.progress_posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.post_likes (
  post_id uuid not null references public.progress_posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.follows (
  entrepreneur_id uuid not null references public.entrepreneur_profiles(id) on delete cascade,
  investor_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (entrepreneur_id, investor_id)
);

create table public.watchlists (
  entrepreneur_id uuid not null references public.entrepreneur_profiles(id) on delete cascade,
  investor_id uuid not null references public.users(id) on delete cascade,
  memo text,
  created_at timestamptz not null default now(),
  primary key (entrepreneur_id, investor_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.meeting_requests (
  id uuid primary key default gen_random_uuid(),
  entrepreneur_id uuid not null references public.entrepreneur_profiles(id) on delete cascade,
  investor_id uuid not null references public.users(id) on delete cascade,
  message text,
  proposed_at timestamptz,
  status text not null default 'pending',
  ticket_plan text,
  ticket_count int not null default 1,
  ticket_amount numeric not null default 11000,
  ticket_payment_status text not null default 'unpaid',
  confirmed_at timestamptz,
  final_meeting_at timestamptz,
  meeting_admin_report text,
  created_at timestamptz not null default now()
);

alter table public.meeting_requests
  add column if not exists ticket_plan text,
  add column if not exists ticket_count int not null default 1,
  add column if not exists ticket_amount numeric not null default 11000,
  add column if not exists ticket_payment_status text not null default 'unpaid',
  add column if not exists confirmed_at timestamptz,
  add column if not exists final_meeting_at timestamptz,
  add column if not exists meeting_admin_report text;

create table public.pitch_materials (
  id uuid primary key default gen_random_uuid(),
  entrepreneur_id uuid not null references public.entrepreneur_profiles(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  file_path text not null,
  title text,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.users(id) on delete set null,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.users(id) on delete set null,
  target_type text not null,
  target_id uuid not null,
  action text not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.email_notification_queue (
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

insert into storage.buckets (id, name, public)
values ('pitch-materials', 'pitch-materials', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('compliance-documents', 'compliance-documents', false)
on conflict (id) do nothing;

create table public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  email text,
  category text not null default 'contact',
  body text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table public.contact_suspicions (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.users(id) on delete set null,
  receiver_id uuid references public.users(id) on delete set null,
  body text not null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table public.automated_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  reminder_type text not null,
  day_offset int not null,
  sent_at timestamptz not null default now(),
  unique(user_id, reminder_type, day_offset)
);

create index entrepreneur_profiles_search_idx on public.entrepreneur_profiles using gin (
  to_tsvector('simple', coalesce(company_name, '') || ' ' || coalesce(industry, '') || ' ' || coalesce(location, '') || ' ' || coalesce(tagline, ''))
);
create index progress_posts_created_idx on public.progress_posts(created_at desc);
create index startup_kpis_month_idx on public.startup_kpis(entrepreneur_id, kpi_month desc);

alter table public.users enable row level security;
alter table public.entrepreneur_profiles enable row level security;
alter table public.investor_profiles enable row level security;
alter table public.startup_kpis enable row level security;
alter table public.progress_posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.follows enable row level security;
alter table public.watchlists enable row level security;
alter table public.messages enable row level security;
alter table public.meeting_requests enable row level security;
alter table public.pitch_materials enable row level security;
alter table public.reports enable row level security;
alter table public.admin_actions enable row level security;
alter table public.notifications enable row level security;
alter table public.email_notification_queue enable row level security;
alter table public.contact_inquiries enable row level security;
alter table public.contact_suspicions enable row level security;
alter table public.automated_reminders enable row level security;

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists(select 1 from public.users where id = auth.uid() and role = 'admin' and is_suspended = false);
$$;

create policy "own user or admin read" on public.users for select using (id = auth.uid() or public.is_admin());
create policy "own user insert" on public.users for insert with check (id = auth.uid());
create policy "own user update" on public.users for update using (id = auth.uid() or public.is_admin());

create policy "entrepreneur public read" on public.entrepreneur_profiles for select using (is_hidden = false or user_id = auth.uid() or public.is_admin());
create policy "entrepreneur own insert" on public.entrepreneur_profiles for insert with check (user_id = auth.uid());
create policy "entrepreneur own update" on public.entrepreneur_profiles for update using (user_id = auth.uid() or public.is_admin());

create policy "investor own/admin read" on public.investor_profiles for select using (user_id = auth.uid() or public.is_admin());
create policy "investor own insert" on public.investor_profiles for insert with check (user_id = auth.uid());
create policy "investor own update" on public.investor_profiles for update using (user_id = auth.uid() or public.is_admin());

create policy "kpi readable" on public.startup_kpis for select using (true);
create policy "kpi owner insert" on public.startup_kpis for insert with check (user_id = auth.uid());
create policy "kpi owner update" on public.startup_kpis for update using (user_id = auth.uid() or public.is_admin());

create policy "posts readable" on public.progress_posts for select using (is_hidden = false or user_id = auth.uid() or public.is_admin());
create policy "posts owner insert" on public.progress_posts for insert with check (user_id = auth.uid());
create policy "posts owner/admin update" on public.progress_posts for update using (user_id = auth.uid() or public.is_admin());

create policy "comments readable" on public.post_comments for select using (is_hidden = false or user_id = auth.uid() or public.is_admin());
create policy "comments logged insert" on public.post_comments for insert with check (user_id = auth.uid());
create policy "comments owner/admin update" on public.post_comments for update using (user_id = auth.uid() or public.is_admin());

create policy "likes readable" on public.post_likes for select using (true);
create policy "likes owner insert" on public.post_likes for insert with check (user_id = auth.uid());
create policy "likes owner delete" on public.post_likes for delete using (user_id = auth.uid());

create policy "follows readable" on public.follows for select using (true);
create policy "follows investor insert" on public.follows for insert with check (investor_id = auth.uid());
create policy "follows investor delete" on public.follows for delete using (investor_id = auth.uid());

create policy "watchlists owner read" on public.watchlists for select using (investor_id = auth.uid() or public.is_admin());
create policy "watchlists owner write" on public.watchlists for insert with check (investor_id = auth.uid());
create policy "watchlists owner update" on public.watchlists for update using (investor_id = auth.uid() or public.is_admin());
create policy "watchlists owner delete" on public.watchlists for delete using (investor_id = auth.uid());

create policy "messages participants read" on public.messages for select using (sender_id = auth.uid() or receiver_id = auth.uid() or public.is_admin());
create policy "messages sender insert" on public.messages for insert with check (sender_id = auth.uid());
create policy "messages receiver update" on public.messages for update using (receiver_id = auth.uid() or public.is_admin());

create policy "meetings participants read" on public.meeting_requests for select using (
  investor_id = auth.uid()
  or public.is_admin()
  or exists(select 1 from public.entrepreneur_profiles p where p.id = entrepreneur_id and p.user_id = auth.uid())
);
create policy "meetings investor insert" on public.meeting_requests for insert with check (investor_id = auth.uid());
create policy "meetings participant update" on public.meeting_requests for update using (
  investor_id = auth.uid()
  or public.is_admin()
  or exists(select 1 from public.entrepreneur_profiles p where p.id = entrepreneur_id and p.user_id = auth.uid())
);

create policy "pitch readable" on public.pitch_materials for select using (true);
create policy "pitch owner insert" on public.pitch_materials for insert with check (user_id = auth.uid());
create policy "pitch owner update" on public.pitch_materials for update using (user_id = auth.uid() or public.is_admin());

create policy "reports own/admin read" on public.reports for select using (reporter_id = auth.uid() or public.is_admin());
create policy "reports logged insert" on public.reports for insert with check (reporter_id = auth.uid());
create policy "reports admin update" on public.reports for update using (public.is_admin());

create policy "admin actions admin only" on public.admin_actions for all using (public.is_admin()) with check (public.is_admin());
create policy "notifications own read" on public.notifications for select using (user_id = auth.uid() or public.is_admin());
create policy "notifications logged insert" on public.notifications for insert with check (auth.uid() is not null);
create policy "notifications own update" on public.notifications for update using (user_id = auth.uid() or public.is_admin());
create policy "email queue own/admin read" on public.email_notification_queue for select using (user_id = auth.uid() or public.is_admin());
create policy "email queue admin update" on public.email_notification_queue for update using (public.is_admin());
create policy "contact insert" on public.contact_inquiries for insert with check (true);
create policy "contact admin read" on public.contact_inquiries for select using (public.is_admin());
create policy "contact admin update" on public.contact_inquiries for update using (public.is_admin());
create policy "contact suspicions logged insert" on public.contact_suspicions for insert with check (auth.uid() is not null);
create policy "contact suspicions admin read" on public.contact_suspicions for select using (public.is_admin());
create policy "contact suspicions admin update" on public.contact_suspicions for update using (public.is_admin());
create policy "automated reminders admin read" on public.automated_reminders for select using (public.is_admin());

create policy "pitch materials owner upload" on storage.objects for insert with check (
  bucket_id = 'pitch-materials' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "pitch materials owner read" on storage.objects for select using (
  bucket_id = 'pitch-materials' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
);
create policy "pitch materials owner update" on storage.objects for update using (
  bucket_id = 'pitch-materials' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
);

create policy "compliance documents owner upload" on storage.objects for insert with check (
  bucket_id = 'compliance-documents' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "compliance documents owner read" on storage.objects for select using (
  bucket_id = 'compliance-documents' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin())
);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.entrepreneur_profiles to anon;
grant insert on public.contact_inquiries to anon;
grant usage, select on all sequences in schema public to authenticated;
grant select, insert, update, delete on public.contact_suspicions to authenticated;
grant select, insert, update, delete on public.automated_reminders to authenticated;

alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;

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
      where ip.corporate_number is null
        and ip.license_file_path is null
        and u.created_at <= now() - make_interval(days => day_value)
        and not exists (
          select 1 from public.automated_reminders ar
          where ar.user_id = u.id and ar.reminder_type = 'investor_document' and ar.day_offset = day_value
        )
    loop
      insert into public.contact_inquiries (user_id, category, body)
      values (user_row.id, 'system_message', '投資家確認情報の提出をお願いします。法人は法人番号、個人事業主は運転免許証の写真をご提出ください。');
      insert into public.automated_reminders (user_id, reminder_type, day_offset)
      values (user_row.id, 'investor_document', day_value)
      on conflict do nothing;
    end loop;
  end loop;
end;
$$;
