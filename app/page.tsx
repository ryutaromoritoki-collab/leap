'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  Bookmark,
  Building2,
  CalendarClock,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Flag,
  Gauge,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageCircle,
  Plus,
  Rocket,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  UsersRound,
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';
import type { AppUser, EntrepreneurProfile, InvestorProfile, ProgressPost, StartupKpi, UserRole } from '@/lib/types';

type View =
  | 'home'
  | 'search'
  | 'profile'
  | 'post'
  | 'kpi'
  | 'messages'
  | 'admin'
  | 'legal'
  | 'launch';

type LegalSlug = 'terms' | 'privacy' | 'commerce' | 'disclaimer' | 'contact' | 'report';

const supabase = getSupabaseClient();

const legalCopy: Record<LegalSlug, { title: string; body: string }> = {
  terms: {
    title: '利用規約',
    body: 'Leapは、起業家と投資家の情報共有および面談機会の創出を目的としたプラットフォームです。利用者は、登録情報が正確であること、他者の権利を侵害しないこと、不正な勧誘や虚偽表示を行わないことに同意します。',
  },
  privacy: {
    title: 'プライバシーポリシー',
    body: '取得した個人情報、企業情報、投稿情報、メッセージ情報は、本人確認、プロフィール審査、通知、問い合わせ対応、サービス改善のために利用します。法令に基づく場合を除き、同意なく第三者へ提供しません。',
  },
  commerce: {
    title: '特定商取引法に基づく表記',
    body: '有料機能を提供する場合、販売事業者名、所在地、連絡先、販売価格、支払方法、キャンセル条件を本ページに明記します。初期版では無料利用を前提としています。',
  },
  disclaimer: {
    title: '免責事項',
    body: 'Leapは投資判断を代行・推奨するサービスではありません。掲載情報をもとにした投資判断は各利用者の責任で行ってください。起業家の掲載情報の正確性、将来の収益性、投資成果を保証しません。',
  },
  contact: {
    title: 'お問い合わせ',
    body: 'サービス利用、審査、退会、法務、その他のご連絡はこちらから送信できます。ログイン中の場合はアカウント情報と紐づけて管理者が確認します。',
  },
  report: {
    title: '通報フォーム',
    body: '虚偽情報、不適切投稿、権利侵害、迷惑行為を見つけた場合は通報してください。管理者が内容を確認し、必要に応じて非表示、停止、審査を行います。',
  },
};

const nav = [
  { view: 'home' as View, label: 'ホーム', icon: Home },
  { view: 'search' as View, label: '検索', icon: Search },
  { view: 'kpi' as View, label: 'KPI', icon: LayoutDashboard },
  { view: 'messages' as View, label: 'メッセージ', icon: Mail },
  { view: 'admin' as View, label: '管理', icon: ShieldCheck },
];

const phaseOptions = ['アイデア', '初期検証', 'プレシード', 'シード', 'プレシリーズA', 'シリーズA', 'シリーズB以降'];
const visibilityOptions = ['public', 'followers', 'verified_investors'];
const visibilityLabels: Record<string, string> = {
  public: '全体公開',
  followers: 'フォロワー限定',
  verified_investors: '認証済み投資家のみ',
};
const roleLabels: Record<UserRole, string> = {
  entrepreneur: '起業家',
  investor: '投資家',
  admin: '管理者',
};

function yen(value?: number | null) {
  if (value === null || value === undefined) return '未入力';
  return `${Number(value).toLocaleString()}円`;
}

function percent(value?: number | null) {
  if (value === null || value === undefined) return '未入力';
  return `${value}%`;
}

function toJapaneseError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) return 'メールアドレスまたはパスワードが正しくありません。';
  if (lower.includes('email not confirmed')) return 'メール認証が完了していません。確認メールを開いて認証してください。';
  if (lower.includes('user already registered') || lower.includes('already registered')) return 'このメールアドレスはすでに登録されています。';
  if (lower.includes('password should be at least')) return 'パスワードは6文字以上で入力してください。';
  if (lower.includes('signup is disabled')) return '現在、新規登録は停止されています。';
  if (lower.includes('permission denied')) return '操作権限がありません。ログイン状態または権限設定を確認してください。';
  if (lower.includes('fetch failed')) return 'データベースへ接続できません。通信環境または接続設定を確認してください。';
  if (lower.includes('rate limit') || lower.includes('security purposes') || lower.includes('after')) {
    return '確認メールの送信回数制限に達しました。この制限はメールアドレス単位ではなくプロジェクト全体にかかります。しばらく待つか、開発中はSupabaseのメール認証を一時的にオフにしてください。';
  }
  return message || '処理に失敗しました。';
}

