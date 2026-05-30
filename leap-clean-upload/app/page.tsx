'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
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
  UserRound,
  UsersRound,
} from 'lucide-react';

type Page = 'feed' | 'search' | 'notifications' | 'messages' | 'mypage' | 'profile' | 'deal' | 'matching';
type Role = 'entrepreneur' | 'investor';
type FeedTab = 'following' | 'recommended' | 'investors' | 'entrepreneurs';

type Account = {
  id: string;
  role: Role;
  accountName: string;
  name: string;
  company: string;
  title: string;
  industry: string;
  location: string;
  stage: string;
  foundedMonth: string;
  employeeSize: string;
  revenueScale: string;
  bio: string;
  avatarLabel: string;
  fundingGoal: string;
  monthlyRevenue: string;
  growthRate: string;
  customerCount: string;
  investmentRange: string;
  supportAreas: string;
  verified: boolean;
};

type Post = {
  id: string;
  authorId: string;
  body: string;
  tags: string[];
  attachmentName: string;
  createdAt: string;
  likes: number;
  saves: number;
  meetings: number;
  views: number;
};

type DirectMessage = {
  id: string;
  partnerId: string;
  body: string;
  createdAt: string;
  mine: boolean;
};

type Notice = {
  id: string;
  body: string;
  createdAt: string;
  unread: boolean;
};

const industries = ['AI / SaaS', 'Fintech', 'HR', 'EdTech', 'ヘルスケア', '環境・脱炭素', '小売DX', '製造DX', 'その他'];
const locations = ['北海道', '東京都', '神奈川県', '愛知県', '大阪府', '福岡県', '沖縄県', '海外'];
const stages = ['アイデア', 'プレシード', 'シード', 'シリーズA', 'シリーズB以降'];
const employeeSizes = ['1人', '5人未満', '20人未満', '50人未満', '100人未満', '100-500人', '501-1000人', '1001-5000人', '5001人以上'];
const revenueScales = ['1,000万円未満', '1,000万円〜5,000万円', '5,000万円〜1億円', '1億円〜5億円', '5億円以上', '未回答'];

const emptyAccount: Account = {
  id: '',
  role: 'entrepreneur',
  accountName: '',
  name: '',
  company: '',
  title: '',
  industry: '',
  location: '',
  stage: '',
  foundedMonth: '',
  employeeSize: '',
  revenueScale: '',
  bio: '',
  avatarLabel: '',
  fundingGoal: '',
  monthlyRevenue: '',
  growthRate: '',
  customerCount: '',
  investmentRange: '',
  supportAreas: '',
  verified: false,
};

