'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  Edit3,
  EyeOff,
  FileText,
  Heart,
  Home,
  Image as ImageIcon,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

type Page = 'feed' | 'search' | 'notifications' | 'messages' | 'mypage' | 'profile' | 'deal' | 'matching' | 'auth' | 'profileEdit' | 'tickets' | 'admin';
type Role = 'entrepreneur' | 'investor';
type FeedTab = 'following' | 'recommended' | 'investors' | 'entrepreneurs';
type Visibility = 'public' | 'followers' | 'investors' | 'entrepreneurs' | 'draft';
type BusinessType = 'corporation' | 'sole';
type MessageKind = 'direct' | 'meeting';

type Account = {
  id: string;
  role: Role;
  email: string;
  phone: string;
  password: string;
  emailVerified: boolean;
  businessType: BusinessType;
  corporateNumber: string;
  licenseFileName: string;
  accountName: string;
  name: string;
  company: string;
  title: string;
  industry: string;
  location: string;
  stage: string;
  foundedYear: string;
  foundedMonth: string;
  employeeSize: string;
  revenueScale: string;
  bio: string;
  avatarLabel: string;
  avatarUrl: string;
  fundingGoal: string;
  monthlyRevenue: string;
  growthRate: string;
  customerCount: string;
  investmentRange: string;
  supportAreas: string;
  ticketBalance: number;
  ticketRequestStatus: 'none' | 'pending';
  ticketRequestPlan: string;
  ticketTransferName: string;
  verified: boolean;
};

type Post = {
  id: string;
  authorId: string;
  body: string;
  tags: string[];
  visibility: Visibility;
  attachmentName: string;
  imageName: string;
  imageUrl: string;
  isHidden: boolean;
  actionUserIds: {
    likes: string[];
    saves: string[];
    meetings: string[];
  };
  createdAt: string;
  likes: number;
  saves: number;
  meetings: number;
  views: number;
};

type DirectMessage = {
  id: string;
  partnerId: string;
  kind: MessageKind;
  body: string;
  createdAt: string;
  mine: boolean;
  meetingStatus?: 'requested' | 'approved' | 'rejected';
};

type MeetingApplication = {
  id: string;
  applicantId: string;
  partnerId: string;
  scheduledAt: string;
  status: 'pending' | 'approved' | 'rejected';
  ticketChargedAccountId: string;
  ticketConsumed: boolean;
  createdAt: string;
};

type Notice = {
  id: string;
  body: string;
  createdAt: string;
  unread: boolean;
};

const industries = ['AI・SaaS', '金融・FinTech', '人材・HR', '教育・EdTech', '医療・ヘルスケア', '環境・脱炭素', '小売・EC', '製造・ものづくり', '不動産', '物流', '飲食', 'エンタメ', '地方創生', '宇宙・ロボット', 'その他'];
const locations = ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県', '海外'];
const stages = ['アイデア', 'プレシード', 'シード', 'シリーズA', 'シリーズB', 'シリーズC以降', '上場済み'];
const employeeSizes = ['1人', '5人未満', '20人未満', '50人未満', '100人未満', '100-500人', '501-1000人', '1001-5000人', '5001人以上'];
const revenueScales = ['未回答', '1,000万円未満', '1,000万円〜5,000万円', '5,000万円〜1億円', '1億円〜3億円', '3億円〜5億円', '5億円〜10億円', '10億円〜20億円', '20億円〜30億円', '30億円〜50億円', '50億円以上'];
const foundedYears = Array.from({ length: 80 }, (_, index) => String(new Date().getFullYear() - index));
const foundedMonths = Array.from({ length: 12 }, (_, index) => `${index + 1}月`);
const visibilityLabels: Record<Visibility, string> = {
  public: '全体公開',
  followers: 'フォロワー限定',
  investors: '投資家限定',
  entrepreneurs: '起業家限定',
  draft: '下書き',
};
const adminEmail = 'ryutaro.moritoki@gmail.com';

const emptyAccount: Account = {
  id: '',
  role: 'entrepreneur',
  email: '',
  phone: '',
  password: '',
  emailVerified: false,
  businessType: 'corporation',
  corporateNumber: '',
  licenseFileName: '',
  accountName: '',
  name: '',
  company: '',
  title: '',
  industry: '',
  location: '',
  stage: '',
  foundedYear: '',
  foundedMonth: '',
  employeeSize: '',
  revenueScale: '',
  bio: '',
  avatarLabel: '',
  avatarUrl: '',
  fundingGoal: '',
  monthlyRevenue: '',
  growthRate: '',
  customerCount: '',
  investmentRange: '',
  supportAreas: '',
  ticketBalance: 0,
  ticketRequestStatus: 'none',
  ticketRequestPlan: '',
  ticketTransferName: '',
  verified: false,
};

function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, value: T) {
  if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(value));
}

function readFileAsDataUrl(file: File, onDone: (url: string) => void) {
  const reader = new FileReader();
  reader.onload = () => onDone(String(reader.result));
  reader.readAsDataURL(file);
}

