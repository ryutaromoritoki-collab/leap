# Supabase確認メールテンプレート

Supabase管理画面の `Authentication` -> `Email Templates` -> `Confirm signup` に設定してください。

## 件名

```text
【Leap】メールアドレスを確認してください
```

## 本文

```html
<h2>Leapのメールアドレス確認</h2>
<p>Leapに登録いただきありがとうございます。</p>
<p>下のボタンを押して、メールアドレスの確認を完了してください。</p>
<p>
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#16d9ff;color:#031018;font-weight:700;text-decoration:none;">
    メールアドレスを確認する
  </a>
</p>
<p>ボタンが押せない場合は、以下のURLをブラウザで開いてください。</p>
<p>{{ .ConfirmationURL }}</p>
<p>すでに登録済みの場合は、Leapのログイン画面から「パスワードを忘れていますか？」を押して再設定できます。</p>
<p>このメールに心当たりがない場合は、破棄してください。</p>
```

## パスワード再設定メールの件名

```text
【Leap】パスワード再設定のご案内
```

## パスワード再設定メールの本文

```html
<h2>Leapのパスワード再設定</h2>
<p>以下のボタンから、新しいパスワードを設定してください。</p>
<p>
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#16d9ff;color:#031018;font-weight:700;text-decoration:none;">
    パスワードを再設定する
  </a>
</p>
<p>ボタンが押せない場合は、以下のURLをブラウザで開いてください。</p>
<p>{{ .ConfirmationURL }}</p>
<p>このメールに心当たりがない場合は、破棄してください。</p>
```
