import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type QueueRow = {
  id: string;
  user_id: string;
  subject: string;
  body: string;
  users?: {
    email: string | null;
    notification_email_enabled: boolean | null;
    is_suspended: boolean | null;
  } | Array<{
    email: string | null;
    notification_email_enabled: boolean | null;
    is_suspended: boolean | null;
  }>;
};

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = (process.env.RESEND_API_KEY ?? '').trim().replace(/^Bearer\s+/i, '').replace(/^Value\s+/i, '');
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL ?? 'Leap <no-reply@leap-club.jp>';

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY、RESEND_API_KEY、NOTIFICATION_FROM_EMAILをVercelに設定してください。' },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: rows, error } = await supabase
    .from('email_notification_queue')
    .select('id, user_id, subject, body, users(email, notification_email_enabled, is_suspended)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(20)
    .returns<QueueRow[]>();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const row of rows ?? []) {
    const user = Array.isArray(row.users) ? row.users[0] : row.users;
    if (!user?.email || user.notification_email_enabled === false || user.is_suspended) {
      await supabase.from('email_notification_queue').update({ status: 'skipped' }).eq('id', row.id);
      continue;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [user.email],
        subject: row.subject,
        text: `${row.body}\n\nLeapを開く: https://leap-club.jp`,
      }),
    });

    await supabase
      .from('email_notification_queue')
      .update({
        status: response.ok ? 'sent' : 'failed',
        sent_at: response.ok ? new Date().toISOString() : null,
      })
      .eq('id', row.id);

    if (response.ok) sent += 1;
  }

  return NextResponse.json({ processed: rows?.length ?? 0, sent });
}