export default function LeapApp() {
  const [page, setPage] = useState<Page>('feed');
  const [feedTab, setFeedTab] = useState<FeedTab>('recommended');
  const [accounts, setAccounts] = useState<Account[]>(() => loadLocal('leap.accounts', []));
  const [currentAccountId, setCurrentAccountId] = useState(() => loadLocal('leap.currentAccountId', ''));
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [posts, setPosts] = useState<Post[]>(() => loadLocal('leap.posts', []));
  const [messages, setMessages] = useState<DirectMessage[]>(() => loadLocal('leap.messages', []));
  const [meetingApplications, setMeetingApplications] = useState<MeetingApplication[]>(() => loadLocal('leap.meetingApplications', []));
  const [notices, setNotices] = useState<Notice[]>(() => loadLocal('leap.notices', []));
  const [following, setFollowing] = useState<string[]>(() => loadLocal('leap.following', []));
  const [savedPosts, setSavedPosts] = useState<string[]>(() => loadLocal('leap.savedPosts', []));
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [postDraft, setPostDraft] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postVisibility, setPostVisibility] = useState<Visibility>('public');
  const [postAttachment, setPostAttachment] = useState('');
  const [postImageName, setPostImageName] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [editingPostId, setEditingPostId] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [messageMode, setMessageMode] = useState<MessageKind>('direct');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => saveLocal('leap.accounts', accounts), [accounts]);
  useEffect(() => saveLocal('leap.currentAccountId', currentAccountId), [currentAccountId]);
  useEffect(() => saveLocal('leap.posts', posts), [posts]);
  useEffect(() => saveLocal('leap.messages', messages), [messages]);
  useEffect(() => saveLocal('leap.meetingApplications', meetingApplications), [meetingApplications]);
  useEffect(() => saveLocal('leap.notices', notices), [notices]);
  useEffect(() => saveLocal('leap.following', following), [following]);
  useEffect(() => saveLocal('leap.savedPosts', savedPosts), [savedPosts]);
  useEffect(() => {
    function syncAcrossTabs(event: StorageEvent) {
      if (event.key === 'leap.accounts') setAccounts(loadLocal('leap.accounts', []));
      if (event.key === 'leap.posts') setPosts(loadLocal('leap.posts', []));
      if (event.key === 'leap.messages') setMessages(loadLocal('leap.messages', []));
      if (event.key === 'leap.meetingApplications') setMeetingApplications(loadLocal('leap.meetingApplications', []));
      if (event.key === 'leap.notices') setNotices(loadLocal('leap.notices', []));
    }
    window.addEventListener('storage', syncAcrossTabs);
    return () => window.removeEventListener('storage', syncAcrossTabs);
  }, []);

  const currentAccount = accounts.find((account) => account.id === currentAccountId) ?? null;
  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) ?? currentAccount;
  const isAdmin = currentAccount?.email.trim().toLowerCase() === adminEmail;

  const visiblePosts = useMemo(() => posts.filter((post) => canSeePost(post, currentAccount, following)).filter((post) => post.visibility !== 'draft' && !post.isHidden), [currentAccount, following, posts]);
  const feedPosts = useMemo(() => {
    if (feedTab === 'following') return visiblePosts.filter((post) => following.includes(post.authorId));
    if (feedTab === 'investors') return visiblePosts.filter((post) => accounts.find((account) => account.id === post.authorId)?.role === 'investor');
    if (feedTab === 'entrepreneurs') return visiblePosts.filter((post) => accounts.find((account) => account.id === post.authorId)?.role === 'entrepreneur');
    return visiblePosts;
  }, [accounts, feedTab, following, visiblePosts]);

  const searchResults = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return accounts;
    return accounts.filter((account) => `${account.accountName} ${account.name} ${account.company} ${account.industry} ${account.location}`.toLowerCase().includes(text));
  }, [accounts, query]);

  function flash(body: string) {
    setToast(body);
    window.setTimeout(() => setToast(''), 1800);
  }

  function openProfile(account: Account) {
    setSelectedAccountId(account.id);
    setPage('profile');
  }

  function requireAccount() {
    if (!currentAccount) {
      setPage('auth');
      flash('先にアカウント作成とメール認証を完了してください');
      return false;
    }
    return true;
  }

  function submitPost() {
    if (!requireAccount()) return;
    if (!postDraft.trim()) return;
    if (editingPostId) {
      setPosts((list) => list.map((post) => post.id === editingPostId ? {
        ...post,
        body: postDraft.trim(),
        tags: postTags.split(',').map((tag) => tag.trim()).filter(Boolean),
        visibility: postVisibility,
        attachmentName: postAttachment.trim(),
        imageName: postImageName,
        imageUrl: postImageUrl,
      } : post));
      resetComposer();
      flash('投稿を更新しました');
      return;
    }
    setPosts((list) => [
      {
        id: crypto.randomUUID(),
        authorId: currentAccount!.id,
        body: postDraft.trim(),
        tags: postTags.split(',').map((tag) => tag.trim()).filter(Boolean),
        visibility: postVisibility,
        attachmentName: postAttachment.trim(),
        imageName: postImageName,
        imageUrl: postImageUrl,
        isHidden: false,
        actionUserIds: { likes: [], saves: [], meetings: [] },
        createdAt: new Date().toISOString(),
        likes: 0,
        saves: 0,
        meetings: 0,
        views: 0,
      },
      ...list,
    ]);
    resetComposer();
    flash(postVisibility === 'draft' ? '下書き保存しました' : '投稿しました');
  }

  function resetComposer() {
    setEditingPostId('');
    setPostDraft('');
    setPostTags('');
    setPostVisibility('public');
    setPostAttachment('');
    setPostImageName('');
    setPostImageUrl('');
    setShowComposer(false);
  }

  function reactToPost(postId: string, type: 'like' | 'save' | 'meeting') {
    if (!requireAccount()) return;
    const bucket = type === 'like' ? 'likes' : type === 'save' ? 'saves' : 'meetings';
    let added = false;
    setPosts((list) => list.map((post) => {
      if (post.id !== postId) return post;
      const actionUserIds = post.actionUserIds ?? { likes: [], saves: [], meetings: [] };
      const current = actionUserIds[bucket] ?? [];
      const exists = current.includes(currentAccount!.id);
      added = !exists;
      const nextUsers = exists ? current.filter((id) => id !== currentAccount!.id) : [...current, currentAccount!.id];
      return {
        ...post,
        actionUserIds: { ...actionUserIds, [bucket]: nextUsers },
        likes: bucket === 'likes' ? nextUsers.length : post.likes,
        saves: bucket === 'saves' ? nextUsers.length : post.saves,
        meetings: bucket === 'meetings' ? nextUsers.length : post.meetings,
      };
    }));
    if (type === 'save') setSavedPosts((list) => added ? (list.includes(postId) ? list : [...list, postId]) : list.filter((id) => id !== postId));
    if (type === 'meeting' && added) {
      const post = posts.find((item) => item.id === postId);
      const author = accounts.find((account) => account.id === post?.authorId);
      if (author) requestMeeting(author);
    } else {
      flash(added ? (type === 'like' ? '応援しました' : '保存しました') : '取り消しました');
    }
  }

  function startEditPost(post: Post) {
    setEditingPostId(post.id);
    setPostDraft(post.body);
    setPostTags(post.tags.join(', '));
    setPostVisibility(post.visibility);
    setPostAttachment(post.attachmentName);
    setPostImageName(post.imageName);
    setPostImageUrl(post.imageUrl);
    setShowComposer(true);
  }

  function hidePost(postId: string) {
    let hidden = false;
    setPosts((list) => list.map((post) => {
      if (post.id !== postId) return post;
      hidden = !post.isHidden;
      return { ...post, isHidden: hidden };
    }));
    flash(hidden ? '投稿を非表示にしました' : '投稿を再公開しました');
  }

  function deletePost(postId: string) {
    setPosts((list) => list.filter((post) => post.id !== postId));
    flash('投稿を削除しました');
  }

  function requestMeeting(account: Account) {
    if (!requireAccount()) return;
    const body = `${currentAccount?.accountName || currentAccount?.name || 'あなた'}さんから面談申請が届きました。個別メッセージで承認すると面談メッセージに移行できます。`;
    setMessages((list) => [
      { id: crypto.randomUUID(), partnerId: account.id, kind: 'direct', body: '面談申請を送信しました。相手が承認すると面談メッセージに移行できます。', createdAt: new Date().toISOString(), mine: true, meetingStatus: 'requested' },
      { id: crypto.randomUUID(), partnerId: account.id, kind: 'direct', body, createdAt: new Date().toISOString(), mine: false, meetingStatus: 'requested' },
      ...list,
    ]);
    setNotices((list) => [{ id: crypto.randomUUID(), body: `${account.accountName || account.name}へ面談申請を送信しました`, createdAt: new Date().toISOString(), unread: true }, ...list]);
    setSelectedAccountId(account.id);
    setMessageMode('direct');
    setPage('messages');
    flash('面談申込をしました');
  }

  function approveMeeting(partner: Account) {
    setMessages((list) => [
      { id: crypto.randomUUID(), partnerId: partner.id, kind: 'meeting', body: '面談申請が承認されました。ここで日程調整をしてください。', createdAt: new Date().toISOString(), mine: false, meetingStatus: 'approved' },
      ...list.map((message) => message.partnerId === partner.id && message.meetingStatus === 'requested' ? { ...message, meetingStatus: 'approved' as const } : message),
    ]);
    setMessageMode('meeting');
    flash('面談メッセージに切り替えました');
  }

  function rejectMeeting(partner: Account) {
    setMessages((list) => [
      { id: crypto.randomUUID(), partnerId: partner.id, kind: 'direct', body: '面談申請を非承認にしました。', createdAt: new Date().toISOString(), mine: true, meetingStatus: 'rejected' },
      ...list.map((message) => message.partnerId === partner.id && message.meetingStatus === 'requested' ? { ...message, meetingStatus: 'rejected' as const } : message),
    ]);
    flash('面談申請を非承認にしました');
  }

  function submitMeetingApplication(partner: Account, scheduledAt: string) {
    if (!requireAccount()) return;
    if (!scheduledAt) {
      flash('面談日時を選択してください');
      return;
    }
    const entrepreneur = [currentAccount, partner].find((account) => account?.role === 'entrepreneur');
    if (!entrepreneur) {
      flash('起業家アカウントが含まれていません');
      return;
    }
    if ((entrepreneur.ticketBalance ?? 0) < 1) {
      flash('面談チケットが不足しています');
      if (currentAccount?.id === entrepreneur.id) setPage('tickets');
      return;
    }
    const existing = meetingApplications.find((item) => item.applicantId === currentAccount!.id && item.partnerId === partner.id && item.status === 'pending');
    if (existing) {
      flash('すでに管理者確認待ちです');
      return;
    }
    setAccounts((list) => list.map((account) => account.id === entrepreneur.id ? { ...account, ticketBalance: Math.max(0, account.ticketBalance - 1) } : account));
    const application: MeetingApplication = {
      id: crypto.randomUUID(),
      applicantId: currentAccount!.id,
      partnerId: partner.id,
      scheduledAt,
      status: 'pending',
      ticketChargedAccountId: entrepreneur.id,
      ticketConsumed: true,
      createdAt: new Date().toISOString(),
    };
    setMeetingApplications((list) => [application, ...list]);
    setMessages((list) => [{ id: crypto.randomUUID(), partnerId: partner.id, kind: 'meeting', body: `面談日時を管理者に申請しました：${formatDate(scheduledAt)}`, createdAt: new Date().toISOString(), mine: true }, ...list]);
    setNotices((list) => [{ id: crypto.randomUUID(), body: `${currentAccount?.accountName || currentAccount?.name || 'ユーザー'}さんが面談日時を管理者に申請しました`, createdAt: new Date().toISOString(), unread: true }, ...list]);
    flash('面談日時を管理者へ申請しました');
  }

  function reviewMeetingApplication(applicationId: string, status: 'approved' | 'rejected') {
    const application = meetingApplications.find((item) => item.id === applicationId);
    if (!application) return;
    const currentStatus = application.status;
    setMeetingApplications((list) => list.map((item) => item.id === applicationId ? { ...item, status } : item));
    setMessages((list) => [{ id: crypto.randomUUID(), partnerId: application.partnerId, kind: 'meeting', body: status === 'approved' ? `管理者が面談を承認しました：${formatDate(application.scheduledAt)}` : '管理者が面談申請を非承認にしました。再度日程調整をしてください。', createdAt: new Date().toISOString(), mine: false, meetingStatus: status === 'approved' ? 'approved' : 'rejected' }, ...list]);
    if (application.ticketChargedAccountId && currentStatus !== status) {
      setAccounts((list) => list.map((account) => {
        if (account.id !== application.ticketChargedAccountId) return account;
        if (status === 'rejected' && application.ticketConsumed) return { ...account, ticketBalance: account.ticketBalance + 1 };
        if (status === 'approved' && currentStatus === 'rejected' && !application.ticketConsumed) return { ...account, ticketBalance: Math.max(0, account.ticketBalance - 1) };
        return account;
      }));
    }
    setMeetingApplications((list) => list.map((item) => item.id === applicationId ? { ...item, status, ticketConsumed: status === 'rejected' ? false : true } : item));
    flash(status === 'approved' ? '面談申請を承認しました' : '面談申請を非承認にしました');
  }

  function follow(account: Account) {
    if (!requireAccount()) return;
    setFollowing((list) => list.includes(account.id) ? list.filter((id) => id !== account.id) : [...list, account.id]);
    flash(following.includes(account.id) ? 'フォロー解除しました' : 'フォローしました');
  }

  function sendMessage(partner: Account | null, kind = messageMode) {
    if (!partner || !messageDraft.trim()) return;
    setMessages((list) => [{ id: crypto.randomUUID(), partnerId: partner.id, kind, body: messageDraft.trim(), createdAt: new Date().toISOString(), mine: true }, ...list]);
    setMessageDraft('');
    flash('メッセージを送信しました');
  }

  function openTickets() {
    if (!requireAccount()) return;
    if (currentAccount?.role !== 'entrepreneur') {
      flash('面談チケット購入は起業家アカウント限定です');
      return;
    }
    setPage('tickets');
  }

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setCurrentAccountId('');
    setSelectedAccountId('');
    setMenuOpen(false);
    setPage('auth');
    flash('ログアウトしました');
  }

  return (
    <main className="min-h-screen bg-[#eef5ff] text-[#101828] lg:p-6">
      <div className="mx-auto grid min-h-screen w-full max-w-[430px] bg-white shadow-2xl lg:max-w-6xl lg:grid-cols-[220px_1fr] lg:overflow-hidden lg:rounded-[28px]">
        <DesktopNav page={page} setPage={setPage} openTickets={openTickets} isAdmin={isAdmin} />
        <AppHeader page={page} goBack={() => setPage('feed')} openTickets={openTickets} menuOpen={menuOpen} setMenuOpen={setMenuOpen} setPage={setPage} currentAccount={currentAccount} isAdmin={isAdmin} logout={logout} />

        <section className="min-h-0 overflow-y-auto pb-24 lg:col-start-2 lg:pb-6">
          {page === 'feed' && (
            <FeedPage posts={feedPosts} accounts={accounts} currentAccount={currentAccount} feedTab={feedTab} setFeedTab={setFeedTab} openComposer={() => setShowComposer(true)} openProfile={openProfile} reactToPost={reactToPost} startEditPost={startEditPost} hidePost={hidePost} deletePost={deletePost} />
          )}
          {page === 'search' && <SearchPage query={query} setQuery={setQuery} results={searchResults} openProfile={openProfile} />}
          {page === 'notifications' && <NotificationsPage notices={notices} setNotices={setNotices} />}
          {page === 'messages' && (
            <MessagesPage accounts={accounts} currentAccount={currentAccount} selectedAccount={selectedAccount} messages={messages} meetingApplications={meetingApplications} mode={messageMode} setMode={setMessageMode} draft={messageDraft} setDraft={setMessageDraft} sendMessage={sendMessage} approveMeeting={approveMeeting} rejectMeeting={rejectMeeting} requestMeeting={requestMeeting} submitMeetingApplication={submitMeetingApplication} openProfile={openProfile} setSelectedAccountId={setSelectedAccountId} />
          )}
          {page === 'auth' && <AuthPage accounts={accounts} setAccounts={setAccounts} setCurrentAccountId={setCurrentAccountId} setPage={setPage} flash={flash} />}
          {page === 'mypage' && (
            <MyPage currentAccount={currentAccount} posts={posts.filter((post) => post.authorId === currentAccount?.id)} setPage={setPage} openComposer={() => setShowComposer(true)} startEditPost={startEditPost} hidePost={hidePost} deletePost={deletePost} />
          )}
          {page === 'profileEdit' && <ProfileEditPage accounts={accounts} currentAccount={currentAccount} setAccounts={setAccounts} setCurrentAccountId={setCurrentAccountId} setPage={setPage} />}
          {page === 'tickets' && <TicketPage currentAccount={currentAccount} setAccounts={setAccounts} />}
          {page === 'admin' && (isAdmin ? <AdminPage accounts={accounts} posts={posts} meetingApplications={meetingApplications} setAccounts={setAccounts} setPosts={setPosts} reviewMeetingApplication={reviewMeetingApplication} openProfile={openProfile} /> : <EmptyState icon={<ShieldCheck size={28} />} title="管理者のみ表示できます" body="管理者アカウントでログインしてください。" action="ログインへ" onAction={() => setPage('auth')} />)}
          {(page === 'profile' || page === 'deal') && selectedAccount && (
            <ProfilePage account={selectedAccount} currentAccount={currentAccount} posts={posts.filter((post) => post.authorId === selectedAccount.id && canSeePost(post, currentAccount, following) && (!post.isHidden || currentAccount?.id === selectedAccount.id))} isFollowing={following.includes(selectedAccount.id)} isMine={currentAccount?.id === selectedAccount.id} follow={() => follow(selectedAccount)} message={() => { setSelectedAccountId(selectedAccount.id); setMessageMode('direct'); setPage('messages'); }} requestMeeting={() => requestMeeting(selectedAccount)} openDeal={() => setPage('deal')} dealMode={page === 'deal'} setPage={setPage} startEditPost={startEditPost} hidePost={hidePost} deletePost={deletePost} />
          )}
          {page === 'matching' && <MatchingPage accounts={accounts.filter((account) => account.role === 'entrepreneur')} openProfile={openProfile} requestMeeting={requestMeeting} />}
        </section>

        <BottomTabs page={page} setPage={setPage} openComposer={() => setShowComposer(true)} />
      </div>

      {showComposer && (
        <Modal onClose={resetComposer} title={editingPostId ? '投稿を編集' : '投稿する'}>
          <textarea className="field min-h-40 resize-none" placeholder="近況、学び、相談したいことを気軽に書いてください" value={postDraft} onChange={(event) => setPostDraft(event.target.value)} />
          <Select label="投稿範囲" value={postVisibility} options={Object.values(visibilityLabels)} onChange={(value) => setPostVisibility((Object.keys(visibilityLabels).find((key) => visibilityLabels[key as Visibility] === value) as Visibility) || 'public')} />
          <input className="field mt-3" placeholder="タグ。例：SaaS, AI, 資金調達" value={postTags} onChange={(event) => setPostTags(event.target.value)} />
          <label className="mt-3 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 text-xs font-black text-slate-500">
            <ImageIcon size={17} />画像を選択
            <input className="hidden" type="file" accept="image/*" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setPostImageName(file.name);
              readFileAsDataUrl(file, setPostImageUrl);
            }} />
          </label>
          {postImageUrl && <img src={postImageUrl} alt={postImageName} className="mt-3 aspect-video w-full rounded-2xl object-cover" />}
          <input className="field mt-3" placeholder="添付ファイル名" value={postAttachment} onChange={(event) => setPostAttachment(event.target.value)} />
          <button className="primary mt-4 w-full" onClick={submitPost}>投稿する</button>
        </Modal>
      )}

      {toast && <div className="fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-full bg-[#050816] px-5 py-3 text-xs font-black text-white shadow-xl">{toast}</div>}
    </main>
  );
}

