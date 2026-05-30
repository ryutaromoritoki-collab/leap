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
  Ban,
  Bell,
  Bookmark,
  Building2,
  CalendarClock,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Flag,
  Gauge,
  Heart,
  Landmark,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Paperclip,
  Plus,
  RefreshCcw,
  Rocket,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  UserRound,
  UsersRound,
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';
import type { AppUser, EntrepreneurProfile, InvestorProfile, ProgressPost, StartupKpi, UserBlock, UserRole } from '@/lib/types';

type View =
  | 'home'
  | 'search'
  | 'profile'
  | 'post'
  | 'kpi'
  | 'messages'
  | 'admin'
  | 'settings'
  | 'legal'
  | 'launch';

type LegalSlug = 'terms' | 'privacy' | 'commerce' | 'disclaimer' | 'contact' | 'report';
type DirectMessageTarget = { userId: string; name: string; accountName?: string | null; entrepreneurId?: string | null };

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
    body: '起業家プロフィールの登録・公開に月額費用はかかりません。投資家との面談チケットは1枚11,000円、3枚29,700円、5枚44,000円です。支払方法は銀行振込のみです。振込先は近畿産業信用組合 本店営業部 普通 3170341 カ）エーアイインフルエンサーです。',
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
  { view: 'post' as View, label: '投稿', icon: FileText },
  { view: 'search' as View, label: '検索', icon: Search },
  { view: 'kpi' as View, label: 'KPI', icon: LayoutDashboard },
  { view: 'messages' as View, label: 'メッセージ', icon: Mail },
  { view: 'admin' as View, label: '管理', icon: ShieldCheck },
];

const phaseOptions = ['アイデア', '初期検証', 'プレシード', 'シード', 'プレシリーズA', 'シリーズA', 'シリーズB以降'];
const industryOptions = ['人工知能', '業務支援システム', '金融', '医療・ヘルスケア', '環境・脱炭素', '小売・店舗支援', '教育', '人材・採用', '食品・外食', '製造・ものづくり', '不動産・建設', '物流・配送', '観光・宿泊', 'エンタメ・メディア', '農業・一次産業', '地方創生', '美容・ウェルネス', '法律・士業支援', '行政・公共', 'その他'];
const locationOptions = ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県', '海外'];
const visibilityOptions = ['public', 'followers', 'verified_investors'];
const visibilityLabels: Record<string, string> = {
  public: '全体公開',
  followers: 'フォロワー限定',
  verified_investors: '認証済み投資家のみ',
};
const employeeSizeOptions = ['1人', '5人未満', '20人未満', '50人未満', '100人未満', '100-500人', '501-1000人', '1001-5000人', '5001人以上'];
const revenueScaleOptions = ['1,000万円未満', '1,000万円-5,000万円未満', '5,000万円-1億円未満', '1億円-5億円未満', '5億円-10億円未満', '10億円-50億円未満', '50億円以上', '未回答'];
const investorTypeOptions = ['法人', '個人事業主'];
const roleLabels: Record<UserRole, string> = {
  entrepreneur: '起業家',
  investor: '投資家',
  admin: '管理者',
};
const bankAccount = {
  bank: '近畿産業信用組合',
  branch: '本店営業部',
  type: '普通',
  number: '3170341',
  holder: 'カ）エーアイインフルエンサー',
};
const ticketPlans = [
  { id: 'one', label: '1枚', count: 1, amount: 11000 },
  { id: 'three', label: '3枚', count: 3, amount: 29700 },
  { id: 'five', label: '5枚', count: 5, amount: 44000 },
];
const reminderDays = [3, 7, 14, 30, 90];

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
  if (lower.includes('error sending confirmation email')) {
    return '確認メールを送信できませんでした。Supabaseのメール送信設定、送信元メールアドレス、SMTPのユーザー名とパスワードを確認してください。';
  }
  if (lower.includes('password should be at least')) return 'パスワードは6文字以上で入力してください。';
  if (lower.includes('signup is disabled')) return '現在、新規登録は停止されています。';
  if (lower.includes('permission denied')) return '操作権限がありません。ログイン状態または権限設定を確認してください。';
  if (lower.includes('fetch failed')) return 'データベースへ接続できません。通信環境または接続設定を確認してください。';
  if (lower.includes('rate limit') || lower.includes('security purposes') || lower.includes('after')) {
    return '確認メールの送信回数制限に達しました。この制限はメールアドレス単位ではなくプロジェクト全体にかかります。しばらく待つか、開発中はSupabaseのメール認証を一時的にオフにしてください。';
  }
  return message || '処理に失敗しました。';
}

async function processEmailNotifications() {
  try {
    await fetch('/api/send-email-notifications', { method: 'POST' });
  } catch {
    // メール送信は通知本体の保存を妨げないようにする。
  }
}

async function createNotification(row: { user_id: string; type: string; body: string }) {
  if (!supabase) return;
  const { error } = await supabase.from('notifications').insert(row);
  if (!error) void processEmailNotifications();
}

async function processTriggeredEmailNotifications() {
  void processEmailNotifications();
}

async function uploadPublicAttachment(bucket: string, userId: string, file: File) {
  if (!supabase) throw new Error('Supabaseが設定されていません。');
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'file';
  const safeName = file.name.replace(/[^\w.\-ぁ-んァ-ン一-龥]/g, '-').slice(0, 80);
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return {
    attachment_url: data.publicUrl,
    attachment_name: safeName || file.name,
    attachment_type: file.type || 'application/octet-stream',
  };
}

