alter table public.entrepreneur_profiles
  add column if not exists payment_status text not null default 'unpaid',
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
