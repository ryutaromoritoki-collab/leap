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
  Download,
  FileText,
  Heart,
  Home,
  Mail,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Star,
  UserRound,
  UsersRound,
} from 'lucide-react';

type Screen = 'feed' | 'search' | 'matching' | 'messages' | 'notifications' | 'my';
type FeedTab = 'following' | 'recommended' | 'investors' | 'entrepreneurs';

type Entrepreneur = {
  id: string;
  name: string;
  account: string;
  company: string;
  title: string;
  avatar: string;
  status: string;
  location: string;
  founded: string;
  round: string;
  category: string;
  tags: string[];
  description: string;
  project: string;
  fundingGoal: string;
  fundingNow: string;
  ownership: string;
  monthlyRevenue: string;
  growth: string;
  team: string;
  match: number;
  followers: string;
};

type Investor = {
  id: string;
  name: string;
  account: string;
  company: string;
  avatar: string;
  verified: boolean;
  range: string;
  domains: string;
  stage: string;
  bio: string;
};

type Post = {
  id: string;
  authorId: string;
  authorType: 'entrepreneur' | 'investor';
  body: string;
  tags: string[];
  minutesAgo: string;
  image?: boolean;
  cheers: number;
  invests: number;
  meetings: number;
};

const entrepreneurs: Entrepreneur[] = [
  {
    id: 'next-create',
    name: '山田 太郎',
    account: 'next_create',
    company: '株式会社Next Create',
    title: 'CEO',
    avatar: '山',
    status: '資金調達中',
    location: '東京都',
    founded: '創業2年',
    round: 'シード',
    category: 'AI業務自動化SaaS',
    tags: ['SaaS', 'AI', 'BtoB'],
    description: 'テクノロジーの力で、働く人々の生産性を最大化するSaaSプロダクトを開発しています。',
    project: 'AIを活用した業務自動化SaaSを開発・提供しています。ノーコードで業務フローを自動化し、企業の生産性向上に貢献します。',
    fundingGoal: '3,000万円',
    fundingNow: '1,200万円（40%）',
    ownership: '10%以下',
    monthlyRevenue: '320万円',
    growth: '+25%',
    team: '4人',
    match: 92,
    followers: '1,250社',
  },
  {
    id: 'greentech',
    name: '鈴木 健一',
    account: 'green_tech',
    company: '株式会社GreenTech',
    title: 'CEO',
    avatar: '鈴',
    status: '資金調達中',
    location: '福岡県',
    founded: '創業1年',
    round: 'プレシード',
    category: '環境テックSaaS',
    tags: ['Climate', 'AI', 'SaaS'],
    description: '環境データの可視化で、中小企業の脱炭素経営を支援しています。',
    project: 'CO2排出量の自動計測と削減施策のレコメンドを提供するクラウドサービスを開発しています。',
    fundingGoal: '2,000万円',
    fundingNow: '800万円（40%）',
    ownership: '12%以下',
    monthlyRevenue: '180万円',
    growth: '+18%',
    team: '3人',
    match: 89,
    followers: '820社',
  },
  {
    id: 'ed-connect',
    name: '伊藤 明',
    account: 'ed_connect',
    company: '株式会社EdConnect',
    title: 'CEO',
    avatar: '伊',
    status: '資金調達中',
    location: '大阪府',
    founded: '創業3年',
    round: 'シリーズA',
    category: '教育プラットフォーム',
    tags: ['EdTech', 'DX', 'HR'],
    description: '学習データと企業研修をつなぎ、リスキリングを加速させるサービスを提供しています。',
    project: '企業向け研修管理、学習履歴分析、人材配置支援を一体化した教育プラットフォームです。',
    fundingGoal: '1,500万円',
    fundingNow: '900万円（60%）',
    ownership: '8%以下',
    monthlyRevenue: '120万円',
    growth: '+14%',
    team: '7人',
    match: 85,
    followers: '610社',
  },
];

const investors: Investor[] = [
  {
    id: 'hana',
    name: '佐藤 花子',
    account: 'Future Ventures',
    company: 'Future Ventures',
    avatar: '佐',
    verified: true,
    range: '1〜3億円',
    domains: 'AI / SaaS / DX / Fintech',
    stage: 'シード〜シリーズA',
    bio: 'シード・アーリーステージのスタートアップに投資を行っています。特にAI・SaaS領域を中心に、事業成長をハンズオンで支援します。',
  },
  {
    id: 'tanaka',
    name: '田中 剛',
    account: 'Growth Capital',
    company: 'Growth Capital',
    avatar: '田',
    verified: false,
    range: '3,000万〜1億円',
    domains: 'BtoB SaaS / HR / EC',
    stage: 'プレシード〜シード',
    bio: '事業提携や営業戦略づくりを得意とし、初期の仮説検証から支援します。',
  },
];