export default function LeapApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('home');
  const [legalSlug, setLegalSlug] = useState<LegalSlug>('terms');
  const [profile, setProfile] = useState<EntrepreneurProfile | null>(null);
  const [investor, setInvestor] = useState<InvestorProfile | null>(null);
  const [posts, setPosts] = useState<ProgressPost[]>([]);
  const [kpis, setKpis] = useState<StartupKpi[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<EntrepreneurProfile | null>(null);
  const [profiles, setProfiles] = useState<EntrepreneurProfile[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [follows, setFollows] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [adminData, setAdminData] = useState<Record<string, any[]>>({});
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) {
      setUser(null);
      return;
    }
    loadUser();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!supabase || !user) return;
    loadWorkspace();
  }, [user?.id, view]);

  async function loadUser() {
    if (!supabase || !session?.user) return;
    const { data, error } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
    if (error) setToast(toJapaneseError(error.message));
    if (data) {
      setUser(data as AppUser);
      return;
    }

    const metadataRole = session.user.user_metadata?.role as UserRole | undefined;
    const role: Exclude<UserRole, 'admin'> = metadataRole === 'investor' ? 'investor' : 'entrepreneur';
    const { data: created, error: createError } = await supabase
      .from('users')
      .insert({
        id: session.user.id,
        email: session.user.email,
        role,
        profile_completed: false,
      })
      .select()
      .single();
    if (createError) {
      setToast(toJapaneseError(createError.message));
      return;
    }
    setUser(created as AppUser);
  }

  async function loadWorkspace() {
    if (!supabase || !user) return;
    if (user.role === 'entrepreneur') {
      const { data: ownProfile } = await supabase.from('entrepreneur_profiles').select('*').eq('user_id', user.id).maybeSingle();
      setProfile((ownProfile as EntrepreneurProfile | null) ?? null);
      if (ownProfile) {
        const [{ data: postRows }, { data: kpiRows }, { data: followRows }, { data: meetingRows }] = await Promise.all([
          supabase.from('progress_posts').select('*').eq('entrepreneur_id', ownProfile.id).order('created_at', { ascending: false }),
          supabase.from('startup_kpis').select('*').eq('entrepreneur_id', ownProfile.id).order('kpi_month', { ascending: true }),
          supabase.from('follows').select('*').eq('entrepreneur_id', ownProfile.id),
          supabase.from('meeting_requests').select('*').eq('entrepreneur_id', ownProfile.id).order('created_at', { ascending: false }),
        ]);
        setPosts((postRows as ProgressPost[]) ?? []);
        setKpis((kpiRows as StartupKpi[]) ?? []);
        setFollows(followRows ?? []);
        setMeetings(meetingRows ?? []);
      }
    }

    if (user.role === 'investor') {
      const [{ data: investorProfile }, { data: allProfiles }, { data: allPosts }, { data: followRows }, { data: meetingRows }, { data: messageRows }] =
        await Promise.all([
          supabase.from('investor_profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('entrepreneur_profiles').select('*').eq('is_hidden', false).order('created_at', { ascending: false }).limit(50),
          supabase
            .from('progress_posts')
            .select('*, entrepreneur_profiles(*)')
            .eq('is_hidden', false)
            .order('created_at', { ascending: false })
            .limit(50),
          supabase.from('follows').select('*').eq('investor_id', user.id),
          supabase.from('meeting_requests').select('*').eq('investor_id', user.id).order('created_at', { ascending: false }),
          supabase.from('messages').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(50),
        ]);
      setInvestor((investorProfile as InvestorProfile | null) ?? null);
      setProfiles((allProfiles as EntrepreneurProfile[]) ?? []);
      setPosts((allPosts as ProgressPost[]) ?? []);
      setFollows(followRows ?? []);
      setMeetings(meetingRows ?? []);
      setMessages(messageRows ?? []);
    }

    if (user.role === 'admin') {
      const [users, entrepreneurs, investors, progressPosts, postComments, reports, meetingRequests, inquiries] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('entrepreneur_profiles').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('investor_profiles').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('progress_posts').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('post_comments').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('meeting_requests').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('contact_inquiries').select('*').order('created_at', { ascending: false }).limit(50),
      ]);
      setAdminData({
        users: users.data ?? [],
        entrepreneurs: entrepreneurs.data ?? [],
        investors: investors.data ?? [],
        posts: progressPosts.data ?? [],
        comments: postComments.data ?? [],
        reports: reports.data ?? [],
        meetings: meetingRequests.data ?? [],
        inquiries: inquiries.data ?? [],
      });
    }

    const { data: notificationRows } = await supabase.from('notifications').select('*').eq('user_id', user.id).is('read_at', null).limit(20);
    setNotifications(notificationRows ?? []);
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setUser(null);
    setView('home');
  }

  async function openStartupProfile(nextProfile: EntrepreneurProfile) {
    setSelectedProfile(nextProfile);
    if (supabase) {
      const { data } = await supabase.from('startup_kpis').select('*').eq('entrepreneur_id', nextProfile.id).order('kpi_month', { ascending: true });
      setKpis((data as StartupKpi[]) ?? []);
    }
    setView('profile');
  }

  if (loading) {
    return <FullScreenMessage title="Leapを起動しています" body="認証状態を確認しています。" />;
  }

  if (!supabase) {
    return <SetupRequired />;
  }

  if ((!session || !user) && view === 'legal') {
    return <PublicLegalPage slug={legalSlug} onBack={() => setView('home')} />;
  }

  if (!session || !user) {
    return <AuthScreen onReady={loadUser} setLegal={(slug) => { setLegalSlug(slug); setView('legal'); }} />;
  }

  if (user.is_suspended) {
    return <FullScreenMessage title="アカウントは停止されています" body="管理者による確認が必要です。お問い合わせからご連絡ください。" />;
  }

  if (!user.profile_completed) {
    return <Onboarding user={user} onDone={loadUser} />;
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="glass fixed inset-y-0 left-0 z-20 hidden w-[260px] border-y-0 border-l-0 p-5 lg:block">
        <button className="neon-text text-3xl font-black" onClick={() => setView('home')}>Leap</button>
        <nav className="mt-8 grid gap-2">
          {nav.filter((item) => item.view !== 'admin' || user.role === 'admin').map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex min-h-11 items-center gap-3 rounded-2xl px-4 text-left text-sm ${view === item.view ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <p className="absolute bottom-5 left-5 right-5 text-xs leading-6 text-slate-500">
          Leapは投資判断を代行・推奨するサービスではありません。投資判断は各利用者の責任で行ってください。
        </p>
      </aside>

      <main className="min-w-0 px-4 pb-28 pt-5 sm:px-6 lg:col-start-2 lg:px-8">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-emerald-300">資本提携プラットフォーム</p>
            <h1 className="text-2xl font-black sm:text-3xl">{titleFor(view, user.role)}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="btn-secondary hidden h-11 px-3 text-xs sm:inline-flex"><Bell size={16} /> {notifications.length}</span>
            <button className="btn-secondary h-11 px-3" onClick={signOut}><LogOut size={17} /></button>
          </div>
        </header>

        {toast && <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{toast}</div>}

        {view === 'home' && user.role === 'entrepreneur' && (
          <EntrepreneurHome profile={profile} posts={posts} kpis={kpis} follows={follows} meetings={meetings} refresh={loadWorkspace} />
        )}
        {view === 'home' && user.role === 'investor' && (
          <InvestorHome currentUser={user} profiles={profiles} posts={posts} follows={follows} meetings={meetings} messages={messages} openProfile={openStartupProfile} setView={setView} />
        )}
        {view === 'home' && user.role === 'admin' && <AdminHome adminData={adminData} refresh={loadWorkspace} />}
        {view === 'search' && (
          <SearchPage
            query={query}
            setQuery={setQuery}
            profiles={profiles}
            refresh={loadWorkspace}
            openProfile={openStartupProfile}
          />
        )}
        {view === 'profile' && selectedProfile && (
          <StartupProfile profile={selectedProfile} currentUser={user} refresh={loadWorkspace} />
        )}
        {view === 'kpi' && <KpiDashboard profile={profile ?? selectedProfile} kpis={kpis} />}
        {view === 'messages' && <Messages currentUser={user} messages={messages} refresh={loadWorkspace} />}
        {view === 'admin' && user.role === 'admin' && <AdminHome adminData={adminData} refresh={loadWorkspace} />}
        {view === 'legal' && <LegalPage slug={legalSlug} currentUser={user} />}
        {view === 'launch' && <LaunchChecklist />}
      </main>

      <nav className="glass fixed bottom-3 left-3 right-3 z-30 grid grid-cols-5 gap-1 rounded-3xl p-2 lg:hidden">
        {nav.filter((item) => item.view !== 'admin' || user.role === 'admin').map((item) => (
          <button key={item.view} onClick={() => setView(item.view)} className={`grid min-h-12 place-items-center rounded-2xl ${view === item.view ? 'bg-white/12 text-white' : 'text-slate-400'}`} aria-label={item.label}>
            <item.icon size={21} />
          </button>
        ))}
      </nav>
    </div>
  );
}

function titleFor(view: View, role: UserRole) {
  if (view === 'home') return role === 'entrepreneur' ? '起業家ホーム' : role === 'investor' ? '投資家ホーム' : '管理者ホーム';
  const titles: Record<View, string> = {
    home: 'ホーム',
    search: '起業家検索',
    profile: '起業家プロフィール',
    post: '進捗投稿',
    kpi: 'KPIダッシュボード',
    messages: 'メッセージ',
    admin: '管理者ページ',
    legal: '法務・問い合わせ',
    launch: 'ローンチ前チェック',
  };
  return titles[view];
}

function FullScreenMessage({ title, body }: { title: string; body: string }) {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <section className="glass max-w-xl rounded-[28px] p-8 text-center">
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-4 leading-7 text-slate-300">{body}</p>
      </section>
    </main>
  );
}