function AppHeader({ page, goBack, openTickets, menuOpen, setMenuOpen, setPage, currentAccount, isAdmin, logout }: { page: Page; goBack: () => void; openTickets: () => void; menuOpen: boolean; setMenuOpen: (value: boolean) => void; setPage: (page: Page) => void; currentAccount: Account | null; isAdmin: boolean; logout: () => void | Promise<void> }) {
  const title: Record<Page, string> = {
    feed: 'フィード',
    search: '検索',
    notifications: '通知',
    messages: 'メッセージ',
    mypage: 'マイページ',
    profile: 'プロフィール',
    deal: '案件詳細',
    matching: 'マッチング',
    auth: 'アカウント作成',
    profileEdit: 'プロフィール編集',
    tickets: '面談チケット',
    admin: '管理者画面',
  };
  const canBack = page === 'profile' || page === 'deal' || page === 'matching' || page === 'profileEdit' || page === 'tickets' || page === 'auth';
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-50" onClick={canBack ? goBack : openTickets} aria-label={canBack ? '戻る' : 'チケット'}>
          {canBack ? <ChevronLeft size={20} /> : <BriefcaseBusiness size={20} />}
        </button>
        <h1 className="text-sm font-black">{title[page]}</h1>
        <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-50" aria-label="メニュー" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={20} /></button>
      </div>
      {menuOpen && (
        <div className="absolute right-3 top-12 z-40 w-52 rounded-2xl border border-slate-100 bg-white p-2 text-xs font-black shadow-xl">
          {[
            ['feed', 'フィード'],
            ['search', '検索'],
            ['messages', 'メッセージ'],
            ['tickets', '面談チケット'],
            ...(isAdmin ? [['admin', '管理者画面']] : []),
            [currentAccount ? 'profileEdit' : 'auth', currentAccount ? 'プロフィール編集' : 'アカウント作成'],
          ].map(([key, label]) => <button key={key} className="block w-full rounded-xl px-3 py-3 text-left hover:bg-slate-50" onClick={() => { setPage(key as Page); setMenuOpen(false); }}>{label}</button>)}
          {currentAccount && <button className="block w-full rounded-xl px-3 py-3 text-left text-rose-600 hover:bg-rose-50" onClick={logout}>ログアウト</button>}
        </div>
      )}
    </header>
  );
}