export default function LeapApp() {
  const [page, setPage] = useState<Page>('feed');
  const [feedTab, setFeedTab] = useState<FeedTab>('recommended');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [postDraft, setPostDraft] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postAttachment, setPostAttachment] = useState('');
  const [messageDraft, setMessageDraft] = useState('');

  const currentAccount = accounts.find((account) => account.id === currentAccountId) ?? null;
  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) ?? currentAccount;

  const feedPosts = useMemo(() => {
    if (feedTab === 'following') return posts.filter((post) => following.includes(post.authorId));
    if (feedTab === 'investors') return posts.filter((post) => accounts.find((account) => account.id === post.authorId)?.role === 'investor');
    if (feedTab === 'entrepreneurs') return posts.filter((post) => accounts.find((account) => account.id === post.authorId)?.role === 'entrepreneur');
    return posts;
  }, [accounts, feedTab, following, posts]);

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
    setPage(account.role === 'entrepreneur' ? 'profile' : 'profile');
  }

  function submitPost() {
    if (!currentAccount) {
      setPage('mypage');
      flash('先にプロフィールを作成してください');
      return;
    }
    if (!postDraft.trim()) return;
    setPosts((list) => [
      {
        id: crypto.randomUUID(),
        authorId: currentAccount.id,
        body: postDraft.trim(),
        tags: postTags.split(',').map((tag) => tag.trim()).filter(Boolean),
        attachmentName: postAttachment.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        saves: 0,
        meetings: 0,
        views: 0,
      },
      ...list,
    ]);
    setPostDraft('');
    setPostTags('');
    setPostAttachment('');
    setShowComposer(false);
    flash('投稿しました');
  }

  function reactToPost(postId: string, type: 'like' | 'save' | 'meeting') {
    setPosts((list) => list.map((post) => {
      if (post.id !== postId) return post;
      if (type === 'like') return { ...post, likes: post.likes + 1 };
      if (type === 'meeting') return { ...post, meetings: post.meetings + 1 };
      return { ...post, saves: post.saves + 1 };
    }));
    if (type === 'save') setSavedPosts((list) => list.includes(postId) ? list : [...list, postId]);
    flash(type === 'like' ? '応援しました' : type === 'save' ? '保存しました' : '面談申込をしました');
  }

  function requestMeeting(account: Account) {
    setNotices((list) => [{ id: crypto.randomUUID(), body: `${account.accountName || account.name}へ面談申込を送信しました`, createdAt: new Date().toISOString(), unread: true }, ...list]);
    flash('面談申込をしました');
  }

  function follow(account: Account) {
    if (!currentAccount) {
      setPage('mypage');
      flash('先にプロフィールを作成してください');
      return;
    }
    setFollowing((list) => list.includes(account.id) ? list.filter((id) => id !== account.id) : [...list, account.id]);
    flash(following.includes(account.id) ? 'フォロー解除しました' : 'フォローしました');
  }

  function sendMessage(partner: Account | null) {
    if (!partner || !messageDraft.trim()) return;
    setMessages((list) => [{ id: crypto.randomUUID(), partnerId: partner.id, body: messageDraft.trim(), createdAt: new Date().toISOString(), mine: true }, ...list]);
    setMessageDraft('');
    flash('メッセージを送信しました');
  }

  return (
    <main className="min-h-screen bg-[#eef5ff] text-[#101828]">
      <div className="mx-auto grid min-h-screen w-full max-w-[430px] bg-white shadow-2xl">
        <AppHeader page={page} goBack={() => setPage('feed')} />

        <section className="min-h-0 overflow-y-auto pb-24">
          {page === 'feed' && (
            <FeedPage
              posts={feedPosts}
              accounts={accounts}
              feedTab={feedTab}
              setFeedTab={setFeedTab}
              openComposer={() => setShowComposer(true)}
              openProfile={openProfile}
              reactToPost={reactToPost}
            />
          )}
          {page === 'search' && (
            <SearchPage
              query={query}
              setQuery={setQuery}
              results={searchResults}
              openProfile={openProfile}
            />
          )}
          {page === 'notifications' && <NotificationsPage notices={notices} setNotices={setNotices} />}
          {page === 'messages' && (
            <MessagesPage
              accounts={accounts}
              currentAccount={currentAccount}
              selectedAccount={selectedAccount}
              messages={messages}
              draft={messageDraft}
              setDraft={setMessageDraft}
              sendMessage={sendMessage}
              openProfile={openProfile}
              setSelectedAccountId={setSelectedAccountId}
            />
          )}
          {page === 'mypage' && (
            <MyPage
              accounts={accounts}
              currentAccount={currentAccount}
              setAccounts={setAccounts}
              setCurrentAccountId={setCurrentAccountId}
              posts={posts.filter((post) => post.authorId === currentAccount?.id)}
              openComposer={() => setShowComposer(true)}
            />
          )}
          {(page === 'profile' || page === 'deal') && selectedAccount && (
            <ProfilePage
              account={selectedAccount}
              posts={posts.filter((post) => post.authorId === selectedAccount.id)}
              isFollowing={following.includes(selectedAccount.id)}
              isMine={currentAccount?.id === selectedAccount.id}
              follow={() => follow(selectedAccount)}
              message={() => {
                setSelectedAccountId(selectedAccount.id);
                setPage('messages');
              }}
              requestMeeting={() => requestMeeting(selectedAccount)}
              openDeal={() => setPage('deal')}
              dealMode={page === 'deal'}
            />
          )}
          {page === 'matching' && <MatchingPage accounts={accounts.filter((account) => account.role === 'entrepreneur')} openProfile={openProfile} requestMeeting={requestMeeting} />}
        </section>

        <BottomTabs page={page} setPage={setPage} openComposer={() => setShowComposer(true)} />
      </div>

      {showComposer && (
        <Modal onClose={() => setShowComposer(false)} title="投稿する">
          <textarea className="field min-h-40 resize-none" placeholder="今の進捗、相談したいこと、投資家に知ってほしいことを書いてください" value={postDraft} onChange={(event) => setPostDraft(event.target.value)} />
          <input className="field mt-3" placeholder="タグ。例：SaaS, AI, 資金調達" value={postTags} onChange={(event) => setPostTags(event.target.value)} />
          <input className="field mt-3" placeholder="添付ファイル名または画像名" value={postAttachment} onChange={(event) => setPostAttachment(event.target.value)} />
          <button className="primary mt-4 w-full" onClick={submitPost}>投稿する</button>
        </Modal>
      )}

      {toast && <div className="fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-full bg-[#050816] px-5 py-3 text-xs font-black text-white shadow-xl">{toast}</div>}
    </main>
  );
}