function SetupRequired() {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <section className="glass max-w-2xl rounded-[28px] p-8">
        <p className="text-sm font-bold text-emerald-300">初期設定が必要です</p>
        <h1 className="mt-3 text-3xl font-black">データベース接続を設定してください</h1>
        <p className="mt-4 leading-7 text-slate-300">
          初期版ではサンプルデータを表示しません。データベースプロジェクトを作成し、<code className="rounded bg-white/10 px-1">supabase/schema.sql</code> を実行してから、<code className="rounded bg-white/10 px-1">.env.local</code> に接続先と公開用キーを設定してください。
        </p>
      <pre className="mt-5 overflow-auto rounded-2xl bg-black/40 p-4 text-xs text-slate-300">接続先=...
公開用キー=...</pre>
      </section>
    </main>
  );
}

function AuthScreen({ onReady, setLegal }: { onReady: () => Promise<void>; setLegal: (slug: LegalSlug) => void }) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Exclude<UserRole, 'admin'>>('entrepreneur');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function submit() {
    if (!supabase) return;
    if (cooldown > 0 && mode !== 'login') return;
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
        if (error) throw error;
        setMessage('パスワード再設定メールを送信しました。');
        setCooldown(60);
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: location.origin,
            data: { role },
          },
        });
        if (error) throw error;
        if (data.session && data.user) {
          await supabase.from('users').upsert({ id: data.user.id, email, role, profile_completed: false });
        }
        setMessage('確認メールを送信しました。メール認証後にログインしてください。');
        setCooldown(60);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await onReady();
      }
    } catch (error: any) {
      setMessage(toJapaneseError(error.message));
      if (mode !== 'login') setCooldown(60);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen gap-5 p-4 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
      <section className="glass relative overflow-hidden rounded-[30px] p-7 lg:p-10">
        <div className="neon-text text-4xl font-black">Leap</div>
        <h1 className="mt-8 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">起業家の成長を、投資家が継続的に観察できる場所へ。</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">進捗投稿、KPI、課題、投資家コメント、面談依頼を実データでつなぐ資本提携プラットフォームです。</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <InfoTile icon={ShieldCheck} title="認証と審査" body="本人確認・法人確認・運営面談の状態を明確化" />
          <InfoTile icon={Gauge} title="KPI中心" body="売上、導入社数、月間利用者数、継続率で成長を判断" />
          <InfoTile icon={MessageCircle} title="関係構築" body="コメント、メッセージ、面談依頼を一気通貫" />
        </div>
      </section>
      <section className="glass self-center rounded-[26px] p-6">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-black/30 p-1">
          {(['login', 'signup', 'reset'] as const).map((item) => (
            <button key={item} onClick={() => setMode(item)} className={`rounded-xl px-2 py-3 text-sm ${mode === item ? 'bg-white/12 text-white' : 'text-slate-400'}`}>
              {item === 'login' ? 'ログイン' : item === 'signup' ? '登録' : '再設定'}
            </button>
          ))}
        </div>
        <h2 className="mt-6 text-2xl font-black">{mode === 'login' ? 'ログイン' : mode === 'signup' ? 'メールアドレス登録' : 'パスワード再設定'}</h2>
        <div className="mt-5 grid gap-4">
          <label className="label">メールアドレス<input className="field" value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></label>
          {mode !== 'reset' && <label className="label">パスワード<input className="field" value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></label>}
          {mode === 'signup' && (
            <label className="label">ユーザー種別
              <select className="field" value={role} onChange={(e) => setRole(e.target.value as Exclude<UserRole, 'admin'>)}>
                <option value="entrepreneur">起業家</option>
                <option value="investor">投資家</option>
              </select>
              <span className="text-xs leading-5 text-slate-500">管理者アカウントは運営側でのみ発行します。</span>
            </label>
          )}
          {mode === 'signup' && (
            <p className="rounded-2xl bg-cyan-400/10 p-3 text-xs leading-6 text-cyan-100">
              開発中に確認メールの制限が出る場合は、Supabaseの認証設定でメール確認を一時的にオフにすると、すぐ登録テストできます。本番公開時はメール確認をオンに戻してください。
            </p>
          )}
          <button className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={busy || (cooldown > 0 && mode !== 'login')} onClick={submit}>
            {busy ? '処理中...' : cooldown > 0 && mode !== 'login' ? `再送信まで ${cooldown}秒` : mode === 'login' ? 'ログイン' : mode === 'signup' ? '登録する' : '再設定メールを送る'}
          </button>
          {message && <p className="rounded-2xl bg-white/8 p-3 text-sm text-slate-200">{message}</p>}
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-400">
          {Object.keys(legalCopy).map((slug) => <button key={slug} onClick={() => setLegal(slug as LegalSlug)}>{legalCopy[slug as LegalSlug].title}</button>)}
        </div>
      </section>
    </main>
  );
}