export default function LeapApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [recoveringPassword, setRecoveringPassword] = useState(false);
  const [view, setView] = useState<View>('home');
  const [legalSlug, setLegalSlug] = useState<LegalSlug>('terms');
  const [profile, setProfile] = useState<EntrepreneurProfile | null>(null);
  const [investor, setInvestor] = useState<InvestorProfile | null>(null);
  const [posts, setPosts] = useState<ProgressPost[]>([]);
  const [hiddenPosts, setHiddenPosts] = useState<ProgressPost[]>([]);
  const [allPosts, setAllPosts] = useState<ProgressPost[]>([]);
  const [kpis, setKpis] = useState<StartupKpi[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<EntrepreneurProfile | null>(null);
  const [messageTarget, setMessageTarget] = useState<DirectMessageTarget | null>(null);
  const [profiles, setProfiles] = useState<EntrepreneurProfile[]>([]);
  const [investorProfiles, setInvestorProfiles] = useState<InvestorProfile[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [follows, setFollows] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [supportInquiries, setSupportInquiries] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [followedKpis, setFollowedKpis] = useState<any[]>([]);
  const [adminData, setAdminData] = useState<Record<string, any[]>>({});
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [authNotice, setAuthNotice] = useState('');

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const authText = decodeURIComponent(`${window.location.hash} ${window.location.search}`).toLowerCase();
    if (authText.includes('already') || authText.includes('registered') || authText.includes('confirmed')) {
      setAuthNotice('すでに登録しています。ログインするか、パスワードを忘れた場合は再設定してください。');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') setRecoveringPassword(true);
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
    if (!supabase || !user) {
      setWorkspaceReady(false);
      return;
    }
    loadWorkspace();
  }, [user?.id, view]);

  async function loadUser() {
    if (!supabase || !session?.user) return;
    const { data, error } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
    if (error) setToast(toJapaneseError(error.message));
    if (data) {
      await supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', session.user.id);
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
        phone: session.user.user_metadata?.phone ?? null,
        available_roles: [role],
        following_visible: true,
        followers_visible: true,
        last_login_at: new Date().toISOString(),
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
    setWorkspaceReady(false);
    try {
    if (user.role === 'entrepreneur') {
      const { data: ownProfile } = await supabase.from('entrepreneur_profiles').select('*').eq('user_id', user.id).maybeSingle();
      setProfile((ownProfile as EntrepreneurProfile | null) ?? null);
      if (!ownProfile) {
        await supabase.from('users').update({ profile_completed: false }).eq('id', user.id);
        setUser({ ...user, profile_completed: false });
        setPosts([]);
        setHiddenPosts([]);
        setAllPosts([]);
        setKpis([]);
        setFollows([]);
        setFollowing([]);
        setFollowers([]);
        setMeetings([]);
        setMessages([]);
        setSupportInquiries([]);
        return;
      }
      if (ownProfile) {
        const [{ data: postRows }, { data: hiddenPostRows }, { data: allPostRows }, { data: allProfiles }, { data: allInvestors }, { data: kpiRows }, { data: followerRows }, { data: followingRows }, { data: meetingRows }, { data: messageRows }, { data: supportRows }, { data: likeRows }, { data: commentRows }] = await Promise.all([
          supabase.from('progress_posts').select('*').eq('entrepreneur_id', ownProfile.id).or('is_hidden.is.null,is_hidden.eq.false').order('created_at', { ascending: false }),
          supabase.from('progress_posts').select('*').eq('entrepreneur_id', ownProfile.id).eq('is_hidden', true).order('created_at', { ascending: false }),
          supabase.from('progress_posts').select('*').or('is_hidden.is.null,is_hidden.eq.false').order('created_at', { ascending: false }).limit(500),
          supabase.from('entrepreneur_profiles').select('*').order('created_at', { ascending: false }).limit(1000),
          supabase.from('investor_profiles').select('*').order('created_at', { ascending: false }).limit(1000),
          supabase.from('startup_kpis').select('*').eq('entrepreneur_id', ownProfile.id).order('kpi_month', { ascending: true }),
          supabase.from('follows').select('*').eq('entrepreneur_id', ownProfile.id),
          supabase.from('follows').select('*').eq('investor_id', user.id),
          supabase.from('meeting_requests').select('*').eq('entrepreneur_id', ownProfile.id).order('created_at', { ascending: false }),
          supabase.from('messages').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(50),
          supabase.from('contact_inquiries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
          supabase.from('post_likes').select('post_id').limit(5000),
          supabase.from('post_comments').select('post_id').limit(5000),
        ]);
        const { data: blockRows } = await supabase.from('user_blocks').select('*').or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);
        const blockedIds = getBlockedUserIds((blockRows as UserBlock[]) ?? [], user.id);
        const safeProfiles = filterProfilesByBlocks((allProfiles as EntrepreneurProfile[]) ?? [], blockedIds, user.id);
        const safeInvestors = filterInvestorsByBlocks((allInvestors as InvestorProfile[]) ?? [], blockedIds, user.id);
        const decoratedOwnPosts = attachPostProfiles(withPostReactionCounts((postRows as ProgressPost[]) ?? [], likeRows ?? [], commentRows ?? []), safeProfiles);
        const decoratedHiddenPosts = attachPostProfiles(withPostReactionCounts((hiddenPostRows as ProgressPost[]) ?? [], likeRows ?? [], commentRows ?? []), safeProfiles);
        const decoratedAllPosts = filterPostsByBlocks(attachPostProfiles(withPostReactionCounts((allPostRows as ProgressPost[]) ?? [], likeRows ?? [], commentRows ?? []), safeProfiles), blockedIds);
        setPosts(decoratedOwnPosts);
        setHiddenPosts(decoratedHiddenPosts);
        setProfiles(safeProfiles);
        setInvestorProfiles(safeInvestors);
        setAllPosts(decoratedAllPosts);
        setKpis((kpiRows as StartupKpi[]) ?? []);
        setFollows(followerRows ?? []);
        setFollowers(followerRows ?? []);
        setFollowing(followingRows ?? []);
        setMeetings(filterMeetingsByBlocks(meetingRows ?? [], blockedIds, safeProfiles));
        setMessages(filterMessagesByBlocks(messageRows ?? [], blockedIds));
        setSupportInquiries(supportRows ?? []);
      }
    }

    if (user.role === 'investor') {
      const [{ data: investorProfile }, { data: ownEntrepreneurProfile }, { data: allProfiles }, { data: allInvestors }, { data: allPosts }, { data: followingRows }, { data: meetingRows }, { data: messageRows }, { data: supportRows }, { data: likeRows }, { data: commentRows }] =
        await Promise.all([
          supabase.from('investor_profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('entrepreneur_profiles').select('id').eq('user_id', user.id).maybeSingle(),
          supabase.from('entrepreneur_profiles').select('*').order('created_at', { ascending: false }).limit(1000),
          supabase.from('investor_profiles').select('*').order('created_at', { ascending: false }).limit(1000),
          supabase
            .from('progress_posts')
            .select('*')
            .or('is_hidden.is.null,is_hidden.eq.false')
            .order('created_at', { ascending: false })
            .limit(500),
          supabase.from('follows').select('*').eq('investor_id', user.id),
          supabase.from('meeting_requests').select('*').eq('investor_id', user.id).order('created_at', { ascending: false }),
          supabase.from('messages').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(50),
          supabase.from('contact_inquiries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
          supabase.from('post_likes').select('post_id').limit(5000),
          supabase.from('post_comments').select('post_id').limit(5000),
        ]);
      const { data: blockRows } = await supabase.from('user_blocks').select('*').or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);
      const blockedIds = getBlockedUserIds((blockRows as UserBlock[]) ?? [], user.id);
      const safeProfiles = filterProfilesByBlocks((allProfiles as EntrepreneurProfile[]) ?? [], blockedIds, user.id);
      const safeInvestors = filterInvestorsByBlocks((allInvestors as InvestorProfile[]) ?? [], blockedIds, user.id);
      setInvestor((investorProfile as InvestorProfile | null) ?? null);
      setProfiles(safeProfiles);
      setInvestorProfiles(safeInvestors);
      const postsWithProfiles = filterPostsByBlocks(attachPostProfiles(withPostReactionCounts((allPosts as ProgressPost[]) ?? [], likeRows ?? [], commentRows ?? []), safeProfiles), blockedIds);
      setPosts(postsWithProfiles);
      setAllPosts(postsWithProfiles);
      setFollows(followingRows ?? []);
      setFollowing(followingRows ?? []);
      if (ownEntrepreneurProfile?.id) {
        const { data: followerRows } = await supabase.from('follows').select('*').eq('entrepreneur_id', ownEntrepreneurProfile.id);
        setFollowers(followerRows ?? []);
      } else {
        setFollowers([]);
      }
      setMeetings(filterMeetingsByBlocks(meetingRows ?? [], blockedIds, safeProfiles));
      setMessages(filterMessagesByBlocks(messageRows ?? [], blockedIds));
      setSupportInquiries(supportRows ?? []);
      if (followingRows?.length) {
        const entrepreneurIds = followingRows.map((row: any) => row.entrepreneur_id);
        const { data: kpiRows } = await supabase.from('startup_kpis').select('*, entrepreneur_profiles(company_name, industry)').in('entrepreneur_id', entrepreneurIds).order('created_at', { ascending: false }).limit(12);
        setFollowedKpis(kpiRows ?? []);
      } else {
        setFollowedKpis([]);
      }
    }

    if (user.role === 'admin') {
      const [users, entrepreneurs, investors, progressPosts, postComments, reports, meetingRequests, inquiries, contactSuspicions, allMessages] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('entrepreneur_profiles').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('investor_profiles').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('progress_posts').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('post_comments').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('meeting_requests').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('contact_inquiries').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('contact_suspicions').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(100),
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
        contactSuspicions: contactSuspicions.data ?? [],
        allMessages: allMessages.data ?? [],
      });
      setAllPosts((progressPosts.data as ProgressPost[]) ?? []);
      setSupportInquiries(inquiries.data ?? []);
    }

    const { data: notificationRows } = await supabase.from('notifications').select('*').eq('user_id', user.id).is('read_at', null).limit(20);
    setNotifications(notificationRows ?? []);
    } finally {
      setWorkspaceReady(true);
    }
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setUser(null);
    setView('home');
  }

  async function switchRole(nextRole: Exclude<UserRole, 'admin'>) {
    if (!supabase || !user) return;
    const table = nextRole === 'entrepreneur' ? 'entrepreneur_profiles' : 'investor_profiles';
    const { data: existingProfile } = await supabase.from(table).select('id').eq('user_id', user.id).maybeSingle();
    await supabase.from('users').update({
      role: nextRole,
      available_roles: Array.from(new Set([...(user.available_roles ?? [user.role]), nextRole])),
      profile_completed: Boolean(existingProfile),
    }).eq('id', user.id);
    setView('home');
    await loadUser();
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
    return <AuthScreen initialMessage={authNotice} onReady={loadUser} setLegal={(slug) => { setLegalSlug(slug); setView('legal'); }} />;
  }

  if (user.is_suspended) {
    return <FullScreenMessage title="アカウントは停止されています" body="管理者による確認が必要です。お問い合わせからご連絡ください。" />;
  }

  if (recoveringPassword) {
    return <UpdatePasswordScreen onDone={async () => { setRecoveringPassword(false); await loadUser(); }} />;
  }

  if (!user.profile_completed) {
    return <Onboarding user={user} onDone={loadUser} />;
  }

  if (!workspaceReady) {
    return <FullScreenMessage title="Leapを起動しています" body="最新のプロフィールと投稿を確認しています。" />;
  }

  const showShellHeader = !(view === 'home' && user.role === 'entrepreneur');

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="glass fixed inset-y-0 left-0 z-20 hidden w-[240px] rounded-none border-y-0 border-l-0 p-5 lg:block">
        <button className="neon-text text-3xl font-black" onClick={() => setView('home')}>Leap</button>
        <nav className="mt-8 grid gap-2">
          {nav.filter((item) => item.view !== 'admin' || user.role === 'admin').map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex min-h-11 items-center gap-3 rounded-2xl px-4 text-left text-sm font-bold ${view === item.view ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'}`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <p className="absolute bottom-5 left-5 right-5 text-xs leading-6 text-slate-500">
          Leapは投資判断を代行・推奨するサービスではありません。投資判断は各利用者の責任で行ってください。
        </p>
      </aside>

      <main className="min-w-0 px-3 pb-28 pt-4 sm:px-6 lg:col-start-2 lg:px-8">
        {showShellHeader && (
          <header className="mx-auto mb-5 flex w-full max-w-5xl items-center justify-between gap-3">
            <div>
              <p className="app-section-title">Leap</p>
              <h1 className="text-2xl font-black sm:text-3xl">{titleFor(view, user.role)}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="btn-secondary hidden h-11 px-3 text-xs sm:inline-flex"><Bell size={16} /> {notifications.length}</span>
              {user.role !== 'admin' && (
                <button className="btn-secondary h-11 px-3 text-xs" onClick={() => switchRole(user.role === 'entrepreneur' ? 'investor' : 'entrepreneur')}>
                  {user.role === 'entrepreneur' ? '投資家画面へ' : '起業家画面へ'}
                </button>
              )}
              <button className="btn-secondary h-11 px-3" onClick={() => setView('settings')} aria-label="設定"><Settings size={17} /></button>
              <button className="btn-secondary h-11 px-3" onClick={signOut}><LogOut size={17} /></button>
            </div>
          </header>
        )}

        {toast && <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{toast}</div>}

        {view === 'home' && user.role === 'entrepreneur' && (
          <EntrepreneurHome currentUser={user} profile={profile} posts={posts} hiddenPosts={hiddenPosts} kpis={kpis} following={following} followers={followers} profiles={profiles} investors={investorProfiles} meetings={meetings} openProfile={openStartupProfile} setView={setView} refresh={loadWorkspace} />
        )}
        {view === 'home' && user.role === 'investor' && (
          <InvestorHome currentUser={user} investor={investor} profiles={profiles} investorProfiles={investorProfiles} posts={posts} follows={follows} following={following} followers={followers} followedKpis={followedKpis} meetings={meetings} messages={messages} openProfile={openStartupProfile} setView={setView} refresh={loadWorkspace} />
        )}
        {view === 'home' && user.role === 'admin' && <AdminHome adminData={adminData} refresh={loadWorkspace} openProfile={openStartupProfile} />}
        {view === 'post' && <AllPostsPage posts={allPosts} currentUser={user} investor={investor} openProfile={openStartupProfile} refresh={loadWorkspace} />}
        {view === 'search' && (
          <SearchPage
            query={query}
            setQuery={setQuery}
            profiles={profiles}
            investors={investorProfiles}
            refresh={loadWorkspace}
            openProfile={openStartupProfile}
          />
        )}
        {view === 'profile' && selectedProfile && (
          <StartupProfile profile={selectedProfile} currentUser={user} followers={followers} following={following} profiles={profiles} investors={investorProfiles} setView={setView} setMessageTarget={setMessageTarget} openProfile={openStartupProfile} refresh={loadWorkspace} />
        )}
        {view === 'kpi' && <KpiDashboard profile={profile ?? selectedProfile} kpis={kpis} />}
        {view === 'messages' && <Messages currentUser={user} entrepreneurProfile={profile} messages={messages} supportInquiries={supportInquiries} meetings={meetings} profiles={profiles} investors={investorProfiles} target={messageTarget} setView={setView} openProfile={openStartupProfile} refresh={loadWorkspace} />}
        {view === 'admin' && user.role === 'admin' && <AdminHome adminData={adminData} refresh={loadWorkspace} openProfile={openStartupProfile} />}
        {view === 'settings' && <SettingsPage currentUser={user} refresh={async () => { await loadUser(); await loadWorkspace(); }} />}
        {view === 'legal' && <LegalPage slug={legalSlug} currentUser={user} />}
        {view === 'launch' && <LaunchChecklist />}
      </main>

      <nav className="bottom-phone-nav fixed bottom-3 left-3 right-3 z-30 mx-auto grid max-w-[430px] grid-cols-6 gap-1 rounded-3xl p-2 lg:hidden">
        {nav.filter((item) => item.view !== 'admin' || user.role === 'admin').map((item) => (
          <button key={item.view} onClick={() => setView(item.view)} className={`grid min-h-12 place-items-center rounded-2xl ${view === item.view ? 'bg-slate-950 text-white' : 'text-slate-500'}`} aria-label={item.label}>
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
    post: '投稿一覧',
    kpi: 'KPIダッシュボード',
    messages: 'メッセージ',
    admin: '管理者ページ',
    settings: '設定',
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

function AuthScreen({ onReady, setLegal, initialMessage }: { onReady: () => Promise<void>; setLegal: (slug: LegalSlug) => void; initialMessage?: string }) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Exclude<UserRole, 'admin'>>('entrepreneur');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (initialMessage) {
      setMode('login');
      setMessage(initialMessage);
    }
  }, [initialMessage]);

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
        await sendResetEmail();
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: location.origin,
            data: { role, phone },
          },
        });
        if (error) {
          if (error.message.toLowerCase().includes('already registered')) {
            await resendConfirmation();
            return;
          }
          throw error;
        }
        if (data.session && data.user) {
          await supabase.from('users').upsert({ id: data.user.id, email, role, phone, available_roles: [role], profile_completed: false });
        }
        setMessage('確認メールを送信しました。届かない場合は、少し待ってから「確認メールを再送」を押してください。すでに登録済みの場合は、パスワード再設定へ進めます。');
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

  async function resendConfirmation() {
    if (!supabase) return;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: location.origin },
    });
    if (error) {
      const lower = error.message.toLowerCase();
      if (lower.includes('already') || lower.includes('confirmed') || lower.includes('registered')) {
        setMessage('このメールアドレスはすでに登録しています。ログインするか、パスワードを忘れた場合は再設定してください。');
        setMode('login');
        return;
      }
      throw error;
    }
    setMessage('確認メールを再送しました。メール内の確認URLを開いてください。');
    setCooldown(60);
  }

  async function sendResetEmail() {
    if (!supabase) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
    if (error) throw error;
    setMessage('パスワード再設定メールを送信しました。メール内のリンクから新しいパスワードを設定してください。');
    setCooldown(60);
  }

  return (
    <main className="grid min-h-screen gap-5 bg-[#f7f8fa] p-4 text-slate-900 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
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
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
          {(['login', 'signup', 'reset'] as const).map((item) => (
            <button key={item} onClick={() => setMode(item)} className={`rounded-xl px-2 py-3 text-sm ${mode === item ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
              {item === 'login' ? 'ログイン' : item === 'signup' ? '登録' : '再設定'}
            </button>
          ))}
        </div>
        <h2 className="mt-6 text-2xl font-black">{mode === 'login' ? 'ログイン' : mode === 'signup' ? 'メールアドレス登録' : 'パスワード再設定'}</h2>
        <div className="mt-5 grid gap-4">
          <label className="label">メールアドレス<input className="field" value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></label>
          {mode !== 'reset' && <label className="label">パスワード<input className="field" value={password} onChange={(e) => setPassword(e.target.value)} type="password" /></label>}
          {mode === 'signup' && <label className="label">電話番号<input className="field" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="例：09012345678" /></label>}
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
            <p className="rounded-2xl bg-cyan-50 p-3 text-xs leading-6 text-cyan-700">
              開発中に確認メールの制限が出る場合は、Supabaseの認証設定でメール確認を一時的にオフにすると、すぐ登録テストできます。本番公開時はメール確認をオンに戻してください。
            </p>
          )}
          <button className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={busy || (cooldown > 0 && mode !== 'login')} onClick={submit}>
            {busy ? '処理中...' : cooldown > 0 && mode !== 'login' ? `再送信まで ${cooldown}秒` : mode === 'login' ? 'ログイン' : mode === 'signup' ? '登録する' : '再設定メールを送る'}
          </button>
          {mode === 'signup' && (
            <button className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={busy || cooldown > 0 || !email} onClick={async () => {
              setBusy(true);
              setMessage('');
              try {
                await resendConfirmation();
              } catch (error: any) {
                setMessage(toJapaneseError(error.message));
                setCooldown(60);
              } finally {
                setBusy(false);
              }
            }}>
              <RefreshCcw size={17} /> 確認メールを再送
            </button>
          )}
          {mode !== 'reset' && (
            <button className="btn-secondary w-full" onClick={() => { setMode('reset'); setMessage('登録済みの場合は、ここからパスワードを再設定できます。'); }}>
              <KeyRound size={17} /> パスワードを忘れていますか？
            </button>
          )}
          {message && <p className="rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">{message}</p>}
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-400">
          {Object.keys(legalCopy).map((slug) => <button key={slug} onClick={() => setLegal(slug as LegalSlug)}>{legalCopy[slug as LegalSlug].title}</button>)}
        </div>
      </section>
    </main>
  );
}

function UpdatePasswordScreen({ onDone }: { onDone: () => Promise<void> }) {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function updatePassword() {
    if (!supabase) return;
    setBusy(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage('パスワードを変更しました。');
      await onDone();
    } catch (error: any) {
      setMessage(toJapaneseError(error.message));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <section className="glass w-full max-w-lg rounded-[28px] p-6">
        <div className="neon-text text-3xl font-black">Leap</div>
        <h1 className="mt-6 text-3xl font-black">新しいパスワードを設定</h1>
        <p className="mt-3 leading-7 text-slate-300">登録済みアカウントのパスワードを変更します。6文字以上で入力してください。</p>
        <label className="label mt-5">新しいパスワード<input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn-primary mt-5 w-full" disabled={busy || password.length < 6} onClick={updatePassword}>{busy ? '変更中...' : 'パスワードを変更する'}</button>
        {message && <p className="mt-4 rounded-2xl bg-white/8 p-3 text-sm text-slate-200">{message}</p>}
      </section>
    </main>
  );
}

function Onboarding({ user, onDone }: { user: AppUser; onDone: () => Promise<void> }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const entrepreneurSteps = ['アカウント情報'];
  const investorSteps = ['アカウント情報'];
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
            account_name: form.account_name,
            company_name: form.company_name,
            founder_name: form.full_name,
            founded_month: form.founded_month,
            employee_size: form.employee_size,
            annual_revenue_scale: form.annual_revenue_scale,
            tagline: form.company_name ? `${form.company_name}の事業成長をLeapで公開中` : null,
            is_hidden: false,
            payment_status: 'paid',
          })
          .select()
          .single();
        if (error) throw error;
      } else if (user.role === 'investor') {
        const { error } = await supabase.from('investor_profiles').upsert({
          user_id: user.id,
          account_name: form.account_name,
          full_name: form.full_name,
          company_name: form.company_name,
          founded_month: form.founded_month,
          employee_size: form.employee_size,
          annual_revenue_scale: form.annual_revenue_scale,
        });
        if (error) throw error;
      }
      await supabase.from('users').update({ profile_completed: true, available_roles: Array.from(new Set([...(user.available_roles ?? []), user.role])) }).eq('id', user.id);
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
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FieldGrid fields={['account_name:アカウント名', 'full_name:名前', 'company_name:会社名']} form={form} set={set} />
      <label className="label">設立年月<input className="field" type="month" value={form.founded_month ?? ''} onChange={(e) => set('founded_month', e.target.value)} /></label>
      <OptionSelect label="従業員数" value={form.employee_size ?? ''} options={employeeSizeOptions} onChange={(value) => set('employee_size', value)} />
      <OptionSelect label="年商規模" value={form.annual_revenue_scale ?? ''} options={revenueScaleOptions} onChange={(value) => set('annual_revenue_scale', value)} />
    </div>
  );
}

function InvestorStep({ step, form, set }: { step: number; form: Record<string, any>; set: (name: string, value: any) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FieldGrid fields={['account_name:アカウント名', 'full_name:名前', 'company_name:会社名']} form={form} set={set} />
      <label className="label">設立年月<input className="field" type="month" value={form.founded_month ?? ''} onChange={(e) => set('founded_month', e.target.value)} /></label>
      <OptionSelect label="従業員数" value={form.employee_size ?? ''} options={employeeSizeOptions} onChange={(value) => set('employee_size', value)} />
      <OptionSelect label="年商規模" value={form.annual_revenue_scale ?? ''} options={revenueScaleOptions} onChange={(value) => set('annual_revenue_scale', value)} />
    </div>
  );
}

function OptionSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="label">
      {label}
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">選択してください</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
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

function EntrepreneurHome({ currentUser, profile, posts, hiddenPosts, kpis, following, followers, profiles, investors, meetings, openProfile, setView, refresh }: { currentUser: AppUser; profile: EntrepreneurProfile | null; posts: ProgressPost[]; hiddenPosts: ProgressPost[]; kpis: StartupKpi[]; following: any[]; followers: any[]; profiles: EntrepreneurProfile[]; investors: InvestorProfile[]; meetings: any[]; openProfile: (p: EntrepreneurProfile) => void; setView: (view: View) => void; refresh: () => Promise<void> }) {
  const [showComposer, setShowComposer] = useState(false);
  const [activeTab, setActiveTab] = useState<'following' | 'recommended' | 'investors' | 'entrepreneurs'>('recommended');
  if (!profile) return <Onboarding user={currentUser} onDone={refresh} />;
  const completeness = calcCompleteness(profile);
  const displayName = profile.company_name || profile.founder_name || 'Leapユーザー';
  const accountName = profile.account_name || 'account';
  const tabPosts = activeTab === 'following' ? posts.filter((post) => following.some((row) => row.entrepreneur_id === post.entrepreneur_id)) : posts;
  const storyProfiles = [profile, ...profiles.filter((item) => item.id !== profile.id)].slice(0, 5);
  return (
    <div className="mobile-screen grid gap-5">
      <section className="app-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white" aria-label="分析"><ChartNoAxesCombined size={20} /></button>
          <div className="flex items-center gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-950" onClick={() => setView('search')} aria-label="検索"><Search size={22} /></button>
            <button className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-950" onClick={() => setView('settings')} aria-label="メニュー"><Menu size={22} /></button>
          </div>
        </div>
        <div className="phone-tabs">
          {[
            ['following', 'フォロー中'],
            ['recommended', 'おすすめ'],
            ['investors', '投資家'],
            ['entrepreneurs', '起業家'],
          ].map(([key, label]) => (
            <button key={key} data-active={activeTab === key} onClick={() => setActiveTab(key as typeof activeTab)}>{label}</button>
          ))}
        </div>
        <div className="flex gap-4 overflow-x-auto border-b border-slate-100 px-4 py-4">
          <button className="grid w-16 shrink-0 justify-items-center gap-2 text-xs font-bold text-slate-700" onClick={() => setShowComposer(true)}>
            <span className="grid h-14 w-14 place-items-center rounded-full border border-blue-200 bg-white text-blue-600"><Plus size={24} /></span>
            投稿する
          </button>
          {storyProfiles.map((item) => (
            <button key={item.id} className="grid w-16 shrink-0 justify-items-center gap-2 text-xs font-bold text-slate-700" onClick={() => item.id === profile.id ? setView('settings') : openProfile(item)}>
              <span className="relative">
                <ProfileAvatar name={item.company_name} avatarUrl={item.avatar_url} />
                <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
              </span>
              <span className="w-full truncate">{item.account_name || item.company_name}</span>
            </button>
          ))}
        </div>
        <div>
          {tabPosts.length === 0 ? (
            <div className="p-5"><EmptyState title="まだ投稿がありません" body="投稿するとこのフィードに表示されます。" cta="投稿する" onClick={() => setShowComposer(true)} /></div>
          ) : (
            tabPosts.map((post) => <HomeThreadPost key={post.id} post={post} name={post.entrepreneur_profiles?.company_name || displayName} accountName={post.entrepreneur_profiles?.account_name || accountName} avatarUrl={post.entrepreneur_profiles?.avatar_url || profile.avatar_url} currentUser={currentUser} refresh={refresh} />)
          )}
        </div>
      </section>
      <section className="app-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="app-section-title">マイプロフィール</p>
            <h2 className="mt-3 break-words text-2xl font-black">{displayName}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">@{accountName}</p>
          </div>
          <div className="relative shrink-0">
            <ProfileAvatar name={displayName} avatarUrl={profile.avatar_url} size="lg" />
            <button className="absolute -left-3 bottom-0 grid h-10 w-10 place-items-center rounded-full border-4 border-white bg-slate-950 text-white shadow-lg" onClick={() => setShowComposer(true)} aria-label="投稿を作成">
              <Plus size={20} />
            </button>
          </div>
        </div>
        <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-slate-700">
          {profile.tagline || `${profile.company_name}の最新情報を発信しています。`}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[profile.industry, profile.current_phase, profile.location, `${completeness}%完了`].filter(Boolean).map((item) => (
            <span className="pill" key={String(item)}>{String(item)}</span>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
          <span><b className="text-slate-950">{following.length.toLocaleString()}</b> フォロー中</span>
          <span><b className="text-slate-950">{followers.length.toLocaleString()}</b> フォロワー</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="btn-secondary" onClick={() => setView('settings')}>プロフィールを編集</button>
          <button className="btn-primary" onClick={() => setShowComposer(true)}>投稿する</button>
        </div>
      </section>
      {showComposer && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-black">新しい投稿</h3>
              <button className="btn-secondary px-3" onClick={() => setShowComposer(false)}>閉じる</button>
            </div>
            <PostComposer profile={profile} refresh={async () => { await refresh(); setShowComposer(false); }} />
          </div>
        </div>
      )}
      <section id="quick-post-composer" className="grid gap-5">
        <PostComposer profile={profile} refresh={refresh} />
        <KpiComposer profile={profile} refresh={refresh} />
      </section>
      <FollowOverview following={following} followers={followers} profiles={profiles} investors={investors} openProfile={openProfile} viewer={currentUser} />
      <MeetingTicketPanel profile={profile} meetings={meetings} refresh={refresh} />
      <PitchUpload profile={profile} refresh={refresh} />
      <HiddenPostsPanel posts={hiddenPosts} refresh={refresh} />
      <KpiDashboard profile={profile} kpis={kpis} compact />
    </div>
  );
}

function InvestorHome({ currentUser, investor, profiles, investorProfiles, posts, follows, following, followers, followedKpis, meetings, messages, openProfile, setView, refresh }: { currentUser: AppUser; investor: InvestorProfile | null; profiles: EntrepreneurProfile[]; investorProfiles: InvestorProfile[]; posts: ProgressPost[]; follows: any[]; following: any[]; followers: any[]; followedKpis: any[]; meetings: any[]; messages: any[]; openProfile: (p: EntrepreneurProfile) => void; setView: (v: View) => void; refresh: () => Promise<void> }) {
  const followedIds = new Set(follows.map((row) => row.entrepreneur_id));
  const followedPosts = posts.filter((post) => followedIds.has(post.entrepreneur_id));
  const recommendedPosts = posts.filter((post) => !followedIds.has(post.entrepreneur_id));
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="app-card p-5 lg:col-span-2">
        <p className="app-section-title">投資家ホーム</p>
        <h2 className="mt-3 text-2xl font-black">成長投稿とKPIから有望な起業家を発見</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">毎週の進捗、課題への向き合い方、数値の改善速度、返信の丁寧さを見て判断できます。</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="フォロー数" value={`${following.length}`} icon={Heart} />
          <Metric label="フォロワー数" value={`${followers.length}`} icon={UsersRound} />
          <Metric label="新着進捗" value={`${posts.length}`} icon={TrendingUp} />
          <Metric label="面談状況" value={`${meetings.length}`} icon={CalendarClock} />
          <Metric label="未返信メッセージ" value={`${messages.filter((m) => !m.read_at).length}`} icon={Mail} />
          <Metric label="累計投資金額" value={yen(investor?.total_investment_amount)} icon={CircleDollarSign} />
        </div>
      </section>
      <InvestorDocumentPanel investor={investor} refresh={refresh} />
      <FollowOverview following={following} followers={followers} profiles={profiles} investors={investorProfiles} openProfile={openProfile} viewer={currentUser} />
      {follows.length === 0 && <EmptyState title="まだフォロー中の起業家はいません。興味のある起業家を探しましょう。" cta="起業家を探す" onClick={() => setView('search')} />}
      <section className="app-card p-5">
        <h3 className="text-xl font-black">フォロー中のKPI更新</h3>
        {followedKpis.length === 0 ? <EmptyState title="フォロー中のKPI更新はまだありません" body="フォローした起業家がKPIを更新するとここに表示されます。" /> : (
          <div className="mt-3 grid gap-3">{followedKpis.map((kpi) => (
            <article key={kpi.id} className="glass rounded-2xl p-4">
              <p className="text-sm font-bold text-emerald-300">{kpi.entrepreneur_profiles?.company_name ?? '起業家'}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-300">
                <span>売上 <b className="block text-white">{yen(kpi.monthly_revenue)}</b></span>
                <span>導入社数 <b className="block text-white">{kpi.customer_count ?? 0}</b></span>
                <span>MAU <b className="block text-white">{kpi.mau ?? 0}</b></span>
                <span>継続率 <b className="block text-white">{percent(kpi.retention_rate)}</b></span>
              </div>
            </article>
          ))}</div>
        )}
      </section>
      <section className="app-card p-5">
        <h3 className="text-xl font-black">興味領域に合う起業家</h3>
        {profiles.length === 0 ? <EmptyState title="閲覧できる起業家がまだいません" body="起業家が登録すると、検索とウォッチリスト追加が利用できます。" /> : (
          <div className="mt-3 grid gap-3">{profiles.slice(0, 4).map((p) => <StartupCard key={p.id} profile={p} onClick={() => openProfile(p)} />)}</div>
        )}
      </section>
      <section className="app-card p-5 lg:col-span-2">
        <h3 className="text-xl font-black">フォロー中の新着進捗ログ</h3>
        {followedPosts.length === 0 ? <EmptyState title="フォロー中の新着進捗ログはまだありません" body="フォローした起業家の進捗がここに表示されます。" /> : followedPosts.map((post) => <PostCard key={post.id} post={post} currentUser={currentUser} investor={investor} refresh={refresh} />)}
      </section>
      <section className="app-card p-5 lg:col-span-2">
        <h3 className="text-xl font-black">興味を惹きそうな投稿</h3>
        {recommendedPosts.length === 0 ? <EmptyState title="おすすめ投稿はまだありません" body="フォローしていない起業家の投稿がここに表示されます。" /> : recommendedPosts.map((post) => <PostCard key={post.id} post={post} currentUser={currentUser} investor={investor} refresh={refresh} />)}
      </section>
    </div>
  );
}

function HomeThreadPost({ post, name, accountName, avatarUrl, currentUser, refresh }: { post: ProgressPost; name: string; accountName: string; avatarUrl?: string | null; currentUser: AppUser; refresh: () => Promise<void> }) {
  const [removed, setRemoved] = useState(false);
  const [notice, setNotice] = useState('');
  const isPrivatePost = post.post_type === 'private';
  const body = isPrivatePost ? post.body : post.did_today;
  const postedAt = new Date(post.created_at).toLocaleString('ja-JP', { hour: '2-digit', minute: '2-digit' });

  async function deleteOwnPost() {
    if (!supabase || currentUser.id !== post.user_id) return;
    if (!window.confirm('この投稿を削除します。元に戻せません。よろしいですか？')) return;
    const { error } = await supabase.from('progress_posts').delete().eq('id', post.id).eq('user_id', currentUser.id);
    if (error) {
      setNotice(toJapaneseError(error.message));
      return;
    }
    setRemoved(true);
    await refresh();
  }

  async function hideOwnPost() {
    if (!supabase || currentUser.id !== post.user_id) return;
    const { error } = await supabase.from('progress_posts').update({ is_hidden: true }).eq('id', post.id).eq('user_id', currentUser.id);
    if (error) {
      setNotice(toJapaneseError(error.message));
      return;
    }
    setRemoved(true);
    await refresh();
  }

  if (removed) return null;
  return (
    <article className="border-t border-slate-200 p-5">
      <div className="grid grid-cols-[52px_1fr] gap-3">
        <ProfileAvatar name={name} avatarUrl={avatarUrl} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <b className="truncate">{accountName}</b>
            <span className="text-sm text-slate-500">{postedAt}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">{isPrivatePost ? '最新情報' : '進捗ログ'}</p>
          <p className="mt-3 whitespace-pre-line break-words text-base leading-8 text-slate-800">{body || '本文はありません。'}</p>
          {!isPrivatePost && (
            <div className="mt-3 grid gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
              {post.metric_change && <p><b>数値:</b> {post.metric_change}</p>}
              {post.issue && <p><b>課題:</b> {post.issue}</p>}
              {post.next_action && <p><b>次:</b> {post.next_action}</p>}
            </div>
          )}
          <AttachmentPreview url={post.attachment_url} name={post.attachment_name} type={post.attachment_type} />
          <div className="mt-4 flex flex-wrap items-center gap-6 text-slate-500">
            <button className="inline-flex items-center gap-2"><Heart size={22} /> {post.like_count ?? 0}</button>
            <button className="inline-flex items-center gap-2"><MessageCircle size={22} /> {post.comment_count ?? 0}</button>
            <button className="inline-flex items-center gap-2"><RefreshCcw size={22} /></button>
            <button className="inline-flex items-center gap-2"><Send size={22} /></button>
          </div>
          {currentUser.id === post.user_id && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn-secondary min-h-10 px-3 text-sm" onClick={hideOwnPost}><EyeOff size={15} /> 非公開</button>
              <button className="btn-secondary min-h-10 px-3 text-sm" onClick={deleteOwnPost}><Trash2 size={15} /> 削除</button>
            </div>
          )}
          {notice && <p className="mt-3 rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">{notice}</p>}
        </div>
      </div>
    </article>
  );
}

function InvestorDocumentPanel({ investor, refresh }: { investor: InvestorProfile | null; refresh: () => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null);
  const [investorType, setInvestorType] = useState(investor?.investor_type ?? investorTypeOptions[0]);
  const [corporateNumber, setCorporateNumber] = useState(investor?.corporate_number ?? '');
  const [message, setMessage] = useState('');
  const submitted = Boolean(investor?.corporate_number || investor?.license_file_path);

  async function uploadDocument() {
    if (!supabase || !investor) return;
    let path = investor.license_file_path;
    if (investorType === '個人事業主') {
      if (!file) {
        setMessage('個人事業主の場合は運転免許証の写真を選択してください。');
        return;
      }
      path = `${investor.user_id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('compliance-documents').upload(path, file, { upsert: false });
      if (error) {
        setMessage(toJapaneseError(error.message));
        return;
      }
    } else if (!corporateNumber.trim()) {
      setMessage('法人の場合は法人番号を入力してください。');
      return;
    }
    await supabase.from('investor_profiles').update({
      investor_type: investorType,
      corporate_number: investorType === '法人' ? corporateNumber.trim() : null,
      license_file_path: investorType === '個人事業主' ? path : null,
      document_status: 'submitted',
      document_submitted_at: new Date().toISOString(),
    }).eq('id', investor.id);
    setMessage('確認情報を提出しました。提出後、コメントとメッセージが利用できます。');
    await refresh();
  }

  return (
    <section className={`glass rounded-[24px] p-5 ${submitted ? 'border-emerald-300/40' : 'border-amber-300/35'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-emerald-300">投資家確認書類</p>
          <h3 className="mt-2 text-2xl font-black">{submitted ? '確認情報を提出済みです' : '法人番号または運転免許証の提出後にコメント・メッセージが利用できます'}</h3>
          <p className="mt-2 leading-7 text-slate-300">法人は法人番号、個人事業主は運転免許証の写真を提出してください。</p>
        </div>
        <span className="pill"><ShieldCheck size={14} /> {submitted ? '提出済み' : '未提出'}</span>
      </div>
      {!submitted && (
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <select className="field" value={investorType} onChange={(e) => setInvestorType(e.target.value)}>
            {investorTypeOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
          {investorType === '法人'
            ? <input className="field" value={corporateNumber} onChange={(e) => setCorporateNumber(e.target.value)} placeholder="法人番号を入力" />
            : <input className="field" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />}
          <button className="btn-primary" onClick={uploadDocument}>提出する</button>
        </div>
      )}
      {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
    </section>
  );
}

function MeetingTicketPanel({ profile, meetings, refresh }: { profile: EntrepreneurProfile; meetings: any[]; refresh: () => Promise<void> }) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(ticketPlans[0].id);
  const [transferName, setTransferName] = useState(profile.company_name);
  const selectedPlan = ticketPlans.find((plan) => plan.id === selectedPlanId) ?? ticketPlans[0];
  const availableTickets = profile.meeting_ticket_balance ?? 0;
  const isPaymentPending = profile.meeting_ticket_payment_status === 'pending_review';
  async function requestTicketReview() {
    if (!supabase || !acceptedTerms || isPaymentPending) return;
    await supabase.from('contact_inquiries').insert({
      user_id: profile.user_id,
      category: 'meeting_ticket_payment',
      body: `${profile.company_name} が面談チケット ${selectedPlan.label}（${yen(selectedPlan.amount)}）の入金確認を希望しています。振込名義: ${transferName}`,
    });
    await processTriggeredEmailNotifications();
    await supabase.from('entrepreneur_profiles').update({
      meeting_ticket_plan: selectedPlan.label,
      meeting_ticket_requested_count: selectedPlan.count,
      meeting_ticket_requested_amount: selectedPlan.amount,
      meeting_ticket_payment_status: 'pending_review',
      meeting_ticket_transfer_name: transferName,
    }).eq('id', profile.id);
    await refresh();
  }
  return (
    <section className="glass rounded-[24px] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-emerald-300">面談チケット</p>
          <h3 className="mt-2 text-2xl font-black">起業家が面談チケットを購入・消費します</h3>
          <p className="mt-2 leading-7 text-slate-300">投資家との面談日時が双方で決まったら、起業家側で面談チケットを1枚消費して運営へ面談申請します。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="pill"><CalendarClock size={14} /> 残り {availableTickets}枚</span>
          {isPaymentPending && <span className="pill"><Clock size={14} /> 入金確認依頼中</span>}
        </div>
      </div>
      {isPaymentPending && (
        <p className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
          入金確認依頼中です。運営が入金確認ボタンを押すと、選択した面談チケットが付与されます。
        </p>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {ticketPlans.map((plan) => (
          <button key={plan.id} type="button" className={`glass rounded-2xl p-4 text-left ${selectedPlanId === plan.id ? 'border-cyan-300/70' : ''}`} onClick={() => setSelectedPlanId(plan.id)}>
            <CircleDollarSign className="text-cyan-300" size={18} />
            <span className="mt-3 block text-xs text-slate-400">{plan.label}</span>
            <b className="mt-1 block text-xl">{yen(plan.amount)}</b>
          </button>
        ))}
      </div>
      <label className="label mt-4">振込名義<input className="field" value={transferName} onChange={(e) => setTransferName(e.target.value)} /></label>
      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-7 text-slate-300">
        <p className="font-bold text-white">利用規約への同意</p>
        <p className="mt-2">面談チケットはLeap内で面談日程を確定し、運営へ面談申請するための費用です。Leap外で連絡先を交換し、面談申請前に面談を実行することは禁止です。</p>
        <label className="mt-4 flex items-center gap-3 text-white"><input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} /> 利用規約に同意する</label>
      </div>
      {acceptedTerms && (
      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-7 text-slate-300">
        <p><b className="text-white">振込先:</b> {bankAccount.bank} {bankAccount.branch} {bankAccount.type} {bankAccount.number}</p>
        <p><b className="text-white">口座名義:</b> {bankAccount.holder}</p>
        <p><b className="text-white">選択チケット:</b> {selectedPlan.label} / {yen(selectedPlan.amount)}</p>
      </div>
      )}
      <button className="btn-primary mt-4 w-full" disabled={isPaymentPending || !acceptedTerms || !transferName.trim()} onClick={requestTicketReview}>
        {isPaymentPending ? '入金確認依頼中です' : '面談チケットの入金確認を依頼する'}
      </button>
    </section>
  );
}

function HiddenPostsPanel({ posts, refresh }: { posts: ProgressPost[]; refresh: () => Promise<void> }) {
  const [notice, setNotice] = useState('');
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const visiblePosts = posts.filter((post) => !removedIds.includes(post.id));
  async function republish(post: ProgressPost) {
    if (!supabase) return;
    const { error } = await supabase.from('progress_posts').update({ is_hidden: false }).eq('id', post.id).eq('user_id', post.user_id);
    if (error) {
      setNotice(toJapaneseError(error.message));
      return;
    }
    setNotice('投稿を再公開しました。');
    await refresh();
  }
  async function deletePost(post: ProgressPost) {
    if (!supabase) return;
    if (!window.confirm('この非表示投稿を削除します。元に戻せません。よろしいですか？')) return;
    const { error } = await supabase.from('progress_posts').delete().eq('id', post.id).eq('user_id', post.user_id);
    if (error) {
      setNotice(toJapaneseError(error.message));
      return;
    }
    setRemovedIds((ids) => [...ids, post.id]);
    setNotice('非表示投稿を削除しました。');
    await refresh();
  }
  return (
    <section className="glass scroll-mt-24 rounded-[24px] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-emerald-300">非表示投稿</p>
          <h3 className="mt-1 text-xl font-black">非表示にした投稿の保存先</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">非表示にした投稿はここに残ります。必要になったら再公開できます。</p>
        </div>
        <span className="pill"><EyeOff size={14} /> {visiblePosts.length}件</span>
      </div>
      {notice && <p className="mt-3 rounded-2xl bg-white/8 p-3 text-sm text-slate-200">{notice}</p>}
      <div className="mt-4 grid gap-3">
        {visiblePosts.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">非表示投稿はありません。</p>
        ) : visiblePosts.map((post) => (
          <article key={post.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs text-slate-500">{new Date(post.created_at).toLocaleString('ja-JP')}</p>
            <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-200">{post.body || post.did_today || '本文はありません。'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn-secondary px-3 text-sm" onClick={() => republish(post)}><Eye size={15} /> 再公開する</button>
              <button type="button" className="btn-secondary px-3 text-sm" onClick={() => deletePost(post)}><Trash2 size={15} /> 削除</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EntrepreneurMeetingManager({ profile, meetings, refresh }: { profile: EntrepreneurProfile; meetings: any[]; refresh: () => Promise<void> }) {
  const [dateById, setDateById] = useState<Record<string, string>>({});
  const [messageById, setMessageById] = useState<Record<string, string>>({});
  const [removedMeetingIds, setRemovedMeetingIds] = useState<string[]>([]);
  const visibleMeetings = meetings.filter((meeting) => !removedMeetingIds.includes(meeting.id) && !['rejected_by_entrepreneur', 'cancelled'].includes(meeting.status));

  async function updateMeeting(id: string, patch: Record<string, any>) {
    await supabase!.from('meeting_requests').update(patch).eq('id', id);
    await refresh();
  }
  async function rejectMeeting(id: string) {
    const { error } = await supabase!.from('meeting_requests').delete().eq('id', id);
    if (error) await supabase!.from('meeting_requests').update({ status: 'rejected_by_entrepreneur' }).eq('id', id);
    setRemovedMeetingIds((ids) => [...ids, id]);
    await refresh();
  }

  async function reportMeeting(meeting: any) {
    if ((profile.meeting_ticket_balance ?? 0) <= 0) return;
    await supabase!.from('meeting_requests').update({
      status: 'reported_to_admin',
      final_meeting_at: dateById[meeting.id] || null,
      meeting_admin_report: messageById[meeting.id] || '面談日時を運営へ報告しました。',
      ticket_payment_status: 'used',
    }).eq('id', meeting.id);
    await refresh();
  }

  return (
    <section className="glass rounded-[24px] p-5">
      <h3 className="text-xl font-black">面談希望・面談用メッセージ</h3>
      <p className="mt-2 text-sm leading-6 text-amber-100">面談申請前にLeap外で面談を実行したことが発覚した場合、双方強制退会となります。</p>
      <div className="mt-4 grid gap-3">
        {visibleMeetings.length === 0 ? <p className="text-slate-400">面談希望はまだありません。</p> : visibleMeetings.map((meeting) => (
          <article key={meeting.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="font-bold">{meeting.message || '面談希望が届いています'}</p>
            <p className="mt-1 text-xs text-slate-500">状態: {meeting.status} / 希望日時: {meeting.proposed_at ? new Date(meeting.proposed_at).toLocaleString('ja-JP') : '未指定'}</p>
            {meeting.status === 'pending' && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-primary" onClick={() => updateMeeting(meeting.id, { status: 'accepted_by_entrepreneur' })}>承認</button>
                <button className="btn-secondary" onClick={() => rejectMeeting(meeting.id)}>非承認</button>
              </div>
            )}
            {meeting.status === 'accepted_by_entrepreneur' && (
              <div className="mt-3 grid gap-3">
                <label className="label">面談日程候補<input className="field" type="datetime-local" value={dateById[meeting.id] ?? ''} onChange={(e) => setDateById({ ...dateById, [meeting.id]: e.target.value })} /></label>
                <button className="btn-primary" onClick={() => updateMeeting(meeting.id, { status: 'candidate_sent', proposed_at: dateById[meeting.id] || null })}>日程候補を送る</button>
              </div>
            )}
            {(meeting.status === 'candidate_sent' || meeting.status === 'mutual_agreed') && (
              <div className="mt-3 grid gap-3">
                <textarea className="field min-h-24" value={messageById[meeting.id] ?? ''} onChange={(e) => setMessageById({ ...messageById, [meeting.id]: e.target.value })} placeholder="面談用メッセージ・運営への報告内容" />
                <button className="btn-primary" disabled={(profile.meeting_ticket_balance ?? 0) <= 0 || !dateById[meeting.id]} onClick={() => reportMeeting(meeting)}>
                  面談日程申込申請
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function SearchPage({ query, setQuery, profiles, investors, openProfile, refresh }: { query: string; setQuery: (q: string) => void; profiles: EntrepreneurProfile[]; investors: InvestorProfile[]; openProfile: (p: EntrepreneurProfile) => void; refresh: () => Promise<void> }) {
  const [filters, setFilters] = useState({ industry: '', location: '', phase: '', verified: false, interviewed: false });
  const [applied, setApplied] = useState({ query: '', industry: '', location: '', phase: '', verified: false, interviewed: false });
  const filteredEntrepreneurs = useMemo(() => {
    return profiles.filter((p) => {
      const text = `${p.account_name ?? ''} ${p.company_name} ${p.founder_name ?? ''} ${p.industry ?? ''} ${p.location ?? ''} ${p.tagline ?? ''}`.toLowerCase();
      return (!applied.query || text.includes(applied.query.toLowerCase()))
        && (!applied.industry || p.industry?.includes(applied.industry))
        && (!applied.location || p.location?.includes(applied.location))
        && (!applied.phase || p.current_phase === applied.phase)
        && (!applied.verified || p.verified_identity || p.verified_corporate)
        && (!applied.interviewed || p.verified_interview);
    });
  }, [profiles, applied]);
  const filteredInvestors = useMemo(() => {
    return investors.filter((p) => {
      const text = `${p.account_name ?? ''} ${p.full_name ?? ''} ${p.company_name ?? ''} ${p.location ?? ''}`.toLowerCase();
      return (!applied.query || text.includes(applied.query.toLowerCase()))
        && (!applied.location || p.location?.includes(applied.location))
        && !applied.industry
        && !applied.phase
        && (!applied.verified || Boolean(p.corporate_number || p.license_file_path))
        && !applied.interviewed;
    });
  }, [investors, applied]);
  const newEntrants = profiles.filter((p: any) => Date.now() - new Date(p.created_at).getTime() <= 7 * 24 * 60 * 60 * 1000);
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <section className="app-card p-5">
        <p className="app-section-title">検索・発見</p>
        <h2 className="mt-3 text-2xl font-black">アカウントを探す</h2>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
          <Search size={18} />
          <input className="field border-0 bg-transparent" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="アカウント名、会社名、名前、業界、地域で検索" />
        </div>
        <div className="mt-4 grid gap-3">
          <select className="field" value={filters.industry} onChange={(e) => setFilters({ ...filters, industry: e.target.value })}><option value="">業界すべて</option>{industryOptions.map((p) => <option key={p}>{p}</option>)}</select>
          <select className="field" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}><option value="">地域すべて</option>{locationOptions.map((p) => <option key={p}>{p}</option>)}</select>
          <select className="field" value={filters.phase} onChange={(e) => setFilters({ ...filters, phase: e.target.value })}><option value="">フェーズすべて</option>{phaseOptions.map((p) => <option key={p}>{p}</option>)}</select>
          <label className="pill"><input type="checkbox" onChange={(e) => setFilters({ ...filters, verified: e.target.checked })} /> 認証済み</label>
          <label className="pill"><input type="checkbox" onChange={(e) => setFilters({ ...filters, interviewed: e.target.checked })} /> 運営面談済み</label>
        </div>
        <button className="btn-primary mt-4 w-full" onClick={() => setApplied({ ...filters, query })}><Search size={17} /> この条件で検索する</button>
      </section>
      <section className="grid gap-4">
        {newEntrants.length > 0 && (
          <div className="app-card p-5">
            <h3 className="text-xl font-black">新規参入</h3>
            <div className="mt-3 grid gap-3">{newEntrants.map((p) => <StartupCard key={p.id} profile={p} onClick={() => openProfile(p)} />)}</div>
          </div>
        )}
        {filteredEntrepreneurs.length === 0 && filteredInvestors.length === 0 ? (
          <EmptyState title="条件に一致するアカウントはありません" body="検索条件を広げるか、アカウント名・会社名・名前で検索してください。" />
        ) : (
          <>
          {filteredEntrepreneurs.length > 0 && (
            <div className="app-card p-5">
              <h3 className="text-xl font-black">起業家アカウント</h3>
              <div className="mt-3 grid gap-3">{filteredEntrepreneurs.map((p) => <StartupCard key={p.id} profile={p} onClick={() => openProfile(p)} />)}</div>
            </div>
          )}
          {filteredInvestors.length > 0 && (
            <div className="app-card p-5">
              <h3 className="text-xl font-black">投資家アカウント</h3>
              <div className="mt-3 grid gap-3">{filteredInvestors.map((p) => <InvestorAccountCard key={p.id} profile={p} />)}</div>
            </div>
          )}
          </>
        )}
      </section>
    </div>
  );
}

function StartupProfile({ profile, currentUser, followers, following, profiles, investors, setView, setMessageTarget, openProfile, refresh }: { profile: EntrepreneurProfile; currentUser: AppUser; followers: any[]; following: any[]; profiles: EntrepreneurProfile[]; investors: InvestorProfile[]; setView: (view: View) => void; setMessageTarget: (target: DirectMessageTarget | null) => void; openProfile: (profile: EntrepreneurProfile) => void; refresh: () => Promise<void> }) {
  const [note, setNote] = useState('');
  const [meetingMessage, setMeetingMessage] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [comment, setComment] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [profileFollowers, setProfileFollowers] = useState<any[]>(followers);
  const [profileFollowing, setProfileFollowing] = useState<any[]>(following);
  const [showProfileComposer, setShowProfileComposer] = useState(false);
  const [investorGate, setInvestorGate] = useState<{ canContact: boolean; message: string }>({ canContact: currentUser.role !== 'investor', message: '' });
  const isOwnProfile = currentUser.id === profile.user_id;
  const isFollowingProfile = profileFollowers.some((row) => row.entrepreneur_id === profile.id && row.investor_id === currentUser.id);

  useEffect(() => {
    async function loadGate() {
      if (!supabase || currentUser.role !== 'investor') return;
      const { data } = await supabase.from('investor_profiles').select('corporate_number, license_file_path').eq('user_id', currentUser.id).maybeSingle();
      const verified = Boolean(data?.corporate_number || data?.license_file_path);
      setInvestorGate({
        canContact: verified,
        message: verified ? '' : '法人番号または運転免許証の提出が完了するまで、コメント・メッセージ・面談希望は利用できません。',
      });
    }
    loadGate();
  }, [currentUser.id, currentUser.role]);

  useEffect(() => {
    setProfileFollowers(followers);
    setProfileFollowing(following);
  }, [followers, following, profile.id]);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    Promise.all([
      supabase.from('follows').select('*').eq('entrepreneur_id', profile.id),
      supabase.from('follows').select('*').eq('investor_id', profile.user_id),
    ]).then(([followerResult, followingResult]) => {
      if (cancelled) return;
      setProfileFollowers(followerResult.data ?? []);
      setProfileFollowing(followingResult.data ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [profile.id, profile.user_id]);

  async function follow() {
    if (!supabase) return;
    if (isOwnProfile) {
      setActionMessage('自分のプロフィールはフォローできません。');
      return;
    }
    if (isFollowingProfile) {
      await supabase.from('follows').delete().eq('entrepreneur_id', profile.id).eq('investor_id', currentUser.id);
      setActionMessage(`${profile.company_name}のフォローを解除しました。`);
    } else {
      await supabase.from('follows').upsert({ entrepreneur_id: profile.id, investor_id: currentUser.id });
      await createNotification({ user_id: profile.user_id, type: 'follow', body: 'あなたのプロフィールがフォローされました。' });
      setActionMessage(`${profile.company_name}をフォローしました。`);
    }
    await refresh();
  }

  async function watch() {
    if (!supabase) return;
    await supabase.from('watchlists').upsert({ entrepreneur_id: profile.id, investor_id: currentUser.id, memo: note });
    await refresh();
  }

  async function requestMeeting() {
    if (!supabase) return;
    if (!investorGate.canContact) return;
    const { data: existing } = await supabase
      .from('meeting_requests')
      .select('id,status')
      .eq('entrepreneur_id', profile.id)
      .eq('investor_id', currentUser.id)
      .in('status', ['pending', 'accepted_by_entrepreneur', 'candidate_sent', 'investor_rejected_candidate', 'mutual_agreed', 'reported_to_admin']);
    if (existing?.length) {
      setActionMessage('同じ相手への面談申込は、承認または非承認まで再送できません。');
      return;
    }
    await supabase.from('meeting_requests').insert({
      entrepreneur_id: profile.id,
      investor_id: currentUser.id,
      message: meetingMessage,
      proposed_at: meetingDate || null,
    });
    await createNotification({ user_id: profile.user_id, type: 'meeting_request', body: '面談リクエストが届きました。' });
    setMeetingMessage('');
    setMeetingDate('');
    setActionMessage('面談申込をしました');
    await refresh();
  }

  async function blockProfileUser() {
    if (!supabase || isOwnProfile) return;
    await supabase.from('user_blocks').upsert({ blocker_id: currentUser.id, blocked_id: profile.user_id });
    await supabase.from('follows').delete().eq('entrepreneur_id', profile.id).eq('investor_id', currentUser.id);
    setActionMessage('このアカウントをブロックしました。相手のプロフィール、投稿、メッセージ、検索結果は表示されなくなります。');
    await refresh();
    setView('search');
  }

  async function sendMessage() {
    if (!supabase) return;
    if (isOwnProfile) {
      setActionMessage('自分のプロフィールにはメッセージを送信できません。');
      return;
    }
    if (containsContactInfo(comment)) {
      await supabase.from('contact_suspicions').insert({ sender_id: currentUser.id, receiver_id: profile.user_id, body: comment, reason: 'メッセージ内に連絡先交換の疑いがあります。' });
      setComment('連絡先交換につながる可能性がある内容は送信できません。');
      return;
    }
    await supabase.from('messages').insert({ sender_id: currentUser.id, receiver_id: profile.user_id, body: comment });
    await createNotification({ user_id: profile.user_id, type: 'message', body: '新しいメッセージが届きました。' });
    setComment('');
    setActionMessage('メッセージを送信しました。');
    await refresh();
    setView('messages');
  }

  async function quickMessage() {
    if (isOwnProfile) {
      setActionMessage('自分のプロフィールにはメッセージを送信できません。');
      return;
    }
    setMessageTarget({ userId: profile.user_id, name: profile.company_name, accountName: profile.account_name, entrepreneurId: profile.id });
    setView('messages');
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
      <section className="app-card overflow-hidden lg:col-span-2">
        <div className="h-28 bg-gradient-to-br from-blue-50 via-indigo-50 to-emerald-50" />
        <div className="grid gap-5 p-5 sm:grid-cols-[140px_1fr] sm:items-start">
          <div className="-mt-16 grid justify-items-center gap-3">
            <ProfileAvatar name={profile.company_name} avatarUrl={profile.avatar_url} size="lg" />
            {isOwnProfile && (
              <button className="btn-secondary h-11 w-11 rounded-full p-0" onClick={() => setShowProfileComposer(true)} aria-label="投稿を作成">
                <Plus size={22} />
              </button>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-blue-600">@{profile.account_name || 'account'}</p>
                <h2 className="mt-1 text-2xl font-black sm:text-3xl">{profile.company_name}</h2>
                <p className="mt-1 text-sm text-slate-500">{profile.founder_name} / {profile.current_phase ?? 'フェーズ未入力'}</p>
              </div>
              {isOwnProfile && <button className="btn-primary" onClick={() => setShowProfileComposer(true)}><Plus size={17} /> 投稿する</button>}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div><b className="block text-xl">{profileFollowing.length}</b><span className="text-xs text-slate-500">フォロー</span></div>
              <div><b className="block text-xl">{profileFollowers.length}</b><span className="text-xs text-slate-500">フォロワー</span></div>
              <div><b className="block text-xl">{yen(profile.total_investment_amount)}</b><span className="text-xs text-slate-500">累計投資</span></div>
            </div>
            <p className="mt-2 max-w-2xl whitespace-pre-line leading-7 text-slate-600">{profile.tagline || '一言説明は未入力です。'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="pill">{profile.industry ?? '業界未入力'}</span>
              <span className="pill">{profile.location ?? '所在地未入力'}</span>
              <span className="pill">{profile.current_phase ?? 'フェーズ未入力'}</span>
            </div>
          </div>
          {!isOwnProfile && (
            <div className="grid w-full gap-2 sm:col-span-2 sm:grid-cols-4">
              <button className={isFollowingProfile ? 'btn-secondary' : 'btn-primary'} onClick={follow}><Heart size={17} /> {isFollowingProfile ? 'フォロー解除' : 'フォロー'}</button>
              <button className="btn-secondary" onClick={quickMessage}><Send size={17} /> メッセージ</button>
              {currentUser.role === 'investor' && <button className="btn-secondary" onClick={watch}><Bookmark size={17} /> ウォッチ</button>}
              <button className="btn-secondary" onClick={blockProfileUser}><Ban size={17} /> ブロック</button>
            </div>
          )}
        </div>
        {showProfileComposer && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[24px] bg-white p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-lg font-black">新しい投稿</h3>
                <button className="btn-secondary px-3" onClick={() => setShowProfileComposer(false)}>閉じる</button>
              </div>
              <PostComposer profile={profile} refresh={async () => { await refresh(); setShowProfileComposer(false); }} />
            </div>
          </div>
        )}
        {actionMessage && <p className="mt-4 rounded-2xl bg-white/8 p-3 text-sm text-slate-200">{actionMessage}</p>}
        {!isOwnProfile && !investorGate.canContact && <p className="mt-4 rounded-2xl bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">通常メッセージは送信できます。コメント・面談希望は、法人番号または運転免許証の提出後に利用できます。</p>}
        <BadgeRow profile={profile} />
        {profile.is_hidden && (
          <div className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
            このプロフィールは現在非公開です。運営確認後、投資家に公開されます。
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-5 sm:grid-cols-4">
          <Metric label="現在フェーズ" value={profile.current_phase ?? '未入力'} icon={Rocket} />
          <Metric label="調達希望額" value={yen(profile.fundraising_amount)} icon={CircleDollarSign} />
          <Metric label="累計投資金額" value={yen(profile.total_investment_amount)} icon={CircleDollarSign} />
          <Metric label="フォロー数" value={`${profileFollowing.length}`} icon={Heart} />
          <Metric label="フォロワー数" value={`${profileFollowers.length}`} icon={UsersRound} />
          <Metric label="業界" value={profile.industry ?? '未入力'} icon={Building2} />
          <Metric label="所在地" value={profile.location ?? '未入力'} icon={UserRound} />
          <Metric label="最終ログイン" value={formatLastLogin((profile as any).users?.last_login_at)} icon={UserRound} />
        </div>
      </section>
      <FollowOverview following={profileFollowing} followers={profileFollowers} profiles={profiles} investors={investors} openProfile={openProfile} />
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
        {currentUser.role === 'investor' && !isOwnProfile && (
          <section className="glass rounded-[24px] p-5">
            <h3 className="text-xl font-black">投資家アクション</h3>
            {!investorGate.canContact && <p className="mt-3 rounded-2xl bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">{investorGate.message}</p>}
            <label className="label mt-4">投資メモ<textarea className="field min-h-24" value={note} onChange={(e) => setNote(e.target.value)} /></label>
            <label className="label mt-4">面談メッセージ<textarea className="field min-h-24" value={meetingMessage} onChange={(e) => setMeetingMessage(e.target.value)} /></label>
            <label className="label mt-4">面談希望日時<input className="field" type="datetime-local" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} /></label>
            <button className="btn-primary mt-4 w-full" disabled={!investorGate.canContact} onClick={requestMeeting}><CalendarClock size={17} /> 面談希望を送る</button>
            <label className="label mt-4">メッセージ<textarea className="field min-h-24" value={comment} onChange={(e) => setComment(e.target.value)} /></label>
            <button className="btn-secondary mt-4 w-full" onClick={sendMessage}><Send size={17} /> メッセージ送信</button>
          </section>
        )}
      </div>
    </div>
  );
}

function PostComposer({ profile, refresh }: { profile: EntrepreneurProfile; refresh: () => Promise<void> }) {
  const [form, setForm] = useState<Record<string, string>>({ visibility: 'public', post_type: 'private' });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [toast, setToast] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const isPrivatePost = form.post_type === 'private';
  const quickPostIdeas = ['今日の小さな進捗', 'いま困っていること', '投資家に聞きたいこと', '嬉しかった反応'];
  async function submit() {
    setErrorMessage('');
    const body = form.body?.trim() ?? '';
    const didToday = (form.did_today?.trim() || body.slice(0, 80) || '今日の投稿').trim();
    let attachment: Awaited<ReturnType<typeof uploadPublicAttachment>> | null = null;
    try {
      if (attachmentFile) attachment = await uploadPublicAttachment('post-attachments', profile.user_id, attachmentFile);
    } catch (error: any) {
      setErrorMessage(toJapaneseError(error.message));
      return;
    }
    const { error } = await supabase!.from('progress_posts').insert({
      entrepreneur_id: profile.id,
      user_id: profile.user_id,
      post_type: form.post_type,
      title: null,
      body: isPrivatePost ? body : null,
      did_today: isPrivatePost ? body.slice(0, 80) || '通常投稿' : didToday,
      metric_change: isPrivatePost ? null : form.metric_change,
      issue: isPrivatePost ? null : form.issue,
      next_action: isPrivatePost ? null : form.next_action,
      related_kpi: form.related_kpi,
      tags: splitTags(form.tags),
      visibility: form.visibility,
      is_hidden: false,
      attachment_url: attachment?.attachment_url ?? null,
      attachment_name: attachment?.attachment_name ?? null,
      attachment_type: attachment?.attachment_type ?? null,
    });
    if (error) {
      setErrorMessage(toJapaneseError(error.message));
      return;
    }
    setForm({ visibility: 'public', post_type: 'private' });
    setAttachmentFile(null);
    setToast('投稿しました');
    setTimeout(() => setToast(''), 2200);
    await refresh();
  }
  return (
    <section className="glass rounded-[24px] p-5">
      {toast && (
        <div className="fixed left-1/2 top-4 z-50 w-[calc(100vw-32px)] max-w-sm -translate-x-1/2 rounded-2xl border border-emerald-300/40 bg-slate-950/95 px-5 py-4 text-center text-base font-black text-emerald-100 shadow-2xl shadow-cyan-500/20">
          {toast}
        </div>
      )}
      <h3 className="text-xl font-black">気軽に投稿</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">短い近況だけでも大丈夫です。小さな実行や悩みも、投資家が成長を追う材料になります。</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className={isPrivatePost ? 'btn-primary' : 'btn-secondary'} onClick={() => setForm({ ...form, post_type: 'private' })}>ひとこと投稿</button>
        <button type="button" className={!isPrivatePost ? 'btn-primary' : 'btn-secondary'} onClick={() => setForm({ ...form, post_type: 'progress' })}>進捗テンプレ</button>
      </div>
      {isPrivatePost ? (
        <div className="mt-4 grid gap-4">
          <div className="flex flex-wrap gap-2">
            {quickPostIdeas.map((idea) => (
              <button key={idea} type="button" className="pill" onClick={() => setForm({ ...form, body: form.body || `${idea}について共有します。` })}>{idea}</button>
            ))}
          </div>
          <label className="label">本文<textarea className="field min-h-32" value={form.body ?? ''} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="例：今日は商談で良い反応がありました。次は導入条件を整理します。" /></label>
          <label className="label">タグ（任意）<input className="field" value={form.tags ?? ''} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="例：営業, プロダクト" /></label>
        </div>
      ) : (
        <FieldGrid textarea fields={['did_today:今日やったこと', 'metric_change:数値の変化', 'issue:課題', 'next_action:次にやること', 'related_kpi:関連KPI', 'tags:タグ（カンマ区切り）']} form={form} set={(n, v) => setForm({ ...form, [n]: v })} />
      )}
      <label className="label mt-4">公開範囲<select className="field" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>{visibilityOptions.map((v) => <option key={v} value={v}>{visibilityLabels[v]}</option>)}</select></label>
      <label className="label mt-4">画像・ファイル（任意）
        <input className="field" type="file" accept="image/*,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx" onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)} />
      </label>
      {attachmentFile && <p className="mt-2 text-sm text-slate-400"><Paperclip size={14} className="inline" /> {attachmentFile.name}</p>}
      <button className="btn-primary mt-4 w-full" onClick={submit} disabled={isPrivatePost ? !form.body?.trim() : !form.did_today?.trim()}><Plus size={17} /> 投稿する</button>
      {errorMessage && <p className="mt-3 rounded-2xl bg-rose-400/10 p-3 text-sm text-rose-100">{errorMessage}</p>}
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
  async function requestConsultation() {
    if (!supabase) return;
    const { error } = await supabase.from('contact_inquiries').insert({
      user_id: profile.user_id,
      category: 'pitch_consultation',
      body: `${profile.company_name} がピッチ資料の相談を希望しています。運営からメッセージで連絡してください。`,
    });
    if (error) {
      setMessage(toJapaneseError(error.message));
      return;
    }
    await processTriggeredEmailNotifications();
    setMessage('ピッチ資料の相談申請を運営へ送信しました。');
  }
  return (
    <section className="glass rounded-[24px] p-5">
      <h3 className="text-xl font-black">ピッチ資料</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">投資家が面談前に確認できる資料を安全なファイル保管場所へ保存します。見せ方や構成に迷う場合は、運営へ相談申請できます。</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input className="field" placeholder="資料タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="field" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button className="btn-primary" onClick={upload}><FileText size={17} /> 保存</button>
      </div>
      <button className="btn-secondary mt-3 w-full" onClick={requestConsultation}><MessageCircle size={17} /> ピッチ資料の相談申請を希望する</button>
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

function AllPostsPage({ posts, currentUser, investor, openProfile, refresh }: { posts: ProgressPost[]; currentUser: AppUser; investor: InvestorProfile | null; openProfile: (profile: EntrepreneurProfile) => void; refresh: () => Promise<void> }) {
  const [messageByPost, setMessageByPost] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [removedPostIds, setRemovedPostIds] = useState<string[]>([]);
  const canMessage = currentUser.role !== 'investor' || Boolean(investor?.corporate_number || investor?.license_file_path);
  const visiblePosts = posts.filter((post) => !removedPostIds.includes(post.id) && !post.is_hidden);

  async function quickFollow(profile?: EntrepreneurProfile) {
    if (!supabase || !profile) return;
    await supabase.from('follows').upsert({ entrepreneur_id: profile.id, investor_id: currentUser.id });
    await createNotification({ user_id: profile.user_id, type: 'follow', body: '投資家があなたをフォローしました。' });
    setNotice(`${profile.company_name}をフォローしました。`);
    await refresh();
  }

  async function quickMessage(post: ProgressPost) {
    if (!supabase) return;
    const profile = post.entrepreneur_profiles;
    const body = messageByPost[post.id]?.trim();
    if (!profile || !body) return;
    if (!canMessage) {
      setNotice('法人番号または運転免許証の提出後にメッセージを送信できます。');
      return;
    }
    if (containsContactInfo(body)) {
      await supabase.from('contact_suspicions').insert({ sender_id: currentUser.id, receiver_id: profile.user_id, body, reason: 'メッセージ内に連絡先交換の疑いがあります。' });
      setNotice('連絡先交換につながる可能性がある内容は送信できません。');
      return;
    }
    await supabase.from('messages').insert({ sender_id: currentUser.id, receiver_id: profile.user_id, body });
    await createNotification({ user_id: profile.user_id, type: 'message', body: '新しいメッセージが届きました。' });
    setMessageByPost({ ...messageByPost, [post.id]: '' });
    setNotice('メッセージを送信しました。');
  }

  async function openTimelineProfile(post: ProgressPost) {
    if (!supabase) {
      if (post.entrepreneur_profiles) openProfile(post.entrepreneur_profiles);
      setNotice('プロフィール情報を取得できませんでした。');
      return;
    }
    const { data, error } = await supabase.from('entrepreneur_profiles').select('*').eq('id', post.entrepreneur_id).maybeSingle();
    if (error || !data) {
      if (post.entrepreneur_profiles) {
        openProfile(post.entrepreneur_profiles);
        return;
      }
      setNotice('プロフィール情報を取得できませんでした。時間をおいて再度お試しください。');
      return;
    }
    openProfile(data as EntrepreneurProfile);
  }

  async function hideOwnPost(post: ProgressPost) {
    if (!supabase || post.user_id !== currentUser.id) return false;
    const { error } = await supabase.from('progress_posts').update({ is_hidden: true }).eq('id', post.id).eq('user_id', currentUser.id);
    if (error) {
      setNotice(toJapaneseError(error.message));
      return false;
    }
    setRemovedPostIds((ids) => [...ids, post.id]);
    setNotice('投稿を非公開にしました。');
    await refresh();
    return true;
  }

  async function deleteOwnPost(post: ProgressPost) {
    if (!supabase || post.user_id !== currentUser.id) return false;
    const ok = window.confirm('この投稿を削除します。元に戻せません。よろしいですか？');
    if (!ok) return false;
    const { error } = await supabase.from('progress_posts').delete().eq('id', post.id).eq('user_id', currentUser.id);
    if (error) {
      const { error: hideError } = await supabase.from('progress_posts').update({ is_hidden: true }).eq('id', post.id).eq('user_id', currentUser.id);
      if (hideError) {
        setNotice(toJapaneseError(error.message));
        return false;
      }
      setRemovedPostIds((ids) => [...ids, post.id]);
      setNotice('投稿を一覧から削除しました。');
      await refresh();
      return true;
    }
    setRemovedPostIds((ids) => [...ids, post.id]);
    setNotice('投稿を削除しました。');
    await refresh();
    return true;
  }

  async function reactToPost(post: ProgressPost, action: 'like' | 'save' | 'report') {
    if (!supabase) return;
    if (action === 'like') {
      const { error } = await supabase.from('post_likes').upsert({ post_id: post.id, user_id: currentUser.id });
      setNotice(error ? toJapaneseError(error.message) : 'いいねしました。');
      return;
    }
    if (action === 'save') {
      const { error } = await supabase.from('watchlists').upsert({ entrepreneur_id: post.entrepreneur_id, investor_id: currentUser.id, memo: `保存した投稿: ${post.did_today.slice(0, 80)}` });
      setNotice(error ? toJapaneseError(error.message) : '保存しました。');
      return;
    }
    const { error } = await supabase.from('reports').insert({ reporter_id: currentUser.id, target_type: 'progress_posts', target_id: post.id, reason: '投稿内容の確認依頼' });
    setNotice(error ? toJapaneseError(error.message) : '通報を送信しました。');
  }

  return (
    <section className="mx-auto grid w-full max-w-2xl gap-4">
      <div className="px-1">
        <p className="text-sm font-bold text-emerald-300">投稿</p>
        <h2 className="mt-1 text-3xl font-black">タイムライン</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">起業家の近況や進捗を時系列で確認できます。気になる投稿からすぐにプロフィール確認、フォロー、メッセージができます。</p>
      </div>
      {notice && <p className="rounded-2xl bg-white/8 p-3 text-sm text-slate-200">{notice}</p>}
      {visiblePosts.length === 0 ? (
        <EmptyState title="表示できる投稿はまだありません" body="起業家が投稿すると、この一覧に表示されます。" />
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/25">
          {visiblePosts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              currentUser={currentUser}
              investor={investor}
              messageValue={messageByPost[post.id]}
              setMessage={(value) => setMessageByPost({ ...messageByPost, [post.id]: value })}
              openTimelineProfile={openTimelineProfile}
              quickFollow={quickFollow}
              quickMessage={quickMessage}
              hideOwnPost={hideOwnPost}
              deleteOwnPost={deleteOwnPost}
              reactToPost={reactToPost}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function FeedPost({
  post,
  currentUser,
  investor,
  messageValue,
  setMessage,
  openTimelineProfile,
  quickFollow,
  quickMessage,
  hideOwnPost,
  deleteOwnPost,
  reactToPost,
}: {
  post: ProgressPost;
  currentUser: AppUser;
  investor: InvestorProfile | null;
  messageValue?: string;
  setMessage: (value: string) => void;
  openTimelineProfile: (post: ProgressPost) => Promise<void>;
  quickFollow: (profile?: EntrepreneurProfile) => Promise<void>;
  quickMessage: (post: ProgressPost) => Promise<void>;
  hideOwnPost: (post: ProgressPost) => Promise<boolean>;
  deleteOwnPost: (post: ProgressPost) => Promise<boolean>;
  reactToPost: (post: ProgressPost, action: 'like' | 'save' | 'report') => Promise<void>;
}) {
  const [removed, setRemoved] = useState(false);
  const [viewCount, setViewCount] = useState(post.view_count ?? 0);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [commentCount] = useState(post.comment_count ?? 0);
  const [resolvedProfile, setResolvedProfile] = useState<EntrepreneurProfile | undefined>(post.entrepreneur_profiles);
  const profile = resolvedProfile ?? post.entrepreneur_profiles;
  const isPrivatePost = post.post_type === 'private';
  const canMessage = currentUser.role !== 'investor' || Boolean(investor?.corporate_number || investor?.license_file_path);
  const companyName = profile?.company_name || '起業家';
  const accountName = profile?.account_name || 'アカウント名未設定';
  const postedAt = new Date(post.created_at).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  useEffect(() => {
    if (!supabase || !currentUser || currentUser.id === post.user_id) return;
    let cancelled = false;
    supabase.rpc('increment_post_view', { post_id_input: post.id }).then(({ data }) => {
      if (!cancelled && typeof data === 'number') setViewCount(data);
    });
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, post.id, post.user_id]);

  useEffect(() => {
    setResolvedProfile(post.entrepreneur_profiles);
  }, [post.entrepreneur_profiles?.id, post.entrepreneur_profiles?.account_name, post.entrepreneur_profiles?.company_name]);

  useEffect(() => {
    if (!supabase || !post.entrepreneur_id) return;
    let cancelled = false;
    supabase
      .from('entrepreneur_profiles')
      .select('*')
      .eq('id', post.entrepreneur_id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setResolvedProfile(data as EntrepreneurProfile);
      });
    return () => {
      cancelled = true;
    };
  }, [post.entrepreneur_id]);

  if (removed) return null;

  return (
    <article className="border-b border-white/10 p-4 last:border-b-0 sm:p-5">
      <div className="grid grid-cols-[44px_1fr] gap-3">
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-300/30 bg-gradient-to-br from-cyan-400/25 via-violet-400/20 to-emerald-300/20 text-base font-black text-cyan-100"
          onClick={() => openTimelineProfile(post)}
          aria-label={`${companyName}のプロフィールを見る`}
        >
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : companyName.slice(0, 1)}
        </button>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <button type="button" className="truncate text-left font-black text-slate-50 hover:text-cyan-200" onClick={() => openTimelineProfile(post)}>
              {companyName}
            </button>
            <span className="truncate text-sm font-bold text-cyan-300">@{accountName}</span>
            <span className="text-sm text-slate-500">・</span>
            <span className="text-sm text-slate-500">{postedAt}</span>
          </div>
          <button type="button" className="mt-1 text-left text-xs font-bold text-cyan-300 hover:text-cyan-100" onClick={() => openTimelineProfile(post)}>
            プロフィールを見る
          </button>
          {!isPrivatePost && <h3 className="mt-3 break-words text-lg font-black leading-7 text-slate-50">{post.did_today}</h3>}
          {isPrivatePost ? (
            <p className="mt-2 whitespace-pre-line break-words leading-7 text-slate-300">{post.body || '本文はありません。'}</p>
          ) : (
            <div className="mt-3 grid gap-3">
              <TimelineDetail title="数値の変化" body={post.metric_change} />
              <TimelineDetail title="課題" body={post.issue} />
              <TimelineDetail title="次にやること" body={post.next_action} />
            </div>
          )}
          {post.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => <span className="text-sm font-bold text-cyan-300" key={tag}>#{tag}</span>)}
            </div>
          ) : null}
          <AttachmentPreview url={post.attachment_url} name={post.attachment_name} type={post.attachment_type} />
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <span className="pill"><Gauge size={13} /> 閲覧 {viewCount.toLocaleString()}回</span>
            <span className="pill"><Heart size={13} /> いいね {likeCount.toLocaleString()}</span>
            <span className="pill"><MessageCircle size={13} /> コメント {commentCount.toLocaleString()}</span>
            <span className="pill"><TrendingUp size={13} /> {isPrivatePost ? '通常投稿' : '進捗投稿'}</span>
            {currentUser.role === 'investor' && profile && (
              <>
                <button type="button" className="btn-secondary min-h-10 px-3 text-sm" onClick={async () => { await reactToPost(post, 'like'); setLikeCount((current) => current + 1); }}><Heart size={15} /> いいね</button>
                <button type="button" className="btn-secondary min-h-10 px-3 text-sm" onClick={() => reactToPost(post, 'save')}><Bookmark size={15} /> 保存</button>
                <button type="button" className="btn-secondary min-h-10 px-3 text-sm" onClick={() => reactToPost(post, 'report')}><Flag size={15} /> 通報</button>
                <button type="button" className="btn-secondary min-h-10 px-3 text-sm" onClick={() => quickFollow(profile)}><Heart size={15} /> フォロー</button>
                <button type="button" className="btn-secondary min-h-10 px-3 text-sm" onClick={() => setMessage(messageValue ?? '投稿を拝見しました。詳しくお話を伺いたいです。')}><Send size={15} /> メッセージ</button>
              </>
            )}
            {currentUser.id === post.user_id && (
              <>
                <button type="button" className="btn-secondary min-h-10 px-3 text-sm" onClick={async () => { if (await hideOwnPost(post)) setRemoved(true); }}><EyeOff size={15} /> 非公開</button>
                <button type="button" className="btn-secondary min-h-10 px-3 text-sm" onClick={async () => { if (await deleteOwnPost(post)) setRemoved(true); }}><Trash2 size={15} /> 削除</button>
              </>
            )}
          </div>
          {messageValue !== undefined && (
            <div className="mt-3 grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 sm:grid-cols-[1fr_auto]">
              {!canMessage && <p className="sm:col-span-2 rounded-2xl bg-amber-300/10 p-3 text-sm text-amber-100">法人番号または運転免許証の提出後にメッセージを送信できます。</p>}
              <input className="field" value={messageValue} onChange={(e) => setMessage(e.target.value)} placeholder="短いメッセージを書く" />
              <button className="btn-primary" onClick={() => quickMessage(post)} disabled={!canMessage}><Send size={16} /> 送信</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function TimelineDetail({ title, body }: { title: string; body?: string | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <span className="text-xs font-bold text-cyan-300">{title}</span>
      <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-slate-300">{body || '未入力'}</p>
    </div>
  );
}

function AttachmentPreview({ url, name, type }: { url?: string | null; name?: string | null; type?: string | null }) {
  if (!url) return null;
  const isImage = type?.startsWith('image/');
  return (
    <a className="mt-3 block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50" href={url} target="_blank" rel="noreferrer">
      {isImage ? (
        <img src={url} alt={name || '添付画像'} className="max-h-[420px] w-full object-cover" />
      ) : (
        <div className="flex items-center gap-2 p-4 text-sm font-bold text-slate-700">
          <Paperclip size={18} /> {name || '添付ファイルを開く'}
        </div>
      )}
    </a>
  );
}

function AdminHome({ adminData, refresh, openProfile }: { adminData: Record<string, any[]>; refresh: () => Promise<void>; openProfile: (profile: EntrepreneurProfile) => void }) {
  const [adminSection, setAdminSection] = useState<'dashboard' | 'members' | 'messages' | 'approvals' | 'badges'>('dashboard');
  const [messageSearch, setMessageSearch] = useState('');
  const [approvalSearch, setApprovalSearch] = useState('');
  const [badgeSearch, setBadgeSearch] = useState('');
  async function update(table: string, id: string, patch: Record<string, any>, action: string) {
    await supabase!.from(table).update(patch).eq('id', id);
    await supabase!.from('admin_actions').insert({ target_type: table, target_id: id, action });
    await refresh();
  }
  async function resolveInquiry(row: any, status: 'hold' | 'done') {
    if (status === 'done') {
      await supabase!.from('contact_inquiries').delete().eq('id', row.id);
      await supabase!.from('admin_actions').insert({ target_type: 'contact_inquiries', target_id: row.id, action: '問い合わせ対応済み' });
    } else {
      await update('contact_inquiries', row.id, { status: 'hold' }, '問い合わせ保留');
      return;
    }
    await refresh();
  }
  async function approveTicketPayment(row: EntrepreneurProfile) {
    const requestedCount = row.meeting_ticket_requested_count ?? 0;
    if (requestedCount <= 0) return;
    await update('entrepreneur_profiles', row.id, {
      meeting_ticket_balance: (row.meeting_ticket_balance ?? 0) + requestedCount,
      meeting_ticket_payment_status: 'paid',
      meeting_ticket_plan: null,
      meeting_ticket_requested_count: 0,
      meeting_ticket_requested_amount: null,
      meeting_ticket_transfer_name: null,
    }, '面談チケット着金確認・専用画面から付与');
  }
  async function approveMeetingDate(row: any) {
    const entrepreneur = entrepreneurs.find((profile) => profile.id === row.entrepreneur_id);
    if (entrepreneur) {
      await supabase!.from('entrepreneur_profiles').update({ meeting_ticket_balance: Math.max(0, (entrepreneur.meeting_ticket_balance ?? 0) - 1) }).eq('id', entrepreneur.id);
    }
    await update('meeting_requests', row.id, { status: 'meeting_date_approved', confirmed_at: new Date().toISOString(), ticket_payment_status: 'used' }, '面談日程申請承認・チケット消費');
  }
  const reports = adminData.reports ?? [];
  const entrepreneurs = adminData.entrepreneurs ?? [];
  const investors = adminData.investors ?? [];
  const ticketPaymentPending = entrepreneurs.filter((row) => row.meeting_ticket_payment_status === 'pending_review');
  const meetingDatePending = (adminData.meetings ?? []).filter((row) => row.status === 'reported_to_admin');
  const visibleInquiries = (adminData.inquiries ?? []).filter((row) => !['support_message', 'support_reply'].includes(row.category));
  const missingDocuments = investors.filter((row) => !row.corporate_number && !row.license_file_path);
  const users = adminData.users ?? [];
  const memberRows = users.map((row) => ({
    ...row,
    entrepreneur: entrepreneurs.find((profile) => profile.user_id === row.id),
    investor: investors.find((profile) => profile.user_id === row.id),
  }));
  function memberDisplayName(row: any) {
    return row.entrepreneur?.account_name || row.investor?.account_name || row.entrepreneur?.company_name || row.investor?.company_name || row.investor?.full_name || row.email || row.id;
  }
  function memberSearchText(row: any) {
    return `${row.email ?? ''} ${row.role ?? ''} ${row.entrepreneur?.account_name ?? ''} ${row.investor?.account_name ?? ''} ${row.entrepreneur?.company_name ?? ''} ${row.investor?.company_name ?? ''} ${row.investor?.full_name ?? ''}`.toLowerCase();
  }
  const userById = new Map(users.map((row) => [row.id, row]));
  const entrepreneurById = new Map(entrepreneurs.map((row) => [row.id, row]));
  const investorByUserId = new Map(investors.map((row) => [row.user_id, row]));
  function meetingAdminMeta(row: any) {
    const entrepreneur = entrepreneurById.get(row.entrepreneur_id);
    const investor = investorByUserId.get(row.investor_id);
    const investorUser = userById.get(row.investor_id);
    const investorName = investor?.account_name || investor?.company_name || investor?.full_name || investorUser?.email || row.investor_id;
    const entrepreneurName = entrepreneur?.account_name || entrepreneur?.company_name || row.entrepreneur_id;
    return { entrepreneur, investor, investorName, entrepreneurName };
  }
  const messageRows = (adminData.allMessages ?? []).filter((row) => {
    if (!messageSearch.trim()) return true;
    const term = messageSearch.trim().toLowerCase();
    const sender = memberRows.find((member) => member.id === row.sender_id);
    const receiver = memberRows.find((member) => member.id === row.receiver_id);
    return [sender?.email, sender?.entrepreneur?.account_name, sender?.investor?.account_name, sender?.entrepreneur?.company_name, sender?.investor?.company_name, receiver?.email, receiver?.entrepreneur?.account_name, receiver?.investor?.account_name, receiver?.entrepreneur?.company_name, receiver?.investor?.company_name, row.body]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term));
  });
  const approvalRows = memberRows.filter((row) => !approvalSearch.trim() || memberSearchText(row).includes(approvalSearch.trim().toLowerCase()));
  const badgeRows = entrepreneurs.filter((row) => {
    if (!badgeSearch.trim()) return true;
    const term = badgeSearch.trim().toLowerCase();
    return `${row.account_name ?? ''} ${row.company_name ?? ''} ${row.founder_name ?? ''} ${row.industry ?? ''} ${row.location ?? ''}`.toLowerCase().includes(term);
  });
  if (adminSection === 'members') {
    return (
      <section className="grid gap-4">
        <button className="btn-secondary w-fit" onClick={() => setAdminSection('dashboard')}>管理者画面へ戻る</button>
        <AdminTable title="メンバー一覧" rows={memberRows} render={(row) => (
          <AdminRow
            key={row.id}
            title={memberDisplayName(row)}
            meta={`起業家: ${row.entrepreneur?.company_name ?? 'なし'} / 投資家: ${row.investor?.company_name ?? row.investor?.full_name ?? 'なし'}`}
          >
            {row.entrepreneur && <button className="btn-secondary" onClick={() => openProfile(row.entrepreneur)}>起業家プロフィール</button>}
            {row.investor && <span className="pill"><CircleDollarSign size={13} /> 投資家</span>}
          </AdminRow>
        )} />
      </section>
    );
  }
  if (adminSection === 'approvals') {
    return (
      <section className="grid gap-4">
        <button className="btn-secondary w-fit" onClick={() => setAdminSection('dashboard')}>管理者画面へ戻る</button>
        <input className="field" value={approvalSearch} onChange={(e) => setApprovalSearch(e.target.value)} placeholder="アカウント名、会社名、メールアドレスで検索" />
        <AdminTable title="ユーザー承認・停止 一覧" rows={approvalRows} render={(row) => (
          <AdminRow
            key={row.id}
            title={memberDisplayName(row)}
            meta={`メール: ${row.email ?? '未登録'} / ${roleLabels[row.role as UserRole] ?? row.role} / プロフィール: ${row.profile_completed ? '完了' : '未完了'} / 状態: ${row.is_suspended ? '停止中' : '利用中'}`}
          >
            {row.entrepreneur && <button className="btn-secondary" onClick={() => openProfile(row.entrepreneur)}>プロフィール</button>}
            {row.investor && <span className="pill"><CircleDollarSign size={13} /> 投資家</span>}
            <button className="btn-secondary" onClick={() => update('users', row.id, { is_suspended: !row.is_suspended }, row.is_suspended ? 'ユーザー停止解除' : 'ユーザー停止')}>{row.is_suspended ? '停止解除' : '停止'}</button>
          </AdminRow>
        )} />
      </section>
    );
  }
  if (adminSection === 'badges') {
    return (
      <section className="grid gap-4">
        <button className="btn-secondary w-fit" onClick={() => setAdminSection('dashboard')}>管理者画面へ戻る</button>
        <input className="field" value={badgeSearch} onChange={(e) => setBadgeSearch(e.target.value)} placeholder="アカウント名、会社名、代表者名で検索" />
        <AdminTable title="起業家審査・バッジ付与 一覧" rows={badgeRows} render={(row) => (
          <AdminRow key={row.id} title={row.account_name ? `@${row.account_name} / ${row.company_name}` : row.company_name} meta={`${row.industry ?? '業界未入力'} / 公開: ${row.is_hidden ? '非公開' : '公開中'} / 累計投資金額: ${yen(row.total_investment_amount)}`}>
            <button className="btn-secondary" onClick={() => openProfile(row)}>プロフィール</button>
            <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_identity: !row.verified_identity }, '本人確認ステータス変更')}>本人確認</button>
            <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_corporate: !row.verified_corporate }, '法人確認ステータス変更')}>法人確認</button>
            <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_interview: !row.verified_interview }, '運営面談済みバッジ付与')}>面談済み</button>
            <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_revenue: !row.verified_revenue }, '売上確認済みバッジ付与')}>売上確認</button>
            <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { is_hidden: !row.is_hidden }, row.is_hidden ? '起業家プロフィール再公開' : '起業家プロフィール非公開')}>{row.is_hidden ? '公開' : '非公開'}</button>
          </AdminRow>
        )} />
      </section>
    );
  }
  if (adminSection === 'messages') {
    return (
      <section className="grid gap-4">
        <button className="btn-secondary w-fit" onClick={() => setAdminSection('dashboard')}>管理者画面へ戻る</button>
        <input className="field" value={messageSearch} onChange={(e) => setMessageSearch(e.target.value)} placeholder="アカウント名、会社名、メールアドレスで検索" />
        <AdminTable title="ユーザーメッセージ一覧" rows={messageRows} render={(row) => {
          const sender = memberRows.find((member) => member.id === row.sender_id);
          const receiver = memberRows.find((member) => member.id === row.receiver_id);
          const senderName = sender?.entrepreneur?.account_name || sender?.investor?.account_name || sender?.entrepreneur?.company_name || sender?.investor?.company_name || sender?.email || row.sender_id;
          const receiverName = receiver?.entrepreneur?.account_name || receiver?.investor?.account_name || receiver?.entrepreneur?.company_name || receiver?.investor?.company_name || receiver?.email || row.receiver_id;
          return (
            <AdminRow key={row.id} title={row.body} meta={`${senderName} → ${receiverName} / ${new Date(row.created_at).toLocaleString('ja-JP')}`}>
              {sender?.entrepreneur && <button className="btn-secondary" onClick={() => openProfile(sender.entrepreneur)}>送信者プロフィール</button>}
              {receiver?.entrepreneur && <button className="btn-secondary" onClick={() => openProfile(receiver.entrepreneur)}>受信者プロフィール</button>}
            </AdminRow>
          );
        }} />
      </section>
    );
  }
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="ユーザー一覧" value={`${adminData.users?.length ?? 0}`} icon={UsersRound} />
        <Metric label="起業家一覧" value={`${adminData.entrepreneurs?.length ?? 0}`} icon={Building2} />
        <Metric label="投稿一覧" value={`${adminData.posts?.length ?? 0}`} icon={FileText} />
        <Metric label="運営相談" value={`${adminData.inquiries?.length ?? 0}`} icon={MessageCircle} />
        <Metric label="チケット申請" value={`${ticketPaymentPending.length}`} icon={CircleDollarSign} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn-secondary" onClick={() => setAdminSection('members')}><UsersRound size={16} /> メンバー一覧を開く</button>
        <button className="btn-secondary" onClick={() => setAdminSection('messages')}><Mail size={16} /> メッセージ確認を開く</button>
        <button className="btn-secondary" onClick={() => setAdminSection('approvals')}><ShieldCheck size={16} /> ユーザー承認を開く</button>
        <button className="btn-secondary" onClick={() => setAdminSection('badges')}><BadgeCheck size={16} /> バッジ付与を開く</button>
      </div>
      {reports.length === 0 && <EmptyState title="現在確認が必要な通報はありません。" />}
      <AdminTable title="面談チケット入金確認申請" rows={ticketPaymentPending} render={(row) => (
        <AdminRow
          key={row.id}
          title={row.company_name || row.user_id}
          meta={`申請: ${row.meeting_ticket_plan ?? `${row.meeting_ticket_requested_count ?? 0}枚`} / 金額: ${row.meeting_ticket_requested_amount ? yen(row.meeting_ticket_requested_amount) : '未入力'} / 振込名義: ${row.meeting_ticket_transfer_name ?? '未入力'} / 現在の保有: ${row.meeting_ticket_balance ?? 0}枚`}
        >
          <button className="btn-primary" onClick={() => approveTicketPayment(row)}>入金確認してチケット付与</button>
        </AdminRow>
      )} />
      <AdminTable title="面談日程申込申請" rows={meetingDatePending} render={(row) => (
        <AdminRow key={row.id} title={`${meetingAdminMeta(row).investorName} → ${meetingAdminMeta(row).entrepreneurName}`} meta={`日時: ${row.final_meeting_at ? new Date(row.final_meeting_at).toLocaleString('ja-JP') : '未入力'} / 補足: ${row.meeting_admin_report ?? 'なし'}`}>
          {meetingAdminMeta(row).entrepreneur && <button className="btn-secondary" onClick={() => openProfile(meetingAdminMeta(row).entrepreneur)}>起業家確認</button>}
          <button className="btn-primary" onClick={() => approveMeetingDate(row)}>承認</button>
          <button className="btn-secondary" onClick={() => update('meeting_requests', row.id, { status: 'meeting_date_rejected' }, '面談日程申請非承認')}>非承認</button>
        </AdminRow>
      )} />
      <AdminTable title="運営相談・お問い合わせ" rows={visibleInquiries} render={(row) => (
        <AdminRow key={row.id} title={row.category ?? '問い合わせ'} meta={`${row.email ?? 'メール未登録'} / ${new Date(row.created_at).toLocaleString('ja-JP')} / ${row.body ?? ''}`}>
          <button className="btn-secondary" onClick={() => resolveInquiry(row, 'hold')}>保留</button>
          <button className="btn-primary" onClick={() => resolveInquiry(row, 'done')}>対応済</button>
        </AdminRow>
      )} />
      <AdminTable title="未対応ユーザー一覧" rows={[...ticketPaymentPending.map((row) => ({ ...row, kind: '起業家：面談チケット入金確認待ち' })), ...missingDocuments.map((row) => ({ ...row, kind: '投資家：法人番号または免許証未提出' }))]} render={(row) => (
        <AdminRow key={`${row.kind}-${row.id}`} title={row.company_name || row.full_name || row.user_id} meta={row.kind}>
          <span className="pill">確認待ち</span>
        </AdminRow>
      )} />
      <AdminTable title="ユーザー承認・停止" rows={memberRows.slice(0, 5)} render={(row) => (
        <AdminRow key={row.id} title={memberDisplayName(row)} meta={`メール: ${row.email ?? '未登録'} / ${roleLabels[row.role as UserRole] ?? row.role} / プロフィール: ${row.profile_completed ? '完了' : '未完了'}`}>
          {row.entrepreneur && <button className="btn-secondary" onClick={() => openProfile(row.entrepreneur)}>プロフィール</button>}
          <button className="btn-secondary" onClick={() => update('users', row.id, { is_suspended: !row.is_suspended }, row.is_suspended ? 'ユーザー停止解除' : 'ユーザー停止')}>{row.is_suspended ? '停止解除' : '停止'}</button>
        </AdminRow>
      )} />
      <button className="btn-secondary w-fit" onClick={() => setAdminSection('approvals')}>ユーザー承認をもっと見る</button>
      <AdminTable title="起業家審査・バッジ付与" rows={entrepreneurs.slice(0, 5)} render={(row) => (
        <AdminRow key={row.id} title={row.account_name ? `@${row.account_name} / ${row.company_name}` : row.company_name} meta={`${row.industry ?? '業界未入力'} / 公開: ${row.is_hidden ? '非公開' : '公開中'} / 累計投資金額: ${yen(row.total_investment_amount)} / チケット: ${row.meeting_ticket_plan ?? '未申請'} ${row.meeting_ticket_requested_amount ? yen(row.meeting_ticket_requested_amount) : ''}`}>
          <button className="btn-secondary" onClick={() => openProfile(row)}>プロフィール</button>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_identity: !row.verified_identity }, '本人確認ステータス変更')}>本人確認</button>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_corporate: !row.verified_corporate }, '法人確認ステータス変更')}>法人確認</button>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_interview: !row.verified_interview }, '運営面談済みバッジ付与')}>面談済み</button>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_revenue: !row.verified_revenue }, '売上確認済みバッジ付与')}>売上確認</button>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { is_hidden: !row.is_hidden }, row.is_hidden ? '起業家プロフィール再公開' : '起業家プロフィール非公開')}>{row.is_hidden ? '公開' : '非公開'}</button>
        </AdminRow>
      )} />
      <button className="btn-secondary w-fit" onClick={() => setAdminSection('badges')}>バッジ付与をもっと見る</button>
      <AdminTable title="連絡先交換の疑い" rows={adminData.contactSuspicions ?? []} render={(row) => (
        <AdminRow key={row.id} title={row.reason} meta={row.body}>
          <span className="pill">送信ブロック済み</span>
        </AdminRow>
      )} />
      <AdminTable title="投稿非表示" rows={adminData.posts ?? []} render={(row) => (
        <AdminRow key={row.id} title={row.did_today} meta={new Date(row.created_at).toLocaleString('ja-JP')}>
          <button className="btn-secondary" onClick={() => update('progress_posts', row.id, { is_hidden: !row.is_hidden }, '投稿非表示')}>{row.is_hidden ? '再表示' : '非表示'}</button>
        </AdminRow>
      )} />
      <AdminTable title="面談リクエスト・チケット確認" rows={adminData.meetings ?? []} render={(row) => (
        <AdminRow key={row.id} title={`${meetingAdminMeta(row).investorName} から ${meetingAdminMeta(row).entrepreneurName} への面談申込`} meta={`状態: ${meetingStatusLabel(row.status)} / チケット: ${row.ticket_plan ?? '1枚'} ${yen(row.ticket_amount)} / 入金: ${row.ticket_payment_status === 'paid' ? '確認済み' : '未確認'}`}>
          {meetingAdminMeta(row).entrepreneur && <button className="btn-secondary" onClick={() => openProfile(meetingAdminMeta(row).entrepreneur)}>起業家確認</button>}
          <button className="btn-secondary" onClick={() => update('meeting_requests', row.id, { status: 'confirmed', confirmed_at: new Date().toISOString() }, '面談日程確定')}>日程確定</button>
          <button className="btn-secondary" onClick={() => update('meeting_requests', row.id, { ticket_payment_status: 'paid' }, '面談チケット入金確認')}>チケット入金確認</button>
          <button className="btn-secondary" onClick={() => update('meeting_requests', row.id, { status: 'cancelled' }, '面談キャンセル')}>キャンセル</button>
        </AdminRow>
      )} />
    </div>
  );
}

function meetingPartner(meeting: any, currentUser: AppUser, entrepreneurProfile: EntrepreneurProfile | null, profiles: EntrepreneurProfile[], investors: InvestorProfile[]) {
  const entrepreneur = profiles.find((profile) => profile.id === meeting.entrepreneur_id) ?? (entrepreneurProfile?.id === meeting.entrepreneur_id ? entrepreneurProfile : null);
  const investor = investors.find((profile) => profile.user_id === meeting.investor_id) ?? null;
  if (currentUser.role === 'entrepreneur') {
    return {
      userId: meeting.investor_id as string,
      name: investor?.company_name || investor?.full_name || '投資家',
      accountName: investor?.account_name || '',
      investor,
      entrepreneur,
    };
  }
  return {
    userId: entrepreneur?.user_id || '',
    name: entrepreneur?.company_name || '起業家',
    accountName: entrepreneur?.account_name || '',
    investor,
    entrepreneur,
  };
}

function meetingStatusLabel(status?: string) {
  const labels: Record<string, string> = {
    pending: '承認待ち',
    accepted_by_entrepreneur: '日程候補待ち',
    rejected_by_entrepreneur: '非承認',
    candidate_sent: '候補日時確認中',
    investor_rejected_candidate: '再調整中',
    mutual_agreed: '双方同意済み',
    reported_to_admin: '運営確認中',
    meeting_date_approved: '面談承認済み',
    meeting_date_rejected: '非承認',
    confirmed: '確定',
    cancelled: 'キャンセル',
  };
  return labels[status ?? ''] ?? '確認中';
}

function Messages({ currentUser, entrepreneurProfile, messages, supportInquiries, meetings, profiles, investors, target, setView, openProfile, refresh }: { currentUser: AppUser; entrepreneurProfile: EntrepreneurProfile | null; messages: any[]; supportInquiries: any[]; meetings: any[]; profiles: EntrepreneurProfile[]; investors: InvestorProfile[]; target: DirectMessageTarget | null; setView: (view: View) => void; openProfile: (profile: EntrepreneurProfile) => void; refresh: () => Promise<void> }) {
  const [supportBody, setSupportBody] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [selectedSupportKey, setSelectedSupportKey] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState(target?.userId ?? '');
  const [messageBody, setMessageBody] = useState('');
  const [messageFile, setMessageFile] = useState<File | null>(null);
  const [directMessage, setDirectMessage] = useState('');
  const [meetingNotice, setMeetingNotice] = useState('');
  const [meetingToast, setMeetingToast] = useState('');
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [meetingMessageById, setMeetingMessageById] = useState<Record<string, string>>({});
  const [candidateDateById, setCandidateDateById] = useState<Record<string, string>>({});
  const [finalDateById, setFinalDateById] = useState<Record<string, string>>({});
  const [adminReportById, setAdminReportById] = useState<Record<string, string>>({});
  const [removedMeetingIds, setRemovedMeetingIds] = useState<string[]>([]);
  const participantByUserId = useMemo(() => {
    const map = new Map<string, DirectMessageTarget>();
    profiles.forEach((profile) => map.set(profile.user_id, { userId: profile.user_id, name: profile.company_name, accountName: profile.account_name, entrepreneurId: profile.id }));
    investors.forEach((profile) => map.set(profile.user_id, { userId: profile.user_id, name: profile.company_name || profile.full_name || '投資家', accountName: profile.account_name }));
    if (target) map.set(target.userId, target);
    return map;
  }, [profiles, investors, target]);
  const partnerIds = useMemo(() => {
    const ids = new Set<string>();
    messages.forEach((message) => ids.add(message.sender_id === currentUser.id ? message.receiver_id : message.sender_id));
    if (target) ids.add(target.userId);
    return Array.from(ids);
  }, [messages, currentUser.id, target]);
  const selectedMessages = messages
    .filter((message) => selectedPartnerId && (message.sender_id === selectedPartnerId || message.receiver_id === selectedPartnerId))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const selectedPartner = selectedPartnerId ? participantByUserId.get(selectedPartnerId) : null;
  const supportThreads = useMemo(() => {
    const keys = new Map<string, any>();
    supportInquiries.forEach((row) => {
      const key = row.user_id || row.email || 'anonymous';
      if (!keys.has(key)) keys.set(key, row);
    });
    return Array.from(keys.entries()).map(([key, row]) => ({ key, row }));
  }, [supportInquiries]);
  const currentSupportKey = currentUser.role === 'admin' ? selectedSupportKey || supportThreads[0]?.key || '' : currentUser.id;
  const selectedSupportMessages = supportInquiries
    .filter((row) => (currentUser.role === 'admin' ? (row.user_id || row.email || 'anonymous') === currentSupportKey : row.user_id === currentUser.id))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const visibleMeetings = meetings.filter((meeting) => !removedMeetingIds.includes(meeting.id) && !['rejected_by_entrepreneur', 'cancelled'].includes(meeting.status));
  const selectedMeeting = visibleMeetings.find((meeting) => meeting.id === selectedMeetingId) ?? visibleMeetings[0];
  const selectedMeetingPartner = selectedMeeting ? meetingPartner(selectedMeeting, currentUser, entrepreneurProfile, profiles, investors) : null;
  const selectedMeetingApproved = selectedMeeting?.status === 'meeting_date_approved';
  const contactExchangeAllowed = selectedPartnerId
    ? meetings.some((meeting) => {
      const partnerEntrepreneur = profiles.find((profile) => profile.user_id === selectedPartnerId);
      return meeting.status === 'meeting_date_approved' && (
        (currentUser.role === 'entrepreneur' && entrepreneurProfile?.id === meeting.entrepreneur_id && meeting.investor_id === selectedPartnerId)
        || (currentUser.role === 'investor' && meeting.investor_id === currentUser.id && partnerEntrepreneur?.id === meeting.entrepreneur_id)
      );
    })
    : false;

  useEffect(() => {
    if (!selectedMeetingId && visibleMeetings[0]) setSelectedMeetingId(visibleMeetings[0].id);
    if (selectedMeetingId && !visibleMeetings.some((meeting) => meeting.id === selectedMeetingId)) setSelectedMeetingId(visibleMeetings[0]?.id ?? '');
  }, [visibleMeetings, selectedMeetingId]);

  useEffect(() => {
    if (target?.userId) {
      setSelectedPartnerId(target.userId);
      return;
    }
    if (!selectedPartnerId && partnerIds[0]) setSelectedPartnerId(partnerIds[0]);
  }, [target?.userId, partnerIds, selectedPartnerId]);

  async function markRead(id: string) {
    await supabase!.from('messages').update({ read_at: new Date().toISOString() }).eq('id', id);
    await refresh();
  }
  async function sendDirectMessage() {
    if (!supabase || !selectedPartnerId || (!messageBody.trim() && !messageFile)) return;
    const body = messageBody.trim() || '添付ファイルを送信しました。';
    if (!contactExchangeAllowed && containsContactInfo(body)) {
      await supabase.from('contact_suspicions').insert({ sender_id: currentUser.id, receiver_id: selectedPartnerId, body, reason: 'メッセージ内に連絡先交換の疑いがあります。' });
      setDirectMessage('連絡先交換につながる可能性がある内容は送信できません。');
      return;
    }
    let attachment: Awaited<ReturnType<typeof uploadPublicAttachment>> | null = null;
    try {
      if (messageFile) attachment = await uploadPublicAttachment('message-attachments', currentUser.id, messageFile);
    } catch (error: any) {
      setDirectMessage(toJapaneseError(error.message));
      return;
    }
    const { error } = await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: selectedPartnerId,
      body,
      attachment_url: attachment?.attachment_url ?? null,
      attachment_name: attachment?.attachment_name ?? null,
      attachment_type: attachment?.attachment_type ?? null,
    });
    if (error) {
      setDirectMessage(toJapaneseError(error.message));
      return;
    }
    await createNotification({ user_id: selectedPartnerId, type: 'message', body: '新しいメッセージが届きました。' });
    setMessageBody('');
    setMessageFile(null);
    setDirectMessage('メッセージを送信しました。');
    await refresh();
  }
  async function requestMeetingFromDirectMessage() {
    if (!supabase || !selectedPartnerId) return;
    const selectedEntrepreneurProfile = profiles.find((profile) => profile.user_id === selectedPartnerId);
    const entrepreneurId = currentUser.role === 'entrepreneur' ? entrepreneurProfile?.id : selectedEntrepreneurProfile?.id;
    const investorId = currentUser.role === 'entrepreneur' ? selectedPartnerId : currentUser.id;
    if (!entrepreneurId || !investorId) {
      setMeetingNotice('面談申込できる相手を選択してください。');
      return;
    }
    const { data: existing } = await supabase
      .from('meeting_requests')
      .select('id,status')
      .eq('entrepreneur_id', entrepreneurId)
      .eq('investor_id', investorId)
      .in('status', ['pending', 'accepted_by_entrepreneur', 'candidate_sent', 'investor_rejected_candidate', 'mutual_agreed', 'reported_to_admin']);
    if (existing?.length) {
      setMeetingNotice('同じ相手への面談申込は、承認または非承認まで再送できません。');
      return;
    }
    const { error } = await supabase.from('meeting_requests').insert({
      entrepreneur_id: entrepreneurId,
      investor_id: investorId,
      message: `${currentUser.role === 'entrepreneur' ? '起業家' : '投資家'}から面談申込がありました。`,
      status: currentUser.role === 'entrepreneur' ? 'accepted_by_entrepreneur' : 'pending',
    });
    if (error) {
      setMeetingNotice(toJapaneseError(error.message));
      return;
    }
    await createNotification({ user_id: selectedPartnerId, type: 'meeting_request', body: '面談申込が届きました。' });
    setMeetingNotice('面談申込をしました。下の面談用メッセージで日程調整できます。');
    setMeetingToast('面談申込をしました');
    setTimeout(() => setMeetingToast(''), 2200);
    await refresh();
  }
  async function updateMeeting(id: string, patch: Record<string, any>) {
    if (!supabase) return;
    await supabase.from('meeting_requests').update(patch).eq('id', id);
    await refresh();
  }
  async function rejectMeeting(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from('meeting_requests').delete().eq('id', id);
    if (error) await supabase.from('meeting_requests').update({ status: 'rejected_by_entrepreneur' }).eq('id', id);
    setMeetingNotice('面談申込を非承認にして削除しました。');
    setRemovedMeetingIds((ids) => [...ids, id]);
    setSelectedMeetingId(visibleMeetings.find((meeting) => meeting.id !== id)?.id ?? '');
    await refresh();
  }
  async function updateMeetingMessage(meeting: any) {
    const body = meetingMessageById[meeting.id]?.trim();
    if (!body) return;
    if (meeting.status !== 'meeting_date_approved' && containsContactInfo(body)) {
      setMeetingNotice('面談承認前は連絡先交換につながる内容を送信できません。');
      return;
    }
    await updateMeeting(meeting.id, { message: body });
    setMeetingMessageById({ ...meetingMessageById, [meeting.id]: '' });
  }
  async function reportFinalMeeting(meeting: any) {
    if (!supabase || !entrepreneurProfile) return;
    const finalDate = finalDateById[meeting.id] || meeting.final_meeting_at || '';
    if (!finalDate) {
      setMeetingNotice('面談日程申請には日付と時間を指定してください。');
      return;
    }
    if ((entrepreneurProfile.meeting_ticket_balance ?? 0) <= 0) {
      window.alert('面談チケットが不足しています');
      setView('home');
      return;
    }
    await supabase.from('meeting_requests').update({
      status: 'reported_to_admin',
      final_meeting_at: finalDate,
      meeting_admin_report: adminReportById[meeting.id] || '面談日時が決まったため、運営へ申請しました。',
      ticket_payment_status: 'used',
    }).eq('id', meeting.id);
    await supabase.from('contact_inquiries').insert({
      user_id: currentUser.id,
      category: 'meeting_date_report',
      body: `${entrepreneurProfile.company_name} が面談日時を申請しました。面談ID: ${meeting.id} / 日時: ${finalDate}`,
    });
    await processTriggeredEmailNotifications();
    setMeetingNotice('面談日程を運営へ申請しました。運営確認待ちです。');
    await refresh();
  }
  async function sendSupportMessage() {
    if (!supabase || !supportBody.trim()) return;
    const selectedSupport = supportThreads.find((thread) => thread.key === currentSupportKey)?.row;
    const { error } = await supabase.from('contact_inquiries').insert({
      user_id: currentUser.role === 'admin' ? selectedSupport?.user_id ?? null : currentUser.id,
      email: currentUser.role === 'admin' ? selectedSupport?.email ?? null : currentUser.email,
      category: currentUser.role === 'admin' ? 'support_reply' : 'support_message',
      body: supportBody,
    });
    if (error) {
      setSupportMessage(toJapaneseError(error.message));
      return;
    }
    setSupportBody('');
    setSupportMessage(currentUser.role === 'admin' ? 'ユーザーへ返信を保存しました。' : '運営サポートへメッセージを送信しました。');
    await processTriggeredEmailNotifications();
    await refresh();
  }
  async function resolveSupportThread(status: 'hold' | 'done') {
    if (!supabase || currentUser.role !== 'admin' || selectedSupportMessages.length === 0) return;
    const ids = selectedSupportMessages.map((row) => row.id);
    if (status === 'done') {
      await supabase.from('contact_inquiries').delete().in('id', ids);
      setSupportMessage('対応済みにしました。');
    } else {
      await supabase.from('contact_inquiries').update({ status: 'hold' }).in('id', ids);
      setSupportMessage('保留にしました。');
    }
    await refresh();
  }
  return (
    <section className="grid gap-3">
      {meetingToast && (
        <div className="fixed left-1/2 top-4 z-50 w-[calc(100vw-32px)] max-w-sm -translate-x-1/2 rounded-2xl border border-emerald-300/40 bg-slate-950/95 px-5 py-4 text-center text-base font-black text-emerald-100 shadow-2xl shadow-cyan-500/20">
          {meetingToast}
        </div>
      )}
      <article className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-emerald-300">個別メッセージ</p>
            <h3 className="mt-1 text-xl font-black">起業家・投資家と直接やりとり</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">通常のメッセージはここで送れます。面談希望や日程調整は下の面談用メッセージで管理します。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="pill"><Mail size={14} /> DM</span>
            {currentUser.role === 'entrepreneur' && entrepreneurProfile && (
              <span className="pill"><CircleDollarSign size={14} /> 面談チケット {entrepreneurProfile.meeting_ticket_balance ?? 0}枚</span>
            )}
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[240px_1fr]">
          <div className="grid content-start gap-2">
            {partnerIds.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-400">プロフィールのメッセージボタンから相手を選べます。</p>
            ) : partnerIds.map((partnerId) => {
              const partner = participantByUserId.get(partnerId);
              const latest = messages.find((message) => message.sender_id === partnerId || message.receiver_id === partnerId);
              return (
                <button key={partnerId} type="button" className={`rounded-2xl border p-3 text-left transition ${selectedPartnerId === partnerId ? 'border-cyan-300/60 bg-cyan-300/10' : 'border-white/10 bg-white/[0.04] hover:border-cyan-300/40'}`} onClick={() => setSelectedPartnerId(partnerId)}>
                  <p className="font-bold">{partner?.name ?? `ユーザー ${partnerId.slice(0, 8)}`}</p>
                  <p className="mt-1 text-xs text-cyan-300">{partner?.accountName ? `@${partner.accountName}` : '個別メッセージ'}</p>
                  {latest && <p className="mt-2 line-clamp-1 text-xs text-slate-500">{latest.body}</p>}
                </button>
              );
            })}
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            {!selectedPartnerId ? (
              <EmptyState title="メッセージ相手を選択してください" body="相手プロフィールのメッセージボタンを押すと、ここで個別にやりとりできます。" />
            ) : (
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black">{selectedPartner?.name ?? 'メッセージ相手'}</p>
                    <p className="text-xs text-slate-500">通常メッセージ</p>
                  </div>
                  <button className="btn-secondary px-3 text-sm" onClick={requestMeetingFromDirectMessage}><CalendarClock size={15} /> 面談申込</button>
                </div>
                {meetingNotice && <p className="rounded-2xl bg-white/8 p-3 text-sm text-slate-200">{meetingNotice}</p>}
                <div className="grid max-h-[360px] gap-2 overflow-y-auto pr-1">
                  {selectedMessages.length === 0 ? (
                    <p className="rounded-2xl bg-white/[0.04] p-3 text-sm text-slate-400">まだメッセージはありません。最初の一言を送れます。</p>
                  ) : selectedMessages.map((message) => {
                    const isMine = message.sender_id === currentUser.id;
                    return (
                      <div key={message.id} className={`grid gap-1 ${isMine ? 'justify-items-end' : 'justify-items-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-6 ${isMine ? 'bg-cyan-300 text-slate-950' : 'bg-white/10 text-slate-100'}`}>
                          {message.body}
                          <AttachmentPreview url={message.attachment_url} name={message.attachment_name} type={message.attachment_type} />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{new Date(message.created_at).toLocaleString('ja-JP')}</span>
                          {message.receiver_id === currentUser.id && !message.read_at && <button className="text-cyan-300" onClick={() => markRead(message.id)}>既読にする</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <div className="grid gap-2">
                    <textarea className="field min-h-20" value={messageBody} onChange={(e) => setMessageBody(e.target.value)} placeholder="メッセージを書く" />
                    <label className="btn-secondary justify-start">
                      <Paperclip size={16} /> 画像・ファイルを添付
                      <input className="hidden" type="file" accept="image/*,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx" onChange={(e) => setMessageFile(e.target.files?.[0] ?? null)} />
                    </label>
                    {messageFile && <p className="text-xs text-slate-500">{messageFile.name}</p>}
                  </div>
                  <button className="btn-primary self-stretch" onClick={sendDirectMessage}><Send size={17} /> 送信</button>
                </div>
                {directMessage && <p className="text-sm text-slate-300">{directMessage}</p>}
              </div>
            )}
          </div>
        </div>
      </article>
      <article className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-emerald-300">運営サポート</p>
            <h3 className="mt-1 text-xl font-black">運営に相談する</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">支払い確認、ピッチ資料、登録情報、使い方の相談をここから運営へ送れます。</p>
          </div>
          <span className="pill"><ShieldCheck size={14} /> 常に表示</span>
        </div>
        {currentUser.role === 'admin' && currentSupportKey && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => resolveSupportThread('hold')}>保留</button>
            <button className="btn-primary" onClick={() => resolveSupportThread('done')}>対応済</button>
          </div>
        )}
        <div className="mt-4 grid gap-3 lg:grid-cols-[240px_1fr]">
          <div className="grid content-start gap-2">
            {currentUser.role === 'admin' ? (
              supportThreads.length === 0 ? <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-400">運営宛メッセージはまだありません。</p> : supportThreads.map((thread) => (
                <button key={thread.key} type="button" className={`rounded-2xl border p-3 text-left transition ${currentSupportKey === thread.key ? 'border-cyan-300/60 bg-cyan-300/10' : 'border-white/10 bg-white/[0.04] hover:border-cyan-300/40'}`} onClick={() => setSelectedSupportKey(thread.key)}>
                  <p className="font-bold">{thread.row.email ?? thread.row.user_id ?? '匿名ユーザー'}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{thread.row.body}</p>
                </button>
              ))
            ) : (
              <button type="button" className="rounded-2xl border border-cyan-300/60 bg-cyan-300/10 p-3 text-left">
                <p className="font-bold">運営サポート</p>
                <p className="mt-1 text-xs text-cyan-300">個別メッセージ</p>
              </button>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="grid max-h-[300px] gap-2 overflow-y-auto pr-1">
              {selectedSupportMessages.length === 0 ? (
                <p className="rounded-2xl bg-white/[0.04] p-3 text-sm text-slate-400">まだ運営とのメッセージはありません。</p>
              ) : selectedSupportMessages.map((row) => {
                const isAdminReply = row.category === 'support_reply';
                const mine = currentUser.role === 'admin' ? isAdminReply : !isAdminReply;
                return (
                  <div key={row.id} className={`grid gap-1 ${mine ? 'justify-items-end' : 'justify-items-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-6 ${mine ? 'bg-cyan-300 text-slate-950' : 'bg-white/10 text-slate-100'}`}>{row.body}</div>
                    <span className="text-[11px] text-slate-500">{new Date(row.created_at).toLocaleString('ja-JP')}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
              <textarea className="field min-h-24" value={supportBody} onChange={(e) => setSupportBody(e.target.value)} placeholder={currentUser.role === 'admin' ? 'ユーザーへの返信を書く' : '運営へのメッセージを書く'} />
              <button className="btn-primary self-stretch" onClick={sendSupportMessage}><Send size={17} /> 送信</button>
            </div>
          </div>
        </div>
        {supportMessage && <p className="mt-3 text-sm text-slate-300">{supportMessage}</p>}
      </article>
      <article className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-emerald-300">面談用メッセージ</p>
            <h3 className="mt-1 text-xl font-black">面談の承認・日程調整</h3>
          </div>
          {currentUser.role === 'entrepreneur' && entrepreneurProfile && (
            <span className="pill"><CalendarClock size={14} /> 保有チケット {entrepreneurProfile.meeting_ticket_balance ?? 0}枚</span>
          )}
        </div>
        {visibleMeetings.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-400">面談申込が入ると、ここに相手ごとの面談メッセージが表示されます。</p>
        ) : (
          <div className="mt-4 grid gap-3 lg:grid-cols-[260px_1fr]">
            <div className="grid content-start gap-2">
              {visibleMeetings.map((meeting) => {
                const partner = meetingPartner(meeting, currentUser, entrepreneurProfile, profiles, investors);
                return (
                  <button key={meeting.id} type="button" className={`rounded-2xl border p-3 text-left transition ${selectedMeeting?.id === meeting.id ? 'border-cyan-300/60 bg-cyan-300/10' : 'border-white/10 bg-white/[0.04] hover:border-cyan-300/40'}`} onClick={() => setSelectedMeetingId(meeting.id)}>
                    <p className="font-bold">{partner.name}</p>
                    <p className="mt-1 text-xs text-cyan-300">{partner.accountName ? `@${partner.accountName}` : '面談相手'}</p>
                    <p className="mt-2 text-xs text-slate-500">{meetingStatusLabel(meeting.status)}</p>
                  </button>
                );
              })}
            </div>
            {selectedMeeting && selectedMeetingPartner && (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black">{selectedMeetingPartner.name}</p>
                    <p className="mt-1 text-xs text-slate-500">状態: {meetingStatusLabel(selectedMeeting.status)} / 候補: {selectedMeeting.proposed_at ? new Date(selectedMeeting.proposed_at).toLocaleString('ja-JP') : '未設定'}</p>
                  </div>
                  {selectedMeetingPartner.entrepreneur && <button className="btn-secondary px-3 text-sm" onClick={() => openProfile(selectedMeetingPartner.entrepreneur!)}>相手のプロフィール</button>}
                </div>
                {selectedMeeting.status === 'pending' && currentUser.role === 'entrepreneur' && (
                  <p className="mt-3 rounded-2xl bg-cyan-300/10 p-3 text-sm text-cyan-100">{selectedMeetingPartner.name} から面談申込が届いています。</p>
                )}
                {selectedMeetingApproved && (
                  <p className="mt-3 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">面談承認済みです。以降、この相手とは連絡先交換ができます。</p>
                )}
                <div className="mt-4 grid max-h-[320px] gap-2 overflow-y-auto pr-1">
                  <div className="grid justify-items-start gap-1">
                    <div className="max-w-[85%] rounded-2xl bg-white/10 p-3 text-sm leading-6 text-slate-100">{selectedMeeting.message || '面談申込がありました。'}</div>
                    <span className="text-[11px] text-slate-500">{new Date(selectedMeeting.created_at).toLocaleString('ja-JP')}</span>
                  </div>
                  {selectedMeeting.meeting_admin_report && (
                    <div className="grid justify-items-end gap-1">
                      <div className="max-w-[85%] rounded-2xl bg-cyan-300 p-3 text-sm leading-6 text-slate-950">{selectedMeeting.meeting_admin_report}</div>
                      <span className="text-[11px] text-slate-500">運営への面談日程申請</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                  <textarea className="field min-h-20" value={meetingMessageById[selectedMeeting.id] ?? ''} onChange={(e) => setMeetingMessageById({ ...meetingMessageById, [selectedMeeting.id]: e.target.value })} placeholder="面談用メッセージを書く" />
                  <button className="btn-secondary self-stretch" onClick={() => updateMeetingMessage(selectedMeeting)}>送信</button>
                </div>
                {entrepreneurProfile?.id === selectedMeeting.entrepreneur_id && selectedMeeting.status === 'pending' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="btn-primary" onClick={() => updateMeeting(selectedMeeting.id, { status: 'accepted_by_entrepreneur' })}>承認</button>
                    <button className="btn-secondary" onClick={() => rejectMeeting(selectedMeeting.id)}>非承認</button>
                  </div>
                )}
                {entrepreneurProfile?.id === selectedMeeting.entrepreneur_id && (selectedMeeting.status === 'accepted_by_entrepreneur' || selectedMeeting.status === 'investor_rejected_candidate') && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input className="field" type="datetime-local" value={candidateDateById[selectedMeeting.id] ?? ''} onChange={(e) => setCandidateDateById({ ...candidateDateById, [selectedMeeting.id]: e.target.value })} />
                    <button className="btn-primary" onClick={() => updateMeeting(selectedMeeting.id, { status: 'candidate_sent', proposed_at: candidateDateById[selectedMeeting.id] || null })}>候補日時を送る</button>
                  </div>
                )}
                {currentUser.id === selectedMeeting.investor_id && selectedMeeting.status === 'candidate_sent' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="btn-primary" onClick={() => updateMeeting(selectedMeeting.id, { status: 'mutual_agreed' })}>この日程に同意</button>
                    <button className="btn-secondary" onClick={() => updateMeeting(selectedMeeting.id, { status: 'investor_rejected_candidate' })}>同意しない</button>
                  </div>
                )}
                {entrepreneurProfile?.id === selectedMeeting.entrepreneur_id && ['accepted_by_entrepreneur', 'candidate_sent', 'investor_rejected_candidate', 'mutual_agreed', 'meeting_date_rejected'].includes(selectedMeeting.status) && (
                  <div className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
                    <p className="text-sm leading-6 text-amber-100">面談申請前にLeap外で面談を実行したことが発覚した場合、双方強制退会となります。面談日時が決まったら、チケットを1枚消費して運営へ申請してください。</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input className="field" type="datetime-local" value={finalDateById[selectedMeeting.id] ?? ''} onChange={(e) => setFinalDateById({ ...finalDateById, [selectedMeeting.id]: e.target.value })} />
                      <button className="btn-primary" disabled={!finalDateById[selectedMeeting.id]} onClick={() => reportFinalMeeting(selectedMeeting)}>面談日程申込申請</button>
                    </div>
                    <textarea className="field mt-2 min-h-20" value={adminReportById[selectedMeeting.id] ?? ''} onChange={(e) => setAdminReportById({ ...adminReportById, [selectedMeeting.id]: e.target.value })} placeholder="運営への補足（任意）" />
                  </div>
                )}
                {entrepreneurProfile?.id === selectedMeeting.entrepreneur_id && selectedMeeting.status === 'reported_to_admin' && (
                  <div className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
                    <p className="text-sm leading-6 text-cyan-100">運営へ面談日程を申請済みです。確認が完了するまでお待ちください。</p>
                    <button className="btn-secondary mt-3 w-full" disabled>申請中</button>
                  </div>
                )}
                {entrepreneurProfile?.id === selectedMeeting.entrepreneur_id && selectedMeeting.status === 'meeting_date_approved' && (
                  <button className="btn-primary mt-3 w-full" disabled><CheckCircle2 size={17} /> 承認</button>
                )}
              </div>
            )}
          </div>
        )}
      </article>
    </section>
  );
}

function SettingsPage({ currentUser, refresh }: { currentUser: AppUser; refresh: () => Promise<void> }) {
  const [emailEnabled, setEmailEnabled] = useState(currentUser.notification_email_enabled !== false);
  const [message, setMessage] = useState('');
  const [profileForm, setProfileForm] = useState<Record<string, string>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profileId, setProfileId] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    async function loadProfileForSettings() {
      if (!supabase || currentUser.role === 'admin') return;
      const table = currentUser.role === 'entrepreneur' ? 'entrepreneur_profiles' : 'investor_profiles';
      const { data } = await supabase.from(table).select('*').eq('user_id', currentUser.id).maybeSingle();
      if (!data) return;
      setProfileId(data.id);
      setProfileForm({
        account_name: data.account_name ?? '',
        name: currentUser.role === 'entrepreneur' ? data.founder_name ?? '' : data.full_name ?? '',
        company_name: data.company_name ?? '',
        founded_month: data.founded_month ?? '',
        employee_size: data.employee_size ?? '',
        annual_revenue_scale: data.annual_revenue_scale ?? '',
        avatar_url: data.avatar_url ?? '',
        location: data.location ?? '',
      });
    }
    loadProfileForSettings();
  }, [currentUser.id, currentUser.role]);

  async function saveNotificationSetting(nextValue: boolean) {
    if (!supabase) return;
    setEmailEnabled(nextValue);
    const { error } = await supabase.from('users').update({ notification_email_enabled: nextValue }).eq('id', currentUser.id);
    if (error) {
      setMessage(toJapaneseError(error.message));
      setEmailEnabled(!nextValue);
      return;
    }
    setMessage(nextValue ? 'メール通知をオンにしました。' : 'メール通知をオフにしました。');
    await refresh();
  }

  async function saveProfileSettings() {
    if (!supabase || !profileId || currentUser.role === 'admin') return;
    const table = currentUser.role === 'entrepreneur' ? 'entrepreneur_profiles' : 'investor_profiles';
    const patch: Record<string, string> = {
      account_name: profileForm.account_name,
      company_name: profileForm.company_name,
      founded_month: profileForm.founded_month,
      employee_size: profileForm.employee_size,
      annual_revenue_scale: profileForm.annual_revenue_scale,
      avatar_url: profileForm.avatar_url,
      location: profileForm.location,
    };
    if (avatarFile) {
      const extension = avatarFile.name.split('.').pop() || 'png';
      const path = `${currentUser.id}/avatar.${extension}`;
      const { error: uploadError } = await supabase.storage.from('profile-icons').upload(path, avatarFile, { upsert: true });
      if (uploadError) {
        setProfileMessage(toJapaneseError(uploadError.message));
        return;
      }
      const { data } = supabase.storage.from('profile-icons').getPublicUrl(path);
      patch.avatar_url = data.publicUrl;
    }
    if (currentUser.role === 'entrepreneur') {
      patch.founder_name = profileForm.name;
    } else {
      patch.full_name = profileForm.name;
    }
    const { error } = await supabase.from(table).update(patch).eq('id', profileId).eq('user_id', currentUser.id);
    if (error) {
      setProfileMessage(toJapaneseError(error.message));
      return;
    }
    setProfileMessage('プロフィール情報を更新しました。');
    setAvatarFile(null);
    await refresh();
  }

  return (
    <section className="grid gap-5">
      <article className="glass rounded-[28px] p-6">
        <p className="text-sm font-bold text-emerald-300">通知設定</p>
        <h2 className="mt-2 text-3xl font-black">メール通知</h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-300">
          メッセージやコメントが届いたとき、登録メールアドレスへ通知します。通知が多い場合はいつでもオフにできます。
        </p>
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold">登録メールアドレス</p>
              <p className="mt-1 text-sm text-slate-400">{currentUser.email ?? '未設定'}</p>
            </div>
            <button className={emailEnabled ? 'btn-primary' : 'btn-secondary'} onClick={() => saveNotificationSetting(!emailEnabled)}>
              <Bell size={17} /> {emailEnabled ? '通知オン' : '通知オフ'}
            </button>
          </div>
        </div>
        {message && <p className="mt-4 rounded-2xl bg-white/8 p-3 text-sm text-slate-200">{message}</p>}
      </article>
      {currentUser.role !== 'admin' && (
        <article className="glass rounded-[28px] p-6">
          <p className="text-sm font-bold text-emerald-300">アカウント情報</p>
          <h2 className="mt-2 text-3xl font-black">プロフィールを編集</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">タイムラインや検索結果に表示されるアカウント名、名前、会社名などを変更できます。</p>
          {!profileId ? (
            <p className="mt-4 rounded-2xl bg-amber-300/10 p-3 text-sm text-amber-100">プロフィール作成後に編集できます。</p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-black/25 p-4">
                <ProfileAvatar name={profileForm.company_name || profileForm.name || 'アカウント'} avatarUrl={profileForm.avatar_url} />
                <label className="label flex-1">アイコン画像<input className="field" type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} /></label>
              </div>
              <label className="label">アカウント名<input className="field" value={profileForm.account_name ?? ''} onChange={(e) => setProfileForm({ ...profileForm, account_name: e.target.value })} placeholder="例：leap_taro" /></label>
              <label className="label">名前<input className="field" value={profileForm.name ?? ''} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} /></label>
              <label className="label">会社名<input className="field" value={profileForm.company_name ?? ''} onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })} /></label>
              <label className="label">所在地<select className="field" value={profileForm.location ?? ''} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}><option value="">未選択</option>{locationOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
              <label className="label">設立年月<input className="field" type="month" value={profileForm.founded_month ?? ''} onChange={(e) => setProfileForm({ ...profileForm, founded_month: e.target.value })} /></label>
              <label className="label">従業員数<select className="field" value={profileForm.employee_size ?? ''} onChange={(e) => setProfileForm({ ...profileForm, employee_size: e.target.value })}><option value="">未選択</option>{employeeSizeOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
              <label className="label sm:col-span-2">年商規模<select className="field" value={profileForm.annual_revenue_scale ?? ''} onChange={(e) => setProfileForm({ ...profileForm, annual_revenue_scale: e.target.value })}><option value="">未選択</option>{revenueScaleOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
              <button className="btn-primary sm:col-span-2" onClick={saveProfileSettings}>プロフィールを保存する</button>
            </div>
          )}
          {profileMessage && <p className="mt-4 rounded-2xl bg-white/8 p-3 text-sm text-slate-200">{profileMessage}</p>}
        </article>
      )}
    </section>
  );
}