function DesktopNav({ page, setPage, openTickets, isAdmin }: { page: Page; setPage: (page: Page) => void; openTickets: () => void; isAdmin: boolean }) {
  const items: [Page, string, ReactNode][] = [
    ['feed', 'フィード', <Home size={18} />],
    ['search', '検索', <Search size={18} />],
    ['notifications', '通知', <Bell size={18} />],
    ['messages', 'メッセージ', <Mail size={18} />],
    ['mypage', 'マイページ', <UserRound size={18} />],
    ...(isAdmin ? [['admin', '管理者画面', <ShieldCheck size={18} />] as [Page, string, ReactNode]] : []),
  ];
  return (
    <aside className="hidden border-r border-slate-100 bg-white p-4 lg:row-span-2 lg:block">
      <div className="mb-6 text-xl font-black text-blue-600">Leap</div>
      <div className="grid gap-2">
        {items.map(([key, label, icon]) => <button key={key} className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-black ${page === key ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`} onClick={() => setPage(key)}>{icon}{label}</button>)}
        <button className="mt-4 flex items-center gap-3 rounded-2xl bg-[#050816] px-3 py-3 text-sm font-black text-white" onClick={openTickets}><BriefcaseBusiness size={18} />面談チケット</button>
      </div>
    </aside>
  );
}

function FeedPage({ posts, accounts, currentAccount, feedTab, setFeedTab, openComposer, openProfile, reactToPost, startEditPost, hidePost, deletePost }: { posts: Post[]; accounts: Account[]; currentAccount: Account | null; feedTab: FeedTab; setFeedTab: (tab: FeedTab) => void; openComposer: () => void; openProfile: (account: Account) => void; reactToPost: (postId: string, type: 'like' | 'save' | 'meeting') => void; startEditPost: (post: Post) => void; hidePost: (postId: string) => void; deletePost: (postId: string) => void }) {
  return (
    <div>
      <div className="grid grid-cols-4 border-b border-slate-100 text-center text-[11px] font-bold text-slate-500">
        {[
          ['following', 'フォロー中'],
          ['recommended', 'おすすめ'],
          ['investors', '投資家'],
          ['entrepreneurs', '起業家'],
        ].map(([key, label]) => <button key={key} className={`py-3 ${feedTab === key ? 'border-b-2 border-blue-600 text-slate-950' : ''}`} onClick={() => setFeedTab(key as FeedTab)}>{label}</button>)}
      </div>
      <div className="flex gap-3 overflow-x-auto border-b border-slate-100 px-4 py-3">
        <button className="grid w-14 shrink-0 justify-items-center gap-1 text-[10px] font-bold" onClick={openComposer}>
          <span className="grid h-12 w-12 place-items-center rounded-full border border-blue-500 text-blue-600"><Plus size={22} /></span>
          投稿する
        </button>
        {accounts.map((account) => <button key={account.id} className="grid w-14 shrink-0 justify-items-center gap-1 text-[10px] font-bold" onClick={() => openProfile(account)}><Avatar account={account} active /><span className="w-full truncate">{account.accountName || account.name}</span></button>)}
      </div>
      {posts.length === 0 ? (
        <EmptyState icon={<MessageCircle size={28} />} title="まだ投稿がありません" body="投稿すると、指定した公開範囲に合わせてフィードとマイページへ反映されます。" action="投稿する" onAction={openComposer} />
      ) : (
        <div className="divide-y divide-slate-100">
          {posts.map((post) => {
            const author = accounts.find((account) => account.id === post.authorId);
            return <PostCard key={post.id} post={post} author={author} currentAccount={currentAccount} openProfile={openProfile} reactToPost={reactToPost} startEditPost={startEditPost} hidePost={hidePost} deletePost={deletePost} />;
          })}
        </div>
      )}
    </div>
  );
}

function SearchPage({ query, setQuery, results, openProfile }: { query: string; setQuery: (value: string) => void; results: Account[]; openProfile: (account: Account) => void }) {
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState('');
  const [location, setLocation] = useState('');
  const filtered = results.filter((account) => (!role || account.role === role) && (!industry || account.industry === industry) && (!stage || account.stage === stage) && (!location || account.location === location));
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3">
        <Search size={17} className="text-slate-400" />
        <input className="min-w-0 flex-1 text-sm outline-none" placeholder="アカウント名、会社名、業界で検索" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-[11px] font-bold">
        {['起業家', '投資家', '案件', '投稿'].map((item) => <button className="rounded-full bg-slate-50 px-2 py-2" key={item}>{item}</button>)}
      </div>
      <div className="mt-5 rounded-2xl border border-slate-100 p-4">
        <h2 className="text-sm font-black">高度な検索</h2>
        <Select label="ユーザー種別" value={role} options={['entrepreneur', 'investor']} displayMap={{ entrepreneur: '起業家', investor: '投資家' }} onChange={setRole} />
        <Select label="業界" value={industry} options={industries} onChange={setIndustry} />
        <Select label="フェーズ" value={stage} options={stages} onChange={setStage} />
        <Select label="地域" value={location} options={locations} onChange={setLocation} />
        <button className="secondary mt-3 w-full" onClick={() => { setRole(''); setIndustry(''); setStage(''); setLocation(''); }}>条件をクリア</button>
      </div>
      <h2 className="mt-6 text-sm font-black">検索結果</h2>
      {filtered.length === 0 ? (
        <EmptyState icon={<Search size={28} />} title="表示できるアカウントがありません" body="登録されたアカウントだけがここに表示されます。" />
      ) : (
        <div className="mt-3 grid gap-3">
          {filtered.map((account) => <AccountRow key={account.id} account={account} onClick={() => openProfile(account)} />)}
        </div>
      )}
    </div>
  );
}

function NotificationsPage({ notices, setNotices }: { notices: Notice[]; setNotices: (notices: Notice[]) => void }) {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const visibleNotices = tab === 'unread' ? notices.filter((notice) => notice.unread) : notices;
  function openNotice(notice: Notice) {
    const readNotice = { ...notice, unread: false };
    setNotices(notices.map((item) => item.id === notice.id ? readNotice : item));
    setSelectedNotice(readNotice);
  }

  return (
    <div>
      <div className="grid grid-cols-2 border-b border-slate-100 text-center text-[11px] font-bold">
        <button className={`py-3 ${tab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`} onClick={() => setTab('all')}>すべて</button>
        <button className={`py-3 ${tab === 'unread' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`} onClick={() => setTab('unread')}>未読</button>
      </div>
      {visibleNotices.length === 0 ? (
        <EmptyState icon={<Bell size={28} />} title={tab === 'unread' ? '未読通知はありません' : '通知はまだありません'} body="フォロー、コメント、面談申込、メッセージが届くと表示されます。" />
      ) : (
        <div className="divide-y divide-slate-100">
          {visibleNotices.map((notice) => (
            <button key={notice.id} className="flex w-full gap-3 px-4 py-4 text-left" onClick={() => openNotice(notice)}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600"><Bell size={18} /></span>
              <span className="min-w-0 flex-1">
                <b className="block text-sm">{notice.body}</b>
                <span className="mt-1 block text-[11px] text-slate-500">{formatDate(notice.createdAt)}</span>
              </span>
              {notice.unread && <span className="mt-2 h-2 w-2 rounded-full bg-blue-600" />}
            </button>
          ))}
        </div>
      )}
      {selectedNotice && (
        <Modal title="通知詳細" onClose={() => setSelectedNotice(null)}>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-black leading-7">{selectedNotice.body}</p>
            <p className="mt-2 text-xs font-bold text-slate-500">{formatDate(selectedNotice.createdAt)}</p>
          </div>
          <button className="primary mt-4 w-full" onClick={() => setSelectedNotice(null)}>閉じる</button>
        </Modal>
      )}
    </div>
  );
}

function MessagesPage({ accounts, currentAccount, selectedAccount, messages, meetingApplications, mode, setMode, draft, setDraft, sendMessage, approveMeeting, rejectMeeting, requestMeeting, submitMeetingApplication, openProfile, setSelectedAccountId }: { accounts: Account[]; currentAccount: Account | null; selectedAccount: Account | null; messages: DirectMessage[]; meetingApplications: MeetingApplication[]; mode: MessageKind; setMode: (mode: MessageKind) => void; draft: string; setDraft: (value: string) => void; sendMessage: (partner: Account | null, kind?: MessageKind) => void; approveMeeting: (partner: Account) => void; rejectMeeting: (partner: Account) => void; requestMeeting: (partner: Account) => void; submitMeetingApplication: (partner: Account, scheduledAt: string) => void; openProfile: (account: Account) => void; setSelectedAccountId: (id: string) => void }) {
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const directPartners = accounts.filter((account) => account.id !== currentAccount?.id);
  const approvedPartnerIds = new Set(messages.filter((message) => message.kind === 'meeting' || message.meetingStatus === 'approved').map((message) => message.partnerId));
  const partners = mode === 'meeting' ? directPartners.filter((account) => approvedPartnerIds.has(account.id)) : directPartners;
  const activePartner = selectedAccount && selectedAccount.id !== currentAccount?.id && partners.some((partner) => partner.id === selectedAccount.id) ? selectedAccount : partners[0] ?? null;
  const thread = activePartner ? messages.filter((message) => message.partnerId === activePartner.id && message.kind === mode).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [];
  const incomingRequested = activePartner ? messages.some((message) => message.partnerId === activePartner.id && message.meetingStatus === 'requested' && !message.mine) : false;
  const outgoingRequested = activePartner ? messages.some((message) => message.partnerId === activePartner.id && message.meetingStatus === 'requested' && message.mine) : false;
  const hasApproved = activePartner ? messages.some((message) => message.partnerId === activePartner.id && message.meetingStatus === 'approved') : false;
  const latestApplication = activePartner && currentAccount ? meetingApplications.find((item) => ((item.applicantId === currentAccount.id && item.partnerId === activePartner.id) || (item.applicantId === activePartner.id && item.partnerId === currentAccount.id))) : null;
  const selectedSchedule = meetingDate && meetingTime ? `${meetingDate}T${meetingTime}:00` : '';
  const meetingButtonLabel = latestApplication?.status === 'pending' ? '申請中' : latestApplication?.status === 'approved' ? '面談可能' : '面談申請';
  return (
    <div className="grid min-h-[calc(100vh-7rem)] grid-rows-[auto_auto_1fr_auto]">
      <div className="grid grid-cols-2 border-b border-slate-100 text-center text-[11px] font-black">
        <button className={`py-3 ${mode === 'direct' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`} onClick={() => setMode('direct')}>個別メッセージ</button>
        <button className={`py-3 ${mode === 'meeting' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`} onClick={() => setMode('meeting')}>面談メッセージ</button>
      </div>
      <div className="flex gap-3 overflow-x-auto border-b border-slate-100 px-4 py-3">
        {partners.length === 0 ? <span className="text-xs text-slate-500">{mode === 'meeting' ? '承認済みの面談相手はまだいません。' : 'メッセージ相手はまだいません。'}</span> : partners.map((partner) => <button key={partner.id} className="grid w-16 shrink-0 justify-items-center gap-1 text-[10px] font-bold" onClick={() => setSelectedAccountId(partner.id)}><Avatar account={partner} active={activePartner?.id === partner.id} /><span className="w-full truncate">{partner.accountName || partner.name}</span></button>)}
      </div>
      {!activePartner ? (
        <EmptyState icon={<Mail size={28} />} title="メッセージはまだありません" body="検索やプロフィールから相手にメッセージできます。" />
      ) : (
        <div className="overflow-y-auto px-4 py-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button className="flex min-w-0 items-center gap-3" onClick={() => openProfile(activePartner)}><Avatar account={activePartner} /><span className="min-w-0 text-left"><b className="block truncate text-sm">{activePartner.accountName || activePartner.name}</b><span className="text-[11px] text-slate-500">プロフィールを見る</span></span></button>
            {mode === 'direct' && <button className="rounded-xl bg-[#050816] px-3 py-2 text-[11px] font-black text-white disabled:bg-slate-300" disabled={incomingRequested || outgoingRequested || hasApproved} onClick={() => requestMeeting(activePartner)}>{outgoingRequested ? '申請中' : hasApproved ? '承認済み' : '面談希望'}</button>}
          </div>
          {mode === 'direct' && incomingRequested && !hasApproved && <div className="mb-3 grid grid-cols-2 gap-2"><button className="primary" onClick={() => approveMeeting(activePartner)}>承認</button><button className="secondary text-rose-600" onClick={() => rejectMeeting(activePartner)}>非承認</button></div>}
          {mode === 'direct' && outgoingRequested && !hasApproved && <p className="mb-3 rounded-2xl bg-blue-50 p-3 text-xs font-bold text-blue-700">相手の承認待ちです。</p>}
          {mode === 'meeting' && (
            <div className="mb-3 rounded-2xl border border-slate-100 p-3">
              <p className="text-xs font-black">管理者への面談日程申請</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <input className="field" type="date" value={meetingDate} onChange={(event) => setMeetingDate(event.target.value)} disabled={latestApplication?.status === 'pending' || latestApplication?.status === 'approved'} />
                <input className="field" type="time" value={meetingTime} onChange={(event) => setMeetingTime(event.target.value)} disabled={latestApplication?.status === 'pending' || latestApplication?.status === 'approved'} />
              </div>
              <button className="primary mt-3 w-full disabled:bg-slate-300" disabled={latestApplication?.status === 'pending' || latestApplication?.status === 'approved'} onClick={() => submitMeetingApplication(activePartner, selectedSchedule)}>{meetingButtonLabel}</button>
              {latestApplication?.status === 'rejected' && <p className="mt-2 text-xs font-bold text-rose-600">非承認になりました。日時を再調整して再申請してください。</p>}
            </div>
          )}
          {thread.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">まだやり取りはありません。</p> : thread.map((message) => <div key={message.id} className={`mb-3 flex ${message.mine ? 'justify-end' : 'justify-start'}`}><p className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${message.mine ? 'bg-[#050816] text-white' : 'bg-slate-100'}`}>{message.body}<span className="mt-1 block text-[10px] opacity-60">{formatDate(message.createdAt)}</span></p></div>)}
        </div>
      )}
      <div className="flex gap-2 border-t border-slate-100 bg-white p-3">
        <input className="field" placeholder="メッセージを書く" value={draft} onChange={(event) => setDraft(event.target.value)} disabled={!activePartner} />
        <button className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#050816] text-white disabled:opacity-30" disabled={!activePartner} onClick={() => sendMessage(activePartner, mode)}><Send size={18} /></button>
      </div>
    </div>
  );
}

function AuthPage({ accounts, setAccounts, setCurrentAccountId, setPage, flash }: { accounts: Account[]; setAccounts: (accounts: Account[]) => void; setCurrentAccountId: (id: string) => void; setPage: (page: Page) => void; flash: (message: string) => void }) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [role, setRole] = useState<Role>('entrepreneur');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const normalizedEmail = email.trim().toLowerCase();
  function login() {
    const account = accounts.find((item) => item.email.trim().toLowerCase() === normalizedEmail && item.password === password);
    if (!account) {
      setAuthMessage('メールアドレスまたはパスワードが違います。');
      return;
    }
    setCurrentAccountId(account.id);
    setPage(account.accountName || account.name ? 'feed' : 'profileEdit');
    flash('ログインしました');
  }
  async function sendConfirmation() {
    if (accounts.some((account) => account.email.trim().toLowerCase() === normalizedEmail)) {
      setAuthMessage('すでに登録済みです。ログイン画面に戻ってログインしてください。');
      setMode('login');
      setSent(false);
      flash('すでに登録済みです');
      return;
    }
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
          data: { phone, role },
        },
      });
      if (error) {
        setAuthMessage(`確認メール送信に失敗しました：${error.message}`);
      } else {
        setAuthMessage('確認メールを送信しました。メール内のURLを押すと本番のメール認証が完了します。');
      }
    } else {
      setAuthMessage('Supabase環境変数がないため、開発確認モードで進めます。');
    }
    setSent(true);
    flash('確認メールを送信しました');
  }
  function complete() {
    if (accounts.some((account) => account.email.trim().toLowerCase() === normalizedEmail)) {
      setAuthMessage('すでに登録済みです。ログイン画面に戻ってログインしてください。');
      setMode('login');
      return;
    }
    const account: Account = { ...emptyAccount, id: crypto.randomUUID(), role, email, phone, password, emailVerified: true };
    setAccounts([...accounts, account]);
    setCurrentAccountId(account.id);
    setPage('profileEdit');
    flash('メール認証が完了しました。プロフィールを作成してください');
  }
  return (
    <div className="p-4">
      <div className="rounded-3xl border border-slate-100 p-5">
        <div className="grid grid-cols-2 rounded-2xl bg-slate-50 p-1 text-xs font-black">
          <button className={`rounded-xl py-3 ${mode === 'signup' ? 'bg-white shadow-sm' : 'text-slate-500'}`} onClick={() => { setMode('signup'); setAuthMessage(''); }}>アカウント作成</button>
          <button className={`rounded-xl py-3 ${mode === 'login' ? 'bg-white shadow-sm' : 'text-slate-500'}`} onClick={() => { setMode('login'); setAuthMessage(''); }}>すでにアカウントをお持ちの方</button>
        </div>
        <h2 className="mt-5 text-xl font-black">{mode === 'signup' ? 'アカウント作成' : 'ログイン'}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{mode === 'signup' ? 'メールアドレス、電話番号、パスワードを入力し、メール認証後にプロフィール作成へ進みます。' : '登録済みのメールアドレスとパスワードでログインしてください。'}</p>
        <div className="mt-5 grid gap-3">
          {mode === 'signup' && <Segmented value={role} onChange={setRole} />}
          <Input label="メールアドレス" value={email} onChange={setEmail} />
          {mode === 'signup' && <Input label="電話番号" value={phone} onChange={setPhone} />}
          <Input label="パスワード" value={password} onChange={setPassword} type="password" />
        </div>
        {mode === 'signup' ? (!sent ? <button className="primary mt-5 w-full" disabled={!email || !phone || !password} onClick={sendConfirmation}>確認メールを送信する</button> : <button className="primary mt-5 w-full" onClick={complete}>認証後、プロフィール作成へ進む</button>) : <button className="primary mt-5 w-full" disabled={!email || !password} onClick={login}>ログイン</button>}
        {(sent || authMessage) && <p className="mt-3 text-xs leading-6 text-slate-500">{authMessage || 'メールの確認URLを押してから、プロフィール作成へ進んでください。'}</p>}
      </div>
    </div>
  );
}