function AppHeader({ page, goBack }: { page: Page; goBack: () => void }) {
  const title: Record<Page, string> = {
    feed: 'フィード',
    search: '検索',
    notifications: '通知',
    messages: 'メッセージ',
    mypage: 'マイページ',
    profile: 'プロフィール',
    deal: '案件詳細',
    matching: 'マッチング',
  };
  const canBack = page === 'profile' || page === 'deal' || page === 'matching';
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur">
      <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-50" onClick={canBack ? goBack : undefined} aria-label="戻る">
        {canBack ? <ChevronLeft size={20} /> : <BriefcaseBusiness size={20} />}
      </button>
      <h1 className="text-sm font-black">{title[page]}</h1>
      <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-50" aria-label="設定"><MoreHorizontal size={20} /></button>
    </header>
  );
}

function FeedPage({ posts, accounts, feedTab, setFeedTab, openComposer, openProfile, reactToPost }: { posts: Post[]; accounts: Account[]; feedTab: FeedTab; setFeedTab: (tab: FeedTab) => void; openComposer: () => void; openProfile: (account: Account) => void; reactToPost: (postId: string, type: 'like' | 'save' | 'meeting') => void }) {
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
        <EmptyState icon={<MessageCircle size={28} />} title="まだ投稿がありません" body="プロフィールを作成して、最初の投稿をしてみましょう。" action="投稿する" onAction={openComposer} />
      ) : (
        <div className="divide-y divide-slate-100">
          {posts.map((post) => {
            const author = accounts.find((account) => account.id === post.authorId);
            return <PostCard key={post.id} post={post} author={author} openProfile={openProfile} reactToPost={reactToPost} />;
          })}
        </div>
      )}
    </div>
  );
}

function SearchPage({ query, setQuery, results, openProfile }: { query: string; setQuery: (value: string) => void; results: Account[]; openProfile: (account: Account) => void }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3">
        <Search size={17} className="text-slate-400" />
        <input className="min-w-0 flex-1 text-sm outline-none" placeholder="アカウント名、会社名、業界で検索" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-[11px] font-bold">
        {['起業家', '投資家', '案件', '投稿'].map((item) => <button className="rounded-full bg-slate-50 px-2 py-2" key={item}>{item}</button>)}
      </div>
      <FilterBlock />
      <h2 className="mt-6 text-sm font-black">検索結果</h2>
      {results.length === 0 ? (
        <EmptyState icon={<Search size={28} />} title="表示できるアカウントがありません" body="登録されたアカウントだけがここに表示されます。" />
      ) : (
        <div className="mt-3 grid gap-3">
          {results.map((account) => <AccountRow key={account.id} account={account} onClick={() => openProfile(account)} />)}
        </div>
      )}
    </div>
  );
}

