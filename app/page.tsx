    ['会社名', account.company || '未入力'],
    ['代表者', account.name || '未入力'],
    ['業界', account.industry || '未入力'],
    ['地域', account.location || '未入力'],
    ['設立', account.foundedYear && account.foundedMonth ? `${account.foundedYear}年${account.foundedMonth}` : '未入力'],
    ['従業員数', account.employeeSize || '未入力'],
    ['年商規模', account.revenueScale || '未入力'],
    ['フェーズ', account.stage || '未入力'],
  ];
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <p className="text-[10px] font-black tracking-[0.18em] text-blue-600">COMPANY INFO</p>
      <h3 className="mt-1 text-lg font-black">基本情報</h3>
      <div className="mt-4 divide-y divide-slate-100 text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[82px_1fr] gap-3 py-3">
            <b className="text-slate-500">{label}</b>
            <span className="font-bold text-slate-800">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function MiniBlogCard({ blog }: { blog: BlogArticle }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      {blog.imageUrl ? <img src={blog.imageUrl} alt={blog.imageName || blog.title} className="aspect-[16/9] w-full object-cover" /> : <div className="aspect-[16/9] bg-gradient-to-br from-blue-50 to-emerald-50" />}
      <div className="p-3">
        <b className="line-clamp-2 text-sm">{blog.title || 'タイトル未設定'}</b>
        <p className="mt-2 line-clamp-2 text-xs font-bold leading-5 text-slate-500">{blog.body}</p>
      </div>
    </article>
  );
}

