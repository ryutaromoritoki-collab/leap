import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function cleanEnv(value: string | undefined) {
  return (value ?? '').trim().replace(/^['"]|['"]$/g, '').replace(/^Bearer\s+/i, '').replace(/^Value\s+/i, '').trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendResendEmail(params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  if (response.ok) return { ok: true };
  const raw = await response.text();
  try {
    const parsed = JSON.parse(raw);
    return { ok: false, error: parsed.message || parsed.error || raw, status: response.status };
  } catch {
    return { ok: false, error: raw, status: response.status };
  }
}

export async function POST(request: Request) {
  const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const resendApiKey = cleanEnv(process.env.RESEND_API_KEY);
  const fromEmail = cleanEnv(process.env.NOTIFICATION_FROM_EMAIL) || 'Leap <no-reply@leap-club.jp>';
  const { email: rawEmail, password, phone, role, redirectTo } = await request.json().catch(() => ({}));
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  const safeRedirectTo = typeof redirectTo === 'string' && /^https?:\/\//.test(redirectTo) ? redirectTo : 'https://leap-club.jp/';

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEYをVercelに設定してください。' }, { status: 500 });
  }
  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEYをVercelに設定してください。' }, { status: 500 });
  }
  if (!resendApiKey.startsWith('re_')) {
    return NextResponse.json({ error: 'RESEND_API_KEYの形式が正しくありません。ResendのAPI Keysで発行した「re_」から始まるキーだけを設定してください。' }, { status: 500 });
  }
  if (!fromEmail.includes('@')) {
    return NextResponse.json({ error: 'NOTIFICATION_FROM_EMAILの形式が正しくありません。例：Leap <no-reply@leap-club.jp>' }, { status: 500 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'メールアドレスの形式が正しくありません。' }, { status: 400 });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return NextResponse.json({ error: 'パスワードは6文字以上で入力してください。' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) {
    return NextResponse.json({ error: `Supabaseユーザー確認に失敗しました：${listError.message}` }, { status: 500 });
  }

  const existingUser = existingUsers.users.find((user) => user.email?.trim().toLowerCase() === email);
  if (existingUser?.email_confirmed_at || existingUser?.confirmed_at) {
    return NextResponse.json({ error: 'すでに登録済みです。ログイン画面に戻ってログインしてください。', alreadyRegistered: true }, { status: 409 });
  }

  const linkType = existingUser ? 'magiclink' : 'signup';
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: linkType,
    email,
    password,
    options: {
      data: { phone, role },
      redirectTo: safeRedirectTo,
    },
  } as never);

  if (linkError) {
    return NextResponse.json({ error: `確認リンクの作成に失敗しました：${linkError.message}` }, { status: 500 });
  }

  const actionLink = (linkData as { properties?: { action_link?: string } }).properties?.action_link;
  if (!actionLink) {
    return NextResponse.json({ error: '確認リンクを作成できませんでした。' }, { status: 500 });
  }

  const subject = '【Leap】メールアドレスを確認してください';
  const escapedEmail = escapeHtml(email);
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.8;color:#111827;">
      <h2 style="margin:0 0 16px;">Leapのメールアドレス確認</h2>
      <p>Leapにご登録いただきありがとうございます。</p>
      <p>下のボタンを押して、メールアドレスの確認を完了してください。</p>
      <p style="margin:24px 0;">
        <a href="${actionLink}" style="display:inline-block;background:#050816;color:#ffffff;text-decoration:none;border-radius:12px;padding:12px 20px;font-weight:700;">メールアドレスを確認する</a>
      </p>
      <p style="font-size:13px;color:#64748b;">ボタンが開けない場合は、下記URLをブラウザに貼り付けてください。</p>
      <p style="font-size:13px;word-break:break-all;color:#2563eb;">${actionLink}</p>
      <p style="font-size:13px;color:#64748b;">送信先：${escapedEmail}</p>
    </div>
  `;
  const text = `Leapのメールアドレス確認\n\nLeapにご登録いただきありがとうございます。\n下記URLを開いて、メールアドレスの確認を完了してください。\n\n${actionLink}\n\n送信先：${email}`;

  const sendResult = await sendResendEmail({
    apiKey: resendApiKey,
    from: fromEmail,
    to: email,
    subject,
    html,
    text,
  });

  if (!sendResult.ok) {
    return NextResponse.json({ error: `確認メール送信に失敗しました：HTTP ${sendResult.status ?? ''} ${sendResult.error ?? ''}`.trim() }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent: 1, via: 'resend-api' });
}
