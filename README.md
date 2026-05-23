# Leap

投資家と起業家をつなぐSNS型資本提携プラットフォームの初期版です。

この実装はサンプルデータを表示しません。画面に表示される情報は、Supabase Authで登録されたユーザーと、Supabase Database/Storageに保存されたデータのみです。

## セットアップ

1. Supabaseプロジェクトを作成します。
2. Supabase SQL Editorで `supabase/schema.sql` を実行します。
3. `.env.example` を参考に `.env.local` を作成します。

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. 開発サーバーを起動します。

```bash
npm run dev
```

## スマホ確認

PCとスマホを同じWi-Fiに接続し、スマホで以下を開きます。

```txt
http://<PCのローカルIP>:3000/
```

この環境ではPCのIPが `192.168.0.115` のため、以下で確認できます。

```txt
http://192.168.0.115:3000/
```

## ローンチ前チェック

- 認証が動くか
- 起業家登録ができるか
- 投資家登録ができるか
- 進捗投稿ができるか
- コメントができるか
- フォローができるか
- 面談リクエストができるか
- 管理者が投稿を非表示にできるか
- スマホで崩れていないか
- 空状態が分かりやすいか
