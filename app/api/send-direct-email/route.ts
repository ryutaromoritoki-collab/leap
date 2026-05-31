import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL ?? 'Leap <no-reply@leap-club.jp>';
  const { to, subject, body } = await request.json().catch(() => ({ to: '', subject: '', body: '' }));

  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEYをVercelに設定してください。' }, { status: 500 });
  }
  if (!to || !subject || !body) {
    return NextResponse.json({ error: 'to、subject、bodyは必須です。' }, { status: 400 });
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      text: `${body}\n\nLeapを開く: https://leap-club.jp`,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: await response.text() }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