function Onboarding({ user, onDone }: { user: AppUser; onDone: () => Promise<void> }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const entrepreneurSteps = ['基本情報', '事業情報', '資金調達情報', 'KPI情報', '初回進捗投稿'];
  const investorSteps = ['基本情報', '投資情報', '利用目的'];
  const steps = user.role === 'entrepreneur' ? entrepreneurSteps : user.role === 'investor' ? investorSteps : ['運営アカウント設定'];

  function set(name: string, value: any) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function finish() {
    if (!supabase) return;
    setBusy(true);
    setMessage('');
    try {
      if (user.role === 'entrepreneur') {
        const { data: profile, error } = await supabase
          .from('entrepreneur_profiles')
          .upsert({
            user_id: user.id,
            company_name: form.company_name,
            founder_name: form.founder_name,
            location: form.location,
            industry: form.industry,
            founded_month: form.founded_month,
            employee_count: numberOrNull(form.employee_count),
            tagline: form.tagline,
            overview: form.overview,
            problem: form.problem,
            solution: form.solution,
            target_customer: form.target_customer,
            business_model: form.business_model,
            advantage: form.advantage,
            current_phase: form.current_phase,
            fundraising_amount: numberOrNull(form.fundraising_amount),
            fund_usage: form.fund_usage,
            investor_support: form.investor_support,
          })
          .select()
          .single();
        if (error) throw error;
        await supabase.from('startup_kpis').insert({
          entrepreneur_id: profile.id,
          user_id: user.id,
          kpi_month: new Date().toISOString().slice(0, 10),
          monthly_revenue: numberOrNull(form.monthly_revenue),
          customer_count: numberOrNull(form.customer_count),
          mau: numberOrNull(form.mau),
          retention_rate: numberOrNull(form.retention_rate),
          gross_margin: numberOrNull(form.gross_margin),
        });
        await supabase.from('progress_posts').insert({
          entrepreneur_id: profile.id,
          user_id: user.id,
          did_today: form.did_today,
          metric_change: form.metric_change,
          issue: form.issue,
          next_action: form.next_action,
          related_kpi: form.related_kpi,
          tags: splitTags(form.tags),
          visibility: form.visibility ?? 'public',
        });
      } else if (user.role === 'investor') {
        const { error } = await supabase.from('investor_profiles').upsert({
          user_id: user.id,
          full_name: form.full_name,
          company_name: form.company_name,
          position: form.position,
          location: form.location,
          investment_fields: form.investment_fields,
          investable_amount: numberOrNull(form.investable_amount),
          interested_phases: form.interested_phases,
          past_investments: form.past_investments,
          support_areas: form.support_areas,
          purpose: form.purpose ?? [],
        });
        if (error) throw error;
      }
      await supabase.from('users').update({ profile_completed: true }).eq('id', user.id);
      await onDone();
    } catch (error: any) {
      setMessage(toJapaneseError(error.message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-4xl content-center p-4">
      <section className="glass rounded-[28px] p-6">
        <p className="text-sm font-bold text-emerald-300">初回オンボーディング</p>
        <h1 className="mt-2 text-3xl font-black">{steps[step]}</h1>
        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {steps.map((item, index) => <div key={item} className={`h-2 rounded-full ${index <= step ? 'bg-cyan-300' : 'bg-white/10'}`} />)}
        </div>
        <div className="mt-6 grid gap-4">
          {user.role === 'entrepreneur' ? <EntrepreneurStep step={step} form={form} set={set} /> : <InvestorStep step={step} form={form} set={set} />}
        </div>
        {message && <p className="mt-4 rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-100">{message}</p>}
        <div className="mt-6 flex gap-3">
          <button className="btn-secondary" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>戻る</button>
          {step < steps.length - 1 ? (
            <button className="btn-primary flex-1" onClick={() => setStep((s) => s + 1)}>次へ</button>
          ) : (
            <button className="btn-primary flex-1" disabled={busy} onClick={finish}>{busy ? '保存中...' : 'ローンチ設定を完了'}</button>
          )}
        </div>
      </section>
    </main>
  );
}

function EntrepreneurStep({ step, form, set }: { step: number; form: Record<string, any>; set: (name: string, value: any) => void }) {
  if (step === 0) return <FieldGrid fields={['company_name:会社名', 'founder_name:代表者名', 'location:所在地', 'industry:業界', 'founded_month:設立年月', 'employee_count:従業員数']} form={form} set={set} />;
  if (step === 1) return <FieldGrid textarea fields={['tagline:一言説明', 'overview:事業概要', 'problem:解決している課題', 'solution:提供サービス', 'target_customer:ターゲット顧客', 'business_model:ビジネスモデル', 'advantage:競合優位性']} form={form} set={set} />;
  if (step === 2) return (
    <>
      <label className="label">現在のフェーズ<select className="field" value={form.current_phase ?? ''} onChange={(e) => set('current_phase', e.target.value)}><option value="">選択</option>{phaseOptions.map((p) => <option key={p}>{p}</option>)}</select></label>
      <FieldGrid textarea fields={['fundraising_amount:調達希望額（円）', 'fund_usage:資金用途', 'investor_support:投資家に求める支援']} form={form} set={set} />
    </>
  );
  if (step === 3) return <FieldGrid fields={['monthly_revenue:月間売上（円）', 'customer_count:導入社数', 'mau:月間利用者数', 'retention_rate:継続率（%）', 'gross_margin:粗利率（%）']} form={form} set={set} />;
  return (
    <>
      <p className="rounded-2xl bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-100">投資家は、派手な発表よりも「何を実行し、どの数字が動き、何が課題で、次にどう検証するか」を見ています。</p>
      <FieldGrid textarea fields={['did_today:今日やったこと', 'metric_change:数値の変化', 'issue:課題', 'next_action:次にやること', 'related_kpi:関連KPI', 'tags:タグ（カンマ区切り）']} form={form} set={set} />
      <label className="label">公開範囲<select className="field" value={form.visibility ?? 'public'} onChange={(e) => set('visibility', e.target.value)}>{visibilityOptions.map((v) => <option key={v} value={v}>{visibilityLabels[v]}</option>)}</select></label>
    </>
  );
}

function InvestorStep({ step, form, set }: { step: number; form: Record<string, any>; set: (name: string, value: any) => void }) {
  if (step === 0) return <FieldGrid fields={['full_name:氏名', 'company_name:会社名', 'position:役職', 'location:所在地']} form={form} set={set} />;
  if (step === 1) return <FieldGrid textarea fields={['investment_fields:投資領域', 'investable_amount:投資可能額（円）', 'interested_phases:興味のあるフェーズ', 'past_investments:過去の投資実績', 'support_areas:支援できる内容']} form={form} set={set} />;
  return (
    <div className="grid gap-3">
      {['投資先を探したい', '事業提携先を探したい', 'M&A候補を探したい', '起業家を支援したい'].map((item) => (
        <label key={item} className="flex items-center gap-3 rounded-2xl bg-white/5 p-4">
          <input type="checkbox" onChange={(e) => {
            const next = new Set(form.purpose ?? []);
            if (e.target.checked) next.add(item); else next.delete(item);
            set('purpose', Array.from(next));
          }} />
          {item}
        </label>
      ))}
    </div>
  );
}

function FieldGrid({ fields, form, set, textarea }: { fields: string[]; form: Record<string, any>; set: (name: string, value: any) => void; textarea?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const [name, label] = field.split(':');
        return (
          <label className="label" key={name}>
            {label}
            {textarea ? <textarea className="field min-h-28" value={form[name] ?? ''} onChange={(e) => set(name, e.target.value)} /> : <input className="field" value={form[name] ?? ''} onChange={(e) => set(name, e.target.value)} />}
          </label>
        );
      })}
    </div>
  );
}

function EntrepreneurHome({ profile, posts, kpis, follows, meetings, refresh }: { profile: EntrepreneurProfile | null; posts: ProgressPost[]; kpis: StartupKpi[]; follows: any[]; meetings: any[]; refresh: () => Promise<void> }) {
  if (!profile) return <EmptyState title="プロフィールが未作成です" body="起業家プロフィールを作成すると、投資家が事業進捗を継続的に確認できます。" cta="オンボーディングを確認" />;
  const completeness = calcCompleteness(profile);
  return (
    <div className="grid gap-5">
      <section className="glass rounded-[28px] p-6">
        <p className="text-sm font-bold text-emerald-300">今日やるべきこと</p>
        <h2 className="mt-2 text-3xl font-black">{profile.company_name}</h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-300">投資家に評価される投稿は、実行内容、数値変化、課題、次の検証が揃っています。小さな進捗でも、継続して残すことで信頼の材料になります。</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Metric label="プロフィール完成度" value={`${completeness}%`} icon={CheckCircle2} />
          <Metric label="フォロワー数" value={`${follows.length}`} icon={UsersRound} />
          <Metric label="面談リクエスト" value={`${meetings.length}`} icon={CalendarClock} />
          <Metric label="進捗投稿" value={`${posts.length}`} icon={FileText} />
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <PostComposer profile={profile} refresh={refresh} />
        <KpiComposer profile={profile} refresh={refresh} />
      </div>
      <PitchUpload profile={profile} refresh={refresh} />
      <section className="grid gap-3">
        <h3 className="text-xl font-black">進捗ログ</h3>
        {posts.length === 0 ? <EmptyState title="まだ進捗投稿がありません。まずは今日やったことを投稿しましょう。" cta="進捗を投稿する" /> : posts.map((post) => <PostCard key={post.id} post={post} />)}
      </section>
      <KpiDashboard profile={profile} kpis={kpis} compact />
    </div>
  );
}