function LegalPage({ slug, currentUser }: { slug: LegalSlug; currentUser: AppUser }) {
  const [body, setBody] = useState('');
  const [email, setEmail] = useState('');
  async function submit(category: string) {
    await supabase!.from('contact_inquiries').insert({ user_id: currentUser.id, email, category, body });
    await processTriggeredEmailNotifications();
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
    await processTriggeredEmailNotifications();
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

function ProfileAvatar({ name, avatarUrl, size = 'md' }: { name: string; avatarUrl?: string | null; size?: 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-20 w-20 rounded-3xl text-2xl' : 'h-12 w-12 rounded-2xl text-base';
  if (avatarUrl) {
    return <img src={avatarUrl} alt={`${name}のアイコン`} className={`${sizeClass} object-cover ring-1 ring-cyan-300/30`} />;
  }
  return <div className={`grid ${sizeClass} place-items-center bg-gradient-to-br from-cyan-300 via-violet-400 to-emerald-300 font-black text-slate-950`}>{name.slice(0, 1)}</div>;
}

function FollowOverview({ following, followers, profiles, investors, openProfile, viewer }: { following: any[]; followers: any[]; profiles: EntrepreneurProfile[]; investors: InvestorProfile[]; openProfile: (profile: EntrepreneurProfile) => void; viewer?: AppUser }) {
  const [followingVisible, setFollowingVisible] = useState(viewer?.following_visible !== false);
  const [followersVisible, setFollowersVisible] = useState(viewer?.followers_visible !== false);
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const investorByUserId = new Map(investors.map((profile) => [profile.user_id, profile]));
  async function toggleVisibility(kind: 'following' | 'followers') {
    if (!supabase || !viewer) return;
    const next = kind === 'following' ? !followingVisible : !followersVisible;
    const column = kind === 'following' ? 'following_visible' : 'followers_visible';
    if (kind === 'following') setFollowingVisible(next);
    if (kind === 'followers') setFollowersVisible(next);
    const { error } = await supabase.from('users').update({ [column]: next }).eq('id', viewer.id);
    if (error) {
      if (kind === 'following') setFollowingVisible(!next);
      if (kind === 'followers') setFollowersVisible(!next);
    }
  }
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="glass rounded-[24px] p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-black">フォロー先</h3>
          <div className="flex flex-wrap gap-2">
            <span className="pill"><Heart size={13} /> {following.length}</span>
            {viewer && <button type="button" className="pill" onClick={() => toggleVisibility('following')}>{followingVisible ? '公開中' : '非表示'}</button>}
          </div>
        </div>
        {!followingVisible ? (
          <p className="mt-4 text-sm leading-6 text-slate-400">フォロー先は非表示です。</p>
        ) : following.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-slate-400">まだフォローしているアカウントはありません。</p>
        ) : (
          <div className="mt-4 grid gap-2">
            {following.map((row) => {
              const followedProfile = profileById.get(row.entrepreneur_id);
              return (
                <button key={`${row.entrepreneur_id}-${row.investor_id}`} type="button" className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-cyan-300/50" onClick={() => followedProfile && openProfile(followedProfile)}>
                  <p className="font-bold">{followedProfile?.company_name ?? '起業家プロフィール'}</p>
                  <p className="mt-1 text-xs text-cyan-300">{followedProfile?.account_name ? `@${followedProfile.account_name}` : 'プロフィールを確認'}</p>
                </button>
              );
            })}
          </div>
        )}
      </article>
      <article className="glass rounded-[24px] p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-black">フォロワー</h3>
          <div className="flex flex-wrap gap-2">
            <span className="pill"><UsersRound size={13} /> {followers.length}</span>
            {viewer && <button type="button" className="pill" onClick={() => toggleVisibility('followers')}>{followersVisible ? '公開中' : '非表示'}</button>}
          </div>
        </div>
        {!followersVisible ? (
          <p className="mt-4 text-sm leading-6 text-slate-400">フォロワーは非表示です。</p>
        ) : followers.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-slate-400">まだフォロワーはいません。</p>
        ) : (
          <div className="mt-4 grid gap-2">
            {followers.map((row) => {
              const follower = investorByUserId.get(row.investor_id);
              const title = follower?.company_name || follower?.full_name || `ユーザー ${String(row.investor_id).slice(0, 8)}`;
              return (
                <div key={`${row.entrepreneur_id}-${row.investor_id}`} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="font-bold">{title}</p>
                  <p className="mt-1 text-xs text-cyan-300">{follower?.account_name ? `@${follower.account_name}` : '投資家アカウント'}</p>
                </div>
              );
            })}
          </div>
        )}
      </article>
    </section>
  );
}