const initialPosts: Post[] = [
  {
    id: 'p1',
    authorId: 'next-create',
    authorType: 'entrepreneur',
    body: '新しいSaaSプロダクトのβ版をリリースしました！初日で100社以上にご登録いただき、手応えを感じています。引き続き、プロダクトの改善とグロースに集中していきます！',
    tags: ['SaaS', 'BtoB', 'AI'],
    minutesAgo: '23時間前',
    image: true,
    cheers: 128,
    invests: 32,
    meetings: 15,
  },
  {
    id: 'p2',
    authorId: 'hana',
    authorType: 'investor',
    body: 'AI×SaaS領域で面白いスタートアップを探しています！特に、業務効率化やデータ活用系のプロダクトに興味があります。',
    tags: ['投資家募集', 'AI', 'SaaS'],
    minutesAgo: '3時間前',
    cheers: 42,
    invests: 9,
    meetings: 5,
  },
];

export default function LeapApp() {
  const [screen, setScreen] = useState<Screen>('feed');
  const [feedTab, setFeedTab] = useState<FeedTab>('recommended');
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState(entrepreneurs[0]);
  const [selectedInvestor, setSelectedInvestor] = useState(investors[0]);
  const [showComposer, setShowComposer] = useState(false);
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [messages, setMessages] = useState([
    { id: 'm1', name: '山田 太郎', body: '画面の件について、ご確認させてください。', time: '10:30' },
    { id: 'm2', name: '鈴木 健一', body: 'ピッチ資料をお送りしました。ご確認お願いします。', time: '昨日' },
    { id: 'm3', name: '佐藤 花子', body: '来週の火曜日はいかがでしょうか？', time: '2日前' },
  ]);

  const filteredEntrepreneurs = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return entrepreneurs;
    return entrepreneurs.filter((item) => `${item.name} ${item.account} ${item.company} ${item.category} ${item.tags.join(' ')}`.toLowerCase().includes(text));
  }, [query]);

  function submitPost() {
    if (!draft.trim()) return;
    setPosts((current) => [
      {
        id: `post-${Date.now()}`,
        authorId: 'next-create',
        authorType: 'entrepreneur',
        body: draft.trim(),
        tags: ['最新情報'],
        minutesAgo: 'たった今',
        cheers: 0,
        invests: 0,
        meetings: 0,
      },
      ...current,
    ]);
    setDraft('');
    setShowComposer(false);
    showToast('投稿しました');
  }

  function sendMessage() {
    if (!messageDraft.trim()) return;
    setMessages((current) => [{ id: `m-${Date.now()}`, name: 'あなた', body: messageDraft.trim(), time: '今' }, ...current]);
    setMessageDraft('');
    showToast('メッセージを送信しました');
  }

  function showToast(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(''), 1800);
  }

  return (
    <main className="min-h-screen bg-[#eef5ff] text-[#101828]">
      <div className="mx-auto max-w-[1180px] px-3 py-4 sm:px-5">
        <HeroBoard
          posts={posts}
          feedTab={feedTab}
          setFeedTab={setFeedTab}
          openComposer={() => setShowComposer(true)}
          openEntrepreneur={(item) => {
            setSelectedEntrepreneur(item);
            setScreen('my');
          }}
          openInvestor={(item) => {
            setSelectedInvestor(item);
            setScreen('my');
          }}
          selectedEntrepreneur={selectedEntrepreneur}
          selectedInvestor={selectedInvestor}
          requestMeeting={() => showToast('面談申込をしました')}
        />

        <FeatureAndPlan />

        <section className="mt-5 grid gap-4 lg:grid-cols-5">
          <DiscoveryPanel query={query} setQuery={setQuery} results={filteredEntrepreneurs} open={(item) => setSelectedEntrepreneur(item)} />
          <AdvancedSearchPanel />
          <MatchingPanel results={filteredEntrepreneurs} open={(item) => setSelectedEntrepreneur(item)} requestMeeting={() => showToast('面談申込をしました')} />
          <MessagesPanel messages={messages} draft={messageDraft} setDraft={setMessageDraft} send={sendMessage} />
          <NotificationsPanel />
        </section>

        <section className="mx-auto mt-6 max-w-[430px] rounded-[34px] border border-blue-100 bg-white shadow-xl lg:hidden">
          {screen === 'feed' && <FeedScreen posts={posts} feedTab={feedTab} setFeedTab={setFeedTab} openComposer={() => setShowComposer(true)} />}
          {screen === 'search' && <DiscoveryPanel query={query} setQuery={setQuery} results={filteredEntrepreneurs} open={(item) => setSelectedEntrepreneur(item)} compact />}
          {screen === 'matching' && <MatchingPanel results={filteredEntrepreneurs} open={(item) => setSelectedEntrepreneur(item)} requestMeeting={() => showToast('面談申込をしました')} compact />}
          {screen === 'messages' && <MessagesPanel messages={messages} draft={messageDraft} setDraft={setMessageDraft} send={sendMessage} compact />}
          {screen === 'notifications' && <NotificationsPanel compact />}
          {screen === 'my' && <EntrepreneurProfile profile={selectedEntrepreneur} requestMeeting={() => showToast('面談申込をしました')} />}
          <BottomNav screen={screen} setScreen={setScreen} openComposer={() => setShowComposer(true)} />
        </section>
      </div>

      {showComposer && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-3 sm:place-items-center">
          <div className="w-full max-w-[430px] rounded-[26px] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black">投稿する</h2>
              <button className="grid h-9 w-9 place-items-center rounded-full bg-slate-100" onClick={() => setShowComposer(false)}><MoreHorizontal size={18} /></button>
            </div>
            <textarea
              className="mt-4 min-h-36 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-400"
              placeholder="今日の進捗、資金調達の状況、相談したいことを書いてください"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <div className="mt-3 flex items-center justify-between">
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold"><FileText size={16} /> 画像・資料</button>
              <button className="rounded-xl bg-[#050816] px-5 py-3 text-sm font-black text-white" onClick={submitPost}>投稿する</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed left-1/2 top-5 z-[60] -translate-x-1/2 rounded-full bg-[#050816] px-5 py-3 text-sm font-black text-white shadow-2xl">{toast}</div>}
    </main>
  );
}

function HeroBoard({
  posts,
  feedTab,
  setFeedTab,
  openComposer,
  openEntrepreneur,
  openInvestor,
  selectedEntrepreneur,
  selectedInvestor,
  requestMeeting,
}: {
  posts: Post[];
  feedTab: FeedTab;
  setFeedTab: (tab: FeedTab) => void;
  openComposer: () => void;
  openEntrepreneur: (item: Entrepreneur) => void;
  openInvestor: (item: Investor) => void;
  selectedEntrepreneur: Entrepreneur;
  selectedInvestor: Investor;
  requestMeeting: () => void;
}) {
  return (
    <section className="grid gap-3 lg:grid-cols-4">
      <PhoneFrame title="SNSフィード（Threads型）">
        <FeedScreen posts={posts} feedTab={feedTab} setFeedTab={setFeedTab} openComposer={openComposer} openEntrepreneur={openEntrepreneur} openInvestor={openInvestor} />
      </PhoneFrame>
      <PhoneFrame title="起業家プロフィール（Wantedly型）">
        <EntrepreneurProfile profile={selectedEntrepreneur} requestMeeting={requestMeeting} />
      </PhoneFrame>
      <PhoneFrame title="案件詳細ページ（ダッシュボード型）">
        <DealDetail profile={selectedEntrepreneur} requestMeeting={requestMeeting} />
      </PhoneFrame>
      <PhoneFrame title="投資家プロフィール">
        <InvestorProfile investor={selectedInvestor} requestMeeting={requestMeeting} />
      </PhoneFrame>
    </section>
  );
}

function FeedScreen({
  posts,
  feedTab,
  setFeedTab,
  openComposer,
  openEntrepreneur,
  openInvestor,
}: {
  posts: Post[];
  feedTab: FeedTab;
  setFeedTab: (tab: FeedTab) => void;
  openComposer: () => void;
  openEntrepreneur?: (item: Entrepreneur) => void;
  openInvestor?: (item: Investor) => void;
}) {
  return (
    <div>
      <TopBar />
      <div className="grid grid-cols-4 border-b border-slate-100 text-center text-[11px] font-bold text-slate-500">
        {[
          ['following', 'フォロー中'],
          ['recommended', 'おすすめ'],
          ['investors', '投資家'],
          ['entrepreneurs', '起業家'],
        ].map(([key, label]) => (
          <button key={key} className={`py-3 ${feedTab === key ? 'border-b-2 border-blue-600 text-slate-950' : ''}`} onClick={() => setFeedTab(key as FeedTab)}>{label}</button>
        ))}
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 py-3">
        <button className="grid w-14 shrink-0 justify-items-center gap-1 text-[10px] font-bold" onClick={openComposer}>
          <span className="grid h-12 w-12 place-items-center rounded-full border border-blue-500 text-blue-600"><Plus size={22} /></span>
          投稿する
        </button>
        {entrepreneurs.concat(entrepreneurs.slice(0, 1)).map((item, index) => (
          <button key={`${item.id}-${index}`} className="grid w-14 shrink-0 justify-items-center gap-1 text-[10px] font-bold" onClick={() => openEntrepreneur?.(item)}>
            <Avatar label={item.avatar} active={index % 2 === 0} />
            <span className="w-full truncate">{item.name.replace(' ', '')}</span>
          </button>
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {posts.map((post) => (
          <FeedPost key={post.id} post={post} openEntrepreneur={openEntrepreneur} openInvestor={openInvestor} />
        ))}
      </div>
    </div>
  );
}

function FeedPost({ post, openEntrepreneur, openInvestor }: { post: Post; openEntrepreneur?: (item: Entrepreneur) => void; openInvestor?: (item: Investor) => void }) {
  const entrepreneur = entrepreneurs.find((item) => item.id === post.authorId);
  const investor = investors.find((item) => item.id === post.authorId);
  const name = entrepreneur?.name || investor?.name || 'Leapユーザー';
  const company = entrepreneur ? `${entrepreneur.company} ${entrepreneur.title}` : investor?.company || '';
  return (
    <article className="px-4 py-4">
      <button className="flex w-full items-start gap-3 text-left" onClick={() => entrepreneur ? openEntrepreneur?.(entrepreneur) : investor && openInvestor?.(investor)}>
        <Avatar label={entrepreneur?.avatar || investor?.avatar || 'L'} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[13px] font-black">{name} <span className="font-medium text-slate-500">{company}</span></p>
            {entrepreneur && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700">{entrepreneur.status}</span>}
          </div>
          <p className="mt-1 text-[10px] text-slate-500">{post.minutesAgo}</p>
        </div>
      </button>
      <p className="mt-3 whitespace-pre-line text-[12px] leading-6 text-slate-900">{post.body}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {post.tags.map((tag) => <span key={tag} className="text-[10px] font-bold text-blue-600">#{tag}</span>)}
      </div>
      {post.image && <DashboardImage />}
      <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-black">
        <button className="rounded-xl border border-slate-100 px-2 py-2 text-rose-600"><Heart className="mx-auto mb-1" size={15} />応援する<br />{post.cheers}</button>
        <button className="rounded-xl border border-slate-100 px-2 py-2 text-emerald-600"><Bookmark className="mx-auto mb-1" size={15} />投資したい<br />{post.invests}</button>
        <button className="rounded-xl border border-slate-100 px-2 py-2 text-blue-600"><UsersRound className="mx-auto mb-1" size={15} />面談したい<br />{post.meetings}</button>
      </div>
    </article>
  );
}

function EntrepreneurProfile({ profile, requestMeeting }: { profile: Entrepreneur; requestMeeting: () => void }) {
  return (
    <div>
      <TopBar back />
      <div className="px-4 pb-4">
        <div className="flex items-start gap-4">
          <Avatar label={profile.avatar} size="lg" />
          <div className="min-w-0 flex-1">
            <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white">{profile.status}</span>
            <h2 className="mt-2 text-lg font-black">{profile.name} <CheckCircle2 className="inline text-blue-600" size={14} /></h2>
            <p className="text-[11px] text-slate-600">{profile.company} {profile.title}</p>
            <p className="mt-2 text-[10px] text-slate-500">{profile.location}　{profile.founded}　{profile.round}</p>
          </div>
        </div>
        <ProfileTabs tabs={['概要', '事業', '実績', 'チーム', '投稿']} />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniStat label="調達希望額" value={profile.fundingGoal} />
          <MiniStat label="現在の調達状況" value={profile.fundingNow} />
          <MiniStat label="株式放出割合" value={profile.ownership} />
          <MiniStat label="月次売上" value={profile.monthlyRevenue} />
          <MiniStat label="成長率（MoM）" value={profile.growth} green />
          <MiniStat label="チーム人数" value={profile.team} />
        </div>
        <TextBlock title="自己紹介" body={profile.description} />
        <TextBlock title="事業概要" body={profile.project} more />
        <div className="sticky bottom-0 mt-4 grid grid-cols-2 gap-2 bg-white py-2">
          <button className="rounded-xl border border-slate-200 py-3 text-[12px] font-black" onClick={requestMeeting}>面談を申し込む</button>
          <button className="rounded-xl bg-[#050816] py-3 text-[12px] font-black text-white">投資に関心がある</button>
        </div>
      </div>
    </div>
  );
}

function DealDetail({ profile, requestMeeting }: { profile: Entrepreneur; requestMeeting: () => void }) {
  return (
    <div>
      <TopBar back />
      <div className="px-4 pb-4">
        <h2 className="text-base font-black">AI業務自動化SaaS「NextFlow」</h2>
        <div className="mt-2 flex flex-wrap gap-1">{profile.tags.concat(['資金調達中']).map((tag) => <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600" key={tag}>{tag}</span>)}</div>
        <DashboardImage large />
        <h3 className="mt-4 text-sm font-black">ハイライト</h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <MiniStat label="月次売上" value={profile.monthlyRevenue} />
          <MiniStat label="成長率（MoM）" value={profile.growth} green />
          <MiniStat label="累計ユーザー数" value={profile.followers} />
          <MiniStat label="解約率" value="2.1%" />
          <MiniStat label="MRR" value="350万円" />
          <MiniStat label="SNSフォロワー" value="3.2倍" />
        </div>
        <h3 className="mt-4 text-sm font-black">関連情報</h3>
        <InfoRows rows={[
          ['調達希望額', profile.fundingGoal],
          ['現在の調達状況', profile.fundingNow],
          ['株式放出割合', profile.ownership],
          ['資金使途', 'プロダクト開発 / マーケティング / 人材採用'],
          ['ラウンド', profile.round],
          ['調達完了予定', '2024年8月'],
        ]} />
        <div className="mt-4 rounded-2xl border border-slate-100 p-3">
          <p className="text-[12px] font-black">ピッチ資料</p>
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-[11px]">
            <FileText className="text-red-500" size={18} />
            <span className="flex-1">NextFlow_PitchDeck.pdf<br /><span className="text-slate-500">PDF・3.2MB</span></span>
            <Download size={16} />
          </div>
        </div>
        <div className="sticky bottom-0 mt-4 grid grid-cols-2 gap-2 bg-white py-2">
          <button className="rounded-xl border border-slate-200 py-3 text-[12px] font-black" onClick={requestMeeting}>面談を申し込む</button>
          <button className="rounded-xl bg-[#050816] py-3 text-[12px] font-black text-white">投資に関心がある</button>
        </div>
      </div>
    </div>
  );
}

function InvestorProfile({ investor, requestMeeting }: { investor: Investor; requestMeeting: () => void }) {
  return (
    <div>
      <TopBar back />
      <div className="px-4 pb-4">
        <div className="flex items-start gap-4">
          <Avatar label={investor.avatar} size="lg" />
          <div>
            <h2 className="text-lg font-black">{investor.name} {investor.verified && <CheckCircle2 className="inline text-blue-600" size={14} />}</h2>
            <p className="text-[11px] text-slate-600">Investment Partner<br />@{investor.account}</p>
            <span className="mt-2 inline-flex rounded-full bg-violet-50 px-3 py-1 text-[10px] font-black text-violet-700">投資家認証済み</span>
          </div>
        </div>
        <ProfileTabs tabs={['概要', '投資方針', '投資実績', '投稿']} />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniStat label="投資可能額" value={investor.range} />
          <MiniStat label="主な投資領域" value={investor.domains} />
          <MiniStat label="投資ステージ" value={investor.stage} />
        </div>
        <TextBlock title="自己紹介" body={investor.bio} />
        <h3 className="mt-4 text-sm font-black">支援できること</h3>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-bold">
          {['資金調達', '事業戦略', '営業支援', '組織構築', 'ネットワーク提供', 'プロダクト改善'].map((item) => <span className="rounded-xl bg-slate-50 p-3" key={item}><ShieldCheck className="mr-1 inline text-blue-500" size={13} />{item}</span>)}
        </div>
        <h3 className="mt-4 text-sm font-black">投資実績（一部）</h3>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] font-bold">
          {['TechNova', 'Cloudship', 'Paylight'].map((item) => <span className="rounded-xl bg-slate-50 p-3 text-center" key={item}><Star className="mx-auto mb-1 text-blue-500" size={15} />{item}</span>)}
        </div>
        <button className="mx-auto mt-3 block text-[11px] font-black text-blue-600">もっと見る ＞</button>
        <div className="sticky bottom-0 mt-4 grid grid-cols-2 gap-2 bg-white py-2">
          <button className="rounded-xl border border-slate-200 py-3 text-[12px] font-black">メッセージ</button>
          <button className="rounded-xl bg-[#050816] py-3 text-[12px] font-black text-white" onClick={requestMeeting}>面談を申し込む</button>
        </div>
      </div>
    </div>
  );
}

function FeatureAndPlan() {
  const features = [
    ['SNSフィード', '日々の活動や成果をリアルタイムで発信', MessageCircle],
    ['マッチング', '投資家と起業家を最適にマッチング', UsersRound],
    ['面談設定', 'カレンダーから簡単に日程調整', CalendarCheck],
    ['ピッチ資料共有', '安全に資料を共有してフィードバック', FileText],
    ['実績バッジ', '信頼性を可視化する各種認証・バッジ', ShieldCheck],
  ] as const;
  const plans = [
    ['起業家Pro', '¥9,800/月', '調達案件の掲載、ピッチ資料掲載、AI案件診断、優先表示など'],
    ['投資家Pro', '¥29,800/月', '詳細検索・DM制限、案件アラート通知、面談設定など'],
    ['スポンサープラン', '¥50,000〜/月', 'トップページ掲載、おすすめ表示、イベント告知など'],
    ['その他の収益', '個別見積', '面談オプション課金、レポート提供、ファンド運用など'],
  ];
  return (
    <section className="mt-5 grid gap-4 rounded-[28px] bg-white p-5 shadow-sm lg:grid-cols-2">
      <div>
        <h2 className="text-sm font-black">主な機能</h2>
        <div className="mt-4 grid grid-cols-5 gap-3">
          {features.map(([title, body, Icon]) => <div className="text-center" key={title}><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Icon size={24} /></span><b className="mt-3 block text-[12px]">{title}</b><p className="mt-1 text-[10px] leading-4 text-slate-500">{body}</p></div>)}
        </div>
      </div>
      <div>
        <h2 className="text-sm font-black">マネタイズモデル</h2>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {plans.map(([name, price, body], index) => <div className="rounded-2xl border border-slate-100 p-3" key={name}><b className={`text-[12px] ${index === 0 ? 'text-emerald-600' : index === 1 ? 'text-violet-600' : index === 2 ? 'text-amber-600' : 'text-slate-700'}`}>{name}</b><p className="mt-1 text-[13px] font-black">{price}</p><p className="mt-2 text-[10px] leading-4 text-slate-500">{body}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function DiscoveryPanel({ query, setQuery, results, open, compact }: { query: string; setQuery: (value: string) => void; results: Entrepreneur[]; open: (item: Entrepreneur) => void; compact?: boolean }) {
  return (
    <Panel title="検索・発見" compact={compact}>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
        <Search size={15} className="text-slate-400" />
        <input className="min-w-0 flex-1 text-[11px] outline-none" placeholder="キーワードで検索" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {['起業家', '投資家', '案件', '投稿'].map((item) => <button className="rounded-full bg-slate-50 px-3 py-2 text-[10px] font-bold" key={item}>{item}</button>)}
      </div>
      <h3 className="mt-4 text-[12px] font-black">人気のタグ</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {['SaaS', 'AI', 'BtoB', 'FinTech', 'D2C', 'HR', 'EdTech', '医療'].map((tag) => <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] text-slate-500" key={tag}>#{tag}</span>)}
      </div>
      <h3 className="mt-4 text-[12px] font-black">注目の起業家</h3>
      <div className="mt-2 grid gap-3">
        {results.map((item) => <PersonRow key={item.id} name={item.name} sub={`${item.company} CEO`} meta={`月額：${item.monthlyRevenue}`} badge={item.status} avatar={item.avatar} onClick={() => open(item)} />)}
      </div>
      <button className="mx-auto mt-3 block text-[11px] font-black text-blue-600">もっと見る ＞</button>
    </Panel>
  );
}

function AdvancedSearchPanel() {
  return (
    <Panel title="高度な検索（起業家）">
      {['カテゴリー', '事業ステージ', '調達希望額', '月次売上', '地域'].map((label) => (
        <label className="mt-3 block text-[11px] font-bold text-slate-600" key={label}>
          {label}
          <button className="mt-1 flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-left text-[11px] text-slate-500">
            すべての{label}<ChevronDown size={14} />
          </button>
        </label>
      ))}
      <Switch label="資金調達中の案件のみ" active />
      <Switch label="認証済みユーザーのみ" />
      <button className="mt-4 w-full rounded-xl bg-[#050816] py-3 text-[12px] font-black text-white">この条件で検索する</button>
      <p className="mt-3 text-center text-[10px] text-slate-500">検索結果：128件</p>
    </Panel>
  );
}

function MatchingPanel({ results, open, requestMeeting, compact }: { results: Entrepreneur[]; open: (item: Entrepreneur) => void; requestMeeting: () => void; compact?: boolean }) {
  return (
    <Panel title="マッチング候補" compact={compact}>
      <div className="grid grid-cols-2 border-b border-slate-100 text-center text-[11px] font-bold">
        <button className="border-b-2 border-blue-600 py-3">あなたへのおすすめ</button>
        <button className="py-3 text-slate-500">面談リクエスト</button>
      </div>
      <div className="mt-3 grid gap-3">
        {results.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3">
            <Avatar label={item.avatar} />
            <button className="min-w-0 flex-1 text-left" onClick={() => open(item)}>
              <p className="truncate text-[12px] font-black">{item.company}</p>
              <p className="truncate text-[10px] text-slate-500">{item.name} CEO</p>
              <p className="mt-1 text-[10px] text-slate-500">月額：{item.monthlyRevenue}</p>
            </button>
            <div className="grid justify-items-end gap-2">
              <span className="text-[10px] font-black text-emerald-600">マッチ度 {item.match}%</span>
              <button className="rounded-lg bg-[#050816] px-3 py-2 text-[10px] font-black text-white" onClick={requestMeeting}>面談する</button>
            </div>
          </div>
        ))}
      </div>
      <button className="mx-auto mt-3 block text-[11px] font-black text-blue-600">もっと見る ＞</button>
    </Panel>
  );
}

function MessagesPanel({ messages, draft, setDraft, send, compact }: { messages: { id: string; name: string; body: string; time: string }[]; draft: string; setDraft: (value: string) => void; send: () => void; compact?: boolean }) {
  return (
    <Panel title="メッセージ" compact={compact}>
      <div className="grid grid-cols-4 border-b border-slate-100 text-center text-[11px] font-bold">
        {['すべて', '未読', '起業家', '投資家'].map((tab, index) => <button className={`py-3 ${index === 0 ? 'border-b-2 border-blue-600' : 'text-slate-500'}`} key={tab}>{tab}</button>)}
      </div>
      <div className="mt-3 grid gap-3">
        {messages.map((message, index) => <PersonRow key={message.id} name={message.name} sub={message.body} meta={message.time} avatar={message.name.slice(0, 1)} unread={index === 0} />)}
      </div>
      <div className="mt-4 flex gap-2 rounded-2xl border border-slate-200 p-2">
        <input className="min-w-0 flex-1 px-2 text-[11px] outline-none" placeholder="メッセージを書く" value={draft} onChange={(event) => setDraft(event.target.value)} />
        <button className="grid h-9 w-9 place-items-center rounded-xl bg-[#050816] text-white" onClick={send}><Send size={15} /></button>
      </div>
    </Panel>
  );
}

function NotificationsPanel({ compact }: { compact?: boolean }) {
  const notifications = [
    ['佐藤 花子さんがあなたの投稿に「投資したい」を送りました', '55分前'],
    ['株式会社Next Createの面談が確定しました', '15分前'],
    ['新しい投資家があなたに興味を持っています', '1時間前'],
    ['あなたのプロフィールが閲覧されました（23回）', '29分前'],
    ['ピッチ資料へのフィードバックが届いています', '33時間前'],
  ];
  return (
    <Panel title="通知" compact={compact}>
      <div className="grid grid-cols-2 border-b border-slate-100 text-center text-[11px] font-bold">
        <button className="border-b-2 border-blue-600 py-3">すべて</button>
        <button className="py-3 text-slate-500">未読</button>
      </div>
      <div className="mt-3 grid gap-3">
        {notifications.map(([body, time], index) => <PersonRow key={body} name={body} sub="" meta={time} avatar={index === 0 ? '佐' : index === 1 ? 'N' : 'L'} />)}
      </div>
    </Panel>
  );
}

function PhoneFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="overflow-hidden rounded-[30px] border-[3px] border-[#050816] bg-white shadow-xl">
      <div className="grid place-items-center bg-[#245cf4] py-1 text-[12px] font-black text-white">{title}</div>
      {children}
    </article>
  );
}

function Panel({ title, children, compact }: { title: string; children: ReactNode; compact?: boolean }) {
  return (
    <article className={`${compact ? 'rounded-none shadow-none' : 'rounded-[22px] shadow-sm'} bg-white p-4`}>
      <h2 className="text-center text-sm font-black">{title}</h2>
      <div className="mt-3">{children}</div>
      {!compact && <MiniBottomNav />}
    </article>
  );
}

function TopBar({ back }: { back?: boolean }) {
  return (
    <>
      <div className="flex items-center justify-between px-4 pt-3 text-[11px] font-black">
        <span>9:41</span>
        <span>••• ▰</span>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <button className="grid h-8 w-8 place-items-center rounded-full">{back ? <ChevronLeft size={18} /> : <BriefcaseBusiness size={18} />}</button>
        <button className="grid h-8 w-8 place-items-center rounded-full"><MoreHorizontal size={18} /></button>
      </div>
    </>
  );
}

function BottomNav({ screen, setScreen, openComposer }: { screen: Screen; setScreen: (screen: Screen) => void; openComposer: () => void }) {
  const items = [
    ['feed', Home],
    ['search', Search],
    ['compose', Plus],
    ['notifications', Heart],
    ['my', UserRound],
  ] as const;
  return (
    <nav className="sticky bottom-0 grid grid-cols-5 border-t border-slate-100 bg-white px-3 py-2">
      {items.map(([key, Icon]) => (
        <button key={key} className={`mx-auto grid h-11 w-11 place-items-center rounded-2xl ${screen === key ? 'bg-slate-100 text-blue-600' : 'text-slate-500'} ${key === 'compose' ? 'bg-[#050816] text-white' : ''}`} onClick={() => key === 'compose' ? openComposer() : setScreen(key as Screen)}>
          <Icon size={20} />
        </button>
      ))}
    </nav>
  );
}

function MiniBottomNav() {
  return (
    <div className="mt-5 grid grid-cols-5 text-center text-[9px] text-slate-500">
      {[
        [Home, 'フィード'],
        [Search, '検索'],
        [Bell, '通知'],
        [Mail, 'メッセージ'],
        [UserRound, 'マイページ'],
      ].map(([Icon, label]) => <span key={String(label)}><Icon className="mx-auto mb-1" size={16} />{String(label)}</span>)}
    </div>
  );
}

function Avatar({ label, size = 'md', active }: { label: string; size?: 'md' | 'lg'; active?: boolean }) {
  const dimensions = size === 'lg' ? 'h-20 w-20 text-xl' : 'h-11 w-11 text-sm';
  return (
    <span className={`relative grid ${dimensions} shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-100 via-white to-amber-100 font-black text-slate-950 ring-1 ring-slate-200`}>
      {label}
      {active && <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />}
    </span>
  );
}

function MiniStat({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="min-h-20 rounded-2xl border border-slate-100 p-3">
      <p className="text-[9px] font-bold leading-4 text-slate-500">{label}</p>
      <b className={`mt-2 block text-[12px] leading-5 ${green ? 'text-emerald-600' : ''}`}>{value}</b>
    </div>
  );
}

function ProfileTabs({ tabs }: { tabs: string[] }) {
  return (
    <div className="mt-5 grid border-b border-slate-100 text-center text-[11px] font-bold text-slate-500" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
      {tabs.map((tab, index) => <button className={`py-3 ${index === 0 ? 'border-b-2 border-blue-600 text-slate-950' : ''}`} key={tab}>{tab}</button>)}
    </div>
  );
}

function TextBlock({ title, body, more }: { title: string; body: string; more?: boolean }) {
  return (
    <section className="mt-4">
      <h3 className="text-sm font-black">{title}</h3>
      <p className="mt-2 text-[12px] leading-6 text-slate-700">{body}</p>
      {more && <button className="mx-auto mt-2 block text-[11px] font-black text-blue-600">もっと見る ＞</button>}
    </section>
  );
}

function DashboardImage({ large }: { large?: boolean }) {
  return (
    <div className={`mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-blue-50 p-3 ${large ? 'h-36' : 'h-32'}`}>
      <div className="grid h-full grid-cols-[1fr_56px] gap-2 rounded-xl bg-white p-3 shadow-inner">
        <div className="grid content-end gap-2">
          <span className="h-2 rounded-full bg-blue-100" />
          <span className="h-2 w-3/4 rounded-full bg-slate-100" />
          <div className="mt-2 flex h-12 items-end gap-1">
            {[32, 46, 28, 56, 42, 64, 70].map((height) => <span key={height} className="flex-1 rounded-t bg-blue-500/70" style={{ height }} />)}
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2">
          <span className="block h-2 rounded-full bg-slate-200" />
          <span className="mt-2 block h-12 rounded-lg bg-blue-100" />
        </div>
      </div>
    </div>
  );
}

function InfoRows({ rows }: { rows: string[][] }) {
  return (
    <div className="mt-2 divide-y divide-slate-100 text-[11px]">
      {rows.map(([label, value]) => <div className="grid grid-cols-[96px_1fr] gap-2 py-2" key={label}><b className="text-slate-500">{label}</b><span>{value}</span></div>)}
    </div>
  );
}

function PersonRow({ name, sub, meta, badge, avatar, unread, onClick }: { name: string; sub: string; meta?: string; badge?: string; avatar: string; unread?: boolean; onClick?: () => void }) {
  return (
    <button className="flex w-full items-center gap-3 text-left" onClick={onClick}>
      <Avatar label={avatar} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-black">{name}</p>
        {sub && <p className="truncate text-[10px] text-slate-500">{sub}</p>}
        {badge && <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700">{badge}</span>}
      </div>
      {meta && <span className="text-[10px] text-slate-500">{meta}</span>}
      {unread && <span className="h-2 w-2 rounded-full bg-blue-600" />}
    </button>
  );
}

function Switch({ label, active }: { label: string; active?: boolean }) {
  return (
    <div className="mt-3 flex items-center justify-between text-[11px] font-bold">
      <span>{label}</span>
      <span className={`relative h-6 w-11 rounded-full ${active ? 'bg-blue-600' : 'bg-slate-200'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${active ? 'left-6' : 'left-1'}`} /></span>
    </div>
  );
}
