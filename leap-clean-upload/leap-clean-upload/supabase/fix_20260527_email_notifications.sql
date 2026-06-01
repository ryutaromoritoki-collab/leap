create or replace function public.queue_comment_message_email()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  email_enabled boolean;
begin
  if new.type not in ('comment', 'message', 'follow', 'meeting_request', 'admin_contact_inquiry') then
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
      case
        when new.type = 'comment' then 'Leapでコメントが届きました'
        when new.type = 'message' then 'Leapでメッセージが届きました'
        when new.type = 'follow' then 'Leapでフォローされました'
        when new.type = 'meeting_request' then 'Leapで面談申込が届きました'
        else 'Leapで運営確認が必要な通知があります'
      end,
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