function NotificationsPage({ notices, setNotices }: { notices: Notice[]; setNotices: (notices: Notice[]) => void }) {
  return (
    <div>
      <div className="grid grid-cols-2 border-b border-slate-100 text-center text-[11px] font-bold">
        <button className="border-b-2 border-blue-600 py-3">すべて</button>
        <button className="py-3 text-slate-500">未読</button>
      </div>
      {notices.length === 0 ? (
        <EmptyState icon={<Bell size={28} />} title="通知はまだありません" body="フォロー、コメント、面談申込、メッセージが届くと表示されます。" />
      ) : (
        <div className="divide-y divide-slate-100">
          {notices.map((notice) => (
            <button key={notice.id} className="flex w-full gap-3 px-4 py-4 text-left" onClick={() => setNotices(notices.map((item) => item.id === notice.id ? { ...item, unread: false } : item))}>
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
    </div>
  );
}

function MessagesPage({ accounts, currentAccount, selectedAccount, messages, draft, setDraft, sendMessage, openProfile, setSelectedAccountId }: { accounts: Account[]; currentAccount: Account | null; selectedAccount: Account | null; messages: DirectMessage[]; draft: string; setDraft: (value: string) => void; sendMessage: (partner: Account | null) => void; openProfile: (account: Account) => void; setSelectedAccountId: (id: string) => void }) {
  const partners = accounts.filter((account) => account.id !== currentAccount?.id);
  const activePartner = selectedAccount && selectedAccount.id !== currentAccount?.id ? selectedAccount : partners[0] ?? null;
  const thread = activePartner ? messages.filter((message) => message.partnerId === activePartner.id) : [];
  return (
    <div className="grid min-h-[calc(100vh-7rem)] grid-rows-[auto_1fr_auto]">
      <div className="flex gap-3 overflow-x-auto border-b border-slate-100 px-4 py-3">
        {partners.length === 0 ? <span className="text-xs text-slate-500">メッセージ相手はまだいません。</span> : partners.map((partner) => <button key={partner.id} className="grid w-16 shrink-0 justify-items-center gap-1 text-[10px] font-bold" onClick={() => setSelectedAccountId(partner.id)}><Avatar account={partner} active={activePartner?.id === partner.id} /><span className="w-full truncate">{partner.accountName || partner.name}</span></button>)}
      </div>
      {!activePartner ? (
        <EmptyState icon={<Mail size={28} />} title="メッセージはまだありません" body="検索やプロフィールから相手にメッセージできます。" />
      ) : (
        <div className="overflow-y-auto px-4 py-4">
          <button className="mb-4 flex items-center gap-3" onClick={() => openProfile(activePartner)}><Avatar account={activePartner} /><span className="text-left"><b className="block text-sm">{activePartner.accountName || activePartner.name}</b><span className="text-[11px] text-slate-500">プロフィールを見る</span></span></button>
          {thread.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">まだやり取りはありません。</p> : thread.map((message) => <div key={message.id} className={`mb-3 flex ${message.mine ? 'justify-end' : 'justify-start'}`}><p className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${message.mine ? 'bg-[#050816] text-white' : 'bg-slate-100'}`}>{message.body}</p></div>)}
        </div>
      )}
      <div className="flex gap-2 border-t border-slate-100 bg-white p-3">
        <input className="field" placeholder="メッセージを書く" value={draft} onChange={(event) => setDraft(event.target.value)} disabled={!activePartner} />
        <button className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#050816] text-white disabled:opacity-30" disabled={!activePartner} onClick={() => sendMessage(activePartner)}><Send size={18} /></button>
      </div>
    </div>
  );
}

function MyPage({ accounts, currentAccount, setAccounts, setCurrentAccountId, posts, openComposer }: { accounts: Account[]; currentAccount: Account | null; setAccounts: (accounts: Account[]) => void; setCurrentAccountId: (id: string) => void; posts: Post[]; openComposer: () => void }) {
  const [form, setForm] = useState<Account>(currentAccount ?? emptyAccount);
  function update(key: keyof Account, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function save() {
    const next: Account = {
      ...form,
      id: form.id || crypto.randomUUID(),
      avatarLabel: form.avatarLabel || (form.accountName || form.name || 'L').slice(0, 1),
    };
    const exists = accounts.some((account) => account.id === next.id);
    setAccounts(exists ? accounts.map((account) => account.id === next.id ? next : account) : [...accounts, next]);
    setCurrentAccountId(next.id);
  }
  return (
    <div className="p-4">
      {currentAccount && (
        <ProfileHero account={currentAccount} isMine posts={posts} />
      )}
      <div className="mt-4 rounded-2xl border border-slate-100 p-4">
        <h2 className="text-sm font-black">{currentAccount ? 'プロフィールを編集' : 'プロフィールを作成'}</h2>
        <div className="mt-4 grid gap-3">
          <Segmented value={form.role} onChange={(role) => update('role', role)} />
          <Input label="アカウント名" value={form.accountName} onChange={(value) => update('accountName', value)} />
          <Input label="名前" value={form.name} onChange={(value) => update('name', value)} />
          <Input label="会社名" value={form.company} onChange={(value) => update('company', value)} />
          <Input label="肩書き" value={form.title} onChange={(value) => update('title', value)} />
          <Select label="業界" value={form.industry} options={industries} onChange={(value) => update('industry', value)} />
          <Select label="地域" value={form.location} options={locations} onChange={(value) => update('location', value)} />
          <Select label="フェーズ" value={form.stage} options={stages} onChange={(value) => update('stage', value)} />
          <Input label="設立年月" value={form.foundedMonth} onChange={(value) => update('foundedMonth', value)} placeholder="例：2026年5月" />
          <Select label="従業員数" value={form.employeeSize} options={employeeSizes} onChange={(value) => update('employeeSize', value)} />
          <Select label="年商規模" value={form.revenueScale} options={revenueScales} onChange={(value) => update('revenueScale', value)} />
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
      <button className="primary mt-4 w-full" onClick={openComposer}><Plus size={17} />投稿する</button>
    </div>
  );
}

function ProfilePage({ account, posts, isFollowing, isMine, follow, message, requestMeeting, openDeal, dealMode }: { account: Account; posts: Post[]; isFollowing: boolean; isMine: boolean; follow: () => void; message: () => void; requestMeeting: () => void; openDeal: () => void; dealMode: boolean }) {
  if (dealMode && account.role === 'entrepreneur') {
    return <DealPage account={account} requestMeeting={requestMeeting} />;
  }
  return (
    <div>
      <ProfileHero account={account} isMine={isMine} posts={posts} />
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
        {posts.length === 0 ? <EmptyState icon={<FileText size={28} />} title="投稿はまだありません" body="投稿されるとここに表示されます。" /> : posts.map((post) => <PostCard key={post.id} post={post} author={account} openProfile={() => undefined} reactToPost={() => undefined} />)}
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
      <InfoRows rows={[
        ['調達希望額', account.fundingGoal || '未入力'],
        ['月次売上', account.monthlyRevenue || '未入力'],
        ['成長率', account.growthRate || '未入力'],
        ['導入社数', account.customerCount || '未入力'],
        ['地域', account.location || '未入力'],
        ['フェーズ', account.stage || '未入力'],
      ]} />
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

function PostCard({ post, author, openProfile, reactToPost }: { post: Post; author?: Account; openProfile: (account: Account) => void; reactToPost: (postId: string, type: 'like' | 'save' | 'meeting') => void }) {
  return (
    <article className="px-4 py-4">
      <button className="flex w-full gap-3 text-left" onClick={() => author && openProfile(author)}>
        {author ? <Avatar account={author} /> : <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100"><UserRound size={18} /></span>}
        <span className="min-w-0 flex-1">
          <b className="block truncate text-sm">{author?.accountName || author?.name || 'アカウント未設定'}</b>
          <span className="text-[11px] text-slate-500">{author?.company || 'プロフィール未設定'}・{formatDate(post.createdAt)}</span>
        </span>
        <MoreHorizontal size={18} className="text-slate-400" />
      </button>
      <p className="mt-3 whitespace-pre-line text-sm leading-7">{post.body}</p>
      {post.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{post.tags.map((tag) => <span className="text-[11px] font-bold text-blue-600" key={tag}>#{tag}</span>)}</div>}
      {post.attachmentName && <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs"><Paperclip size={15} />{post.attachmentName}</div>}
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-black">
        <button className="rounded-xl border border-slate-100 py-2 text-rose-600" onClick={() => reactToPost(post.id, 'like')}><Heart className="mx-auto mb-1" size={16} />応援 {post.likes}</button>
        <button className="rounded-xl border border-slate-100 py-2 text-emerald-600" onClick={() => reactToPost(post.id, 'save')}><Bookmark className="mx-auto mb-1" size={16} />保存 {post.saves}</button>
        <button className="rounded-xl border border-slate-100 py-2 text-blue-600" onClick={() => reactToPost(post.id, 'meeting')}><UsersRound className="mx-auto mb-1" size={16} />面談 {post.meetings}</button>
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
      <button className="fixed bottom-20 left-1/2 z-40 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-2xl bg-[#050816] text-white shadow-xl" onClick={openComposer} aria-label="投稿する">
        <Plus size={24} />
      </button>
      <nav className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-5 border-t border-slate-100 bg-white px-2 py-2 shadow-[0_-10px_28px_rgba(15,23,42,0.08)]">
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

function ProfileHero({ account, isMine, posts }: { account: Account; isMine: boolean; posts: Post[] }) {
  return (
    <section className="p-4">
      <div className="flex items-start gap-4">
        <Avatar account={account} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-black">{account.name || account.accountName || '名前未設定'} {account.verified && <CheckCircle2 className="inline text-blue-600" size={16} />}</h2>
          <p className="mt-1 text-xs text-slate-500">@{account.accountName || 'account'} / {account.company || '会社名未設定'}</p>
          <p className="mt-2 text-xs text-slate-500">{account.location || '地域未設定'}　{account.foundedMonth || '設立年月未設定'}　{account.stage || 'フェーズ未設定'}</p>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-line text-sm leading-7">{account.bio || '自己紹介は未入力です。'}</p>
      <div className="mt-3 flex flex-wrap gap-2">{[account.industry, account.employeeSize, account.revenueScale].filter(Boolean).map((item) => <span className="pill" key={item}>{item}</span>)}</div>
      <div className="mt-4 flex gap-5 text-xs"><span><b>{posts.length}</b> 投稿</span><span><b>0</b> フォロー</span><span><b>0</b> フォロワー</span></div>
      {isMine && <button className="secondary mt-4 w-full"><Settings size={16} />プロフィールを編集</button>}
    </section>
  );
}

function KpiGrid({ account }: { account: Account }) {
  const items = account.role === 'entrepreneur'
    ? [['調達希望額', account.fundingGoal], ['月次売上', account.monthlyRevenue], ['成長率', account.growthRate], ['導入社数', account.customerCount], ['フェーズ', account.stage], ['累計投資金額', '未入力']]
    : [['投資可能額', account.investmentRange], ['投資領域', account.industry], ['投資ステージ', account.stage], ['支援内容', account.supportAreas], ['地域', account.location], ['累計投資金額', '未入力']];
  return <div className="mt-3 grid grid-cols-3 gap-2">{items.map(([label, value]) => <div className="rounded-2xl border border-slate-100 p-3" key={label}><span className="text-[10px] font-bold text-slate-500">{label}</span><b className="mt-2 block break-words text-xs">{value || '未入力'}</b></div>)}</div>;
}

function FilterBlock() {
  return (
    <div className="mt-5 rounded-2xl border border-slate-100 p-4">
      <h2 className="text-sm font-black">高度な検索</h2>
      {['カテゴリー', '事業ステージ', '調達希望額', '地域'].map((label) => <button key={label} className="mt-3 flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-xs text-slate-500">{label}<ChevronDown size={15} /></button>)}
      <button className="primary mt-4 w-full">この条件で検索する</button>
    </div>
  );
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
      <span className="min-w-0 flex-1"><b className="block truncate text-sm">{account.company || account.name || account.accountName}</b><span className="text-xs text-slate-500">{account.role === 'entrepreneur' ? '起業家' : '投資家'} / {account.industry || '業界未入力'}</span></span>
      <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">{account.location || '地域未入力'}</span>
    </button>
  );
}

function Avatar({ account, size = 'md', active }: { account: Account; size?: 'md' | 'lg'; active?: boolean }) {
  const dimension = size === 'lg' ? 'h-20 w-20 text-xl' : 'h-11 w-11 text-sm';
  const label = account.avatarLabel || account.accountName?.slice(0, 1) || account.name?.slice(0, 1) || 'L';
  return <span className={`relative grid ${dimension} shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-100 via-white to-emerald-100 font-black ring-1 ring-slate-200`}>{label}{active && <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />}</span>;
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-3">
      <div className="w-full max-w-[430px] rounded-[26px] bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-black">{title}</h2>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-slate-100" onClick={onClose}><MoreHorizontal size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Segmented({ value, onChange }: { value: Role; onChange: (value: Role) => void }) {
  return <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-xs font-black"><button className={`rounded-lg py-3 ${value === 'entrepreneur' ? 'bg-white shadow-sm' : ''}`} onClick={() => onChange('entrepreneur')}>起業家</button><button className={`rounded-lg py-3 ${value === 'investor' ? 'bg-white shadow-sm' : ''}`} onClick={() => onChange('investor')}>投資家</button></div>;
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="grid gap-1 text-[11px] font-bold text-slate-600">{label}<input className="field" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="grid gap-1 text-[11px] font-bold text-slate-600">{label}<select className="field" value={value} onChange={(event) => onChange(event.target.value)}><option value="">選択してください</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
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

function formatDate(value: string) {
  return new Date(value).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