function MyPage({ currentAccount, posts, setPage, openComposer, startEditPost, hidePost, deletePost }: { currentAccount: Account | null; posts: Post[]; setPage: (page: Page) => void; openComposer: () => void; startEditPost: (post: Post) => void; hidePost: (postId: string) => void; deletePost: (postId: string) => void }) {
  if (!currentAccount) {
    return <EmptyState icon={<ShieldCheck size={28} />} title="アカウント作成が必要です" body="メール認証後にプロフィールを作成するとマイページが表示されます。" action="アカウント作成へ" onAction={() => setPage('auth')} />;
  }
  return (
    <div className="p-4">
      <ProfileHero account={currentAccount} isMine posts={posts} setPage={setPage} />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="secondary" onClick={() => setPage('profileEdit')}><Settings size={16} />プロフィールを編集</button>
        <button className="primary" onClick={openComposer}><Plus size={17} />投稿する</button>
      </div>
      <div className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-100">
        {posts.length === 0 ? <EmptyState icon={<FileText size={28} />} title="投稿はまだありません" body="投稿するとここに保存され、公開範囲に合わせてフィードにも表示されます。" /> : posts.map((post) => <PostCard key={post.id} post={post} author={currentAccount} currentAccount={currentAccount} openProfile={() => undefined} reactToPost={() => undefined} startEditPost={startEditPost} hidePost={hidePost} deletePost={deletePost} />)}
      </div>
    </div>
  );
}