function InvestorHome({ currentUser, profiles, posts, follows, meetings, messages, openProfile, setView }: { currentUser: AppUser; profiles: EntrepreneurProfile[]; posts: ProgressPost[]; follows: any[]; meetings: any[]; messages: any[]; openProfile: (p: EntrepreneurProfile) => void; setView: (v: View) => void }) {
  return (
    <div className="grid gap-5">
      <section className="glass rounded-[28px] p-6">
        <p className="text-sm font-bold text-emerald-300">投資判断の見方</p>
        <h2 className="mt-2 text-3xl font-black">有望な起業家は、投稿の継続性とKPIの変化で見つける。</h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-300">会社概要だけではなく、毎週の進捗、課題への向き合い方、数値の改善速度、投資家コメントへの返信を確認してください。</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Metric label="フォロー中" value={`${follows.length}`} icon={Heart} />
          <Metric label="新着進捗" value={`${posts.length}`} icon={TrendingUp} />
          <Metric label="面談状況" value={`${meetings.length}`} icon={CalendarClock} />
          <Metric label="未返信メッセージ" value={`${messages.filter((m) => !m.read_at).length}`} icon={Mail} />
        </div>
      </section>
      {follows.length === 0 && <EmptyState title="まだフォロー中の起業家はいません。興味のある起業家を探しましょう。" cta="起業家を探す" onClick={() => setView('search')} />}
      <section className="grid gap-3">
        <h3 className="text-xl font-black">興味領域に合う起業家</h3>
        {profiles.length === 0 ? <EmptyState title="閲覧できる起業家がまだいません" body="起業家が登録すると、検索とウォッチリスト追加が利用できます。" /> : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{profiles.map((p) => <StartupCard key={p.id} profile={p} onClick={() => openProfile(p)} />)}</div>
        )}
      </section>
      <section className="grid gap-3">
        <h3 className="text-xl font-black">新着進捗ログ</h3>
        {posts.length === 0 ? <EmptyState title="新着進捗ログはまだありません" body="フォローした起業家の進捗がここに表示されます。" /> : posts.map((post) => <PostCard key={post.id} post={post} currentUser={currentUser} />)}
      </section>
    </div>
  );
}

function SearchPage({ query, setQuery, profiles, openProfile, refresh }: { query: string; setQuery: (q: string) => void; profiles: EntrepreneurProfile[]; openProfile: (p: EntrepreneurProfile) => void; refresh: () => Promise<void> }) {
  const [filters, setFilters] = useState({ industry: '', location: '', phase: '', verified: false, interviewed: false });
  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const text = `${p.company_name} ${p.industry ?? ''} ${p.location ?? ''} ${p.tagline ?? ''}`.toLowerCase();
      return (!query || text.includes(query.toLowerCase()))
        && (!filters.industry || p.industry?.includes(filters.industry))
        && (!filters.location || p.location?.includes(filters.location))
        && (!filters.phase || p.current_phase === filters.phase)
        && (!filters.verified || p.verified_identity || p.verified_corporate)
        && (!filters.interviewed || p.verified_interview);
    });
  }, [profiles, query, filters]);
  return (
    <div className="grid gap-5">
      <section className="glass rounded-[24px] p-5">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4">
          <Search size={18} />
          <input className="field border-0 bg-transparent" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="キーワード、業界、地域で検索" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input className="field" placeholder="業界" value={filters.industry} onChange={(e) => setFilters({ ...filters, industry: e.target.value })} />
          <input className="field" placeholder="地域" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
          <select className="field" value={filters.phase} onChange={(e) => setFilters({ ...filters, phase: e.target.value })}><option value="">フェーズすべて</option>{phaseOptions.map((p) => <option key={p}>{p}</option>)}</select>
          <label className="pill"><input type="checkbox" onChange={(e) => setFilters({ ...filters, verified: e.target.checked })} /> 認証済み</label>
          <label className="pill"><input type="checkbox" onChange={(e) => setFilters({ ...filters, interviewed: e.target.checked })} /> 運営面談済み</label>
        </div>
      </section>
      {filtered.length === 0 ? <EmptyState title="条件に一致する起業家はいません" body="検索条件を広げるか、起業家の登録を待ってください。" /> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((p) => <StartupCard key={p.id} profile={p} onClick={() => openProfile(p)} />)}</div>}
    </div>
  );
}