function DealPage({ account, requestMeeting }: { account: Account; requestMeeting: () => void }) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-black">{account.company || account.accountName || '案件詳細'}</h2>
      <div className="mt-2 flex flex-wrap gap-2">{[account.industry, account.stage, account.location].filter(Boolean).map((tag) => <span className="pill" key={tag}>{tag}</span>)}</div>
      {account.profileImageUrl ? <img src={account.profileImageUrl} alt={account.profileImageName || '会社紹介画像'} className="mt-4 aspect-[16/9] w-full rounded-2xl object-cover ring-1 ring-slate-100" /> : <DashboardCard />}
      <h3 className="mt-5 text-sm font-black">ハイライト</h3>
      <KpiGrid account={account} />
      <TextBlock title="案件詳細" body={account.dealDetails || '案件詳細はまだ登録されていません。'} />
      <h3 className="mt-5 text-sm font-black">関連情報</h3>
      <InfoRows rows={[['調達希望額', account.fundingGoal || '未入力'], ['月次売上', account.monthlyRevenue || '未入力'], ['成長率', account.growthRate || '未入力'], ['導入社数', account.customerCount || '未入力'], ['地域', account.location || '未入力'], ['フェーズ', account.stage || '未入力']]} />
      <div className="mt-4 rounded-2xl border border-slate-100 p-4">
        <p className="text-sm font-black">事業計画書・ピッチ資料</p>
        {account.businessPlanUrl ? <a className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs font-black text-blue-600" href={account.businessPlanUrl} target="_blank" rel="noopener noreferrer"><Paperclip size={15} />{account.businessPlanName || '資料を開く'}</a> : <p className="mt-2 text-xs text-slate-500">資料が登録されるとここに表示されます。</p>}
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

function BlogCard({ blog, author, currentAccount, startEditBlog, hideBlog, deleteBlog }: { blog: BlogArticle; author?: Account | null; currentAccount: Account | null; startEditBlog: (blog: BlogArticle) => void; hideBlog: (blogId: string) => void; deleteBlog: (blogId: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = Boolean(currentAccount && currentAccount.id === blog.authorId);
  return (
    <article className="bg-white p-4">
      <div className="flex items-start gap-3">
        {author && <Avatar account={author} />}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{blog.title}</p>
              <p className="mt-0.5 text-[12px] font-bold text-slate-500">{author ? displayAccountName(author) : '名前未設定'}・{blog.isHidden ? '非表示・' : ''}{visibilityLabels[blog.visibility]}・{formatDate(blog.createdAt)}</p>
            </div>
            {isOwner && (
              <div className="relative">
                <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-50" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={18} /></button>
                {menuOpen && <div className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-2xl bg-white text-xs font-black shadow-xl ring-1 ring-slate-100"><button className="block w-full px-4 py-3 text-left hover:bg-slate-50" onClick={() => startEditBlog(blog)}>編集</button><button className="block w-full px-4 py-3 text-left hover:bg-slate-50" onClick={() => hideBlog(blog.id)}>{blog.isHidden ? '再公開' : '非表示'}</button><button className="block w-full px-4 py-3 text-left text-rose-600 hover:bg-rose-50" onClick={() => deleteBlog(blog.id)}>削除</button></div>}
              </div>
            )}
          </div>
          {blog.imageUrl && <img className="mt-3 aspect-[16/9] w-full rounded-2xl object-cover" src={blog.imageUrl} alt={blog.imageName || blog.title} />}
          <p className="mt-3 whitespace-pre-line text-[14px] leading-7 text-slate-700">{blog.body}</p>
          {blog.tags.length > 0 && <p className="mt-3 text-[13px] font-black text-blue-600">{blog.tags.map((tag) => `#${tag}`).join(' ')}</p>}
          {blog.attachmentUrl && <a className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs font-black text-blue-600" href={blog.attachmentUrl} download={blog.attachmentName || 'blog-attachment'}><Paperclip size={15} />{blog.attachmentName || '添付ファイル'}</a>}
          <p className="mt-3 text-[11px] font-bold text-slate-400">閲覧 {blog.views}</p>
        </div>
      </div>
    </article>
  );
}

function PostCard({ post, author, currentAccount, openProfile, reactToPost, startEditPost, hidePost, deletePost }: { post: Post; author?: Account; currentAccount: Account | null; openProfile: (account: Account) => void; reactToPost: (postId: string, type: 'like' | 'save' | 'meeting') => void; startEditPost: (post: Post) => void; hidePost: (postId: string) => void; deletePost: (postId: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(false);
  const [comment, setComment] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const isOwner = Boolean(currentAccount && currentAccount.id === post.authorId);
  const actions = post.actionUserIds ?? { likes: [], saves: [], meetings: [] };
  const liked = currentAccount ? actions.likes?.includes(currentAccount.id) : false;
  const saved = currentAccount ? actions.saves?.includes(currentAccount.id) : false;
  const meetingRequested = currentAccount ? actions.meetings?.includes(currentAccount.id) : false;
  const authorName = author ? displayAccountName(author) : 'アカウント未設定';
  const secondaryLabel = post.isHidden ? '非表示' : '';
  const canShowViews = isOwner || post.views > 1000;
  const canComment = currentAccount?.role !== 'investor' || Boolean(currentAccount?.corporateNumber || currentAccount?.licenseFileName || currentAccount?.verified);

  async function like() {
    reactToPost(post.id, 'like');
    const supabase = createSupabaseBrowserClient();
    if (!supabase || !currentAccount) return;
    await supabase.from('post_likes').upsert({ post_id: post.id, user_id: currentAccount.id });
  }

  async function save() {
    reactToPost(post.id, 'save');
    const supabase = createSupabaseBrowserClient();
    if (!supabase || !currentAccount) return;
    await supabase.from('watchlists').upsert({
      entrepreneur_id: post.authorId,
      investor_id: currentAccount.id,
      memo: `保存した投稿: ${post.body.slice(0, 80)}`,
    });
  }

  async function report() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase || !currentAccount) return;
    await supabase.from('reports').insert({
      reporter_id: currentAccount.id,
      target_type: 'progress_posts',
      target_id: post.id,
      reason: '投稿内容の確認依頼',
    });
    setCommentMessage('通報を送信しました。');
  }

  async function submitComment() {
    if (!currentAccount || !comment.trim()) return;
    if (!canComment) {
      setCommentMessage('確認書類の提出が完了するまで、コメントは利用できません。');
      return;
    }
    const supabase = createSupabaseBrowserClient();
    if (containsContactInfo(comment)) {
      if (supabase) {
        await supabase.from('contact_suspicions').insert({
          sender_id: currentAccount.id,
          receiver_id: post.authorId,
          body: comment,
          reason: 'コメント内に連絡先交換の疑いがあります。',
        });
      }
      setCommentMessage('連絡先交換につながる可能性がある内容は送信できません。');
      return;
    }
    if (supabase) {
      await supabase.from('post_comments').insert({ post_id: post.id, user_id: currentAccount.id, body: comment });
      await supabase.from('notifications').insert({ user_id: post.authorId, type: 'comment', body: '進捗投稿にコメントがつきました。' });
    }
    setComment('');
    setCommentMessage('コメントを送信しました。');
  }

  return (
    <article className={`relative border-b border-[#eff3f4] px-4 py-2 ${post.isHidden ? 'bg-slate-50' : 'bg-white'}`}>
      <div className="flex w-full items-start gap-2.5 text-left">
        <div className="grid shrink-0 justify-items-center">
        <button className="shrink-0" onClick={() => author && openProfile(author)} aria-label={`${authorName}のプロフィールを見る`}>
          {author ? <Avatar account={author} size="feed" /> : <span className="grid h-12 w-12 place-items-center rounded-full bg-[#f2f4f7] text-slate-400 ring-1 ring-[#e5e7eb]"><Building2 size={21} strokeWidth={1.8} /></span>}
        </button>
        <span className="mt-2 h-full min-h-8 w-px bg-[#d9dfe4]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1">
            <button className="min-w-0 flex-1 text-left" onClick={() => author && openProfile(author)}>
              <span className="flex min-w-0 items-center gap-1 leading-[1.25]">
                <b className="truncate text-[13px] font-black text-[#0f1419]">{authorName}</b>
                <span className="shrink-0 text-[11px] font-medium text-[#536471]">・{formatRelativeTime(post.createdAt)}</span>
              </span>
              {secondaryLabel && <span className="mt-0.5 inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-bold leading-none text-[#536471]">{secondaryLabel}</span>}
            </button>
            <button className="grid h-6 w-6 shrink-0 place-items-center rounded-full hover:bg-slate-50" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={17} className="text-[#536471]" /></button>
          </div>

          <p className="mt-0.5 whitespace-pre-wrap text-[13px] font-medium leading-[1.48] text-[#0f1419]">{renderPostBody(post.body)}</p>
          {post.tags.length > 0 && <div className="mt-0.5 flex flex-wrap gap-x-1.5 gap-y-0.5">{post.tags.map((tag) => <span className="text-[11px] font-semibold text-blue-600" key={tag}>#{tag}</span>)}</div>}
          {post.imageUrl && <button className="mt-1.5 block w-full" onClick={() => setPreviewImage(true)}><img className="aspect-square w-full rounded-2xl object-cover" src={post.imageUrl} alt={post.imageName || '投稿画像'} /></button>}
          {post.attachmentName && <div className="mt-1.5 flex items-center gap-1.5 rounded-2xl bg-slate-50 p-2 text-[11px]"><Paperclip size={13} />{post.attachmentName}</div>}
          <div className="mt-1.5 flex items-center gap-5 text-[10.5px] font-semibold text-[#536471]">
            <button className="inline-flex min-w-6 items-center gap-1 text-[#0f1419]" onClick={like} aria-label="応援" aria-pressed={liked}><Heart size={18} strokeWidth={1.8} fill={liked ? 'currentColor' : 'none'} /><span>{post.likes}</span></button>
            <button className="inline-flex min-w-6 items-center gap-1 text-[#0f1419]" onClick={save} aria-label="保存" aria-pressed={saved}><Bookmark size={18} strokeWidth={1.8} fill={saved ? 'currentColor' : 'none'} /><span>{post.saves}</span></button>
            <button className="inline-flex min-w-6 items-center gap-1 text-[#0f1419]" onClick={() => reactToPost(post.id, 'meeting')} aria-label="面談" aria-pressed={meetingRequested}><UsersRound size={18} strokeWidth={1.8} /><span>{post.meetings}</span></button>
            <button className="inline-flex min-w-6 items-center gap-1 text-[#0f1419]" onClick={report} aria-label="通報"><Flag size={17} strokeWidth={1.8} /></button>
            {canShowViews && <span className="ml-auto text-[10px] font-semibold text-[#536471]">{post.views}</span>}
          </div>
          {currentAccount?.role === 'investor' && (
            <div className="mt-2">
              {!canComment && <p className="mb-1 text-[10px] font-bold text-amber-600">確認書類の提出が完了するまで、コメントは利用できません。</p>}
              <div className="flex items-center gap-1.5">
                <input className="field min-h-8 flex-1 rounded-full py-1.5 text-[11px]" value={comment} onChange={(event) => { setComment(event.target.value); setCommentMessage(''); }} placeholder="質問やコメントを書く" />
                <button className="primary min-h-8 rounded-full px-3 text-[10px] disabled:opacity-40" disabled={!canComment || !comment.trim()} onClick={submitComment}><MessageCircle size={14} />送信</button>
              </div>
              {commentMessage && <p className="mt-1 text-[10px] font-bold text-[#536471]">{commentMessage}</p>}
            </div>
          )}
        </div>
      </div>
      {menuOpen && isOwner && (
        <div className="absolute right-4 top-12 z-20 w-40 rounded-2xl border border-slate-100 bg-white p-2 text-xs font-black shadow-xl">
          <button className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left hover:bg-slate-50" onClick={() => { startEditPost(post); setMenuOpen(false); }}><Edit3 size={14} />編集</button>
          <button className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left hover:bg-slate-50" onClick={() => { hidePost(post.id); setMenuOpen(false); }}><EyeOff size={14} />{post.isHidden ? '再公開' : '非表示'}</button>
          <button className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-rose-600 hover:bg-rose-50" onClick={() => { deletePost(post.id); setMenuOpen(false); }}><Trash2 size={14} />削除</button>
        </div>
      )}
      {menuOpen && !isOwner && <div className="absolute right-4 top-12 z-20 rounded-2xl border border-slate-100 bg-white p-3 text-xs font-bold text-slate-500 shadow-xl">投稿者のみ操作できます</div>}
      {previewImage && (
        <Modal title={post.imageName || '投稿画像'} onClose={() => setPreviewImage(false)}>
          <img className="max-h-[70vh] w-full rounded-2xl object-contain" src={post.imageUrl} alt={post.imageName || '投稿画像'} />
        </Modal>
      )}
    </article>
  );
}

function renderPostBody(body: string) {
  return body.split('\n').map((line, index) => (
    line.trim()
      ? <span key={`${index}-${line}`} className="block whitespace-pre-wrap">{line}</span>
      : <span key={`blank-${index}`} className="block h-[0.55em]" aria-hidden />
  ));
}

function BottomTabs({ page, setPage, openComposer }: { page: Page; setPage: (page: Page) => void; openComposer: () => void }) {
  const tabs = [
    ['feed', 'フィード', Home],
    ['search', '検索', Search],
    ['messages', 'メッセージ', Mail],
    ['mypage', 'マイページ', UserRound],
  ] as const;  RefreshCcw,
  Rocket,
  Search,
  Send,
  Settings,
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
  | 'settings'
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
    body: '起業家プロフィールの公開費用は1ヶ月11,000円、3ヶ月29,700円、6ヶ月55,000円、1年間99,000円です。投資家との面談チケットは1枚11,000円、3枚29,700円、5枚44,000円です。支払方法は銀行振込のみです。振込先は近畿産業信用組合 本店営業部 普通 3170341 カ）エーアイインフルエンサーです。',
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
const industryOptions = ['人工知能', '業務支援システム', '金融', '医療・ヘルスケア', '環境・脱炭素', '小売・店舗支援', '教育', '人材・採用', '食品・外食', '製造・ものづくり', '不動産・建設', '物流・配送', '観光・宿泊', 'エンタメ・メディア', '農業・一次産業', '地方創生', '美容・ウェルネス', '法律・士業支援', '行政・公共', 'その他'];
const locationOptions = ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県', '海外'];
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
const paymentLabels: Record<string, string> = {
  unpaid: '未入金',
  pending_review: '振込確認待ち',
  paid: '入金確認済み',
};
const bankAccount = {
  bank: '近畿産業信用組合',
  branch: '本店営業部',
  type: '普通',
  number: '3170341',
  holder: 'カ）エーアイインフルエンサー',
};
const entrepreneurPaymentPlans = [
  { id: 'one_month', label: '1ヶ月', months: 1, amount: 11000 },
  { id: 'three_months', label: '3ヶ月', months: 3, amount: 29700 },
  { id: 'six_months', label: '6ヶ月', months: 6, amount: 55000 },
  { id: 'one_year', label: '1年間', months: 12, amount: 99000 },
];
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

export default function LeapApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveringPassword, setRecoveringPassword] = useState(false);
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
    if (!supabase || !user) return;
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
    if (user.role === 'entrepreneur') {
      const { data: ownProfile } = await supabase.from('entrepreneur_profiles').select('*').eq('user_id', user.id).maybeSingle();
      setProfile((ownProfile as EntrepreneurProfile | null) ?? null);
      if (ownProfile) {
        const [{ data: postRows }, { data: kpiRows }, { data: followRows }, { data: meetingRows }, { data: messageRows }] = await Promise.all([
          supabase.from('progress_posts').select('*').eq('entrepreneur_id', ownProfile.id).order('created_at', { ascending: false }),
          supabase.from('startup_kpis').select('*').eq('entrepreneur_id', ownProfile.id).order('kpi_month', { ascending: true }),
          supabase.from('follows').select('*').eq('entrepreneur_id', ownProfile.id),
          supabase.from('meeting_requests').select('*').eq('entrepreneur_id', ownProfile.id).order('created_at', { ascending: false }),
          supabase.from('messages').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(50),
        ]);
        setPosts((postRows as ProgressPost[]) ?? []);
        setKpis((kpiRows as StartupKpi[]) ?? []);
        setFollows(followRows ?? []);
        setMeetings(meetingRows ?? []);
        setMessages(messageRows ?? []);
      }
    }

    if (user.role === 'investor') {
      const [{ data: investorProfile }, { data: allProfiles }, { data: allPosts }, { data: followRows }, { data: meetingRows }, { data: messageRows }] =
        await Promise.all([
          supabase.from('investor_profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('entrepreneur_profiles').select('*, users(last_login_at)').eq('is_hidden', false).order('created_at', { ascending: false }).limit(50),
          supabase
            .from('progress_posts')
            .select('*, entrepreneur_profiles(*, users(last_login_at))')
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
      if (followRows?.length) {
        const entrepreneurIds = followRows.map((row: any) => row.entrepreneur_id);
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
    }

    const { data: notificationRows } = await supabase.from('notifications').select('*').eq('user_id', user.id).is('read_at', null).limit(20);
    setNotifications(notificationRows ?? []);
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
            {user.role !== 'admin' && (
              <button className="btn-secondary h-11 px-3 text-xs" onClick={() => switchRole(user.role === 'entrepreneur' ? 'investor' : 'entrepreneur')}>
                {user.role === 'entrepreneur' ? '投資家画面へ' : '起業家画面へ'}
              </button>
            )}
            <button className="btn-secondary h-11 px-3" onClick={() => setView('settings')} aria-label="設定"><Settings size={17} /></button>
            <button className="btn-secondary h-11 px-3" onClick={signOut}><LogOut size={17} /></button>
          </div>
        </header>

        {toast && <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">{toast}</div>}

        {view === 'home' && user.role === 'entrepreneur' && (
          <EntrepreneurHome profile={profile} posts={posts} kpis={kpis} follows={follows} meetings={meetings} refresh={loadWorkspace} />
        )}
        {view === 'home' && user.role === 'investor' && (
          <InvestorHome currentUser={user} investor={investor} profiles={profiles} posts={posts} follows={follows} followedKpis={followedKpis} meetings={meetings} messages={messages} openProfile={openStartupProfile} setView={setView} refresh={loadWorkspace} />
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
        {view === 'messages' && <Messages currentUser={user} messages={messages} meetings={meetings} refresh={loadWorkspace} />}
        {view === 'admin' && user.role === 'admin' && <AdminHome adminData={adminData} refresh={loadWorkspace} />}
        {view === 'settings' && <SettingsPage currentUser={user} refresh={loadUser} />}
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
            <p className="rounded-2xl bg-cyan-400/10 p-3 text-xs leading-6 text-cyan-100">
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
          {message && <p className="rounded-2xl bg-white/8 p-3 text-sm text-slate-200">{message}</p>}
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
            is_hidden: true,
            payment_status: 'unpaid',
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
  if (step === 0) return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FieldGrid fields={['company_name:会社名', 'founder_name:代表者名', 'founded_month:設立年月', 'employee_count:従業員数']} form={form} set={set} />
      <OptionSelect label="所在地" value={form.location ?? ''} options={locationOptions} onChange={(value) => set('location', value)} />
      <OptionSelect label="業界" value={form.industry ?? ''} options={industryOptions} onChange={(value) => set('industry', value)} />
    </div>
  );
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
  if (step === 0) return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FieldGrid fields={['full_name:氏名', 'company_name:会社名', 'position:役職']} form={form} set={set} />
      <OptionSelect label="所在地" value={form.location ?? ''} options={locationOptions} onChange={(value) => set('location', value)} />
    </div>
  );
  if (step === 1) return (
    <div className="grid gap-4">
      <OptionSelect label="投資領域" value={form.investment_fields ?? ''} options={industryOptions} onChange={(value) => set('investment_fields', value)} />
      <FieldGrid textarea fields={['investable_amount:投資可能額（円）', 'interested_phases:興味のあるフェーズ', 'past_investments:過去の投資実績', 'support_areas:支援できる内容']} form={form} set={set} />
    </div>
  );
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
      <PublicationPaymentPanel profile={profile} refresh={refresh} />
      <MeetingTicketPanel profile={profile} meetings={meetings} refresh={refresh} />
      <EntrepreneurMeetingManager profile={profile} meetings={meetings} refresh={refresh} />
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

function PublicationPaymentPanel({ profile, refresh }: { profile: EntrepreneurProfile; refresh: () => Promise<void> }) {
  const status = profile.payment_status ?? 'unpaid';
  const isPublished = !profile.is_hidden && status === 'paid';
  const [showApplication, setShowApplication] = useState(status !== 'unpaid');
  const [acceptedTerms, setAcceptedTerms] = useState(status !== 'unpaid');
  const [transferName, setTransferName] = useState(profile.payment_transfer_name ?? `${profile.company_name} `);
  const [selectedPlanId, setSelectedPlanId] = useState(profile.payment_plan_id ?? entrepreneurPaymentPlans[0].id);
  const selectedPlan = entrepreneurPaymentPlans.find((plan) => plan.id === selectedPlanId) ?? entrepreneurPaymentPlans[0];
  const canShowBank = acceptedTerms || status !== 'unpaid';

  async function requestReview() {
    if (!supabase) return;
    await supabase
      .from('entrepreneur_profiles')
      .update({
        payment_status: 'pending_review',
        payment_transfer_name: transferName.trim() || profile.company_name,
        payment_plan_id: selectedPlan.id,
        payment_plan_label: selectedPlan.label,
        payment_plan_months: selectedPlan.months,
        payment_plan_amount: selectedPlan.amount,
        payment_requested_at: new Date().toISOString(),
        is_hidden: true,
      })
      .eq('id', profile.id);
    await supabase.from('notifications').insert({
      user_id: profile.user_id,
      type: 'payment_review_requested',
      body: '銀行振込の確認依頼を受け付けました。運営確認後にプロフィールが公開されます。',
    });
    await refresh();
  }

  return (
    <section className={`glass rounded-[24px] p-5 ${isPublished ? 'border-emerald-300/40' : 'border-cyan-300/30'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-emerald-300">公開設定</p>
          <h3 className="mt-2 text-2xl font-black">{isPublished ? 'プロフィールは公開中です' : '入金確認後にプロフィールが公開されます'}</h3>
          <p className="mt-2 max-w-3xl leading-7 text-slate-300">
            起業家プロフィールは月額費用のお支払い確認後に、投資家の検索結果とフィードへ表示されます。支払い方法は銀行振込のみです。
          </p>
        </div>
        <span className="pill"><Landmark size={14} /> {paymentLabels[status] ?? status}</span>
      </div>
      {!isPublished && !showApplication && (
        <button className="btn-primary mt-5 w-full" onClick={() => setShowApplication(true)}>
          月額費用の支払いを申請する
        </button>
      )}
      {!isPublished && showApplication && (
        <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
          <p className="text-sm font-bold text-cyan-100">お振込名義を設定してください</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            お振込名義は、登録時の会社名がある場合は会社名、続けてお名前をカタカナで入力してください。
          </p>
          <label className="label mt-4">
            お振込名義
            <input className="field" value={transferName} onChange={(e) => setTransferName(e.target.value)} placeholder="例：カ）リープ ヤマダタロウ" />
          </label>
          <div className="mt-4">
            <p className="text-sm font-bold text-cyan-100">公開プランを選択してください</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              {entrepreneurPaymentPlans.map((plan) => (
                <button
                  key={plan.id}
                  className={`rounded-2xl border p-4 text-left transition ${selectedPlanId === plan.id ? 'border-cyan-300 bg-cyan-300/15' : 'border-white/10 bg-black/25 hover:border-cyan-300/40'}`}
                  onClick={() => setSelectedPlanId(plan.id)}
                  type="button"
                >
                  <span className="text-sm font-bold text-white">{plan.label}</span>
                  <b className="mt-2 block text-xl">{yen(plan.amount)}</b>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-7 text-slate-300">
            <p className="font-bold text-white">利用規約への同意</p>
            <p className="mt-2">
              Leapは投資判断を代行・推奨するサービスではありません。プロフィール公開後も、掲載情報をもとにした投資判断は各利用者の責任で行われます。月額費用は起業家プロフィールの公開・運営確認・プラットフォーム利用に関する費用です。
            </p>
            <label className="mt-4 flex items-center gap-3 text-white">
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
              利用規約に同意する
            </label>
          </div>
        </div>
      )}
      {canShowBank ? (
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs font-bold text-slate-400">選択プラン</p>
          <p className="mt-1 text-2xl font-black">{selectedPlan.label} {yen(selectedPlan.amount)}</p>
          <p className="mt-3 text-xs leading-6 text-slate-400">入金後、下のボタンで運営へ確認依頼を送ってください。</p>
          <p className="mt-3 rounded-xl bg-emerald-300/10 p-3 text-xs leading-6 text-emerald-100">
            運営にメッセージでお振込明細書のお写真を送ると、早急に対応できる場合があります。
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm leading-7 text-slate-300">
          <p><b className="text-white">銀行名:</b> {bankAccount.bank}</p>
          <p><b className="text-white">支店:</b> {bankAccount.branch}</p>
          <p><b className="text-white">種別:</b> {bankAccount.type}</p>
          <p><b className="text-white">口座番号:</b> {bankAccount.number}</p>
          <p><b className="text-white">口座名義:</b> {bankAccount.holder}</p>
          <p><b className="text-white">お振込名義:</b> {transferName || '未入力'}</p>
        </div>
      </div>
      ) : (
        showApplication && <p className="mt-4 rounded-2xl bg-white/8 p-4 text-sm leading-6 text-slate-300">利用規約に同意すると、振込先口座情報が表示されます。</p>
      )}
      {!isPublished && (
        <button className="btn-primary mt-5 w-full" onClick={requestReview} disabled={status === 'pending_review' || !canShowBank || !transferName.trim()}>
          {status === 'pending_review' ? '運営が入金確認中です' : '振込済みとして確認を依頼する'}
        </button>
      )}
    </section>
  );
}

function InvestorHome({ currentUser, investor, profiles, posts, follows, followedKpis, meetings, messages, openProfile, setView, refresh }: { currentUser: AppUser; investor: InvestorProfile | null; profiles: EntrepreneurProfile[]; posts: ProgressPost[]; follows: any[]; followedKpis: any[]; meetings: any[]; messages: any[]; openProfile: (p: EntrepreneurProfile) => void; setView: (v: View) => void; refresh: () => Promise<void> }) {
  const followedIds = new Set(follows.map((row) => row.entrepreneur_id));
  const followedPosts = posts.filter((post) => followedIds.has(post.entrepreneur_id));
  const recommendedPosts = posts.filter((post) => !followedIds.has(post.entrepreneur_id));
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
      <InvestorDocumentPanel investor={investor} refresh={refresh} />
      {follows.length === 0 && <EmptyState title="まだフォロー中の起業家はいません。興味のある起業家を探しましょう。" cta="起業家を探す" onClick={() => setView('search')} />}
      <section className="grid gap-3">
        <h3 className="text-xl font-black">フォロー中のKPI更新</h3>
        {followedKpis.length === 0 ? <EmptyState title="フォロー中のKPI更新はまだありません" body="フォローした起業家がKPIを更新するとここに表示されます。" /> : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{followedKpis.map((kpi) => (
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
      <section className="grid gap-3">
        <h3 className="text-xl font-black">興味領域に合う起業家</h3>
        {profiles.length === 0 ? <EmptyState title="閲覧できる起業家がまだいません" body="起業家が登録すると、検索とウォッチリスト追加が利用できます。" /> : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{profiles.map((p) => <StartupCard key={p.id} profile={p} onClick={() => openProfile(p)} />)}</div>
        )}
      </section>
      <section className="grid gap-3">
        <h3 className="text-xl font-black">フォロー中の新着進捗ログ</h3>
        {followedPosts.length === 0 ? <EmptyState title="フォロー中の新着進捗ログはまだありません" body="フォローした起業家の進捗がここに表示されます。" /> : followedPosts.map((post) => <PostCard key={post.id} post={post} currentUser={currentUser} investor={investor} />)}
      </section>
      <section className="grid gap-3">
        <h3 className="text-xl font-black">興味を惹きそうな投稿</h3>
        {recommendedPosts.length === 0 ? <EmptyState title="おすすめ投稿はまだありません" body="フォローしていない起業家の投稿がここに表示されます。" /> : recommendedPosts.map((post) => <PostCard key={post.id} post={post} currentUser={currentUser} investor={investor} />)}
      </section>
    </div>
  );
}

function InvestorDocumentPanel({ investor, refresh }: { investor: InvestorProfile | null; refresh: () => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState(investor?.document_type ?? 'corporate_registry');
  const [message, setMessage] = useState('');
  const submitted = Boolean(investor?.document_file_path);

  async function uploadDocument() {
    if (!supabase || !investor || !file) return;
    const path = `${investor.user_id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('compliance-documents').upload(path, file, { upsert: false });
    if (error) {
      setMessage(toJapaneseError(error.message));
      return;
    }
    await supabase.from('investor_profiles').update({
      document_type: docType,
      document_file_path: path,
      document_status: 'submitted',
      document_submitted_at: new Date().toISOString(),
    }).eq('id', investor.id);
    setMessage('確認書類を提出しました。提出後、コメントとメッセージが利用できます。');
    await refresh();
  }

  return (
    <section className={`glass rounded-[24px] p-5 ${submitted ? 'border-emerald-300/40' : 'border-amber-300/35'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-emerald-300">投資家確認書類</p>
          <h3 className="mt-2 text-2xl font-black">{submitted ? '確認書類を提出済みです' : '書類提出後にコメント・メッセージが利用できます'}</h3>
          <p className="mt-2 leading-7 text-slate-300">法人は直近3ヶ月以内の登記簿謄本、個人事業主は開業届または直近の確定申告書を提出してください。</p>
        </div>
        <span className="pill"><ShieldCheck size={14} /> {submitted ? '提出済み' : '未提出'}</span>
      </div>
      {!submitted && (
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <select className="field" value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="corporate_registry">法人：登記簿謄本</option>
            <option value="sole_proprietor_filing">個人事業主：開業届</option>
            <option value="tax_return">個人事業主：確定申告書</option>
          </select>
          <input className="field" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
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
  async function requestTicketReview() {
    if (!supabase || !acceptedTerms) return;
    await supabase.from('contact_inquiries').insert({
      user_id: profile.user_id,
      category: 'meeting_ticket_payment',
      body: `${profile.company_name} が面談チケット ${selectedPlan.label}（${yen(selectedPlan.amount)}）の入金確認を希望しています。振込名義: ${transferName}`,
    });
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
        <span className="pill"><CalendarClock size={14} /> 残り {availableTickets}枚</span>
      </div>
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
      <button className="btn-primary mt-4 w-full" disabled={!acceptedTerms || !transferName.trim()} onClick={requestTicketReview}>
        面談チケットの入金確認を依頼する
      </button>
    </section>
  );
}

function EntrepreneurMeetingManager({ profile, meetings, refresh }: { profile: EntrepreneurProfile; meetings: any[]; refresh: () => Promise<void> }) {
  const [dateById, setDateById] = useState<Record<string, string>>({});
  const [messageById, setMessageById] = useState<Record<string, string>>({});

  async function updateMeeting(id: string, patch: Record<string, any>) {
    await supabase!.from('meeting_requests').update(patch).eq('id', id);
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
    await supabase!.from('entrepreneur_profiles').update({ meeting_ticket_balance: Math.max(0, (profile.meeting_ticket_balance ?? 0) - 1) }).eq('id', profile.id);
    await refresh();
  }

  return (
    <section className="glass rounded-[24px] p-5">
      <h3 className="text-xl font-black">面談希望・面談用メッセージ</h3>
      <p className="mt-2 text-sm leading-6 text-amber-100">面談申請前にLeap外で面談を実行したことが発覚した場合、双方強制退会となります。</p>
      <div className="mt-4 grid gap-3">
        {meetings.length === 0 ? <p className="text-slate-400">面談希望はまだありません。</p> : meetings.map((meeting) => (
          <article key={meeting.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="font-bold">{meeting.message || '面談希望が届いています'}</p>
            <p className="mt-1 text-xs text-slate-500">状態: {meeting.status} / 希望日時: {meeting.proposed_at ? new Date(meeting.proposed_at).toLocaleString('ja-JP') : '未指定'}</p>
            {meeting.status === 'pending' && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-primary" onClick={() => updateMeeting(meeting.id, { status: 'accepted_by_entrepreneur' })}>承認</button>
                <button className="btn-secondary" onClick={() => updateMeeting(meeting.id, { status: 'rejected_by_entrepreneur' })}>非承認</button>
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
                <button className="btn-primary" disabled={(profile.meeting_ticket_balance ?? 0) <= 0} onClick={() => reportMeeting(meeting)}>
                  面談チケット1枚を消費して運営へ面談日程を報告する
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function SearchPage({ query, setQuery, profiles, openProfile, refresh }: { query: string; setQuery: (q: string) => void; profiles: EntrepreneurProfile[]; openProfile: (p: EntrepreneurProfile) => void; refresh: () => Promise<void> }) {
  const [filters, setFilters] = useState({ industry: '', location: '', phase: '', verified: false, interviewed: false });
  const [applied, setApplied] = useState({ query: '', industry: '', location: '', phase: '', verified: false, interviewed: false });
  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const text = `${p.company_name} ${p.industry ?? ''} ${p.location ?? ''} ${p.tagline ?? ''}`.toLowerCase();
      return (!applied.query || text.includes(applied.query.toLowerCase()))
        && (!applied.industry || p.industry?.includes(applied.industry))
        && (!applied.location || p.location?.includes(applied.location))
        && (!applied.phase || p.current_phase === applied.phase)
        && (!applied.verified || p.verified_identity || p.verified_corporate)
        && (!applied.interviewed || p.verified_interview);
    });
  }, [profiles, applied]);
  const newEntrants = profiles.filter((p: any) => Date.now() - new Date(p.created_at).getTime() <= 7 * 24 * 60 * 60 * 1000);
  return (
    <div className="grid gap-5">
      <section className="glass rounded-[24px] p-5">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4">
          <Search size={18} />
          <input className="field border-0 bg-transparent" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="キーワード、業界、地域で検索" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <select className="field" value={filters.industry} onChange={(e) => setFilters({ ...filters, industry: e.target.value })}><option value="">業界すべて</option>{industryOptions.map((p) => <option key={p}>{p}</option>)}</select>
          <select className="field" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}><option value="">地域すべて</option>{locationOptions.map((p) => <option key={p}>{p}</option>)}</select>
          <select className="field" value={filters.phase} onChange={(e) => setFilters({ ...filters, phase: e.target.value })}><option value="">フェーズすべて</option>{phaseOptions.map((p) => <option key={p}>{p}</option>)}</select>
          <label className="pill"><input type="checkbox" onChange={(e) => setFilters({ ...filters, verified: e.target.checked })} /> 認証済み</label>
          <label className="pill"><input type="checkbox" onChange={(e) => setFilters({ ...filters, interviewed: e.target.checked })} /> 運営面談済み</label>
        </div>
        <button className="btn-primary mt-4 w-full" onClick={() => setApplied({ ...filters, query })}><Search size={17} /> この条件で検索する</button>
      </section>
      {newEntrants.length > 0 && (
        <section className="grid gap-3">
          <h3 className="text-xl font-black">新規参入</h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{newEntrants.map((p) => <StartupCard key={p.id} profile={p} onClick={() => openProfile(p)} />)}</div>
        </section>
      )}
      {filtered.length === 0 ? <EmptyState title="条件に一致する起業家はいません" body="検索条件を広げるか、起業家の登録を待ってください。" /> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((p) => <StartupCard key={p.id} profile={p} onClick={() => openProfile(p)} />)}</div>}
    </div>
  );
}

function StartupProfile({ profile, currentUser, refresh }: { profile: EntrepreneurProfile; currentUser: AppUser; refresh: () => Promise<void> }) {
  const [note, setNote] = useState('');
  const [meetingMessage, setMeetingMessage] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [comment, setComment] = useState('');
  const [investorGate, setInvestorGate] = useState<{ canContact: boolean; message: string }>({ canContact: currentUser.role !== 'investor', message: '' });

  useEffect(() => {
    async function loadGate() {
      if (!supabase || currentUser.role !== 'investor') return;
      const { data } = await supabase.from('investor_profiles').select('document_file_path').eq('user_id', currentUser.id).maybeSingle();
      setInvestorGate({
        canContact: Boolean(data?.document_file_path),
        message: data?.document_file_path ? '' : '投資家確認書類の提出が完了するまで、コメント・メッセージ・面談希望は利用できません。',
      });
    }
    loadGate();
  }, [currentUser.id, currentUser.role]);

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
    if (!investorGate.canContact) return;
    await supabase.from('meeting_requests').insert({
      entrepreneur_id: profile.id,
      investor_id: currentUser.id,
      message: meetingMessage,
      proposed_at: meetingDate || null,
    });
    await supabase.from('notifications').insert({ user_id: profile.user_id, type: 'meeting_request', body: '面談リクエストが届きました。' });
    setMeetingMessage('');
    setMeetingDate('');
    await refresh();
  }

  async function sendMessage() {
    if (!supabase) return;
    if (!investorGate.canContact) return;
    if (containsContactInfo(comment)) {
      await supabase.from('contact_suspicions').insert({ sender_id: currentUser.id, receiver_id: profile.user_id, body: comment, reason: 'メッセージ内に連絡先交換の疑いがあります。' });
      setComment('連絡先交換につながる可能性がある内容は送信できません。');
      return;
    }
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
        {profile.is_hidden && (
          <div className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
            このプロフィールは現在非公開です。月額費用の入金確認後、投資家に公開されます。
          </div>
        )}
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Metric label="現在フェーズ" value={profile.current_phase ?? '未入力'} icon={Rocket} />
          <Metric label="調達希望額" value={yen(profile.fundraising_amount)} icon={CircleDollarSign} />
          <Metric label="業界" value={profile.industry ?? '未入力'} icon={Building2} />
          <Metric label="所在地" value={profile.location ?? '未入力'} icon={UserRound} />
          <Metric label="最終ログイン" value={formatLastLogin((profile as any).users?.last_login_at)} icon={UserRound} />
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
            {!investorGate.canContact && <p className="mt-3 rounded-2xl bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">{investorGate.message}</p>}
            <label className="label mt-4">投資メモ<textarea className="field min-h-24" value={note} onChange={(e) => setNote(e.target.value)} /></label>
            <label className="label mt-4">面談メッセージ<textarea className="field min-h-24" value={meetingMessage} onChange={(e) => setMeetingMessage(e.target.value)} /></label>
            <label className="label mt-4">面談希望日時<input className="field" type="datetime-local" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} /></label>
            <button className="btn-primary mt-4 w-full" disabled={!investorGate.canContact} onClick={requestMeeting}><CalendarClock size={17} /> 面談希望を送る</button>
            <label className="label mt-4">メッセージ<textarea className="field min-h-24" value={comment} onChange={(e) => setComment(e.target.value)} /></label>
            <button className="btn-secondary mt-4 w-full" disabled={!investorGate.canContact} onClick={sendMessage}><Send size={17} /> メッセージ送信</button>
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
  async function requestConsultation() {
    if (!supabase) return;
    await supabase.from('contact_inquiries').insert({
      user_id: profile.user_id,
      category: 'pitch_consultation',
      body: `${profile.company_name} がピッチ資料の相談を希望しています。運営からメッセージで連絡してください。`,
    });
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

function AdminHome({ adminData, refresh }: { adminData: Record<string, any[]>; refresh: () => Promise<void> }) {
  async function update(table: string, id: string, patch: Record<string, any>, action: string) {
    await supabase!.from(table).update(patch).eq('id', id);
    await supabase!.from('admin_actions').insert({ target_type: table, target_id: id, action });
    await refresh();
  }
  const reports = adminData.reports ?? [];
  const entrepreneurs = adminData.entrepreneurs ?? [];
  const investors = adminData.investors ?? [];
  const missingPayment = entrepreneurs.filter((row) => row.payment_status !== 'paid' || row.is_hidden);
  const missingDocuments = investors.filter((row) => !row.document_file_path);
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="ユーザー一覧" value={`${adminData.users?.length ?? 0}`} icon={UsersRound} />
        <Metric label="起業家一覧" value={`${adminData.entrepreneurs?.length ?? 0}`} icon={Building2} />
        <Metric label="投稿一覧" value={`${adminData.posts?.length ?? 0}`} icon={FileText} />
        <Metric label="通報一覧" value={`${reports.length}`} icon={Flag} />
      </div>
      {reports.length === 0 && <EmptyState title="現在確認が必要な通報はありません。" />}
      <AdminTable title="メンバー一覧" rows={adminData.users ?? []} render={(row) => {
        const hasEntrepreneur = entrepreneurs.some((p) => p.user_id === row.id);
        const hasInvestor = investors.some((p) => p.user_id === row.id);
        return (
          <AdminRow key={row.id} title={row.email ?? row.id} meta={`電話番号: ${row.phone ?? '未登録'} / 最終ログイン: ${formatLastLogin(row.last_login_at)}`}>
            {hasEntrepreneur && <span className="pill"><Rocket size={13} /> 起業家</span>}
            {hasInvestor && <span className="pill"><CircleDollarSign size={13} /> 投資家</span>}
          </AdminRow>
        );
      }} />
      <AdminTable title="未対応ユーザー一覧" rows={[...missingPayment.map((row) => ({ ...row, kind: '起業家：月額費用未払い・非公開' })), ...missingDocuments.map((row) => ({ ...row, kind: '投資家：確認書類未提出' }))]} render={(row) => (
        <AdminRow key={`${row.kind}-${row.id}`} title={row.company_name || row.full_name || row.user_id} meta={row.kind}>
          <span className="pill">確認待ち</span>
        </AdminRow>
      )} />
      <AdminTable title="ユーザー承認・停止" rows={adminData.users ?? []} render={(row) => (
        <AdminRow key={row.id} title={row.email ?? row.id} meta={`${roleLabels[row.role as UserRole] ?? row.role} / プロフィール: ${row.profile_completed ? '完了' : '未完了'}`}>
          <button className="btn-secondary" onClick={() => update('users', row.id, { is_suspended: !row.is_suspended }, row.is_suspended ? 'ユーザー停止解除' : 'ユーザー停止')}>{row.is_suspended ? '停止解除' : '停止'}</button>
        </AdminRow>
      )} />
      <AdminTable title="起業家審査・バッジ付与" rows={adminData.entrepreneurs ?? []} render={(row) => (
        <AdminRow key={row.id} title={row.company_name} meta={`${row.industry ?? '業界未入力'} / 公開: ${row.is_hidden ? '非公開' : '公開中'} / 支払い: ${paymentLabels[row.payment_status] ?? '未入金'} / プラン: ${row.payment_plan_label ?? '未選択'} ${row.payment_plan_amount ? yen(row.payment_plan_amount) : ''} / 振込名義: ${row.payment_transfer_name ?? '未申請'}`}>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_identity: !row.verified_identity }, '本人確認ステータス変更')}>本人確認</button>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_corporate: !row.verified_corporate }, '法人確認ステータス変更')}>法人確認</button>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_interview: !row.verified_interview }, '運営面談済みバッジ付与')}>面談済み</button>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { verified_revenue: !row.verified_revenue }, '売上確認済みバッジ付与')}>売上確認</button>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { payment_status: 'paid', paid_at: new Date().toISOString(), subscription_ends_at: calcSubscriptionEnd(row.payment_plan_months), is_hidden: false }, '入金確認・プロフィール公開')}>入金確認して公開</button>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { meeting_ticket_balance: (row.meeting_ticket_balance ?? 0) + (row.meeting_ticket_requested_count ?? 0), meeting_ticket_payment_status: 'paid' }, '面談チケット着金確認')}>チケット付与</button>
          <button className="btn-secondary" onClick={() => update('entrepreneur_profiles', row.id, { is_hidden: !row.is_hidden }, row.is_hidden ? '起業家プロフィール再公開' : '起業家プロフィール非公開')}>{row.is_hidden ? '公開' : '非公開'}</button>
        </AdminRow>
      )} />
      <AdminTable title="連絡先交換の疑い" rows={adminData.contactSuspicions ?? []} render={(row) => (
        <AdminRow key={row.id} title={row.reason} meta={row.body}>
          <span className="pill">送信ブロック済み</span>
        </AdminRow>
      )} />
      <AdminTable title="ユーザーメッセージ確認" rows={adminData.allMessages ?? []} render={(row) => (
        <AdminRow key={row.id} title={row.body} meta={`送信者: ${row.sender_id} / 受信者: ${row.receiver_id} / ${new Date(row.created_at).toLocaleString('ja-JP')}`}>
          <span className="pill">管理確認</span>
        </AdminRow>
      )} />
      <AdminTable title="投稿非表示" rows={adminData.posts ?? []} render={(row) => (
        <AdminRow key={row.id} title={row.did_today} meta={new Date(row.created_at).toLocaleString('ja-JP')}>
          <button className="btn-secondary" onClick={() => update('progress_posts', row.id, { is_hidden: !row.is_hidden }, '投稿非表示')}>{row.is_hidden ? '再表示' : '非表示'}</button>
        </AdminRow>
      )} />
      <AdminTable title="面談リクエスト・チケット確認" rows={adminData.meetings ?? []} render={(row) => (
        <AdminRow key={row.id} title={row.message || '面談リクエスト'} meta={`状態: ${row.status} / チケット: ${row.ticket_plan ?? '1枚'} ${yen(row.ticket_amount)} / 入金: ${row.ticket_payment_status === 'paid' ? '確認済み' : '未確認'}`}>
          <button className="btn-secondary" onClick={() => update('meeting_requests', row.id, { status: 'confirmed', confirmed_at: new Date().toISOString() }, '面談日程確定')}>日程確定</button>
          <button className="btn-secondary" onClick={() => update('meeting_requests', row.id, { ticket_payment_status: 'paid' }, '面談チケット入金確認')}>チケット入金確認</button>
          <button className="btn-secondary" onClick={() => update('meeting_requests', row.id, { status: 'cancelled' }, '面談キャンセル')}>キャンセル</button>
        </AdminRow>
      )} />
    </div>
  );
}

function Messages({ currentUser, messages, meetings, refresh }: { currentUser: AppUser; messages: any[]; meetings: any[]; refresh: () => Promise<void> }) {
  const [supportBody, setSupportBody] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  async function markRead(id: string) {
    await supabase!.from('messages').update({ read_at: new Date().toISOString() }).eq('id', id);
    await refresh();
  }
  async function sendSupportMessage() {
    if (!supabase || !supportBody.trim()) return;
    await supabase.from('contact_inquiries').insert({
      user_id: currentUser.id,
      email: currentUser.email,
      category: 'support_message',
      body: supportBody,
    });
    setSupportBody('');
    setSupportMessage('運営サポートへメッセージを送信しました。');
  }
  return (
    <section className="grid gap-3">
      <article className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-emerald-300">運営サポート</p>
            <h3 className="mt-1 text-xl font-black">運営に相談する</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">支払い確認、ピッチ資料、登録情報、使い方の相談をここから運営へ送れます。</p>
          </div>
          <span className="pill"><ShieldCheck size={14} /> 常に表示</span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <textarea className="field min-h-24" value={supportBody} onChange={(e) => setSupportBody(e.target.value)} placeholder="運営へのメッセージを書く" />
          <button className="btn-primary self-stretch" onClick={sendSupportMessage}><Send size={17} /> 送信</button>
        </div>
        {supportMessage && <p className="mt-3 text-sm text-slate-300">{supportMessage}</p>}
      </article>
      <section className="grid gap-3">
        <h3 className="text-xl font-black">面談用メッセージ</h3>
        {meetings.length === 0 ? <p className="text-sm text-slate-400">双方同意後の面談用メッセージはここに表示されます。</p> : meetings.map((meeting) => (
          <article key={meeting.id} className="glass rounded-2xl p-4">
            <p className="font-bold">{meeting.message || '面談リクエスト'}</p>
            <p className="mt-1 text-xs text-slate-500">状態: {meeting.status} / 候補: {meeting.proposed_at ? new Date(meeting.proposed_at).toLocaleString('ja-JP') : '未設定'}</p>
            {currentUser.role === 'investor' && meeting.status === 'candidate_sent' && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-primary" onClick={async () => { await supabase!.from('meeting_requests').update({ status: 'mutual_agreed' }).eq('id', meeting.id); await refresh(); }}>この日程に同意</button>
                <button className="btn-secondary" onClick={async () => { await supabase!.from('meeting_requests').update({ status: 'investor_rejected_candidate' }).eq('id', meeting.id); await refresh(); }}>同意しない</button>
              </div>
            )}
            {meeting.status === 'mutual_agreed' && <p className="mt-3 rounded-2xl bg-emerald-300/10 p-3 text-sm text-emerald-100">双方同意済みです。起業家側が面談チケットを消費し、運営へ面談日程を報告してください。</p>}
          </article>
        ))}
      </section>
      {messages.length === 0 ? <EmptyState title="メッセージはまだありません" body="フォローや面談リクエスト後の1対1チャットがここに表示されます。" /> : messages.map((m) => (
        <article key={m.id} className="glass flex items-center justify-between gap-3 rounded-2xl p-4">
          <div><p className="font-bold">{m.body}</p><span className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString('ja-JP')}</span></div>
          {m.receiver_id === currentUser.id && !m.read_at && <button className="btn-secondary" onClick={() => markRead(m.id)}>既読</button>}
        </article>
      ))}
    </section>
  );
}

function SettingsPage({ currentUser, refresh }: { currentUser: AppUser; refresh: () => Promise<void> }) {
  const [emailEnabled, setEmailEnabled] = useState(currentUser.notification_email_enabled !== false);
  const [message, setMessage] = useState('');

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

  return (
    <section className="glass rounded-[28px] p-6">
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
      <p className="mt-4 rounded-2xl bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100">
        メール送信はSupabaseの通知キューに保存されます。Resendなどの送信処理を接続すると、コメント・メッセージ通知が自動送信されます。
      </p>
      {message && <p className="mt-4 rounded-2xl bg-white/8 p-3 text-sm text-slate-200">{message}</p>}
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

function PostCard({ post, currentUser, investor }: { post: ProgressPost; currentUser?: AppUser; investor?: InvestorProfile | null }) {
  const [comment, setComment] = useState('');
  const canComment = currentUser?.role !== 'investor' || Boolean(investor?.document_file_path);
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
    if (!canComment) return;
    if (containsContactInfo(comment)) {
      await supabase.from('contact_suspicions').insert({ sender_id: currentUser.id, receiver_id: post.user_id, body: comment, reason: 'コメント内に連絡先交換の疑いがあります。' });
      setComment('連絡先交換につながる可能性がある内容は送信できません。');
      return;
    }
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

function calcSubscriptionEnd(months?: number | null) {
  const date = new Date();
  date.setMonth(date.getMonth() + (months && months > 0 ? months : 1));
  return date.toISOString();
}