function ProfileEditPage({ accounts, currentAccount, setAccounts, setCurrentAccountId, setPage }: { accounts: Account[]; currentAccount: Account | null; setAccounts: (accounts: Account[]) => void; setCurrentAccountId: (id: string) => void; setPage: (page: Page) => void }) {
  const [form, setForm] = useState<Account>(currentAccount ?? emptyAccount);
  useEffect(() => setForm(currentAccount ?? emptyAccount), [currentAccount?.id]);
  function update(key: keyof Account, value: string | number | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function save() {
    const next: Account = { ...form, id: form.id || crypto.randomUUID(), avatarLabel: form.avatarLabel || (form.accountName || form.name || 'L').slice(0, 1), verified: Boolean(form.corporateNumber || form.licenseFileName) };
    const exists = accounts.some((account) => account.id === next.id);
    setAccounts(exists ? accounts.map((account) => account.id === next.id ? next : account) : [...accounts, next]);
    setCurrentAccountId(next.id);
    setPage('mypage');
  }
  return (
    <div className="p-4">
      <div className="rounded-2xl border border-slate-100 p-4">
        <h2 className="text-sm font-black">プロフィール{currentAccount ? '編集' : '作成'}</h2>
        <div className="mt-4 grid gap-3">
          <Segmented value={form.role} onChange={(role) => update('role', role)} />
          <label className="grid gap-2 text-[11px] font-bold text-slate-600">
            アイコン画像
            <span className="flex items-center gap-3">
              <Avatar account={form} />
              <span className="secondary relative overflow-hidden">
                画像を選択
                <input className="absolute inset-0 opacity-0" type="file" accept="image/*" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  readFileAsDataUrl(file, (url) => update('avatarUrl', url));
                }} />
              </span>
            </span>
          </label>
          <Input label="アカウント名" value={form.accountName} onChange={(value) => update('accountName', value)} />
          <Input label="名前" value={form.name} onChange={(value) => update('name', value)} />
          <Input label="会社名" value={form.company} onChange={(value) => update('company', value)} />
          <Input label="肩書き" value={form.title} onChange={(value) => update('title', value)} />
          <Select label="業界" value={form.industry} options={industries} onChange={(value) => update('industry', value)} />
          <Select label="地域" value={form.location} options={locations} onChange={(value) => update('location', value)} />
          <Select label="フェーズ" value={form.stage} options={stages} onChange={(value) => update('stage', value)} />
          <div className="grid grid-cols-2 gap-2"><Select label="設立年" value={form.foundedYear} options={foundedYears} onChange={(value) => update('foundedYear', value)} /><Select label="設立月" value={form.foundedMonth} options={foundedMonths} onChange={(value) => update('foundedMonth', value)} /></div>
          <Select label="従業員数" value={form.employeeSize} options={employeeSizes} onChange={(value) => update('employeeSize', value)} />
          <Select label="年商規模" value={form.revenueScale} options={revenueScales} onChange={(value) => update('revenueScale', value)} />
          <Select label="本人確認種別" value={form.businessType} options={['corporation', 'sole']} displayMap={{ corporation: '法人', sole: '個人事業主' }} onChange={(value) => update('businessType', value)} />
          {form.businessType === 'corporation' ? <Input label="法人番号" value={form.corporateNumber} onChange={(value) => update('corporateNumber', value)} /> : <label className="grid gap-1 text-[11px] font-bold text-slate-600">運転免許証の写真<input className="field" type="file" accept="image/*" onChange={(event) => update('licenseFileName', event.target.files?.[0]?.name || '')} />{form.licenseFileName && <span className="text-slate-500">{form.licenseFileName}</span>}</label>}
          {form.role === 'entrepreneur' ? (
            <>
              <Input label="調達希望額" value={form.fundingGoal} onChange={(value) => update('fundingGoal', value)} />
              <Input label="月次売上" value={form.monthlyRevenue} onChange={(value) => update('monthlyRevenue', value)} />
              <Input label="成長率" value={form.growthRate} onChange={(value) => update('growthRate', value)} />
              <Input label="導入社数" value={form.customerCount} onChange={(value) => update('customerCount', value)} />
            </>
          ) : (
            <>
              <Input label="投資可能額" value={form.investmentRange} onChange={(value) => update('investmentRange', value)} />
              <Input label="支援できること" value={form.supportAreas} onChange={(value) => update('supportAreas', value)} />
            </>
          )}
          <label className="grid gap-1 text-[11px] font-bold text-slate-600">自己紹介<textarea className="field min-h-24 resize-none" value={form.bio} onChange={(event) => update('bio', event.target.value)} /></label>
        </div>
        <button className="primary mt-4 w-full" onClick={save}>保存する</button>
      </div>
    </div>
  );
}

function TicketPage({ currentAccount, setAccounts }: { currentAccount: Account | null; setAccounts: (updater: Account[] | ((accounts: Account[]) => Account[])) => void }) {
  const [agreed, setAgreed] = useState(false);
  const [plan, setPlan] = useState('1枚');
  const [transferName, setTransferName] = useState(currentAccount?.ticketTransferName || '');
  const [showTerms, setShowTerms] = useState(false);
  const plans = [['1枚', '11,000円'], ['3枚', '29,700円'], ['5枚', '44,000円']];
  function requestPayment() {
    if (!currentAccount) return;
    setAccounts((accounts) => accounts.map((account) => account.id === currentAccount.id ? { ...account, ticketRequestStatus: 'pending', ticketRequestPlan: plan, ticketTransferName: transferName.trim() } : account));
  }
  return (
    <div className="p-4">
      <div className="rounded-3xl border border-slate-100 p-5">
        <h2 className="text-xl font-black">面談チケット</h2>
        <p className="mt-2 text-sm text-slate-500">保有枚数：<b className="text-slate-950">{currentAccount?.ticketBalance ?? 0}枚</b></p>
        <div className="mt-4 grid gap-2">
          {plans.map(([name, price]) => <button key={name} className={`rounded-2xl border p-4 text-left ${plan === name ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`} onClick={() => setPlan(name)}><b className="block text-sm">{name}</b><span className="text-xs text-slate-500">{price}</span></button>)}
        </div>
        <Input label="振込名義（カタカナ）" value={transferName} onChange={setTransferName} />
        <label className="mt-4 flex gap-2 rounded-2xl bg-slate-50 p-3 text-xs leading-6 text-slate-600"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /><span><button type="button" className="font-black text-blue-600 underline" onClick={() => setShowTerms(true)}>利用規約</button>と、面談実施前に運営へ面談日程申請が必要であることに同意します。</span></label>
        {agreed && (
          <div className="mt-4 rounded-2xl border border-slate-100 p-4 text-sm leading-8">
            <b>振込先</b><br />近畿産業信用組合<br />本店営業部<br />普通 3170341<br />カ）エーアイインフルエンサー
            <p className="mt-2 text-xs leading-6 text-slate-500">振込名義は、登録会社名があれば会社名、なければ氏名カタカナでお願いします。運営へ振込明細の写真を送ると早く確認できる場合があります。</p>
          </div>
        )}
        <button className="primary mt-4 w-full" disabled={!agreed || !transferName.trim() || currentAccount?.ticketRequestStatus === 'pending'} onClick={requestPayment}>{currentAccount?.ticketRequestStatus === 'pending' ? '入金確認依頼中です' : `${plan}の入金確認を依頼する`}</button>
      </div>
      {showTerms && (
        <Modal title="面談チケット利用規約" onClose={() => setShowTerms(false)}>
          <div className="max-h-[60vh] overflow-y-auto rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">
            <p>本規約は、Leap上で提供する面談チケットの購入および利用条件を定めるものです。利用者は本規約に同意したうえでチケットを購入・利用します。</p>
            <p className="mt-3">チケットは、投資家等との面談日程を運営に申請するために使用します。面談実施前に必ず運営へ日程申請を行い、承認を受けてください。</p>
            <p className="mt-3">支払い方法は銀行振込のみです。振込手数料は利用者負担とし、入金確認後にチケットを付与します。入金確認には時間がかかる場合があります。</p>
            <p className="mt-3">購入後のキャンセル、返金、換金は原則できません。ただし、運営が必要と判断した場合は個別に対応します。</p>
            <p className="mt-3">利用者が虚偽情報の登録、無断での連絡先交換、運営承認前の面談実施、その他不適切行為を行った場合、チケットの失効またはアカウント停止を行うことがあります。</p>
            <p className="mt-3">Leapは投資判断を代行・推奨するサービスではありません。掲載情報をもとにした判断は各利用者の責任で行ってください。</p>
          </div>
          <button className="primary mt-4 w-full" onClick={() => setShowTerms(false)}>閉じる</button>
        </Modal>
      )}
    </div>
  );
}

