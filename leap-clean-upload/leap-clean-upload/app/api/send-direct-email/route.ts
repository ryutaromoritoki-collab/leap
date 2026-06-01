import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function cleanEnv(value: string | undefined) {
  return (value ?? '').trim().replace(/^['"]|['"]$/g, '').replace(/^Bearer\s+/i, '').replace(/^Value\s+/i, '').trim();
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const resendApiKey = cleanEnv(process.env.RESEND_API_KEY);
  const fromEmail = cleanEnv(process.env.NOTIFICATION_FROM_EMAIL) || 'Leap <no-reply@leap-club.jp>';
  const { to, subject, body } = await request.json().catch(() => ({ to: '', subject: '', body: '' }));
  const recipients = Array.from(new Set((Array.isArray(to) ? to : [to]).map((email) => typeof email === 'string' ? email.trim().toLowerCase() : '').filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))));

  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEYをVercelに設定してください。' }, { status: 500 });
  }
  if (!resendApiKey.startsWith('re_')) {
    return NextResponse.json({ error: 'RESEND_API_KEYの形式が正しくありません。ResendのAPI Keysで発行した「re_」から始まるキーだけを設定してください。' }, { status: 500 });
  }
  if (!fromEmail.includes('@')) {
    return NextResponse.json({ error: 'NOTIFICATION_FROM_EMAILの形式が正しくありません。例：Leap <no-reply@leap-club.jp>' }, { status: 500 });
  }
  if (recipients.length === 0 || !subject || !body) {
    return NextResponse.json({ error: 'to、subject、bodyは必須です。' }, { status: 400 });
  }

  let sent = 0;
  const errors: Array<{ email: string; error: string }> = [];
  for (let index = 0; index < recipients.length; index += 1) {
    if (index > 0) await wait(650);
    const recipient = recipients[index];
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipient],
        subject,
        text: `${body}\n\nLeapを開く: https://leap-club.jp`,
      }),
    });

    if (response.ok) {
      sent += 1;
    } else {
      const raw = await response.text();
      let message = raw;
      try {
        const parsed = JSON.parse(raw);
        message = parsed.message || parsed.error || raw;
      } catch {
        message = raw;
      }
      errors.push({ email: recipient, error: `HTTP ${response.status}: ${message}` });
    }
  }
  if (errors.length > 0) {
    const detail = errors.slice(0, 5).map((item) => `${item.email}: ${item.error}`).join('\n');
    const error = `${errors.length}件の送信に失敗しました。\n${detail}${errors.length > 5 ? '\nほかにも失敗があります。' : ''}`;
    if (sent === 0) return NextResponse.json({ error, sent, failed: errors.length }, { status: 500 });
    return NextResponse.json({ ok: true, sent, failed: errors.length, error });
  }
  return NextResponse.json({ ok: true, sent });
}
