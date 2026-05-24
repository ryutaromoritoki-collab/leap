import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
const fromEmail = Deno.env.get('NOTIFICATION_FROM_EMAIL') ?? 'Leap <no-reply@leap-club.jp>';

const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async () => {
  if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return Response.json({ error: 'Missing required environment variables' }, { status: 500 });
  }

  const { data: rows, error } = await supabase
    .from('email_notification_queue')
    .select('id, user_id, subject, body, users(email, notification_email_enabled, is_suspended)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(20);

  if (error) return Response.json({ error: error.message }, { status: 500 });

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
        text: `${row.body}\n\nLeap: https://leap-club.jp`,
      }),
    });

    await supabase
      .from('email_notification_queue')
      .update({ status: response.ok ? 'sent' : 'failed', sent_at: response.ok ? new Date().toISOString() : null })
      .eq('id', row.id);

    if (response.ok) sent += 1;
  }

  return Response.json({ processed: rows?.length ?? 0, sent });
});