function AdminPage({ accounts, posts, meetingApplications, setAccounts, setPosts, reviewMeetingApplication, openProfile }: { accounts: Account[]; posts: Post[]; meetingApplications: MeetingApplication[]; setAccounts: (accounts: Account[]) => void; setPosts: (posts: Post[]) => void; reviewMeetingApplication: (applicationId: string, status: 'approved' | 'rejected') => void; openProfile: (account: Account) => void }) {
  const pendingTickets = accounts.filter((account) => account.ticketRequestStatus === 'pending');
  const hiddenPosts = posts.filter((post) => post.isHidden);
  const pendingMeetings = meetingApplications.filter((application) => application.status === 'pending');
  function approveTicket(account: Account) {
    const count = Number(account.ticketRequestPlan.replace('枚', '')) || 1;
    setAccounts(accounts.map((item) => item.id === account.id ? { ...item, ticketBalance: item.ticketBalance + count, ticketRequestStatus: 'none', ticketRequestPlan: '', ticketTransferName: '' } : item));
  }
  return (
    <div className="p-4 lg:p-6">
      <div className="grid gap-3 lg:grid-cols-5">
        <AdminStat label="ユーザー" value={`${accounts.length}件`} />
        <AdminStat label="投稿" value={`${posts.length}件`} />
        <AdminStat label="非表示投稿" value={`${hiddenPosts.length}件`} />
        <AdminStat label="チケット申請" value={`${pendingTickets.length}件`} />
        <AdminStat label="面談申請" value={`${pendingMeetings.length}件`} />
      </div>
      <section className="mt-5 rounded-2xl border border-slate-100 p-4">
        <h2 className="text-sm font-black">面談申請一覧</h2>
        {meetingApplications.length === 0 ? <p className="mt-3 text-sm text-slate-500">面談申請はまだありません。</p> : (
          <div className="mt-3 grid gap-2">
            {meetingApplications.map((application) => {
              const applicant = accounts.find((account) => account.id === application.applicantId);
              const partner = accounts.find((account) => account.id === application.partnerId);
              return (
                <div key={application.id} className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <b className="block truncate text-sm">{applicant?.accountName || applicant?.name || '申請者未設定'} → {partner?.accountName || partner?.name || '相手未設定'}</b>
                      <span className="mt-1 block text-xs text-slate-500">面談日時：{formatDate(application.scheduledAt)}</span>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-black ${application.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : application.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'}`}>{application.status === 'approved' ? '承認済み' : application.status === 'rejected' ? '非承認' : '確認待ち'}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {applicant && <button className="secondary min-h-9 text-[11px]" onClick={() => openProfile(applicant)}>申請者を見る</button>}
                    {partner && <button className="secondary min-h-9 text-[11px]" onClick={() => openProfile(partner)}>相手を見る</button>}
                    <button className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white" onClick={() => reviewMeetingApplication(application.id, 'approved')}>承認</button>
                    <button className="rounded-xl border border-rose-100 px-3 py-2 text-xs font-black text-rose-600" onClick={() => reviewMeetingApplication(application.id, 'rejected')}>非承認</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <section className="mt-5 rounded-2xl border border-slate-100 p-4">
        <h2 className="text-sm font-black">チケット入金確認</h2>
        {pendingTickets.length === 0 ? <p className="mt-3 text-sm text-slate-500">確認待ちはありません。</p> : (
          <div className="mt-3 grid gap-2">
            {pendingTickets.map((account) => <div key={account.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><Avatar account={account} /><div className="min-w-0 flex-1"><b className="block truncate text-sm">{account.accountName || account.name || account.email}</b><span className="block text-xs text-slate-500">購入枚数：{account.ticketRequestPlan || '1枚'} / 振込名義：{account.ticketTransferName || '未入力'}</span><span className="block text-xs text-slate-500">{account.company || '会社名未設定'}</span></div><button className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white" onClick={() => approveTicket(account)}>承認</button></div>)}
          </div>
        )}
      </section>
      <section className="mt-5 rounded-2xl border border-slate-100 p-4">
        <h2 className="text-sm font-black">メンバー一覧</h2>
        {accounts.length === 0 ? <p className="mt-3 text-sm text-slate-500">登録ユーザーはまだいません。</p> : (
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {accounts.map((account) => <button key={account.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-left" onClick={() => openProfile(account)}><Avatar account={account} /><span className="min-w-0 flex-1"><b className="block truncate text-sm">{account.accountName || account.name || '未設定'}</b><span className="block truncate text-xs text-slate-500">{account.email || 'メール未登録'} / {account.company || '会社名未設定'}</span></span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-500">{account.role === 'entrepreneur' ? '起業家' : '投資家'}</span></button>)}
          </div>
        )}
      </section>
      <section className="mt-5 rounded-2xl border border-slate-100 p-4">
        <h2 className="text-sm font-black">投稿管理</h2>
        {posts.length === 0 ? <p className="mt-3 text-sm text-slate-500">投稿はまだありません。</p> : (
          <div className="mt-3 grid gap-2">
            {posts.map((post) => {
              const author = accounts.find((account) => account.id === post.authorId);
              return <div key={post.id} className="rounded-2xl bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><b className="truncate text-sm">{author?.accountName || author?.name || '投稿者未設定'}</b><span className="text-[10px] font-black text-slate-500">{post.isHidden ? '非表示' : visibilityLabels[post.visibility]}</span></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{post.body}</p><div className="mt-2 flex gap-2"><button className="secondary min-h-9 text-[11px]" onClick={() => setPosts(posts.map((item) => item.id === post.id ? { ...item, isHidden: !item.isHidden } : item))}>{post.isHidden ? '再公開' : '非表示'}</button><button className="secondary min-h-9 text-[11px] text-rose-600" onClick={() => setPosts(posts.filter((item) => item.id !== post.id))}>削除</button></div></div>;
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function AdminStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-100 p-4"><span className="text-[11px] font-black text-slate-500">{label}</span><b className="mt-2 block text-xl">{value}</b></div>;
}

function ProfilePage({ account, currentAccount, posts, isFollowing, isMine, follow, message, requestMeeting, openDeal, dealMode, setPage, startEditPost, hidePost, deletePost }: { account: Account; currentAccount: Account | null; posts: Post[]; isFollowing: boolean; isMine: boolean; follow: () => void; message: () => void; requestMeeting: () => void; openDeal: () => void; dealMode: boolean; setPage: (page: Page) => void; startEditPost: (post: Post) => void; hidePost: (postId: string) => void; deletePost: (postId: string) => void }) {
  if (dealMode && account.role === 'entrepreneur') return <DealPage account={account} requestMeeting={requestMeeting} />;
  return (
    <div>
      <ProfileHero account={account} isMine={isMine} posts={posts} setPage={setPage} />
      <div className="grid grid-cols-3 border-b border-slate-100 text-center text-[11px] font-bold">
        <button className="border-b-2 border-blue-600 py-3">概要</button>
        <button className="py-3 text-slate-500">実績</button>
        <button className="py-3 text-slate-500">投稿</button>
      </div>
      <div className="p-4">
        <KpiGrid account={account} />
        <TextBlock title="自己紹介" body={account.bio || '自己紹介は未入力です。'} />
        {account.role === 'entrepreneur' && <button className="secondary mt-4 w-full" onClick={openDeal}>案件詳細を見る</button>}
        {!isMine && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button className="secondary" onClick={follow}>{isFollowing ? '解除' : 'フォロー'}</button>
            <button className="secondary" onClick={message}>メッセージ</button>
            <button className="primary" onClick={requestMeeting}>面談</button>
          </div>
        )}
      </div>
      <div className="divide-y divide-slate-100">
        {posts.length === 0 ? <EmptyState icon={<FileText size={28} />} title="投稿はまだありません" body="投稿されるとここに表示されます。" /> : posts.map((post) => <PostCard key={post.id} post={post} author={account} currentAccount={currentAccount} openProfile={() => undefined} reactToPost={() => undefined} startEditPost={startEditPost} hidePost={hidePost} deletePost={deletePost} />)}
      </div>
    </div>
  );
}

function DealPage({ account, requestMeeting }: { account: Account; requestMeeting: () => void }) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-black">{account.company || account.accountName || '案件詳細'}</h2>
      <div className="mt-2 flex flex-wrap gap-2">{[account.industry, account.stage, account.location].filter(Boolean).map((tag) => <span className="pill" key={tag}>{tag}</span>)}</div>
      <DashboardCard />
      <h3 className="mt-5 text-sm font-black">ハイライト</h3>
      <KpiGrid account={account} />
      <h3 className="mt-5 text-sm font-black">関連情報</h3>
      <InfoRows rows={[['調達希望額', account.fundingGoal || '未入力'], ['月次売上', account.monthlyRevenue || '未入力'], ['成長率', account.growthRate || '未入力'], ['導入社数', account.customerCount || '未入力'], ['地域', account.location || '未入力'], ['フェーズ', account.stage || '未入力']]} />
      <div className="mt-4 rounded-2xl border border-slate-100 p-4">
        <p className="text-sm font-black">ピッチ資料</p>
        <p className="mt-2 text-xs text-slate-500">資料が登録されるとここに表示されます。</p>
      </div>
      <button className="primary mt-4 w-full" onClick={requestMeeting}>面談を申し込む</button>
    </div>
  );
}

function MatchingPage({ accounts, openProfile, requestMeeting }: { accounts: Account[]; openProfile: (account: Account) => void; requestMeeting: (account: Account) => void }) {
  return (
    <div className="p-4">
      <h2 className="text-sm font-black">マッチング候補</h2>
      {accounts.length === 0 ? <EmptyState icon={<UsersRound size={28} />} title="候補はまだありません" body="起業家アカウントが登録されると表示されます。" /> : (
        <div className="mt-3 grid gap-3">
          {accounts.map((account) => <div key={account.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3"><Avatar account={account} /><button className="min-w-0 flex-1 text-left" onClick={() => openProfile(account)}><b className="block truncate text-sm">{account.company || account.accountName}</b><span className="text-xs text-slate-500">{account.industry || '業界未入力'} / {account.stage || 'フェーズ未入力'}</span></button><button className="rounded-xl bg-[#050816] px-3 py-2 text-xs font-black text-white" onClick={() => requestMeeting(account)}>面談</button></div>)}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, author, currentAccount, openProfile, reactToPost, startEditPost, hidePost, deletePost }: { post: Post; author?: Account; currentAccount: Account | null; openProfile: (account: Account) => void; reactToPost: (postId: string, type: 'like' | 'save' | 'meeting') => void; startEditPost: (post: Post) => void; hidePost: (postId: string) => void; deletePost: (postId: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = Boolean(currentAccount && currentAccount.id === post.authorId);
  const actions = post.actionUserIds ?? { likes: [], saves: [], meetings: [] };
  const liked = currentAccount ? actions.likes?.includes(currentAccount.id) : false;
  const saved = currentAccount ? actions.saves?.includes(currentAccount.id) : false;
  const meetingRequested = currentAccount ? actions.meetings?.includes(currentAccount.id) : false;
  return (
    <article className={`relative px-4 py-4 ${post.isHidden ? 'bg-slate-50' : ''}`}>
      <div className="flex w-full gap-3 text-left">
        <button className="flex min-w-0 flex-1 gap-3 text-left" onClick={() => author && openProfile(author)}>
        {author ? <Avatar account={author} /> : <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100"><UserRound size={18} /></span>}
        <span className="min-w-0 flex-1">
          <b className="block truncate text-sm">{author?.accountName || author?.name || 'アカウント未設定'}</b>
          <span className="text-[11px] text-slate-500">{post.isHidden ? '非表示・' : ''}{visibilityLabels[post.visibility]}・{formatDate(post.createdAt)}</span>
        </span>
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-50" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={18} className="text-slate-400" /></button>
      </div>
      {menuOpen && isOwner && (
        <div className="absolute right-4 top-12 z-20 w-40 rounded-2xl border border-slate-100 bg-white p-2 text-xs font-black shadow-xl">
          <button className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left hover:bg-slate-50" onClick={() => { startEditPost(post); setMenuOpen(false); }}><Edit3 size={14} />編集</button>
          <button className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left hover:bg-slate-50" onClick={() => { hidePost(post.id); setMenuOpen(false); }}><EyeOff size={14} />{post.isHidden ? '再公開' : '非表示'}</button>
          <button className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-rose-600 hover:bg-rose-50" onClick={() => { deletePost(post.id); setMenuOpen(false); }}><Trash2 size={14} />削除</button>
        </div>
      )}
      {menuOpen && !isOwner && <div className="absolute right-4 top-12 z-20 rounded-2xl border border-slate-100 bg-white p-3 text-xs font-bold text-slate-500 shadow-xl">投稿者のみ操作できます</div>}
      <p className="mt-3 whitespace-pre-line text-sm leading-7">{post.body}</p>
      {post.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{post.tags.map((tag) => <span className="text-[11px] font-bold text-blue-600" key={tag}>#{tag}</span>)}</div>}
      {post.imageUrl && <img className="mt-3 aspect-video w-full rounded-2xl object-cover" src={post.imageUrl} alt={post.imageName || '投稿画像'} />}
      {post.attachmentName && <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs"><Paperclip size={15} />{post.attachmentName}</div>}
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-black">
        <button className={`rounded-xl border py-2 ${liked ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-100 text-rose-600'}`} onClick={() => reactToPost(post.id, 'like')}><Heart className="mx-auto mb-1" size={16} />応援 {post.likes}</button>
        <button className={`rounded-xl border py-2 ${saved ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-emerald-600'}`} onClick={() => reactToPost(post.id, 'save')}><Bookmark className="mx-auto mb-1" size={16} />保存 {post.saves}</button>
        <button className={`rounded-xl border py-2 ${meetingRequested ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-100 text-blue-600'}`} onClick={() => reactToPost(post.id, 'meeting')}><UsersRound className="mx-auto mb-1" size={16} />面談 {post.meetings}</button>
      </div>
      <p className="mt-2 text-right text-[10px] text-slate-400">閲覧 {post.views} 回</p>
    </article>
  );
}

function BottomTabs({ page, setPage, openComposer }: { page: Page; setPage: (page: Page) => void; openComposer: () => void }) {
  const tabs = [
    ['feed', 'フィード', Home],
    ['search', '検索', Search],
    ['notifications', '通知', Bell],
    ['messages', 'メッセージ', Mail],
    ['mypage', 'マイページ', UserRound],
  ] as const;
  return (
    <>
      <button className="fixed bottom-20 left-1/2 z-40 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-2xl bg-[#050816] text-white shadow-xl lg:hidden" onClick={openComposer} aria-label="投稿する">
        <Plus size={24} />
      </button>
      <nav className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-5 border-t border-slate-100 bg-white px-2 py-2 shadow-[0_-10px_28px_rgba(15,23,42,0.08)] lg:hidden">
        {tabs.map(([key, label, Icon]) => (
          <button key={key} className={`grid justify-items-center gap-1 rounded-2xl px-1 py-2 text-[9px] font-bold ${page === key ? 'text-blue-600' : 'text-slate-500'}`} onClick={() => setPage(key as Page)}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

function ProfileHero({ account, isMine, posts, setPage }: { account: Account; isMine: boolean; posts: Post[]; setPage: (page: Page) => void }) {
  return (
    <section className="rounded-3xl border border-slate-100 p-4">
      <div className="flex items-start gap-4">
        <Avatar account={account} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-black">{account.name || account.accountName || '名前未設定'} {account.verified && <CheckCircle2 className="inline text-blue-600" size={16} />}</h2>
          <p className="mt-1 text-xs text-slate-500">@{account.accountName || 'account'} / {account.company || '会社名未設定'}</p>
          <p className="mt-1 text-xs text-slate-500">{account.location || '地域未設定'}　{account.foundedYear && account.foundedMonth ? `${account.foundedYear}年${account.foundedMonth}` : '設立年月未設定'}　{account.stage || 'フェーズ未設定'}</p>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-line text-sm leading-7">{account.bio || '自己紹介は未入力です。'}</p>
      <div className="mt-3 flex flex-wrap gap-2">{[account.industry, account.employeeSize, account.revenueScale].filter(Boolean).map((item) => <span className="pill" key={item}>{item}</span>)}</div>
      <div className="mt-4 flex gap-5 text-xs"><span><b>{posts.length}</b> 投稿</span><span><b>0</b> フォロー</span><span><b>0</b> フォロワー</span>{isMine && account.role === 'entrepreneur' && <span><b>{account.ticketBalance}</b> チケット</span>}</div>
    </section>
  );
}

function KpiGrid({ account }: { account: Account }) {
  const items = account.role === 'entrepreneur'
    ? [['調達希望額', account.fundingGoal], ['月次売上', account.monthlyRevenue], ['成長率', account.growthRate], ['導入社数', account.customerCount], ['フェーズ', account.stage], ['累計投資金額', '未入力']]
    : [['投資可能額', account.investmentRange], ['投資領域', account.industry], ['投資ステージ', account.stage], ['支援内容', account.supportAreas], ['地域', account.location], ['累計投資金額', '未入力']];
  return <div className="mt-3 grid grid-cols-3 gap-2">{items.map(([label, value]) => <div className="rounded-2xl border border-slate-100 p-3" key={label}><span className="text-[10px] font-bold text-slate-500">{label}</span><b className="mt-2 block break-words text-xs">{value || '未入力'}</b></div>)}</div>;
}

function EmptyState({ icon, title, body, action, onAction }: { icon: ReactNode; title: string; body: string; action?: string; onAction?: () => void }) {
  return (
    <div className="grid min-h-72 place-items-center p-8 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">{icon}</div>
        <h2 className="mt-4 text-lg font-black">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
        {action && <button className="primary mt-5" onClick={onAction}>{action}</button>}
      </div>
    </div>
  );
}

function AccountRow({ account, onClick }: { account: Account; onClick: () => void }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left" onClick={onClick}>
      <Avatar account={account} />
      <span className="min-w-0 flex-1"><b className="block truncate text-sm">{account.accountName || account.company || account.name}</b><span className="text-xs text-slate-500">{account.role === 'entrepreneur' ? '起業家' : '投資家'} / {account.industry || '業界未入力'}</span></span>
      <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">{account.location || '地域未入力'}</span>
    </button>
  );
}

function Avatar({ account, size = 'md', active }: { account: Account; size?: 'md' | 'lg'; active?: boolean }) {
  const dimension = size === 'lg' ? 'h-20 w-20 text-xl' : 'h-11 w-11 text-sm';
  const label = account.avatarLabel || account.accountName?.slice(0, 1) || account.name?.slice(0, 1) || 'L';
  return <span className={`relative grid ${dimension} shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-blue-100 via-white to-emerald-100 font-black ring-1 ring-slate-200`}>{account.avatarUrl ? <img src={account.avatarUrl} alt={account.accountName || 'avatar'} className="h-full w-full object-cover" /> : label}{active && <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />}</span>;
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-3">
      <div className="w-full max-w-[430px] rounded-[26px] bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-black">{title}</h2>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-slate-100" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Segmented({ value, onChange }: { value: Role; onChange: (value: Role) => void }) {
  return <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-xs font-black"><button className={`rounded-lg py-3 ${value === 'entrepreneur' ? 'bg-white shadow-sm' : ''}`} onClick={() => onChange('entrepreneur')}>起業家</button><button className={`rounded-lg py-3 ${value === 'investor' ? 'bg-white shadow-sm' : ''}`} onClick={() => onChange('investor')}>投資家</button></div>;
}

function Input({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label className="grid gap-1 text-[11px] font-bold text-slate-600">{label}<input className="field" type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Select({ label, value, options, onChange, displayMap }: { label: string; value: string; options: string[]; onChange: (value: string) => void; displayMap?: Record<string, string> }) {
  return <label className="mt-3 grid gap-1 text-[11px] font-bold text-slate-600">{label}<select className="field" value={value} onChange={(event) => onChange(event.target.value)}><option value="">選択してください</option>{options.map((option) => <option key={option} value={option}>{displayMap?.[option] ?? option}</option>)}</select></label>;
}

function TextBlock({ title, body }: { title: string; body: string }) {
  return <section className="mt-5"><h3 className="text-sm font-black">{title}</h3><p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{body}</p></section>;
}

function DashboardCard() {
  return <div className="mt-4 rounded-2xl bg-gradient-to-br from-slate-100 to-blue-50 p-4"><div className="grid h-40 content-end gap-3 rounded-xl bg-white p-4 shadow-inner"><span className="h-2 rounded-full bg-slate-100" /><span className="h-2 w-2/3 rounded-full bg-slate-100" /><div className="flex h-20 items-end gap-2">{[45, 70, 38, 88, 64, 98].map((height) => <span className="flex-1 rounded-t bg-blue-500/70" style={{ height }} key={height} />)}</div></div></div>;
}

function InfoRows({ rows }: { rows: string[][] }) {
  return <div className="mt-2 divide-y divide-slate-100 rounded-2xl border border-slate-100 text-xs">{rows.map(([label, value]) => <div className="grid grid-cols-[100px_1fr] gap-2 px-3 py-3" key={label}><b className="text-slate-500">{label}</b><span>{value}</span></div>)}</div>;
}

function canSeePost(post: Post, viewer: Account | null, following: string[]) {
  if (post.visibility === 'public') return true;
  if (!viewer) return false;
  if (post.authorId === viewer.id) return true;
  if (post.visibility === 'followers') return following.includes(post.authorId);
  if (post.visibility === 'investors') return viewer.role === 'investor';
  if (post.visibility === 'entrepreneurs') return viewer.role === 'entrepreneur';
  return false;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