function StartupProfile({ profile, currentUser, refresh }: { profile: EntrepreneurProfile; currentUser: AppUser; refresh: () => Promise<void> }) {
  const [note, setNote] = useState('');
  const [meetingMessage, setMeetingMessage] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [comment, setComment] = useState('');

  async function follow() {
    if (!supabase) return;
    await supabase.from('follows').upsert({ entrepreneur_id: profile.id, investor_id: currentUser.id });
    await supabase.from('notifications').insert({ user_id: profile.user_id, type: 'follow', body: '投資家があなたをフォローしました。' });
    await refresh();
  }

  async function watch() {
    if (!supabase) return;
    await supabase.from('watchlists').upsert({ entrepreneur_id: profile.id, investor_id: currentUser.id, memo: note });
    await refresh();
  }

  async function requestMeeting() {
    if (!supabase) return;
    await supabase.from('meeting_requests').insert({ entrepreneur_id: profile.id, investor_id: currentUser.id, message: meetingMessage, proposed_at: meetingDate || null });
    await supabase.from('notifications').insert({ user_id: profile.user_id, type: 'meeting_request', body: '面談リクエストが届きました。' });
    setMeetingMessage('');
    setMeetingDate('');
    await refresh();
  }

  async function sendMessage() {
    if (!supabase) return;
    await supabase.from('messages').insert({ sender_id: currentUser.id, receiver_id: profile.user_id, body: comment });
    await supabase.from('notifications').insert({ user_id: profile.user_id, type: 'message', body: '新しいメッセージが届きました。' });
    setComment('');
  }

  return (
    <div className="grid gap-5">
      <section className="glass overflow-hidden rounded-[28px] p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-cyan-300 via-violet-400 to-emerald-300 text-2xl font-black text-slate-950">{profile.company_name.slice(0, 1)}</div>
            <p className="text-sm font-bold text-emerald-300">起業家プロフィール</p>
            <h2 className="mt-2 text-4xl font-black">{profile.company_name}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">{profile.tagline || '一言説明は未入力です。'}</p>
          </div>
          {currentUser.role === 'investor' && (
            <div className="grid gap-2 sm:grid-cols-2">
              <button className="btn-primary" onClick={follow}><Heart size={17} /> フォロー</button>
              <button className="btn-secondary" onClick={watch}><Bookmark size={17} /> ウォッチ</button>
            </div>
          )}
        </div>
        <BadgeRow profile={profile} />
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Metric label="現在フェーズ" value={profile.current_phase ?? '未入力'} icon={Rocket} />
          <Metric label="調達希望額" value={yen(profile.fundraising_amount)} icon={CircleDollarSign} />
          <Metric label="業界" value={profile.industry ?? '未入力'} icon={Building2} />
          <Metric label="所在地" value={profile.location ?? '未入力'} icon={UserRound} />
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <section className="glass rounded-[24px] p-5">
          <h3 className="text-xl font-black">事業概要</h3>
          <Detail title="代表者名" body={profile.founder_name} />
          <Detail title="事業概要" body={profile.overview} />
          <Detail title="課題" body={profile.problem} />
          <Detail title="解決策" body={profile.solution} />
          <Detail title="ビジネスモデル" body={profile.business_model} />
          <Detail title="資金用途" body={profile.fund_usage} />
        </section>
        {currentUser.role === 'investor' && (
          <section className="glass rounded-[24px] p-5">
            <h3 className="text-xl font-black">投資家アクション</h3>
            <label className="label mt-4">投資メモ<textarea className="field min-h-24" value={note} onChange={(e) => setNote(e.target.value)} /></label>
            <label className="label mt-4">面談メッセージ<textarea className="field min-h-24" value={meetingMessage} onChange={(e) => setMeetingMessage(e.target.value)} /></label>
            <label className="label mt-4">面談希望日時<input className="field" type="datetime-local" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} /></label>
            <button className="btn-primary mt-4 w-full" onClick={requestMeeting}><CalendarClock size={17} /> 面談リクエスト</button>
            <label className="label mt-4">メッセージ<textarea className="field min-h-24" value={comment} onChange={(e) => setComment(e.target.value)} /></label>
            <button className="btn-secondary mt-4 w-full" onClick={sendMessage}><Send size={17} /> メッセージ送信</button>
          </section>
        )}
      </div>
    </div>
  );
}

function PostComposer({ profile, refresh }: { profile: EntrepreneurProfile; refresh: () => Promise<void> }) {
  const [form, setForm] = useState<Record<string, string>>({ visibility: 'public' });
  async function submit() {
    const { error } = await supabase!.from('progress_posts').insert({
      entrepreneur_id: profile.id,
      user_id: profile.user_id,
      did_today: form.did_today,
      metric_change: form.metric_change,
      issue: form.issue,
      next_action: form.next_action,
      related_kpi: form.related_kpi,
      tags: splitTags(form.tags),
      visibility: form.visibility,
    });
    if (!error) {
      setForm({ visibility: 'public' });
      await refresh();
    }
  }
  return (
    <section className="glass rounded-[24px] p-5">
      <h3 className="text-xl font-black">進捗投稿</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">投資家が見たいのは、実行、数値、課題、次の検証です。</p>
      <FieldGrid textarea fields={['did_today:今日やったこと', 'metric_change:数値の変化', 'issue:課題', 'next_action:次にやること', 'related_kpi:関連KPI', 'tags:タグ（カンマ区切り）']} form={form} set={(n, v) => setForm({ ...form, [n]: v })} />
      <label className="label mt-4">公開範囲<select className="field" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>{visibilityOptions.map((v) => <option key={v} value={v}>{visibilityLabels[v]}</option>)}</select></label>
      <button className="btn-primary mt-4 w-full" onClick={submit}><Plus size={17} /> 進捗を投稿する</button>
    </section>
  );
}

function KpiComposer({ profile, refresh }: { profile: EntrepreneurProfile; refresh: () => Promise<void> }) {
  const [form, setForm] = useState<Record<string, string>>({ kpi_month: new Date().toISOString().slice(0, 10) });
  async function submit() {
    await supabase!.from('startup_kpis').insert({
      entrepreneur_id: profile.id,
      user_id: profile.user_id,
      kpi_month: form.kpi_month,
      monthly_revenue: numberOrNull(form.monthly_revenue),
      customer_count: numberOrNull(form.customer_count),
      mau: numberOrNull(form.mau),
      retention_rate: numberOrNull(form.retention_rate),
      gross_margin: numberOrNull(form.gross_margin),
    });
    setForm({ kpi_month: new Date().toISOString().slice(0, 10) });
    await refresh();
  }
  return (
    <section className="glass rounded-[24px] p-5">
      <h3 className="text-xl font-black">KPI更新</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="label">対象日<input className="field" type="date" value={form.kpi_month} onChange={(e) => setForm({ ...form, kpi_month: e.target.value })} /></label>
        {['monthly_revenue:月間売上（円）', 'customer_count:導入社数', 'mau:月間利用者数', 'retention_rate:継続率（%）', 'gross_margin:粗利率（%）'].map((f) => {
          const [name, label] = f.split(':');
          return <label className="label" key={name}>{label}<input className="field" value={form[name] ?? ''} onChange={(e) => setForm({ ...form, [name]: e.target.value })} /></label>;
        })}
      </div>
      <button className="btn-primary mt-4 w-full" onClick={submit}><Gauge size={17} /> KPIを更新する</button>
    </section>
  );
}

