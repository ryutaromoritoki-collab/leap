import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL ?? 'Leap <no-reply@leap-club.jp>';
  const { to, subject, body } = await request.json().catch(() => ({ to: '', subject: '', body: '' }));
  const recipients = (Array.isArray(to) ? to : [to]).filter((email) => typeof email === 'string' && email.includes('@'));

  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEYをVercelに設定してください。' }, { status: 500 });
  }
  if (recipients.length === 0 || !subject || !body) {
    return NextResponse.json({ error: 'to、subject、bodyは必須です。' }, { status: 400 });
  }

  let sent = 0;
  const errors: string[] = [];
  for (let index = 0; index < recipients.length; index += 50) {
    const chunk = recipients.slice(index, index + 50);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: chunk,
        subject,
        text: `${body}\n\nLeapを開く: https://leap-club.jp`,
      }),
    });

    if (response.ok) {
      sent += chunk.length;
    } else {
      errors.push(await response.text());
    }
  }
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join('\n'), sent }, { status: 500 });
  }
  return NextResponse.json({ ok: true, sent });
}