function StartupCard({ profile, onClick }: { profile: EntrepreneurProfile; onClick: () => void }) {
  return (
    <button className="glass rounded-[24px] p-5 text-left transition hover:border-cyan-300/50" onClick={onClick}>
      <div className="flex items-center justify-between gap-3"><ProfileAvatar name={profile.company_name} avatarUrl={profile.avatar_url} /><ChevronRight /></div>
      <h3 className="mt-4 text-xl font-black">{profile.company_name}</h3>
      {profile.account_name && <p className="mt-1 text-sm font-bold text-cyan-300">@{profile.account_name}</p>}
      <p className="mt-2 line-clamp-3 min-h-16 leading-7 text-slate-300">{profile.tagline || profile.overview || '事業説明は未入力です。'}</p>
      <BadgeRow profile={profile} />
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400"><span>業界 <b className="block text-white">{profile.industry ?? '未入力'}</b></span><span>累計投資金額 <b className="block text-white">{yen(profile.total_investment_amount)}</b></span></div>
    </button>
  );
}

function InvestorAccountCard({ profile }: { profile: InvestorProfile }) {
  const title = profile.company_name || profile.full_name || '投資家';
  return (
    <article className="glass rounded-[24px] p-5">
      <div className="flex items-center justify-between gap-3">
        <ProfileAvatar name={title} avatarUrl={profile.avatar_url} />
        <span className="pill"><CircleDollarSign size={13} /> 投資家</span>
      </div>
      <h3 className="mt-4 text-xl font-black">{title}</h3>
      {profile.account_name && <p className="mt-1 text-sm font-bold text-cyan-300">@{profile.account_name}</p>}
      <p className="mt-2 text-sm leading-6 text-slate-400">{profile.full_name}{profile.location ? ` / ${profile.location}` : ''}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400">
        <span>確認状態 <b className="block text-white">{profile.corporate_number || profile.license_file_path ? '提出済み' : '未提出'}</b></span>
        <span>累計投資金額 <b className="block text-white">{yen(profile.total_investment_amount)}</b></span>
      </div>
    </article>
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

function PostCard({ post, currentUser, investor, refresh }: { post: ProgressPost; currentUser?: AppUser; investor?: InvestorProfile | null; refresh?: () => Promise<void> }) {
  const [comment, setComment] = useState('');
  const [viewCount, setViewCount] = useState(post.view_count ?? 0);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);
  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0);
  const [notice, setNotice] = useState('');
  const [removed, setRemoved] = useState(false);
  const canComment = currentUser?.role !== 'investor' || Boolean(investor?.corporate_number || investor?.license_file_path);
  const isPrivatePost = post.post_type === 'private';

  useEffect(() => {
    if (!supabase || !currentUser || currentUser.id === post.user_id) return;
    let cancelled = false;
    supabase.rpc('increment_post_view', { post_id_input: post.id }).then(({ data }) => {
      if (!cancelled && typeof data === 'number') setViewCount(data);
    });
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, post.id, post.user_id]);

  async function like() {
    if (!supabase || !currentUser) return;
    const { error } = await supabase.from('post_likes').upsert({ post_id: post.id, user_id: currentUser.id });
    if (!error) setLikeCount((current) => current + 1);
    setNotice(error ? toJapaneseError(error.message) : 'いいねしました。');
  }
  async function save() {
    if (!supabase || !currentUser) return;
    const { error } = await supabase.from('watchlists').upsert({ entrepreneur_id: post.entrepreneur_id, investor_id: currentUser.id, memo: `保存した投稿: ${post.did_today.slice(0, 80)}` });
    setNotice(error ? toJapaneseError(error.message) : '保存しました。');
  }
  async function report() {
    if (!supabase || !currentUser) return;
    const { error } = await supabase.from('reports').insert({ reporter_id: currentUser.id, target_type: 'progress_posts', target_id: post.id, reason: '投稿内容の確認依頼' });
    setNotice(error ? toJapaneseError(error.message) : '通報を送信しました。');
  }
  async function hideOwnPost() {
    if (!supabase || !currentUser || currentUser.id !== post.user_id) return;
    const { error } = await supabase.from('progress_posts').update({ is_hidden: true }).eq('id', post.id).eq('user_id', currentUser.id);
    if (error) {
      setNotice(toJapaneseError(error.message));
      return;
    }
    setRemoved(true);
    setNotice('投稿を非公開にしました。');
    await refresh?.();
  }
  async function deleteOwnPost() {
    if (!supabase || !currentUser || currentUser.id !== post.user_id) return;
    if (!window.confirm('この投稿を削除します。元に戻せません。よろしいですか？')) return;
    const { error } = await supabase.from('progress_posts').delete().eq('id', post.id).eq('user_id', currentUser.id);
    if (error) {
      const { error: hideError } = await supabase.from('progress_posts').update({ is_hidden: true }).eq('id', post.id).eq('user_id', currentUser.id);
      if (hideError) {
        setNotice(toJapaneseError(error.message));
        return;
      }
      setRemoved(true);
      setNotice('投稿を一覧から削除しました。');
      await refresh?.();
      return;
    }
    setRemoved(true);
    setNotice('投稿を削除しました。');
    await refresh?.();
  }
  async function submitComment() {
    if (!supabase || !currentUser || !comment.trim()) return;
    if (!canComment) return;
    if (containsContactInfo(comment)) {
      await supabase.from('contact_suspicions').insert({ sender_id: currentUser.id, receiver_id: post.user_id, body: comment, reason: 'コメント内に連絡先交換の疑いがあります。' });
      setComment('連絡先交換につながる可能性がある内容は送信できません。');
      return;
    }
    const { error } = await supabase.from('post_comments').insert({ post_id: post.id, user_id: currentUser.id, body: comment });
    if (error) {
      setNotice(toJapaneseError(error.message));
      return;
    }
    await createNotification({ user_id: post.user_id, type: 'comment', body: '進捗投稿にコメントがつきました。' });
    setComment('');
    setCommentCount((current) => current + 1);
    setNotice('コメントしました。');
  }
  if (removed) return null;
  return (
    <article className="glass rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm text-slate-400">{new Date(post.created_at).toLocaleString('ja-JP')} / {visibilityLabels[post.visibility] ?? post.visibility}</p>{!isPrivatePost && <h3 className="mt-2 text-xl font-black">{post.did_today}</h3>}</div>
        <div className="flex flex-wrap justify-end gap-2">
          <span className="pill"><Gauge size={13} /> 閲覧 {viewCount.toLocaleString()}回</span>
          <span className="pill"><Heart size={13} /> いいね {likeCount.toLocaleString()}</span>
          <span className="pill"><MessageCircle size={13} /> コメント {commentCount.toLocaleString()}</span>
          <span className="pill"><TrendingUp size={13} /> {isPrivatePost ? 'ひとこと' : '進捗'}</span>
        </div>
      </div>
      {isPrivatePost ? <p className="mt-4 whitespace-pre-line leading-7 text-slate-300">{post.body || '本文はありません。'}</p> : <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Detail title="数値の変化" body={post.metric_change} />
        <Detail title="課題" body={post.issue} />
        <Detail title="次にやること" body={post.next_action} />
      </div>}
      <div className="mt-4 flex flex-wrap gap-2">{post.tags?.map((tag) => <span className="pill" key={tag}>#{tag}</span>)}</div>
      <AttachmentPreview url={post.attachment_url} name={post.attachment_name} type={post.attachment_type} />
      {currentUser?.id === post.user_id && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={hideOwnPost}><EyeOff size={16} /> 非公開</button>
          <button className="btn-secondary" onClick={deleteOwnPost}><Trash2 size={16} /> 削除</button>
        </div>
      )}
      {currentUser?.role === 'investor' && (
        <div className="mt-4 grid gap-3">
          {!canComment && <p className="rounded-2xl bg-amber-300/10 p-3 text-sm text-amber-100">確認書類の提出が完了するまで、コメントは利用できません。</p>}
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={like}><Heart size={16} /> いいね</button>
            <button className="btn-secondary" onClick={save}><Bookmark size={16} /> 保存</button>
            <button className="btn-secondary" onClick={report}><Flag size={16} /> 通報</button>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input className="field" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="投資判断に必要な質問やコメントを書く" />
            <button className="btn-primary" disabled={!canComment} onClick={submitComment}><MessageCircle size={16} /> コメント</button>
          </div>
        </div>
      )}
      {notice && <p className="mt-3 rounded-2xl bg-white/8 p-3 text-sm text-slate-200">{notice}</p>}
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
  const keys = ['account_name', 'company_name', 'founder_name', 'founded_month', 'employee_size', 'annual_revenue_scale'];
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

function attachPostProfiles(posts: ProgressPost[], profiles: EntrepreneurProfile[]) {
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  return posts.map((post) => ({
    ...post,
    entrepreneur_profiles: profileById.get(post.entrepreneur_id) ?? post.entrepreneur_profiles,
  }));
}

function getBlockedUserIds(blocks: UserBlock[], currentUserId: string) {
  const ids = new Set<string>();
  blocks.forEach((block) => {
    if (block.blocker_id === currentUserId) ids.add(block.blocked_id);
    if (block.blocked_id === currentUserId) ids.add(block.blocker_id);
  });
  return ids;
}

function filterProfilesByBlocks(profiles: EntrepreneurProfile[], blockedIds: Set<string>, currentUserId: string) {
  return profiles.filter((profile) => profile.user_id === currentUserId || !blockedIds.has(profile.user_id));
}

function filterInvestorsByBlocks(investors: InvestorProfile[], blockedIds: Set<string>, currentUserId: string) {
  return investors.filter((profile) => profile.user_id === currentUserId || !blockedIds.has(profile.user_id));
}

function filterPostsByBlocks(posts: ProgressPost[], blockedIds: Set<string>) {
  return posts.filter((post) => !blockedIds.has(post.user_id) && !blockedIds.has(post.entrepreneur_profiles?.user_id ?? ''));
}

function filterMessagesByBlocks(messages: any[], blockedIds: Set<string>) {
  return messages.filter((message) => !blockedIds.has(message.sender_id) && !blockedIds.has(message.receiver_id));
}

function filterMeetingsByBlocks(meetings: any[], blockedIds: Set<string>, profiles: EntrepreneurProfile[]) {
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  return meetings.filter((meeting) => {
    const entrepreneur = profileById.get(meeting.entrepreneur_id);
    return !blockedIds.has(meeting.investor_id) && !blockedIds.has(entrepreneur?.user_id ?? '');
  });
}

function withPostReactionCounts(posts: ProgressPost[], likes: any[], comments: any[]) {
  const likeCounts = countRowsByPostId(likes);
  const commentCounts = countRowsByPostId(comments);
  return posts.map((post) => ({
    ...post,
    like_count: likeCounts.get(post.id) ?? 0,
    comment_count: commentCounts.get(post.id) ?? 0,
  }));
}

function countRowsByPostId(rows: any[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.post_id) continue;
    counts.set(row.post_id, (counts.get(row.post_id) ?? 0) + 1);
  }
  return counts;
}

function containsContactInfo(value: string) {
  const patterns = [
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
    /0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{3,4}/,
    /(?:https?:\/\/)?(?:www\.)?(?:line\.me|lin\.ee)\/\S+/i,
    /(?:line|ライン)\s*(?:id|ＩＤ|アカウント)?\s*[:：]?\s*[A-Z0-9._-]{3,}/i,
    /(?:https?:\/\/)?(?:[\w.-]+\.)?zoom\.us\/\S+/i,
  ];
  return patterns.some((pattern) => pattern.test(value));
}

function formatLastLogin(value?: string | null) {
  if (!value) return '未ログイン';
  return new Date(value).toLocaleString('ja-JP');
}