function PitchUpload({ profile, refresh }: { profile: EntrepreneurProfile; refresh: () => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  async function upload() {
    if (!supabase || !file) return;
    const path = `${profile.user_id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('pitch-materials').upload(path, file, { upsert: false });
    if (error) {
      setMessage(toJapaneseError(error.message));
      return;
    }
    await supabase.from('pitch_materials').insert({ entrepreneur_id: profile.id, user_id: profile.user_id, file_path: path, title: title || file.name });
    setFile(null);
    setTitle('');
    setMessage('ピッチ資料を保存しました。');
    await refresh();
  }
  return (
    <section className="glass rounded-[24px] p-5">
      <h3 className="text-xl font-black">ピッチ資料</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">投資家が面談前に確認できる資料を安全なファイル保管場所へ保存します。</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input className="field" placeholder="資料タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="field" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button className="btn-primary" onClick={upload}><FileText size={17} /> 保存</button>
      </div>
      {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
    </section>
  );
}

function KpiDashboard({ profile, kpis, compact }: { profile: EntrepreneurProfile | null; kpis: StartupKpi[]; compact?: boolean }) {
  if (!profile) return <EmptyState title="KPIを表示するプロフィールがありません" />;
  if (kpis.length === 0) return <EmptyState title="KPIがまだ登録されていません" body="月間売上、導入社数、月間利用者数、継続率を更新するとグラフが表示されます。" />;
  const data = kpis.map((k) => ({ month: k.kpi_month?.slice(5, 10), revenue: k.monthly_revenue ?? 0, customers: k.customer_count ?? 0, mau: k.mau ?? 0, retention: k.retention_rate ?? 0 }));
  const latest = kpis[kpis.length - 1];
  return (
    <section className={compact ? 'grid gap-4' : 'grid gap-5'}>
      {!compact && <h2 className="text-2xl font-black">{profile.company_name} のKPI</h2>}
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="月間売上" value={yen(latest.monthly_revenue)} icon={CircleDollarSign} />
        <Metric label="導入社数" value={`${latest.customer_count ?? 0}`} icon={Building2} />
        <Metric label="月間利用者数" value={`${latest.mau ?? 0}`} icon={UsersRound} />
        <Metric label="継続率" value={percent(latest.retention_rate)} icon={CheckCircle2} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Chart title="売上推移" data={data} keyName="revenue" />
        <Chart title="導入社数推移" data={data} keyName="customers" />
        <Chart title="月間利用者数推移" data={data} keyName="mau" />
        <Chart title="継続率推移" data={data} keyName="retention" />
      </div>
    </section>
  );
}

function AdminHome({ adminData, refresh }: { adminData: Record<string, any[]>; refresh: () => Promise<void> }) {
  async function update(table: string, id: string, patch: Record<string, any>, action: string) {
    await supabase!.from(table).update(patch).eq('id', id);
    await supabase!.from('admin_actions').insert({ target_type: table, target_id: id, action });
    await refresh();
  }
  const reports = adminData.reports ?? [];
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="ユーザー一覧" value={`${adminData.users?.length ?? 0}`} icon={UsersRound} />
        <Metric label="起業家一覧" value={`${adminData.entrepreneurs?.length ?? 0}`} icon={Building2} />
        <Metric label="投稿一覧" value={`${adminData.posts?.length ?? 0}`} icon={FileText} />
        <Metric label="通報一覧" value={`${reports.length}`} icon={Flag} />
      </div>
      {reports.length === 0 && <EmptyState title="現在確認が必要な通報はありません。" />}
      <AdminTable title="ユーザー承認・停止" rows={adminData.users ?? []} render={(row) => (
        <AdminRow key={row.id} title={row.email ?? row.id} meta={`${roleLabels[row.role as UserRole] ?? row.role} / プロフィール: ${row.profile_completed ? '完了' : '未完了'}`}>
          <button className="btn-secondary" onClick={() => update('users', row.id, { is_suspended: !row.is_suspended }, row.is_suspended ? 'ユーザー停止解除' : 'ユーザー停止')}>{row.is_suspended ? '停止解除' : '停止'}</button>
        </AdminRow>
      )} />
      <AdminTable title="起業家審査・バッジ付与" rows={adminData.entrepreneurs ?? []} render={(row) => (
        <AdminRow key={row.id} title={row.company_name} meta={row.industry ?? '業界未入力'}>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_identity: !row.verified_identity }, '本人確認ステータス変更')}>本人確認</button>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_corporate: !row.verified_corporate }, '法人確認ステータス変更')}>法人確認</button>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_interview: !row.verified_interview }, '運営面談済みバッジ付与')}>面談済み</button>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_revenue: !row.verified_revenue }, '売上確認済みバッジ付与')}>売上確認</button>
        </AdminRow>
      )} />
      <AdminTable title="投稿非表示" rows={adminData.posts ?? []} render={(row) => (
        <AdminRow key={row.id} title={row.did_today} meta={new Date(row.created_at).toLocaleString('ja-JP')}>
          <button className="btn-secondary" onClick={() => update('progress_posts', row.id, { is_hidden: !row.is_hidden }, '投稿非表示')}>{row.is_hidden ? '再表示' : '非表示'}</button>
        </AdminRow>
      )} />
    </div>
  );
}

function Messages({ currentUser, messages, refresh }: { currentUser: AppUser; messages: any[]; refresh: () => Promise<void> }) {
  async function markRead(id: string) {
    await supabase!.from('messages').update({ read_at: new Date().toISOString() }).eq('id', id);
    await refresh();
  }
  return (
    <section className="grid gap-3">
      {messages.length === 0 ? <EmptyState title="メッセージはまだありません" body="フォローや面談リクエスト後の1対1チャットがここに表示されます。" /> : messages.map((m) => (
        <article key={m.id} className="glass flex items-center justify-between gap-3 rounded-2xl p-4">
          <div><p className="font-bold">{m.body}</p><span className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString('ja-JP')}</span></div>
          {m.receiver_id === currentUser.id && !m.read_at && <button className="btn-secondary" onClick={() => markRead(m.id)}>既読</button>}
        </article>
      ))}
    </section>
  );
}

function LegalPage({ slug, currentUser }: { slug: LegalSlug; currentUser: AppUser }) {
  const [body, setBody] = useState('');
  const [email, setEmail] = useState('');
  async function submit(category: string) {
    await supabase!.from('contact_inquiries').insert({ user_id: currentUser.id, email, category, body });
    setBody('');
  }
  return (
    <section className="glass rounded-[28px] p-6">
      <h2 className="text-3xl font-black">{legalCopy[slug].title}</h2>
      <p className="mt-4 leading-8 text-slate-300">{legalCopy[slug].body}</p>
      {(slug === 'contact' || slug === 'report') && (
        <div className="mt-6 grid gap-4">
          <input className="field" placeholder="返信先メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} />
          <textarea className="field min-h-36" placeholder="内容" value={body} onChange={(e) => setBody(e.target.value)} />
          <button className="btn-primary" onClick={() => submit(slug)}>送信する</button>
        </div>
      )}
    </section>
  );
}

function PublicLegalPage({ slug, onBack }: { slug: LegalSlug; onBack: () => void }) {
  const [body, setBody] = useState('');
  const [email, setEmail] = useState('');
  async function submit(category: string) {
    await supabase!.from('contact_inquiries').insert({ email, category, body });
    setBody('');
  }
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <section className="glass max-w-3xl rounded-[28px] p-6">
        <button className="btn-secondary mb-5" onClick={onBack}>ログインへ戻る</button>
        <h1 className="text-3xl font-black">{legalCopy[slug].title}</h1>
        <p className="mt-4 leading-8 text-slate-300">{legalCopy[slug].body}</p>
        {(slug === 'contact' || slug === 'report') && (
          <div className="mt-6 grid gap-4">
            <input className="field" placeholder="返信先メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} />
            <textarea className="field min-h-36" placeholder="内容" value={body} onChange={(e) => setBody(e.target.value)} />
            <button className="btn-primary" onClick={() => submit(slug)}>送信する</button>
          </div>
        )}
      </section>
    </main>
  );
}

function LaunchChecklist() {
  const items = ['認証が動くか', '起業家登録ができるか', '投資家登録ができるか', '進捗投稿ができるか', 'コメントができるか', 'フォローができるか', '面談リクエストができるか', '管理者が投稿を非表示にできるか', 'スマホで崩れていないか', '空状態が分かりやすいか'];
  return <section className="glass rounded-[24px] p-5"><h2 className="text-2xl font-black">ローンチ前チェック項目</h2><div className="mt-5 grid gap-3">{items.map((item) => <label key={item} className="flex items-center gap-3 rounded-2xl bg-white/5 p-4"><input type="checkbox" /> {item}</label>)}</div></section>;
}

function InfoTile({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/6 p-4"><Icon className="text-cyan-300" size={20} /><b className="mt-3 block">{title}</b><p className="mt-1 text-sm leading-6 text-slate-400">{body}</p></div>;
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return <div className="glass rounded-2xl p-4"><Icon className="text-cyan-300" size={18} /><span className="mt-3 block text-xs text-slate-400">{label}</span><b className="mt-1 block text-xl">{value}</b></div>;
}

function EmptyState({ title, body, cta, onClick }: { title: string; body?: string; cta?: string; onClick?: () => void }) {
  return <section className="glass rounded-[24px] p-6 text-center"><AlertTriangle className="mx-auto text-cyan-300" /><h3 className="mt-3 text-xl font-black">{title}</h3>{body && <p className="mx-auto mt-2 max-w-xl leading-7 text-slate-400">{body}</p>}{cta && <button className="btn-primary mt-5" onClick={onClick}>{cta}</button>}</section>;
}

function StartupCard({ profile, onClick }: { profile: EntrepreneurProfile; onClick: () => void }) {
  return (
    <button className="glass rounded-[24px] p-5 text-left transition hover:border-cyan-300/50" onClick={onClick}>
      <div className="flex items-center justify-between gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 via-violet-400 to-emerald-300 font-black text-slate-950">{profile.company_name.slice(0, 1)}</div><ChevronRight /></div>
      <h3 className="mt-4 text-xl font-black">{profile.company_name}</h3>
      <p className="mt-2 line-clamp-3 min-h-16 leading-7 text-slate-300">{profile.tagline || profile.overview || '事業説明は未入力です。'}</p>
      <BadgeRow profile={profile} />
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400"><span>業界 <b className="block text-white">{profile.industry ?? '未入力'}</b></span><span>フェーズ <b className="block text-white">{profile.current_phase ?? '未入力'}</b></span></div>
    </button>
  );
}

function BadgeRow({ profile }: { profile: EntrepreneurProfile }) {
  const badges = [
    profile.verified_identity && '本人確認済み',
    profile.verified_corporate && '法人確認済み',
    profile.verified_interview && '運営面談済み',
    profile.verified_revenue && '売上確認済み',
    profile.is_fast_growing && '急成長中',
  ].filter(Boolean);
  return <div className="mt-4 flex flex-wrap gap-2">{badges.length ? badges.map((b) => <span className="pill" key={String(b)}><BadgeCheck size={13} /> {b}</span>) : <span className="pill">認証審査前</span>}</div>;
}

function PostCard({ post, currentUser }: { post: ProgressPost; currentUser?: AppUser }) {
  const [comment, setComment] = useState('');
  async function like() {
    if (!supabase || !currentUser) return;
    await supabase.from('post_likes').upsert({ post_id: post.id, user_id: currentUser.id });
  }
  async function save() {
    if (!supabase || !currentUser) return;
    await supabase.from('watchlists').upsert({ entrepreneur_id: post.entrepreneur_id, investor_id: currentUser.id, memo: `保存した投稿: ${post.did_today.slice(0, 80)}` });
  }
  async function report() {
    if (!supabase || !currentUser) return;
    await supabase.from('reports').insert({ reporter_id: currentUser.id, target_type: 'progress_posts', target_id: post.id, reason: '投稿内容の確認依頼' });
  }
  async function submitComment() {
    if (!supabase || !currentUser || !comment.trim()) return;
    await supabase.from('post_comments').insert({ post_id: post.id, user_id: currentUser.id, body: comment });
    await supabase.from('notifications').insert({ user_id: post.user_id, type: 'comment', body: '進捗投稿にコメントがつきました。' });
    setComment('');
  }
  return (
    <article className="glass rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm text-slate-400">{new Date(post.created_at).toLocaleString('ja-JP')} / {visibilityLabels[post.visibility] ?? post.visibility}</p><h3 className="mt-2 text-xl font-black">{post.did_today}</h3></div>
        <span className="pill"><TrendingUp size={13} /> 進捗</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Detail title="数値の変化" body={post.metric_change} />
        <Detail title="課題" body={post.issue} />
        <Detail title="次にやること" body={post.next_action} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">{post.tags?.map((tag) => <span className="pill" key={tag}>#{tag}</span>)}</div>
      {currentUser?.role === 'investor' && (
        <div className="mt-4 grid gap-3">
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={like}><Heart size={16} /> いいね</button>
            <button className="btn-secondary" onClick={save}><Bookmark size={16} /> 保存</button>
            <button className="btn-secondary" onClick={report}><Flag size={16} /> 通報</button>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input className="field" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="投資判断に必要な質問やコメントを書く" />
            <button className="btn-primary" onClick={submitComment}><MessageCircle size={16} /> コメント</button>
          </div>
        </div>
      )}
    </article>
  );
}

function Detail({ title, body }: { title: string; body?: string | null }) {
  return <div className="mt-4 rounded-2xl bg-white/5 p-4"><span className="text-xs font-bold text-cyan-300">{title}</span><p className="mt-2 whitespace-pre-line leading-7 text-slate-300">{body || '未入力'}</p></div>;
}

function Chart({ title, data, keyName }: { title: string; data: any[]; keyName: string }) {
  return (
    <section className="glass rounded-[24px] p-5">
      <div className="mb-4 flex items-center justify-between"><h3 className="font-black">{title}</h3><span className="pill">6ヶ月 / 12ヶ月</span></div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <CartesianGrid stroke="#24304a" vertical={false} />
          <XAxis dataKey="month" stroke="#74809d" />
          <YAxis stroke="#74809d" />
          <Tooltip contentStyle={{ background: '#101827', border: '1px solid #263556', borderRadius: 12 }} />
          <Area dataKey={keyName} stroke="#16d9ff" fill="#16d9ff33" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}

function AdminTable({ title, rows, render }: { title: string; rows: any[]; render: (row: any) => ReactNode }) {
  return <section className="glass rounded-[24px] p-5"><h3 className="text-xl font-black">{title}</h3><div className="mt-4 grid gap-3">{rows.length ? rows.map(render) : <p className="text-slate-400">対象データはありません。</p>}</div></section>;
}

function AdminRow({ title, meta, children }: { title: string; meta: string; children: ReactNode }) {
  return <article className="rounded-2xl bg-white/5 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><b>{title}</b><p className="mt-1 text-sm text-slate-400">{meta}</p></div><div className="flex flex-wrap gap-2">{children}</div></div></article>;
}

function calcCompleteness(profile: EntrepreneurProfile) {
  const keys = ['company_name', 'founder_name', 'location', 'industry', 'tagline', 'overview', 'problem', 'solution', 'business_model', 'current_phase', 'fundraising_amount'];
  const filled = keys.filter((key) => Boolean((profile as any)[key])).length;
  return Math.round((filled / keys.length) * 100);
}

function numberOrNull(value: any) {
  if (value === '' || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function splitTags(value?: string) {
  if (!value) return [];
  return value.split(',').map((tag) => tag.trim()).filter(Boolean);
}
