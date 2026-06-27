'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  Edit3,
  EyeOff,
  FileText,
  Flag,
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
type IdentityStatus = 'none' | 'submitted' | 'verified' | 'resubmit';

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
  identityStatus: IdentityStatus;
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
  mission?: string;
  culture?: string;
  teamIntro?: string;
  personalityProfile?: string;
  workStyleSpeed?: string;
  workStyleTeam?: string;
  workStyleRisk?: string;
  profileImageName?: string;
  profileImageUrl?: string;
  dealDetails?: string;
  businessPlanName?: string;
  businessPlanUrl?: string;
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
  followingIds: string[];
  followerIds: string[];
  hideSocialGraph: boolean;
  achievements: string;
  isHidden: boolean;
  isDeleted: boolean;
  emailNotificationsEnabled: boolean;
  isBot: boolean;
  botKind: Role | '';
  age: string;
  gender: string;
  verified: boolean;
  tutorialCompleted: boolean;
  updatedAt?: string;
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

type BlogArticle = {
  id: string;
  authorId: string;
  title: string;
  body: string;
  tags: string[];
  visibility: Visibility;
  imageName: string;
  imageUrl: string;
  attachmentName: string;
  attachmentUrl: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  views: number;
};

type DirectMessage = {
  id: string;
  partnerId: string;
  senderId?: string;
  recipientId?: string;
  kind: MessageKind;
  body: string;
  createdAt: string;
  mine: boolean;
  attachmentName?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
  meetingStatus?: 'requested' | 'approved' | 'rejected';
};

type LeapCloudState = {
  accounts: Account[];
  posts: Post[];
  blogs?: BlogArticle[];
  messages: DirectMessage[];
  meetingApplications: MeetingApplication[];
  notices: Notice[];
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
  userId?: string;
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
  identityStatus: 'none',
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
  mission: '',
  culture: '',
  teamIntro: '',
  personalityProfile: '',
  workStyleSpeed: '3',
  workStyleTeam: '3',
  workStyleRisk: '3',
  profileImageName: '',
  profileImageUrl: '',
  dealDetails: '',
  businessPlanName: '',
  businessPlanUrl: '',
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
  followingIds: [],
  followerIds: [],
  hideSocialGraph: false,
  achievements: '',
  isHidden: false,
  isDeleted: false,
  emailNotificationsEnabled: true,
  isBot: false,
  botKind: '',
  age: '',
  gender: '',
  verified: false,
  tutorialCompleted: false,
  updatedAt: '',
};

const adminAccount: Account = {
  ...emptyAccount,
  id: 'leap-admin',
  role: 'investor',
  email: adminEmail,
  phone: '',
  emailVerified: true,
  accountName: 'leap_admin',
  name: 'Leap運営',
  company: 'Leap',
  title: '運営チーム',
  bio: 'Leap運営への相談・お問い合わせはこちらから送れます。',
  avatarLabel: '運',
  verified: true,
};

const aiPersonNames = ['山田 太郎', '佐藤 花子', '鈴木 健一', '田中 明', '伊藤 真央', '高橋 優', '渡辺 航', '中村 葵', '小林 直樹', '加藤 美咲', '吉田 悠斗', '山本 紗季', '井上 蓮', '木村 彩乃', '林 大輔', '清水 結衣', '斎藤 陽菜', '山崎 匠', '森 里奈', '池田 蒼', '橋本 凛', '石川 翔', '前田 菜月', '藤田 亮', '岡田 美月', '後藤 悠真', '長谷川 栞', '村上 智也', '近藤 愛', '遠藤 颯'];
const aiInvestorNames = ['松本 拓也', '藤原 玲奈', '青木 大地', '石井 美穂', '坂本 悠介', '西村 沙織', '福田 直人', '太田 佳奈', '三浦 健太', '原田 杏奈', '中川 智', '小川 真由', '岡本 裕也', '松田 千尋', '中島 亮介', '平野 彩', '上田 航平', '森田 奈緒', '内田 諒', '柴田 優香', '酒井 慎', '宮本 由衣', '横山 大輔', '安藤 萌', '島田 啓太', '片山 香織', '大野 翔太', '栗原 梨央', '西田 司', '杉山 美里'];
const aiCompanyWords = [
  'NextFlow', 'GreenBridge', 'RetailMind', 'CareSync', 'FinPulse', 'HRWave', 'LogiCore', 'EduLift', 'MedLink', 'LegalBase',
  'BuildVista', 'AgriNest', 'TravelMesh', 'FoodLoop', 'MediNote', 'SkillBridge', 'SalesPilot', 'FactoryOne', 'LocalGrid', 'PayNest',
  'ClinicPath', 'CarbonWorks', 'StudyPort', 'WorkShift', 'CraftBank', 'HomeLogi', 'EventHub', 'RiskScope', 'Wellnest', 'DataHarbor',
];
const aiInvestorFirms = [
  'Future Ventures', 'Seed Partners', 'Bridge Capital', 'Growth Angels', 'Impact Studio', 'North Star Capital', 'Blue Lake Partners', 'Tokyo Founders Fund', 'Orbit Ventures', 'Anchor Capital',
  'MIRAI Seed', 'River Growth', 'Launch Gate', 'First Check Partners', 'Sakura Capital', 'Horizon Angels', 'Next Stage Ventures', 'Basecamp Capital', 'Urban Innovation Fund', 'DeepTech Partners',
  'Local Impact Fund', 'FinEdge Capital', 'Health Bridge VC', 'Retail Innovation Partners', 'EduNext Fund', 'Climate Seed Lab', 'DX Growth Studio', 'Founders Orbit', 'Prime Angel Group', 'CrossBorder Ventures',
];
const aiIndustries = ['AI / SaaS', 'FinTech', 'ヘルスケア', 'HRTech', '物流DX', '教育', 'Climate Tech', '小売DX', 'リーガルテック', 'クリエイター支援'];
const aiBusinessDomains = [
  '商談後の顧客フォローを自動化するSaaS',
  '中小企業のCO2排出量を可視化するクラウド',
  '小売店舗の在庫と発注を予測するシステム',
  '介護事業所の記録と請求をつなぐ業務ツール',
  '個人事業主向けの資金繰り管理サービス',
  '採用候補者との接点を管理するHRプラットフォーム',
  '配送計画と倉庫作業を最適化する物流DX',
  '社会人学習の進捗を可視化する学習支援サービス',
  'クリニックの予約と問診を一体化するサービス',
  '契約レビューを効率化するリーガルSaaS',
  '建設現場の写真管理と報告書作成を支援するアプリ',
  '農家の収穫予測と販売計画を支えるツール',
  '宿泊施設の予約単価を改善する分析サービス',
  '飲食店のフードロスを減らす仕入れ管理ツール',
  '医療チーム内の申し送りを標準化するSaaS',
  'リスキリング研修を企業内で運用するサービス',
  '営業チームの提案資料を自動生成するツール',
  '製造ラインの異常検知を行うモニタリングSaaS',
  '自治体と地域事業者の情報共有を支える基盤',
  '請求と入金確認を効率化する決済管理サービス',
  'クリニックの来院導線を改善する患者向けアプリ',
  'サプライチェーンの環境負荷を見える化するSaaS',
  '学校外学習の成果を記録するポートフォリオ',
  'シフト作成と勤怠管理を統合する店舗向けツール',
  '職人と発注者をつなぐ受発注プラットフォーム',
  '住宅設備メンテナンスの日程調整サービス',
  'イベント運営の受付と導線を管理するアプリ',
  '中小企業の与信とリスクを可視化する分析サービス',
  '従業員の健康状態と面談記録を管理するツール',
  '社内データを横断検索するナレッジ基盤',
];
const aiFounderStories = [
  '現場の非効率をなくし、少人数でも大きな成果を出せる仕組みをつくっています。今は顧客の声を起点に、毎週プロダクト改善を重ねています。',
  '業界に残る手作業や属人的な判断を、使いやすいソフトウェアで置き換えることを目指しています。導入後の定着率を最重要指標にしています。',
  '一次情報を集めながら、小さく検証して伸びた施策に集中しています。投資家には成長の背景まで伝わるよう、進捗とKPIを公開しています。',
  'チーム全員で顧客課題を深く理解し、毎週の改善を積み上げています。短期の数字だけでなく、継続利用される理由づくりに取り組んでいます。',
];
const aiInvestorStories = [
  'シードからシリーズA前後の事業を中心に、創業者の学習速度と顧客理解を重視して見ています。数字の変化だけでなく、意思決定の質を確認します。',
  'AI、SaaS、DX領域で、課題の深さと再現性のある成長に注目しています。必要に応じて営業、採用、資金調達の壁打ちを支援します。',
  '初期の熱量と市場の広がりを大切にしています。投資検討では、継続率、紹介率、顧客単価の変化を中心に確認しています。',
];
const aiPostThemes = [
  '新規導入前の不安点を分解し、初回説明で伝える順番を変えました。次は導入後7日目の利用率を追って、どこでつまずくかを確認します。',
  '既存ユーザーの操作ログを見直し、最初に触られる機能と使われない機能を分けました。来週は使われていない機能を削る判断も含めて整理します。',
  '商談資料を数字中心から導入後の現場変化が伝わる構成に変えました。反応が良かったため、次回から事例ページにも反映します。',
  '問い合わせが多かった画面に補足テキストを追加しました。サポート工数が下がるかを見ながら、セルフオンボーディングに寄せていきます。',
  '週次レビューで、伸びているチャネルに営業時間を寄せることを決めました。小さな施策を続けるより、勝ち筋に集中します。',
];
const aiInvestorPostThemes = [
  '初期SaaSでは、売上の伸び方よりも解約理由の解像度を重視しています。学習速度が見える投稿は継続して追いやすいです。',
  '顧客課題が深い事業は、最初の数字が小さくても前進が見えます。今週は導入後の利用頻度と紹介発生の有無を中心に見ています。',
  'AI領域は機能差が短期間で埋まりやすいため、業務フローの中にどれだけ入り込めているかを確認しています。',
  '投資検討では、月次売上、継続率、顧客単価の変化をセットで見ています。特に単価が上がる理由が説明できる会社は強いです。',
  '市場規模だけではなく、最初の顧客がなぜ使い続けるのかを見ています。投稿から仮説検証の過程が見えると判断しやすいです。',
];

function hashText(text: string) {
  return Array.from(text).reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
}

function companyLogoLabel(company: string) {
  const cleaned = company.replace(/株式会社|合同会社|有限会社|Inc\.?|Corp\.?|LLC|Partners|Capital|Ventures|Fund|Studio|Group/gi, '').trim();
  const source = cleaned || company || 'L';
  const latin = source.match(/[A-Za-z0-9]/g)?.slice(0, 2).join('').toUpperCase();
  return latin || Array.from(source).slice(0, 2).join('');
}

function companyLogoDataUri(company: string, seed = 0) {
  const palettes = [
    { ink: '#111827', primary: '#111827', secondary: '#6b7280', paper: '#ffffff' },
    { ink: '#0f172a', primary: '#1d4ed8', secondary: '#64748b', paper: '#ffffff' },
    { ink: '#10231d', primary: '#047857', secondary: '#7c8a83', paper: '#ffffff' },
    { ink: '#2d1b08', primary: '#a16207', secondary: '#8b7355', paper: '#ffffff' },
    { ink: '#25143a', primary: '#6d28d9', secondary: '#7c6f8f', paper: '#ffffff' },
    { ink: '#2a121d', primary: '#be123c', secondary: '#8f6672', paper: '#ffffff' },
    { ink: '#102a36', primary: '#0e7490', secondary: '#64748b', paper: '#ffffff' },
    { ink: '#161616', primary: '#3f3f46', secondary: '#71717a', paper: '#ffffff' },
    { ink: '#1c1917', primary: '#92400e', secondary: '#78716c', paper: '#ffffff' },
    { ink: '#082f49', primary: '#0369a1', secondary: '#64748b', paper: '#ffffff' },
    { ink: '#0f2419', primary: '#166534', secondary: '#6b7b70', paper: '#ffffff' },
    { ink: '#1f2937', primary: '#334155', secondary: '#94a3b8', paper: '#ffffff' },
  ];
  const hash = Math.abs(hashText(company) + seed * 997);
  const palette = palettes[hash % palettes.length];
  const label = companyLogoLabel(company);
  const safeLabel = label.replace(/[<>&"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[char] || char));
  const style = hash % 24;
  const monoFont = `font-family="'Helvetica Neue', Arial, 'Hiragino Sans', sans-serif"`;
  const serifFont = `font-family="Georgia, 'Times New Roman', serif"`;
  const markColor = style % 5 === 0 ? palette.ink : palette.primary;
  const accent = palette.secondary;
  const marks = [
    `<path d="M49 107 80 47l31 60H94L80 80l-14 27H49Z" fill="${markColor}"/><path d="M80 58 95 91H65L80 58Z" fill="${palette.paper}"/>`,
    `<circle cx="80" cy="78" r="37" fill="none" stroke="${markColor}" stroke-width="12"/><path d="M58 78h44M80 56v44" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`,
    `<path d="M50 108V53h27c24 0 39 10 39 27s-15 28-39 28H50Zm17-16h12c12 0 20-4 20-12s-8-12-20-12H67v24Z" fill="${markColor}"/>`,
    `<path d="M80 43 115 63v40L80 123l-35-20V63l35-20Z" fill="none" stroke="${markColor}" stroke-width="10" stroke-linejoin="round"/><path d="M80 64 98 74v18l-18 10-18-10V74l18-10Z" fill="${accent}"/>`,
    `<rect x="50" y="49" width="60" height="60" rx="14" fill="${markColor}"/><path d="M64 80h32M80 64v32" stroke="${palette.paper}" stroke-width="9" stroke-linecap="round"/>`,
    `<path d="M49 103c7-34 29-54 63-54h6v17h-8c-24 0-39 14-44 37H49Z" fill="${markColor}"/><path d="M88 73h26v36H88z" fill="${accent}"/>`,
    `<path d="M50 105 64 55h15l-14 50H50Zm31 0 14-50h15l-14 50H81Z" fill="${markColor}"/><path d="M61 81h48" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`,
    `<path d="M45 80c17-27 53-39 88-19-18 28-54 40-88 19Z" fill="${markColor}"/><circle cx="80" cy="80" r="13" fill="${palette.paper}"/><circle cx="80" cy="80" r="6" fill="${accent}"/>`,
    `<path d="M48 57h64v15H48V57Zm0 31h64v15H48V88Z" fill="${markColor}"/><circle cx="118" cy="64" r="9" fill="${accent}"/><circle cx="42" cy="96" r="9" fill="${accent}"/>`,
    `<path d="M80 45c23 0 38 15 38 36s-15 36-38 36-38-15-38-36 15-36 38-36Zm0 16c-13 0-21 8-21 20s8 20 21 20 21-8 21-20-8-20-21-20Z" fill="${markColor}"/>`,
    `<path d="M80 43 113 109H47L80 43Z" fill="none" stroke="${markColor}" stroke-width="11" stroke-linejoin="round"/><circle cx="80" cy="82" r="8" fill="${accent}"/>`,
    `<rect x="46" y="52" width="68" height="56" rx="8" fill="none" stroke="${markColor}" stroke-width="10"/><path d="M62 72h36M62 88h22" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`,
    `<path d="M48 103c20-42 48-61 88-58-8 39-35 65-77 74 7-18 21-34 41-49-21 8-37 18-52 33Z" fill="${markColor}"/>`,
    `<path d="M48 56h24v58H48V56Zm40 0h24v58H88V56Z" fill="${markColor}"/><path d="M66 85h28" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`,
    `<path d="M43 60 80 39l37 21v42l-37 21-37-21V60Z" fill="${markColor}"/><path d="M80 39v84M43 60l74 42M117 60l-74 42" stroke="${palette.paper}" stroke-width="5" opacity=".9"/>`,
    `<path d="M80 42c31 0 50 22 43 52H91v28H69V94H37c-7-30 12-52 43-52Z" fill="${markColor}"/><path d="M60 73h40" stroke="${palette.paper}" stroke-width="9" stroke-linecap="round"/>`,
    `<path d="M55 108V53h18l28 32V53h17v55h-16L72 75v33H55Z" fill="${markColor}"/>`,
    `<path d="M45 109 80 50l35 59H96L80 82l-16 27H45Z" fill="${markColor}"/><path d="M43 50h74" stroke="${accent}" stroke-width="9" stroke-linecap="round"/>`,
    `<circle cx="62" cy="80" r="25" fill="${markColor}"/><circle cx="98" cy="80" r="25" fill="${accent}" opacity=".82"/><path d="M80 58c10 12 10 32 0 44-10-12-10-32 0-44Z" fill="${palette.paper}" opacity=".9"/>`,
    `<path d="M49 55h62v13H49V55Zm18 25h62v13H67V80Zm-18 25h62v13H49v-13Z" fill="${markColor}"/>`,
    `<path d="M80 45 119 78 80 111 41 78 80 45Z" fill="none" stroke="${markColor}" stroke-width="10" stroke-linejoin="round"/><path d="M63 78h34" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>`,
    `<path d="M52 108V52h56v16H70v8h33v15H70v17H52Z" fill="${markColor}"/><circle cx="111" cy="58" r="8" fill="${accent}"/>`,
    `<path d="M81 43c22 0 38 14 40 34H99c-3-9-9-14-18-14-13 0-21 9-21 22s8 22 21 22c9 0 16-5 19-14h22c-4 20-20 34-41 34-27 0-45-18-45-42s18-42 45-42Z" fill="${markColor}"/>`,
    `<path d="M49 110 80 48l31 62H49Z" fill="${markColor}"/><path d="M49 48h62" stroke="${accent}" stroke-width="9" stroke-linecap="round"/>`,
  ];
  const labelTreatments = [
    `<text x="80" y="134" text-anchor="middle" ${monoFont} font-size="${safeLabel.length > 1 ? 15 : 22}" font-weight="800" letter-spacing="1.8" fill="${palette.ink}">${safeLabel}</text>`,
    `<text x="80" y="136" text-anchor="middle" ${serifFont} font-size="${safeLabel.length > 1 ? 18 : 27}" font-weight="700" letter-spacing=".3" fill="${palette.ink}">${safeLabel}</text>`,
    `<path d="M56 126h48" stroke="${accent}" stroke-width="3" stroke-linecap="round"/><text x="80" y="120" text-anchor="middle" ${monoFont} font-size="${safeLabel.length > 1 ? 14 : 20}" font-weight="700" letter-spacing="2.8" fill="${palette.ink}">${safeLabel}</text>`,
    `<text x="80" y="132" text-anchor="middle" ${monoFont} font-size="${safeLabel.length > 1 ? 14 : 21}" font-weight="500" letter-spacing="3.6" fill="${palette.ink}">${safeLabel}</text>`,
  ];
  const mark = marks[style % marks.length];
  const frame = style % 6 === 0
    ? `<rect x="12" y="12" width="136" height="136" rx="30" fill="none" stroke="#e5e7eb" stroke-width="2"/>`
    : style % 6 === 1
      ? `<circle cx="80" cy="80" r="67" fill="none" stroke="#e5e7eb" stroke-width="2"/>`
      : style % 6 === 2
        ? `<path d="M30 35h100M30 125h100" stroke="#e5e7eb" stroke-width="2"/>`
        : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="34" fill="${palette.paper}"/><rect x="1" y="1" width="158" height="158" rx="33" fill="none" stroke="#e5e7eb" stroke-width="1"/>${frame}<g>${mark}</g>${labelTreatments[style % labelTreatments.length]}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function dynamicAiKpi(index: number, role: Role) {
  const weeks = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const momentum = (weeks + index * 3) % 18;
  if (role === 'entrepreneur') {
    return {
      monthlyRevenue: `${120 + index * 13 + momentum * 4}万円`,
      growthRate: `+${10 + (momentum % 22)}%`,
      customerCount: `${10 + index + Math.floor(momentum / 2)}社`,
      fundingGoal: `${(index % 5) + 1},000万円`,
    };
  }
  return {
    investmentRange: ['500万円〜3,000万円', '1,000万円〜1億円', '3,000万円〜3億円'][index % 3],
    supportAreas: ['事業戦略', '採用支援', '営業支援', '資金調達', 'ネットワーク提供'][index % 5],
  };
}

function createAiAccounts(): Account[] {
  const entrepreneurs = aiPersonNames.map((name, index): Account => ({
    ...emptyAccount,
    ...dynamicAiKpi(index, 'entrepreneur'),
    id: `ai-entrepreneur-${index + 1}`,
    role: 'entrepreneur',
    email: `ai-entrepreneur-${index + 1}@leap.local`,
    phone: '',
    emailVerified: true,
    accountName: `${aiCompanyWords[index]}株式会社`,
    name,
    company: `${aiCompanyWords[index % aiCompanyWords.length]}株式会社`,
    title: '代表取締役',
    industry: aiIndustries[index % aiIndustries.length],
    location: locations[index % locations.length],
    stage: stages[(index % (stages.length - 1)) + 1],
    foundedYear: String(2020 + (index % 6)),
    foundedMonth: `${(index % 12) + 1}月`,
    employeeSize: employeeSizes[index % employeeSizes.length],
    revenueScale: revenueScales[(index % (revenueScales.length - 1)) + 1],
    bio: `${aiFounderStories[index % aiFounderStories.length]}\n\n現在は「${aiBusinessDomains[index % aiBusinessDomains.length]}」を提供し、現場の声をもとにプロダクトと導入体験を改善しています。`,
    achievements: `${accountAchievementTitle(index)}\n・週次のKPIレビューを継続\n・顧客ヒアリングを累計${35 + index * 4}件実施\n・導入後オンボーディング改善を毎月実施`,
    avatarLabel: '',
    avatarUrl: companyLogoDataUri(`${aiCompanyWords[index % aiCompanyWords.length]}株式会社`, index),
    isBot: true,
    botKind: 'entrepreneur',
    age: `${28 + (index % 18)}歳`,
    gender: index % 2 === 0 ? '男性' : '女性',
    verified: true,
  }));
  const investors = aiInvestorNames.map((name, index): Account => ({
    ...emptyAccount,
    ...dynamicAiKpi(index, 'investor'),
    id: `ai-investor-${index + 1}`,
    role: 'investor',
    email: `ai-investor-${index + 1}@leap.local`,
    phone: '',
    emailVerified: true,
    accountName: aiInvestorFirms[index],
    name,
    company: aiInvestorFirms[index],
    title: index % 3 === 0 ? 'パートナー' : '投資担当',
    industry: aiIndustries[index % aiIndustries.length],
    location: locations[(index + 12) % locations.length],
    stage: ['プレシード', 'シード', 'シリーズA'][index % 3],
    foundedYear: String(2014 + (index % 10)),
    foundedMonth: `${(index % 12) + 1}月`,
    employeeSize: employeeSizes[(index + 2) % employeeSizes.length],
    revenueScale: revenueScales[(index % (revenueScales.length - 1)) + 1],
    bio: aiInvestorStories[index % aiInvestorStories.length],
    achievements: `投資検討領域：${aiIndustries[index % aiIndustries.length]}\n支援可能領域：${['事業戦略', '採用支援', '営業支援', '資金調達', 'ネットワーク提供'][index % 5]}\n公開プロフィールと投稿内容をもとに継続的に案件を確認しています。`,
    avatarLabel: '',
    avatarUrl: companyLogoDataUri(aiInvestorFirms[index], index + 100),
    isBot: true,
    botKind: 'investor',
    age: `${32 + (index % 22)}歳`,
    gender: index % 2 === 0 ? '男性' : '女性',
    verified: true,
  }));
  return [...entrepreneurs, ...investors];
}

const aiAccounts = createAiAccounts();

function accountAchievementTitle(index: number) {
  return ['初期顧客の獲得', '継続率の改善', '営業導線の整理', 'プロダクト改善', '採用体制の構築'][index % 5];
}

function recentWeekdayDate(accountIndex: number, postIndex: number) {
  const now = new Date();
  const date = new Date(now);
  const minutesInDay = 24 * 60;
  const scheduledMinutes = (accountIndex * 37 + postIndex * 113) % minutesInDay;
  date.setHours(Math.floor(scheduledMinutes / 60), scheduledMinutes % 60, 0, 0);
  if (date.getTime() > now.getTime()) date.setDate(date.getDate() - 1);
  date.setDate(date.getDate() - postIndex);
  return date.toISOString();
}

function createEntrepreneurPostBody(account: Account, accountIndex: number, postIndex: number) {
  const domain = aiBusinessDomains[accountIndex % aiBusinessDomains.length];
  const theme = aiPostThemes[(accountIndex + postIndex) % aiPostThemes.length];
  const focus = ['初回導入', '商談後フォロー', '継続利用', '単価改善', '紹介発生', 'サポート削減'][accountIndex % 6];
  const nextAction = ['画面文言を短くする', '導入事例を追加する', '利用ログを深掘りする', '営業資料を業界別に分ける', 'オンボーディング動画を撮る', '解約理由を分類する'][(accountIndex + postIndex) % 6];
  switch ((accountIndex * 5 + postIndex) % 12) {
    case 0:
      return `今日の進捗メモ。\n\n${account.company}では「${domain}」の${focus}を見直しました。${theme}\n\n次は${nextAction}予定です。`;
    case 1:
      return `数字から見ると、今月は月間売上${account.monthlyRevenue}、導入社数${account.customerCount}。\n\n伸びている一方で、最初の設定で止まるユーザーがまだいます。今週はそこだけに絞って改善します。`;
    case 2:
      return `顧客ヒアリングで刺さった一言。\n「便利そう」より「明日から使えそう」と言われた時の方が受注に近い。\n\n${domain}は、機能説明より導入後の業務イメージを先に見せる方針に変えます。`;
    case 3:
      return `今週やったこと\n・${focus}のボトルネック確認\n・既存顧客への使い方ヒアリング\n・営業資料の1ページ目を差し替え\n\n小さい修正ですが、商談の温度感が少し変わりました。`;
    case 4:
      return `${account.company}の課題共有です。\n\n${domain}は説明すれば価値が伝わるのですが、説明前に離脱する人がいます。次はファーストビューで「誰の何を減らすのか」が伝わるようにします。`;
    case 5:
      return `KPI更新。\n成長率：${account.growthRate}\n導入社数：${account.customerCount}\n月間売上：${account.monthlyRevenue}\n\n数字は悪くないですが、問い合わせ対応の属人化が見えてきました。サポート導線を整えます。`;
    case 6:
      return `今日はプロダクトより営業プロセスの日でした。\n\n${domain}の商談で、導入決裁者と実際に使う人の見ているポイントが違うことが分かりました。資料を2種類に分けます。`;
    case 7:
      return `小さな勝ち。\n既存顧客から「社内で紹介したい」と言ってもらえました。\n\nまだ再現性はありませんが、${focus}の改善が効いている可能性があります。紹介が出た理由を聞き切ります。`;
    case 8:
      return `反省。\n今週は機能追加に寄りすぎました。\n\n${account.company}に今必要なのは多機能化ではなく、初回利用の迷いを減らすこと。来週は新機能を止めて、既存導線を磨きます。`;
    case 9:
      return `投資家の方に見てほしいポイント。\n\n${domain}は市場規模よりも、現場で毎週使われるかが重要です。今は導入後2週間の利用頻度を一番追っています。`;
    case 10:
      return `今週の意思決定：${nextAction}。\n\n理由はシンプルで、商談では興味を持たれるのに利用開始で止まるからです。受注数より先に、利用開始率を上げます。`;
    default:
      return `${account.company}の近況です。\n\n${theme}\n\n${domain}を必要としている会社に、もっと短い時間で価値が伝わるように磨き込みます。`;
  }
}

function createInvestorPostBody(account: Account, accountIndex: number, postIndex: number) {
  const theme = aiInvestorPostThemes[(accountIndex + postIndex) % aiInvestorPostThemes.length];
  const lens = ['継続率', '顧客単価', '紹介発生率', '導入スピード', '創業者の学習速度', '市場の切実さ'][accountIndex % 6];
  const sector = account.industry || aiIndustries[accountIndex % aiIndustries.length];
  switch ((accountIndex * 7 + postIndex) % 12) {
    case 0:
      return `${account.company}の投資メモ。\n\n今日は${sector}領域で${lens}が見える会社を中心に確認しています。${theme}`;
    case 1:
      return `初期案件を見る時、最初に確認するのは売上の大きさではなく「なぜ今伸びているのか」です。\n\n${sector}では特に${lens}の説明があると追いやすいです。`;
    case 2:
      return `面談前に見たい投稿\n・顧客が誰か\n・今週何を学んだか\n・数字がなぜ変わったか\n\nこの3つがあると、初回面談の質がかなり上がります。`;
    case 3:
      return `最近の関心は${sector}。\n\n派手な機能より、現場の作業が本当に減っているかを見ています。プロダクトの説明より、導入後の変化が知りたいです。`;
    case 4:
      return `投資レンジは${account.investmentRange}。\n今週は、初期顧客の熱量が高い会社を優先して見ています。\n\n数字が小さくても、使われ方が濃い事業は追い続けたいです。`;
    case 5:
      return `支援できること：${account.supportAreas}。\n\n投稿で課題が具体的に書かれていると、投資前でも何を手伝えるか考えやすいです。`;
    case 6:
      return `メモ：${lens}が伸びている会社は、投稿の粒度も具体的なことが多い。\n\nやったことだけでなく、なぜそう判断したかが見えると強いです。`;
    case 7:
      return `${sector}の案件で見落としがちなのは、導入後の運用負荷。\n\n売れるかだけでなく、使い続けるために誰が何をするのかを見ています。`;
    case 8:
      return `今週のチェック項目は3つ。\n1. 顧客課題の頻度\n2. 導入後の継続理由\n3. 次の打ち手の具体性\n\n${theme}`;
    case 9:
      return `創業者の投稿で好きなのは、うまくいった話より「外した仮説」の共有です。\n\n学習の速さが見えるので、継続して見たくなります。`;
    case 10:
      return `${account.company}では、${sector}の中でも最初の顧客が強く使っている会社を探しています。\n\n大きな市場より、まず濃い利用。そこから広がるかを見ます。`;
    default:
      return `投資検討の観点を少し共有します。\n\n${theme}\n\n投稿に数字と背景がセットであると、判断材料としてかなり使いやすいです。`;
  }
}

function createAiPosts(accounts: Account[]): Post[] {
  return accounts.flatMap((account, accountIndex) => Array.from({ length: 5 }, (_, postIndex) => {
    return {
      id: `ai-post-${account.id}-${postIndex + 1}`,
      authorId: account.id,
      body: account.role === 'entrepreneur'
        ? createEntrepreneurPostBody(account, accountIndex, postIndex)
        : createInvestorPostBody(account, accountIndex, postIndex),
      tags: account.role === 'entrepreneur' ? ['進捗', account.industry] : ['投資観点', account.industry],
      visibility: 'public' as const,
      attachmentName: '',
      imageName: '',
      imageUrl: '',
      isHidden: false,
      actionUserIds: { likes: [], saves: [], meetings: [] },
      createdAt: recentWeekdayDate(accountIndex, postIndex),
      likes: 0,
      saves: 0,
      meetings: 0,
      views: 0,
    };
  }));
}

function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function containsContactInfo(value: string) {
  const text = value.toLowerCase();
  return [
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
    /(?:0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{3,4})/,
    /line\s*(id|:|：)/i,
    /https?:\/\/(?:line\.me|lin\.ee|zoom\.us|meet\.google\.com)/i,
  ].some((pattern) => pattern.test(text));
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

function normalizeAccount(account: Account): Account {
  const hasIdentityMaterial = Boolean(account.corporateNumber || account.licenseFileName);
  const identityStatus = account.identityStatus || (account.verified ? 'verified' : hasIdentityMaterial ? 'submitted' : 'none');
  const isManagedAccount = Boolean(account.isBot || account.botKind);
  const avatarUrl = account.avatarUrl || (isManagedAccount ? companyLogoDataUri(account.company || account.accountName || account.name || account.id, Math.abs(hashText(account.id || account.email || account.company))) : '');
  return {
    ...emptyAccount,
    ...account,
    avatarUrl,
    identityStatus,
    followingIds: Array.isArray(account.followingIds) ? account.followingIds : [],
    followerIds: Array.isArray(account.followerIds) ? account.followerIds : [],
    hideSocialGraph: Boolean(account.hideSocialGraph),
    achievements: account.achievements || '',
    isHidden: Boolean(account.isHidden),
    isDeleted: Boolean(account.isDeleted),
    emailNotificationsEnabled: account.emailNotificationsEnabled !== false,
    isBot: isManagedAccount,
    botKind: account.botKind || '',
    age: account.age || '',
    gender: account.gender || '',
    ticketTransferName: account.ticketTransferName || '',
    tutorialCompleted: Boolean(account.tutorialCompleted),
    updatedAt: account.updatedAt || '',
    verified: identityStatus === 'verified' || identityStatus === 'submitted',
  };
}

function displayAccountName(account?: Account | null): string {
  if (!account) return 'アカウント未設定';
  const candidates = [account.accountName, account.name, account.company, account.email?.split('@')[0]];
  const name = candidates.find((value) => {
    const text = (value || '').trim();
    return text && !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(text);
  });
  return name || 'アカウント未設定';
}

function displayPostAuthorName(account?: Account | null): string {
  const name = account?.name?.trim();
  return name || '名前未設定';
}

function scrollContentToTop() {
  const scroll = () => {
    document.querySelector<HTMLElement>('[data-app-scroll]')?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  };
  scroll();
  requestAnimationFrame(() => {
    scroll();
    requestAnimationFrame(() => {
      scroll();
    });
  });
  setTimeout(scroll, 80);
}

function replaceAccountIds(text: string, accounts: Account[]): string {
  return accounts.reduce((body, account) => body.replaceAll(account.id, displayAccountName(account)), text);
}

async function loadCloudState(): Promise<LeapCloudState | null> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from('app_state').select('data').eq('key', 'leap-main').maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.data) return null;
  const cloud = data.data as LeapCloudState;
  return { ...cloud, accounts: (cloud.accounts ?? []).map(normalizeAccount), posts: cloud.posts ?? [], blogs: cloud.blogs ?? [], messages: cloud.messages ?? [], meetingApplications: cloud.meetingApplications ?? [], notices: cloud.notices ?? [] };
}

async function saveCloudState(state: LeapCloudState) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  const { error } = await supabase.from('app_state').upsert({ key: 'leap-main', data: state, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
}

function mergeById<T extends { id: string }>(local: T[], cloud: T[]): T[] {
  const map = new Map<string, T>();
  local.forEach((item) => map.set(item.id, item));
  cloud.forEach((item) => map.set(item.id, { ...(map.get(item.id) ?? {} as T), ...item }));
  return Array.from(map.values());
}

function newerAccount(local: Account | undefined, cloud: Account): Account {
  if (!local) return normalizeAccount(cloud);
  const normalizedLocal = normalizeAccount(local);
  const normalizedCloud = normalizeAccount(cloud);
  const localTime = normalizedLocal.updatedAt ? new Date(normalizedLocal.updatedAt).getTime() : 0;
  const cloudTime = normalizedCloud.updatedAt ? new Date(normalizedCloud.updatedAt).getTime() : 0;
  return cloudTime > localTime ? normalizedCloud : normalizedLocal;
}

function mergeAccounts(local: Account[], cloud: Account[]): Account[] {
  const map = new Map<string, Account>();
  local.map(normalizeAccount).forEach((account) => map.set(account.id, account));
  cloud.map(normalizeAccount).forEach((account) => map.set(account.id, newerAccount(map.get(account.id), account)));
  return Array.from(map.values());
}

function applyFollowChange(accounts: Account[], current: Account, target: Account, alreadyFollowing: boolean, now = new Date().toISOString()): { accounts: Account[]; followingIds: string[] } {
  const normalizedCurrent = normalizeAccount(current);
  const normalizedTarget = normalizeAccount(target);
  const followingIds = alreadyFollowing
    ? normalizedCurrent.followingIds.filter((id) => id !== normalizedTarget.id)
    : (normalizedCurrent.followingIds.includes(normalizedTarget.id) ? normalizedCurrent.followingIds : [...normalizedCurrent.followingIds, normalizedTarget.id]);
  const followerIds = alreadyFollowing
    ? normalizedTarget.followerIds.filter((id) => id !== normalizedCurrent.id)
    : (normalizedTarget.followerIds.includes(normalizedCurrent.id) ? normalizedTarget.followerIds : [...normalizedTarget.followerIds, normalizedCurrent.id]);
  const map = new Map<string, Account>();
  accounts.map(normalizeAccount).forEach((account) => map.set(account.id, account));
  map.set(normalizedCurrent.id, { ...(map.get(normalizedCurrent.id) ?? normalizedCurrent), followingIds, updatedAt: now });
  map.set(normalizedTarget.id, { ...(map.get(normalizedTarget.id) ?? normalizedTarget), followerIds, updatedAt: now });
  return { accounts: Array.from(map.values()).map(normalizeAccount), followingIds };
}

function mergeCloudState(local: LeapCloudState, cloud: LeapCloudState): LeapCloudState {
  return {
    accounts: mergeAccounts(local.accounts, cloud.accounts),
    posts: mergeById(local.posts, cloud.posts),
    blogs: mergeById(local.blogs ?? [], cloud.blogs ?? []),
    messages: mergeById(local.messages, cloud.messages),
    meetingApplications: mergeById(local.meetingApplications, cloud.meetingApplications),
    notices: mergeById(local.notices, cloud.notices),
  };
}

function withAdminAccount(accounts: Account[]): Account[] {
  const normalizedAll = accounts.map(normalizeAccount);
  const savedById = new Map(normalizedAll.map((account) => [account.id, account]));
  const restoreSystemAccount = (systemAccount: Account) => {
    const saved = savedById.get(systemAccount.id);
    if (!saved) return normalizeAccount(systemAccount);
    return normalizeAccount({
      ...systemAccount,
      followingIds: saved.followingIds,
      followerIds: saved.followerIds,
      hideSocialGraph: saved.hideSocialGraph,
      ticketBalance: saved.ticketBalance,
      ticketRequestStatus: saved.ticketRequestStatus,
      ticketRequestPlan: saved.ticketRequestPlan,
      ticketTransferName: saved.ticketTransferName,
      updatedAt: saved.updatedAt,
    });
  };
  const systemIds = new Set([adminAccount.id, ...aiAccounts.map((account) => account.id)]);
  const normalized = normalizedAll.filter((account) => !systemIds.has(account.id) && account.email.trim().toLowerCase() !== adminEmail && !account.isBot);
  return [restoreSystemAccount(adminAccount), ...aiAccounts.map(restoreSystemAccount), ...normalized];
}

async function sendDirectEmail(to: string | string[], subject: string, body: string): Promise<{ ok: boolean; error?: string; sent?: number; failed?: number }> {
  const recipients = Array.from(new Set((Array.isArray(to) ? to : [to]).map((email) => email.trim().toLowerCase()).filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))));
  if (recipients.length === 0) return { ok: false, error: '送信先メールアドレスがありません。' };
  try {
    const response = await fetch('/api/send-direct-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: recipients, subject, body }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, error: result.error || `メール送信に失敗しました。status=${response.status}` };
    return { ok: true, sent: result.sent ?? recipients.length, failed: result.failed, error: result.error };
  } catch {
    return { ok: false, error: 'メール送信APIに接続できませんでした。' };
  }
}

function canReceiveBroadcastEmail(account: Account) {
  const email = account.email.trim().toLowerCase();
  return !account.isBot && !account.isDeleted && account.emailNotificationsEnabled !== false && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.endsWith('.local');
}

function readFileAsDataUrl(file: File, onDone: (url: string) => void) {
  const reader = new FileReader();
  reader.onload = () => onDone(String(reader.result));
  reader.readAsDataURL(file);
}

function isSupabaseEmailConfirmed(user: { email_confirmed_at?: string | null; confirmed_at?: string | null } | null | undefined): boolean {
  return Boolean(user?.email_confirmed_at || user?.confirmed_at);
}

type SupabaseUserLike = {
  id?: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

export default function LeapApp() {
  const [page, setPage] = useState<Page>('feed');
  const [feedTab, setFeedTab] = useState<FeedTab>('recommended');
  const [accounts, setAccounts] = useState<Account[]>(() => loadLocal('leap.accounts', []));
  const [currentAccountId, setCurrentAccountId] = useState(() => loadLocal('leap.currentAccountId', ''));
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [posts, setPosts] = useState<Post[]>(() => loadLocal('leap.posts', []));
  const [blogs, setBlogs] = useState<BlogArticle[]>(() => loadLocal('leap.blogs', []));
  const [messages, setMessages] = useState<DirectMessage[]>(() => loadLocal('leap.messages', []));
  const [meetingApplications, setMeetingApplications] = useState<MeetingApplication[]>(() => loadLocal('leap.meetingApplications', []));
  const [notices, setNotices] = useState<Notice[]>(() => loadLocal('leap.notices', []));
  const [following, setFollowing] = useState<string[]>(() => loadLocal('leap.following', []));
  const [savedPosts, setSavedPosts] = useState<string[]>(() => loadLocal('leap.savedPosts', []));
  const [readMessageIds, setReadMessageIds] = useState<string[]>(() => loadLocal('leap.readMessageIds', []));
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
  const [showBlogComposer, setShowBlogComposer] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [blogBody, setBlogBody] = useState('');
  const [blogTags, setBlogTags] = useState('');
  const [blogVisibility, setBlogVisibility] = useState<Visibility>('public');
  const [blogImageName, setBlogImageName] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');
  const [blogAttachmentName, setBlogAttachmentName] = useState('');
  const [blogAttachmentUrl, setBlogAttachmentUrl] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [messageMode, setMessageMode] = useState<MessageKind>('direct');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [darkMode, setDarkMode] = useState(() => loadLocal('leap.darkMode', false));
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudError, setCloudError] = useState('');
  const [authBootstrapped, setAuthBootstrapped] = useState(false);
  const [authenticatedEmail, setAuthenticatedEmail] = useState('');
  const [systemPostActions, setSystemPostActions] = useState<Record<string, Post['actionUserIds']>>({});

  useEffect(() => saveLocal('leap.accounts', accounts), [accounts]);
  useEffect(() => saveLocal('leap.currentAccountId', currentAccountId), [currentAccountId]);
  useEffect(() => saveLocal('leap.posts', posts), [posts]);
  useEffect(() => saveLocal('leap.blogs', blogs), [blogs]);
  useEffect(() => saveLocal('leap.messages', messages), [messages]);
  useEffect(() => saveLocal('leap.meetingApplications', meetingApplications), [meetingApplications]);
  useEffect(() => saveLocal('leap.notices', notices), [notices]);
  useEffect(() => saveLocal('leap.following', following), [following]);
  useEffect(() => saveLocal('leap.savedPosts', savedPosts), [savedPosts]);
  useEffect(() => saveLocal('leap.readMessageIds', readMessageIds), [readMessageIds]);
  useEffect(() => saveLocal('leap.darkMode', darkMode), [darkMode]);
  useEffect(() => {
    function syncAcrossTabs(event: StorageEvent) {
      if (event.key === 'leap.accounts') setAccounts(loadLocal('leap.accounts', []));
      if (event.key === 'leap.posts') setPosts(loadLocal('leap.posts', []));
      if (event.key === 'leap.blogs') setBlogs(loadLocal('leap.blogs', []));
      if (event.key === 'leap.messages') setMessages(loadLocal('leap.messages', []));
      if (event.key === 'leap.meetingApplications') setMeetingApplications(loadLocal('leap.meetingApplications', []));
      if (event.key === 'leap.notices') setNotices(loadLocal('leap.notices', []));
    }
    window.addEventListener('storage', syncAcrossTabs);
    return () => window.removeEventListener('storage', syncAcrossTabs);
  }, []);
  useEffect(() => {
    loadCloudState().then((cloud) => {
      if (cloud) {
        const merged = mergeCloudState({ accounts: accounts.map(normalizeAccount), posts, blogs, messages, meetingApplications, notices }, cloud);
        setAccounts(merged.accounts);
        setPosts(merged.posts);
        setBlogs(merged.blogs ?? []);
        setMessages(merged.messages);
        setMeetingApplications(merged.meetingApplications);
        setNotices(merged.notices);
      }
      setCloudReady(true);
      setCloudError('');
    }).catch((error) => {
      setCloudError(`クラウド同期に失敗しています：${error.message}`);
      setCloudReady(true);
    });
  }, []);
  useEffect(() => {
    if (!cloudReady) return;
    const timer = window.setInterval(() => {
      loadCloudState().then((cloud) => {
        if (!cloud) return;
        const merged = mergeCloudState({ accounts: accounts.map(normalizeAccount), posts, blogs, messages, meetingApplications, notices }, cloud);
        setAccounts(merged.accounts);
        setPosts(merged.posts);
        setBlogs(merged.blogs ?? []);
        setMessages(merged.messages);
        setMeetingApplications(merged.meetingApplications);
        setNotices(merged.notices);
        setCloudError('');
      }).catch((error) => {
        setCloudError(`クラウド同期に失敗しています：${error.message}`);
      });
    }, 8000);
    return () => window.clearInterval(timer);
  }, [accounts, blogs, cloudReady, meetingApplications, messages, notices, posts]);
  useEffect(() => {
    if (!cloudReady) return;
    const timer = window.setTimeout(() => {
      saveCloudState({ accounts: accounts.map(normalizeAccount), posts, blogs, messages, meetingApplications, notices })
        .then(() => setCloudError(''))
        .catch((error) => setCloudError(`クラウド同期に失敗しています：${error.message}`));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [accounts, blogs, cloudReady, meetingApplications, messages, notices, posts]);
  useEffect(() => {
    if (!cloudReady || authBootstrapped) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setAuthBootstrapped(true);
      return;
    }
    const authClient = supabase;
    let cancelled = false;
    async function bootstrapAuthSession() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const hasAuthHash = hashParams.has('access_token') || hashParams.has('refresh_token');
        if (code) {
          await authClient.auth.exchangeCodeForSession(code);
        } else if (hasAuthHash) {
          await authClient.auth.getSession();
        }
        const { data } = await authClient.auth.getUser();
        if (cancelled) return;
        const user = data.user;
        if (!user?.email || !isSupabaseEmailConfirmed(user)) {
          setAuthBootstrapped(true);
          return;
        }
        const email = user.email.trim().toLowerCase();
        const existing = accounts.find((account) => account.email.trim().toLowerCase() === email);
        const synced = syncAuthenticatedAccount(user, existing?.role || 'entrepreneur', existing?.phone || '');
        setPage(synced.profileComplete ? 'feed' : 'profileEdit');
        flash(synced.profileComplete ? 'メール認証が完了し、ログインしました' : 'メール認証が完了しました。プロフィールを作成してください');
        if (code || hasAuthHash) {
          url.searchParams.delete('code');
          window.history.replaceState({}, document.title, `${url.pathname}${url.searchParams.size ? `?${url.searchParams.toString()}` : ''}`);
        }
        setAuthBootstrapped(true);
      } catch (error) {
        if (!cancelled) {
          setCloudError(`メール認証後のログイン処理に失敗しました：${error instanceof Error ? error.message : '不明なエラー'}`);
          setAuthBootstrapped(true);
        }
      }
    }
    bootstrapAuthSession();
    return () => {
      cancelled = true;
    };
  }, [accounts, authBootstrapped, cloudReady]);

  const accountsWithAdmin = useMemo(() => withAdminAccount(accounts).filter((account) => !account.isDeleted), [accounts]);
  const visibleAccounts = useMemo(() => accountsWithAdmin.filter((account) => account.id === currentAccountId || account.id === adminAccount.id || !account.isHidden), [accountsWithAdmin, currentAccountId]);
  const discoverableAccounts = useMemo(() => visibleAccounts.filter((account) => account.role !== 'investor' && account.id !== adminAccount.id), [visibleAccounts]);
  const currentAccount = accountsWithAdmin.find((account) => account.id === currentAccountId) ?? accountsWithAdmin.find((account) => authenticatedEmail && account.email.trim().toLowerCase() === authenticatedEmail) ?? null;
  const selectedAccount = accountsWithAdmin.find((account) => account.id === selectedAccountId) ?? currentAccount;
  const isAdmin = currentAccount?.email.trim().toLowerCase() === adminEmail;
  const currentFollowing = currentAccount?.followingIds ?? following;
  useEffect(() => {
    if (currentAccount && currentAccount.id !== currentAccountId) setCurrentAccountId(currentAccount.id);
  }, [currentAccount, currentAccountId]);
  useEffect(() => {
    if (!currentAccount || isAdmin || currentAccount.isBot || currentAccount.tutorialCompleted || page === 'auth') return;
    setTutorialStep(0);
    setShowTutorial(true);
  }, [currentAccount?.id, currentAccount?.isBot, currentAccount?.tutorialCompleted, isAdmin, page]);
  const systemPosts = useMemo(() => createAiPosts(aiAccounts), []);
  const allPosts = useMemo(() => mergeById(systemPosts.map((post) => {
    const actionUserIds = systemPostActions[post.id] ?? post.actionUserIds;
    return { ...post, actionUserIds, likes: actionUserIds.likes.length, saves: actionUserIds.saves.length, meetings: actionUserIds.meetings.length };
  }), posts).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [posts, systemPostActions, systemPosts]);

  const visiblePosts = useMemo(() => allPosts.filter((post) => discoverableAccounts.some((account) => account.id === post.authorId)).filter((post) => canSeePost(post, currentAccount, currentFollowing)).filter((post) => post.visibility !== 'draft' && !post.isHidden), [allPosts, currentAccount, currentFollowing, discoverableAccounts]);
  const visibleBlogs = useMemo(() => blogs.filter((blog) => discoverableAccounts.some((account) => account.id === blog.authorId) || blog.authorId === currentAccount?.id).filter((blog) => canSeeBlog(blog, currentAccount, currentFollowing)).filter((blog) => blog.visibility !== 'draft' && !blog.isHidden).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [blogs, currentAccount, currentFollowing, discoverableAccounts]);
  const feedPosts = useMemo(() => {
    if (feedTab === 'following') return visiblePosts.filter((post) => currentFollowing.includes(post.authorId));
    if (feedTab === 'investors') return visiblePosts.filter((post) => visibleAccounts.find((account) => account.id === post.authorId)?.role === 'investor');
    if (feedTab === 'entrepreneurs') return visiblePosts.filter((post) => visibleAccounts.find((account) => account.id === post.authorId)?.role === 'entrepreneur');
    return visiblePosts;
  }, [currentFollowing, feedTab, visibleAccounts, visiblePosts]);
  useEffect(() => {
    if (feedTab === 'investors') setFeedTab('recommended');
  }, [feedTab]);

  const searchResults = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return discoverableAccounts;
    return discoverableAccounts.filter((account) => `${account.accountName} ${account.name} ${account.company} ${account.industry} ${account.location}`.toLowerCase().includes(text));
  }, [query, discoverableAccounts]);

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

  function syncAuthenticatedAccount(user: SupabaseUserLike, fallbackRole: Role, fallbackPhone: string) {
    const email = user.email?.trim().toLowerCase() || '';
    const metadata = user.user_metadata ?? {};
    const metadataRole = metadata.role === 'investor' ? 'investor' : metadata.role === 'entrepreneur' ? 'entrepreneur' : fallbackRole;
    const metadataPhone = String(metadata.phone || fallbackPhone || '');
    const existing = accounts.find((account) => account.email.trim().toLowerCase() === email);
    const id = existing?.id || user.id || crypto.randomUUID();
    const nextAccount: Account = normalizeAccount({
      ...emptyAccount,
      ...existing,
      id,
      role: existing?.role || metadataRole,
      email,
      phone: existing?.phone || metadataPhone,
      password: '',
      emailVerified: true,
    });
    setAuthenticatedEmail(email);
    setAccounts((list) => {
      const index = list.findIndex((account) => account.email.trim().toLowerCase() === email || account.id === id);
      if (index === -1) return [nextAccount, ...list];
      return list.map((account, accountIndex) => accountIndex === index ? { ...normalizeAccount(account), ...nextAccount } : account);
    });
    setCurrentAccountId(id);
    return { account: nextAccount, profileComplete: Boolean(nextAccount.accountName || nextAccount.name || nextAccount.company) };
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
    const targetPost = allPosts.find((item) => item.id === postId);
    if (!targetPost) return;
    const actionUserIds = targetPost.actionUserIds ?? { likes: [], saves: [], meetings: [] };
    const current = actionUserIds[bucket] ?? [];
    const exists = current.includes(currentAccount!.id);
    const added = !exists;
    const nextUsers = exists ? current.filter((id) => id !== currentAccount!.id) : [...current, currentAccount!.id];
    const nextActions = { ...actionUserIds, [bucket]: nextUsers };
    if (posts.some((post) => post.id === postId)) {
      setPosts((list) => list.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          actionUserIds: nextActions,
          likes: bucket === 'likes' ? nextUsers.length : post.likes,
          saves: bucket === 'saves' ? nextUsers.length : post.saves,
          meetings: bucket === 'meetings' ? nextUsers.length : post.meetings,
        };
      }));
    } else {
      setSystemPostActions((currentActions) => ({ ...currentActions, [postId]: nextActions }));
    }
    if (type === 'save') setSavedPosts((list) => added ? (list.includes(postId) ? list : [...list, postId]) : list.filter((id) => id !== postId));
    if (type === 'meeting' && added) {
      const post = allPosts.find((item) => item.id === postId);
      const author = accountsWithAdmin.find((account) => account.id === post?.authorId);
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

  function submitBlog() {
    if (!requireAccount()) return;
    if (!blogTitle.trim() || !blogBody.trim()) {
      flash('タイトルと本文を入力してください');
      return;
    }
    const now = new Date().toISOString();
    const tags = blogTags.split(',').map((tag) => tag.trim()).filter(Boolean);
    if (editingBlogId) {
      setBlogs((list) => list.map((blog) => blog.id === editingBlogId ? { ...blog, title: blogTitle.trim(), body: blogBody.trim(), tags, visibility: blogVisibility, imageName: blogImageName, imageUrl: blogImageUrl, attachmentName: blogAttachmentName, attachmentUrl: blogAttachmentUrl, updatedAt: now } : blog));
      resetBlogComposer();
      flash('ブログを更新しました');
      return;
    }
    setBlogs((list) => [{
      id: crypto.randomUUID(),
      authorId: currentAccount!.id,
      title: blogTitle.trim(),
      body: blogBody.trim(),
      tags,
      visibility: blogVisibility,
      imageName: blogImageName,
      imageUrl: blogImageUrl,
      attachmentName: blogAttachmentName,
      attachmentUrl: blogAttachmentUrl,
      isHidden: false,
      createdAt: now,
      updatedAt: now,
      views: 0,
    }, ...list]);
    resetBlogComposer();
    flash(blogVisibility === 'draft' ? 'ブログを下書き保存しました' : 'ブログを公開しました');
  }

  function resetBlogComposer() {
    setEditingBlogId('');
    setBlogTitle('');
    setBlogBody('');
    setBlogTags('');
    setBlogVisibility('public');
    setBlogImageName('');
    setBlogImageUrl('');
    setBlogAttachmentName('');
    setBlogAttachmentUrl('');
    setShowBlogComposer(false);
  }

  function startEditBlog(blog: BlogArticle) {
    setEditingBlogId(blog.id);
    setBlogTitle(blog.title);
    setBlogBody(blog.body);
    setBlogTags(blog.tags.join(', '));
    setBlogVisibility(blog.visibility);
    setBlogImageName(blog.imageName);
    setBlogImageUrl(blog.imageUrl);
    setBlogAttachmentName(blog.attachmentName);
    setBlogAttachmentUrl(blog.attachmentUrl);
    setShowBlogComposer(true);
  }

  function hideBlog(blogId: string) {
    let hidden = false;
    setBlogs((list) => list.map((blog) => {
      if (blog.id !== blogId) return blog;
      hidden = !blog.isHidden;
      return { ...blog, isHidden: hidden };
    }));
    flash(hidden ? 'ブログを非表示にしました' : 'ブログを再公開しました');
  }

  function deleteBlog(blogId: string) {
    setBlogs((list) => list.filter((blog) => blog.id !== blogId));
    flash('ブログを削除しました');
  }

  function requestMeeting(account: Account) {
    if (!requireAccount()) return;
    const body = `${displayAccountName(currentAccount) || 'あなた'}さんから面談申請が届きました。個別メッセージで承認すると面談メッセージに移行できます。`;
    setMessages((list) => [
      { id: crypto.randomUUID(), partnerId: account.id, senderId: currentAccount?.id, recipientId: account.id, kind: 'direct', body: '面談申請を送信しました。相手が承認すると面談メッセージに移行できます。', createdAt: new Date().toISOString(), mine: true, meetingStatus: 'requested' },
      { id: crypto.randomUUID(), partnerId: currentAccount!.id, senderId: currentAccount?.id, recipientId: account.id, kind: 'direct', body, createdAt: new Date().toISOString(), mine: false, meetingStatus: 'requested' },
      ...list,
    ]);
    setNotices((list) => [{ id: crypto.randomUUID(), body: `${displayAccountName(account)}へ面談申請を送信しました`, createdAt: new Date().toISOString(), unread: true }, ...list]);
    if (account.emailNotificationsEnabled) void sendDirectEmail(account.email, 'Leap: 面談希望が届きました', `${displayAccountName(currentAccount)}さんから面談希望が届きました。`);
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
    setMessages((list) => list.filter((message) => {
      if (message.meetingStatus !== 'requested') return true;
      if (message.senderId || message.recipientId) {
        return !(
          (message.senderId === currentAccount?.id && message.recipientId === partner.id)
          || (message.senderId === partner.id && message.recipientId === currentAccount?.id)
        );
      }
      return message.partnerId !== partner.id;
    }));
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
    setNotices((list) => [{ id: crypto.randomUUID(), body: `${displayAccountName(currentAccount)}さんが面談日時を管理者に申請しました`, createdAt: new Date().toISOString(), unread: true }, ...list]);
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
    if (account.id === currentAccount!.id) {
      flash('自分自身はフォローできません');
      return;
    }
    const alreadyFollowing = currentFollowing.includes(account.id);
    const next = applyFollowChange(accounts, currentAccount!, account, alreadyFollowing);
    setAccounts(next.accounts);
    setFollowing(next.followingIds);
    void saveCloudState({ accounts: next.accounts, posts, blogs, messages, meetingApplications, notices })
      .then(() => setCloudError(''))
      .catch((error) => setCloudError(`クラウド同期に失敗しています：${error.message}`));
    if (!alreadyFollowing) {
      setNotices((list) => [{ id: crypto.randomUUID(), userId: account.id, body: `${displayAccountName(currentAccount)}さんにフォローされました`, createdAt: new Date().toISOString(), unread: true }, ...list]);
      if (account.emailNotificationsEnabled) void sendDirectEmail(account.email, 'Leap: フォローされました', `${displayAccountName(currentAccount)}さんがあなたをフォローしました。`);
    }
    flash(alreadyFollowing ? 'フォロー解除しました' : 'フォローしました');
  }

  function sendMessage(partner: Account | null, kind = messageMode, attachment?: { name: string; url: string; type: 'image' | 'file' }) {
    if (!partner || (!messageDraft.trim() && !attachment)) return;
    const newMessage = { id: crypto.randomUUID(), partnerId: partner.id, senderId: currentAccount?.id, recipientId: partner.id, kind, body: messageDraft.trim(), createdAt: new Date().toISOString(), mine: true, attachmentName: attachment?.name, attachmentUrl: attachment?.url, attachmentType: attachment?.type };
    const autoReply = partner.isBot && kind === 'direct' ? {
      id: crypto.randomUUID(),
      partnerId: partner.id,
      senderId: partner.id,
      recipientId: currentAccount?.id,
      kind: 'direct' as const,
      body: partner.role === 'entrepreneur'
        ? 'メッセージありがとうございます。公開している事業進捗やKPIの見方について回答できます。面談は受け付けていません。'
        : 'メッセージありがとうございます。投資観点や公開プロフィールに関する質問に回答できます。面談は受け付けていません。',
      createdAt: new Date(Date.now() + 1000).toISOString(),
      mine: false,
    } : null;
    setMessages((list) => autoReply ? [autoReply, newMessage, ...list] : [newMessage, ...list]);
    if (partner.emailNotificationsEnabled) void sendDirectEmail(partner.email, 'Leap: メッセージが届きました', `${displayAccountName(currentAccount)}さんからメッセージが届きました。\n\n${messageDraft.trim()}`);
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

  function finishTutorial(nextPage?: Page) {
    if (currentAccount) {
      setAccounts((list) => list.map((account) => account.id === currentAccount.id ? { ...normalizeAccount(account), tutorialCompleted: true } : account));
    }
    setShowTutorial(false);
    if (nextPage) {
      setPage(nextPage);
      scrollContentToTop();
    }
  }

  function reopenTutorial() {
    if (isAdmin) return;
    setTutorialStep(0);
    setShowTutorial(true);
    setMenuOpen(false);
  }

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setCurrentAccountId('');
    setSelectedAccountId('');
    setAuthenticatedEmail('');
    setMenuOpen(false);
    setPage('auth');
    flash('ログアウトしました');
  }

  return (
    <main className={`min-h-screen bg-white text-[#101828] lg:p-6 ${darkMode ? 'leap-dark' : ''}`}>
      <div className="mx-auto grid h-[100dvh] min-h-[100dvh] w-full max-w-[430px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-white shadow-none lg:max-w-6xl lg:grid-cols-[220px_1fr] lg:rounded-[28px] lg:shadow-sm lg:ring-1 lg:ring-[#eff3f4]">
        <DesktopNav page={page} setPage={setPage} openTickets={openTickets} isAdmin={isAdmin} />
        <AppHeader page={page} goBack={() => setPage('feed')} openTickets={openTickets} menuOpen={menuOpen} setMenuOpen={setMenuOpen} setPage={setPage} currentAccount={currentAccount} isAdmin={isAdmin} logout={logout} unreadNoticeCount={notices.filter((notice) => notice.unread && (!notice.userId || notice.userId === currentAccount?.id)).length} openTutorial={reopenTutorial} darkMode={darkMode} toggleDarkMode={() => setDarkMode((value) => !value)} />

        <section data-app-scroll className="min-h-0 overflow-y-auto pb-14 lg:col-start-2 lg:row-start-2 lg:pb-6">
          {cloudError && (
            <div className="m-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-800">
              {cloudError}<br />PC/スマホ連携にはSupabase SQL Editorで `supabase/fix_20260608_app_state_permissions.sql` を実行してください。
            </div>
          )}
          {page === 'feed' && (
            <FeedPage posts={feedPosts} accounts={discoverableAccounts} currentAccount={currentAccount} feedTab={feedTab} setFeedTab={setFeedTab} openComposer={() => setShowComposer(true)} openProfile={openProfile} reactToPost={reactToPost} startEditPost={startEditPost} hidePost={hidePost} deletePost={deletePost} />
          )}
          {page === 'search' && <SearchPage query={query} setQuery={setQuery} results={searchResults} openProfile={openProfile} />}
          {page === 'notifications' && <NotificationsPage notices={notices} currentAccount={currentAccount} setNotices={setNotices} />}
          {page === 'messages' && (
            <MessagesPage accounts={visibleAccounts} currentAccount={currentAccount} selectedAccount={selectedAccount} messages={messages} meetingApplications={meetingApplications} mode={messageMode} setMode={setMessageMode} draft={messageDraft} setDraft={setMessageDraft} sendMessage={sendMessage} approveMeeting={approveMeeting} rejectMeeting={rejectMeeting} requestMeeting={requestMeeting} submitMeetingApplication={submitMeetingApplication} openProfile={openProfile} setSelectedAccountId={setSelectedAccountId} readMessageIds={readMessageIds} setReadMessageIds={setReadMessageIds} />
          )}
          {page === 'auth' && <AuthPage accounts={accounts} setAccounts={setAccounts} setCurrentAccountId={setCurrentAccountId} setPage={setPage} flash={flash} onAuthenticated={syncAuthenticatedAccount} />}
          {page === 'mypage' && (
            <MyPage currentAccount={currentAccount} accounts={accountsWithAdmin} posts={posts.filter((post) => post.authorId === currentAccount?.id)} blogs={blogs.filter((blog) => blog.authorId === currentAccount?.id)} setPage={setPage} openComposer={() => setShowComposer(true)} openBlogComposer={() => setShowBlogComposer(true)} reactToPost={reactToPost} startEditPost={startEditPost} hidePost={hidePost} deletePost={deletePost} startEditBlog={startEditBlog} hideBlog={hideBlog} deleteBlog={deleteBlog} />
          )}
          {page === 'profileEdit' && <ProfileEditPage accounts={accounts} currentAccount={currentAccount} setAccounts={setAccounts} setCurrentAccountId={setCurrentAccountId} setPage={setPage} flash={flash} />}
          {page === 'tickets' && <TicketPage currentAccount={currentAccount} setAccounts={setAccounts} />}
          {page === 'admin' && (isAdmin ? <AdminPage accounts={accounts} posts={posts} meetingApplications={meetingApplications} setAccounts={setAccounts} setPosts={setPosts} setMessages={setMessages} setNotices={setNotices} reviewMeetingApplication={reviewMeetingApplication} openProfile={openProfile} /> : <EmptyState icon={<ShieldCheck size={28} />} title="管理者のみ表示できます" body="管理者アカウントでログインしてください。" action="ログインへ" onAction={() => setPage('auth')} />)}
          {(page === 'profile' || page === 'deal') && selectedAccount && (
            <ProfilePage account={selectedAccount} accounts={accountsWithAdmin} currentAccount={currentAccount} posts={allPosts.filter((post) => post.authorId === selectedAccount.id && canSeePost(post, currentAccount, currentFollowing) && (!post.isHidden || currentAccount?.id === selectedAccount.id))} blogs={blogs.filter((blog) => blog.authorId === selectedAccount.id && canSeeBlog(blog, currentAccount, currentFollowing) && (!blog.isHidden || currentAccount?.id === selectedAccount.id))} isFollowing={currentFollowing.includes(selectedAccount.id)} isMine={currentAccount?.id === selectedAccount.id} follow={() => follow(selectedAccount)} message={() => { setSelectedAccountId(selectedAccount.id); setMessageMode('direct'); setPage('messages'); }} requestMeeting={() => requestMeeting(selectedAccount)} openDeal={() => setPage('deal')} dealMode={page === 'deal'} setPage={setPage} reactToPost={reactToPost} startEditPost={startEditPost} hidePost={hidePost} deletePost={deletePost} startEditBlog={startEditBlog} hideBlog={hideBlog} deleteBlog={deleteBlog} />
          )}
          {page === 'matching' && <MatchingPage accounts={visibleAccounts.filter((account) => account.role === 'entrepreneur')} openProfile={openProfile} requestMeeting={requestMeeting} />}
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
          {postImageUrl && <img src={postImageUrl} alt={postImageName} className="mt-3 aspect-square w-full rounded-2xl object-cover" />}
          <input className="field mt-3" placeholder="添付ファイル名" value={postAttachment} onChange={(event) => setPostAttachment(event.target.value)} />
          <button className="primary mt-4 w-full" onClick={submitPost}>投稿する</button>
        </Modal>
      )}

      {showBlogComposer && (
        <Modal onClose={resetBlogComposer} title={editingBlogId ? 'ブログを編集' : 'ブログを書く'}>
          <input className="field" placeholder="ブログタイトル" value={blogTitle} onChange={(event) => setBlogTitle(event.target.value)} />
          <textarea className="field mt-3 min-h-56 resize-none leading-7" placeholder="会社のストーリー、事業の考え方、顧客事例、学び、採用・資本提携につながる長文を書いてください" value={blogBody} onChange={(event) => setBlogBody(event.target.value)} />
          <Select label="公開範囲" value={blogVisibility} options={Object.values(visibilityLabels)} onChange={(value) => setBlogVisibility((Object.keys(visibilityLabels).find((key) => visibilityLabels[key as Visibility] === value) as Visibility) || 'public')} />
          <input className="field mt-3" placeholder="タグ。例：会社紹介, SaaS, 資金調達" value={blogTags} onChange={(event) => setBlogTags(event.target.value)} />
          <label className="mt-3 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 text-xs font-black text-slate-500">
            <ImageIcon size={17} />カバー画像を選択
            <input className="hidden" type="file" accept="image/*" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setBlogImageName(file.name);
              readFileAsDataUrl(file, setBlogImageUrl);
            }} />
          </label>
          {blogImageUrl && <img src={blogImageUrl} alt={blogImageName} className="mt-3 aspect-[16/9] w-full rounded-2xl object-cover" />}
          <label className="mt-3 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 text-xs font-black text-slate-500">
            <Paperclip size={17} />添付ファイルを選択
            <input className="hidden" type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,image/*" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setBlogAttachmentName(file.name);
              readFileAsDataUrl(file, setBlogAttachmentUrl);
            }} />
          </label>
          {blogAttachmentName && <p className="mt-2 truncate rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">{blogAttachmentName}</p>}
          <button className="primary mt-4 w-full" onClick={submitBlog}>{editingBlogId ? 'ブログを更新する' : 'ブログを公開する'}</button>
        </Modal>
      )}

      {showTutorial && currentAccount && (
        <TutorialModal
          account={currentAccount}
          step={tutorialStep}
          setStep={setTutorialStep}
          onSkip={() => finishTutorial()}
          onFinish={(nextPage) => finishTutorial(nextPage)}
        />
      )}

      {toast && <div className="fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-full bg-[#050816] px-5 py-3 text-xs font-black text-white shadow-xl">{toast}</div>}
    </main>
  );
}

function TutorialModal({ account, step, setStep, onSkip, onFinish }: { account: Account; step: number; setStep: (step: number) => void; onSkip: () => void; onFinish: (page: Page) => void }) {
  const isEntrepreneur = account.role === 'entrepreneur';
  const steps = [
    {
      title: 'Leapへようこそ',
      body: 'Leapでは、投稿・プロフィール・メッセージを通じて、起業家と投資家が自然につながれます。まずは使う順番を短く確認しましょう。',
      tip: 'この案内は右上の「…」からいつでも見直せます。',
    },
    {
      title: 'プロフィールを整える',
      body: isEntrepreneur
        ? '会社の想い、事業内容、実績、案件詳細を入力すると、投資家があなたの事業を判断しやすくなります。'
        : '投資方針、支援できること、本人確認情報を入力すると、起業家が安心してやり取りできます。',
      tip: 'プロフィールはマイページ、または右上メニューのプロフィール編集から変更できます。',
    },
    {
      title: '投稿で活動を共有する',
      body: '投稿ボタンから近況、進捗、学び、募集したいことを気軽に投稿できます。画像やファイルも添付できます。',
      tip: '公開範囲は、全体公開・フォロワー限定・投資家限定・起業家限定・下書きから選べます。',
    },
    {
      title: 'フィードを見る',
      body: 'フィードでは、フォロー中・おすすめ・起業家の投稿を切り替えられます。気になる投稿には応援、保存、面談希望ができます。',
      tip: '自分の投稿の閲覧数は本人だけが確認できます。一定以上見られた投稿は他の人にも閲覧数が表示されます。',
    },
    {
      title: '検索で相手を探す',
      body: '検索ページでは、アカウント名、会社名、業界、地域などから起業家を探せます。気になる相手はプロフィールを確認しましょう。',
      tip: 'プロフィール画面からフォローやメッセージ送信ができます。',
    },
    {
      title: 'メッセージと面談',
      body: '通常メッセージでやり取りし、面談したい場合は面談希望を送ります。双方が進める場合は面談メッセージへ移動します。',
      tip: '面談日時が決まったら、面談メッセージから運営へ面談日程を申請します。',
    },
    {
      title: '通知を確認する',
      body: 'フォロー、メッセージ、面談申込、運営からのお知らせは通知で確認できます。未読だけに絞り込むこともできます。',
      tip: 'メール通知のオン・オフは設定から変更できます。',
    },
    {
      title: '準備完了です',
      body: isEntrepreneur
        ? 'まずはプロフィール編集で会社の魅力を整えてから、最初の投稿をしてみましょう。'
        : 'まずは検索で気になる起業家を探し、プロフィールや投稿を見てみましょう。',
      tip: '迷ったら、プロフィールを整える、投稿を見る、メッセージする、の順番で使えば大丈夫です。',
    },
  ];
  const current = steps[step] ?? steps[0];
  const isLast = step >= steps.length - 1;
  const targetPage: Page = isEntrepreneur ? 'profileEdit' : 'search';

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 p-3 backdrop-blur-[2px] sm:items-center">
      <div className="w-full max-w-[430px] overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-black text-blue-600">はじめての使い方</p>
            <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-50" aria-label="閉じる" onClick={onSkip}><X size={17} /></button>
          </div>
          <div className="flex gap-1">
            {steps.map((_, index) => <span key={index} className={`h-1 flex-1 rounded-full ${index <= step ? 'bg-blue-600' : 'bg-slate-100'}`} />)}
          </div>
        </div>
        <div className="px-5 py-6">
          <div className="mb-5 grid h-14 w-14 place-items-center rounded-3xl bg-blue-50 text-blue-600">
            {step === 0 && <CheckCircle2 size={26} />}
            {step === 1 && <UserRound size={26} />}
            {step === 2 && <Plus size={26} />}
            {step === 3 && <Home size={26} />}
            {step === 4 && <Search size={26} />}
            {step === 5 && <MessageCircle size={26} />}
            {step === 6 && <Bell size={26} />}
            {step >= 7 && <ShieldCheck size={26} />}
          </div>
          <h2 className="text-[20px] font-black tracking-tight text-[#101828]">{current.title}</h2>
          <p className="mt-3 text-[13px] font-bold leading-6 text-slate-600">{current.body}</p>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-[12px] font-bold leading-5 text-slate-500">{current.tip}</div>
        </div>
        <div className="flex items-center gap-2 border-t border-slate-100 p-4">
          <button className="h-11 rounded-2xl px-4 text-xs font-black text-slate-500 hover:bg-slate-50" onClick={onSkip}>スキップ</button>
          <div className="flex-1" />
          {step > 0 && <button className="h-11 rounded-2xl border border-slate-200 px-4 text-xs font-black" onClick={() => setStep(step - 1)}>戻る</button>}
          <button className="h-11 rounded-2xl bg-[#050816] px-5 text-xs font-black text-white" onClick={() => isLast ? onFinish(targetPage) : setStep(step + 1)}>
            {isLast ? (isEntrepreneur ? 'プロフィール編集へ' : '検索へ') : '次へ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AppHeader({ page, goBack, openTickets, menuOpen, setMenuOpen, setPage, currentAccount, isAdmin, logout, unreadNoticeCount, openTutorial, darkMode, toggleDarkMode }: { page: Page; goBack: () => void; openTickets: () => void; menuOpen: boolean; setMenuOpen: (value: boolean) => void; setPage: (page: Page) => void; currentAccount: Account | null; isAdmin: boolean; logout: () => void | Promise<void>; unreadNoticeCount: number; openTutorial: () => void; darkMode: boolean; toggleDarkMode: () => void }) {
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
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur lg:col-start-2">
      <div className="grid h-11 grid-cols-[34px_1fr_62px] items-center px-2">
        <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-50" onClick={canBack ? goBack : openTickets} aria-label={canBack ? '戻る' : 'チケット'}>
          {canBack ? <ChevronLeft size={18} /> : <BriefcaseBusiness size={18} />}
        </button>
        <h1 className="text-center text-[13px] font-black">{title[page]}</h1>
        <div className="flex items-center justify-end gap-0.5">
          <button className="relative grid h-8 w-8 place-items-center rounded-full hover:bg-slate-50" aria-label="通知" onClick={() => { setPage('notifications'); scrollContentToTop(); }}>
            <Bell size={17} />
            {unreadNoticeCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-rose-600 px-1 text-[8px] font-black leading-none text-white">{unreadNoticeCount > 99 ? '99+' : unreadNoticeCount}</span>}
          </button>
          <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-50" aria-label="メニュー" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={18} /></button>
        </div>
      </div>
      {menuOpen && (
        <div className="absolute right-2 top-10 z-40 w-52 rounded-2xl border border-slate-100 bg-white p-2 text-xs font-black shadow-xl">
          {[
            ['feed', 'フィード'],
            ['search', '検索'],
            ['messages', 'メッセージ'],
            ['tickets', '面談チケット'],
            ...(isAdmin ? [['admin', '管理者画面']] : []),
            [currentAccount ? 'profileEdit' : 'auth', '設定'],
            [currentAccount ? 'profileEdit' : 'auth', currentAccount ? 'プロフィール編集' : 'アカウント作成'],
          ].map(([key, label]) => <button key={key} className="block w-full rounded-xl px-3 py-3 text-left hover:bg-slate-50" onClick={() => { setPage(key as Page); setMenuOpen(false); }}>{label}</button>)}
          {currentAccount && !isAdmin && <button className="block w-full rounded-xl px-3 py-3 text-left hover:bg-slate-50" onClick={openTutorial}>使い方を見る</button>}
          <button className="block w-full rounded-xl px-3 py-3 text-left hover:bg-slate-50" onClick={() => { toggleDarkMode(); setMenuOpen(false); }}>{darkMode ? 'ライトモードにする' : 'ダークモードにする'}</button>
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
  const accountScrollerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    scrollContentToTop();
  }, [feedTab]);

  return (
    <div>
      <div className="sticky top-0 z-20 grid grid-cols-3 border-b border-slate-100 bg-white text-center text-[10px] font-bold text-slate-500">
        {[
          ['following', 'フォロー中'],
          ['recommended', 'おすすめ'],
          ['entrepreneurs', '起業家'],
        ].map(([key, label]) => <button key={key} className={`py-0.5 ${feedTab === key ? 'border-b-2 border-blue-600 text-slate-950' : ''}`} onClick={() => { setFeedTab(key as FeedTab); scrollContentToTop(); }}>{label}</button>)}
      </div>
      {feedTab !== 'following' && (
        <div className="relative border-b border-slate-100">
          <button className="absolute left-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-[#050816] text-white shadow-lg ring-2 ring-white" onClick={() => accountScrollerRef.current?.scrollBy({ left: -240, behavior: 'smooth' })} aria-label="左へスクロール">
            <ChevronLeft size={18} />
          </button>
          <button className="absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-[#050816] text-white shadow-lg ring-2 ring-white" onClick={() => accountScrollerRef.current?.scrollBy({ left: 240, behavior: 'smooth' })} aria-label="右へスクロール">
            <ChevronLeft size={18} className="rotate-180" />
          </button>
          <div ref={accountScrollerRef} className="flex gap-2.5 overflow-x-auto scroll-smooth px-14 py-1.5 [scrollbar-width:thin]">
            <button className="grid w-14 shrink-0 justify-items-center gap-1 text-[10px] font-bold" onClick={openComposer}>
              <span className="grid h-12 w-12 place-items-center rounded-full border border-blue-500 text-blue-600"><Plus size={22} /></span>
              投稿する
            </button>
            {accounts.map((account) => <button key={account.id} className="grid w-14 shrink-0 justify-items-center gap-1 text-[10px] font-bold" onClick={() => openProfile(account)}><Avatar account={account} active /><span className="w-full truncate">{displayAccountName(account)}</span></button>)}
          </div>
        </div>
      )}
      <button className="flex w-full items-center gap-2.5 border-b border-[#eff3f4] px-4 py-2 text-left hover:bg-[#f7f9f9]" onClick={openComposer}>
        {currentAccount ? <Avatar account={currentAccount} size="feed" /> : <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f2f4f7] text-slate-400 ring-1 ring-[#e5e7eb]"><Building2 size={21} strokeWidth={1.8} /></span>}
        <span className="min-w-0 flex-1 text-[12px] font-semibold text-[#536471]">いま何を共有しますか？</span>
        <span className="rounded-full bg-[#050816] px-4 py-2 text-[11px] font-black text-white">投稿</span>
      </button>
      {posts.length === 0 ? (
        <EmptyState compact={feedTab === 'following'} icon={<MessageCircle size={28} />} title="まだ投稿がありません" body="投稿すると、指定した公開範囲に合わせてフィードとマイページへ反映されます。" action="投稿する" onAction={openComposer} />
      ) : (
        <div>
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
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const toggleType = (type: string) => setSelectedTypes((types) => types.includes(type) ? types.filter((item) => item !== type) : [...types, type]);
  const typeMatched = (account: Account) => {
    if (selectedTypes.length === 0) return true;
    if (selectedTypes.includes('起業家') && account.role === 'entrepreneur') return true;
    if (selectedTypes.includes('案件') && account.role === 'entrepreneur') return true;
    if (selectedTypes.includes('投稿')) return true;
    return false;
  };
  const filtered = results.filter((account) => typeMatched(account) && (!role || account.role === role) && (!industry || account.industry === industry) && (!stage || account.stage === stage) && (!location || account.location === location));
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3">
        <Search size={17} className="text-slate-400" />
        <input className="min-w-0 flex-1 text-sm outline-none" placeholder="アカウント名、会社名、業界で検索" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-[11px] font-bold">
        {['起業家', '投資家', '案件', '投稿'].map((item) => {
          const active = selectedTypes.includes(item);
          return <button className={`rounded-full px-2 py-2 ${active ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600'}`} key={item} onClick={() => toggleType(item)}>{item}</button>;
        })}
      </div>
      <div className="mt-5 rounded-2xl border border-slate-100 p-4">
        <h2 className="text-sm font-black">高度な検索</h2>
        <Select label="ユーザー種別" value={role} options={['entrepreneur']} displayMap={{ entrepreneur: '起業家' }} onChange={setRole} />
        <Select label="業界" value={industry} options={industries} onChange={setIndustry} />
        <Select label="フェーズ" value={stage} options={stages} onChange={setStage} />
        <Select label="地域" value={location} options={locations} onChange={setLocation} />
        <button className="secondary mt-3 w-full" onClick={() => { setRole(''); setIndustry(''); setStage(''); setLocation(''); setSelectedTypes([]); }}>条件をクリア</button>
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

function NotificationsPage({ notices, currentAccount, setNotices }: { notices: Notice[]; currentAccount: Account | null; setNotices: (notices: Notice[]) => void }) {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const ownNotices = notices.filter((notice) => !notice.userId || notice.userId === currentAccount?.id);
  const visibleNotices = tab === 'unread' ? ownNotices.filter((notice) => notice.unread) : ownNotices;
  useEffect(() => {
    scrollContentToTop();
  }, [tab]);

  function openNotice(notice: Notice) {
    const readNotice = { ...notice, unread: false };
    setNotices(notices.map((item) => item.id === notice.id ? readNotice : item));
    setSelectedNotice(readNotice);
  }

  return (
    <div>
      <div className="sticky top-0 z-20 grid grid-cols-2 border-b border-slate-100 bg-white text-center text-[11px] font-bold">
        <button className={`py-0.5 ${tab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`} onClick={() => { setTab('all'); scrollContentToTop(); }}>すべて</button>
        <button className={`py-0.5 ${tab === 'unread' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`} onClick={() => { setTab('unread'); scrollContentToTop(); }}>未読</button>
      </div>
      {visibleNotices.length === 0 ? (
        <div className={tab === 'unread' ? 'px-0 py-0' : 'px-3 py-3'}>
          <div className={`${tab === 'unread' ? 'rounded-none px-3 py-2' : 'rounded-2xl px-4 py-4'} bg-slate-50`}>
            <p className="text-sm font-black text-slate-700">{tab === 'unread' ? '未読通知はありません' : '通知はまだありません'}</p>
            <p className="mt-1 text-xs font-bold leading-5 text-slate-500">フォロー、コメント、面談申込、メッセージが届くと表示されます。</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {visibleNotices.map((notice) => (
            <button key={notice.id} className="flex w-full gap-3 px-3 py-3 text-left" onClick={() => openNotice(notice)}>
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

function MessagesPage({ accounts, currentAccount, selectedAccount, messages, meetingApplications, mode, setMode, draft, setDraft, sendMessage, approveMeeting, rejectMeeting, requestMeeting, submitMeetingApplication, openProfile, setSelectedAccountId, readMessageIds, setReadMessageIds }: { accounts: Account[]; currentAccount: Account | null; selectedAccount: Account | null; messages: DirectMessage[]; meetingApplications: MeetingApplication[]; mode: MessageKind; setMode: (mode: MessageKind) => void; draft: string; setDraft: (value: string) => void; sendMessage: (partner: Account | null, kind?: MessageKind, attachment?: { name: string; url: string; type: 'image' | 'file' }) => void; approveMeeting: (partner: Account) => void; rejectMeeting: (partner: Account) => void; requestMeeting: (partner: Account) => void; submitMeetingApplication: (partner: Account, scheduledAt: string) => void; openProfile: (account: Account) => void; setSelectedAccountId: (id: string) => void; readMessageIds: string[]; setReadMessageIds: (updater: string[] | ((ids: string[]) => string[])) => void }) {
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [attachment, setAttachment] = useState<{ name: string; url: string; type: 'image' | 'file' } | undefined>();
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
  const partnerScrollerRef = useRef<HTMLDivElement | null>(null);
  const directPartners = accounts.filter((account) => account.id !== currentAccount?.id);
  const approvedPartnerIds = new Set(messages.filter((message) => message.kind === 'meeting' || message.meetingStatus === 'approved').map((message) => message.senderId === currentAccount?.id ? message.recipientId || message.partnerId : message.senderId || message.partnerId));
  const unreadMessageIds = new Set(messages.filter((message) => {
    const fromOther = message.senderId ? message.recipientId === currentAccount?.id : !message.mine;
    return fromOther && !readMessageIds.includes(message.id);
  }).map((message) => message.id));
  const getPartnerStats = (partner: Account) => {
    const related = messages.filter((message) => {
      if (message.kind !== mode) return false;
      if (message.senderId || message.recipientId) {
        return (message.senderId === currentAccount?.id && message.recipientId === partner.id) || (message.senderId === partner.id && message.recipientId === currentAccount?.id);
      }
      return message.partnerId === partner.id;
    });
    const unreadCount = related.filter((message) => {
      const fromPartner = message.senderId ? message.senderId === partner.id && message.recipientId === currentAccount?.id : !message.mine;
      return fromPartner && unreadMessageIds.has(message.id);
    }).length;
    const latestAt = related.reduce((latest, message) => Math.max(latest, new Date(message.createdAt).getTime()), 0);
    return { unreadCount, messageCount: related.length, latestAt };
  };
  const basePartners = mode === 'meeting' ? directPartners.filter((account) => approvedPartnerIds.has(account.id)) : directPartners;
  const partners = [...basePartners].sort((a, b) => {
    const aStats = getPartnerStats(a);
    const bStats = getPartnerStats(b);
    if (aStats.unreadCount !== bStats.unreadCount) return bStats.unreadCount - aStats.unreadCount;
    if (aStats.messageCount !== bStats.messageCount) return bStats.messageCount - aStats.messageCount;
    if (aStats.latestAt !== bStats.latestAt) return bStats.latestAt - aStats.latestAt;
  return displayAccountName(a).localeCompare(displayAccountName(b), 'ja');
  });
  const activePartner = selectedAccount && selectedAccount.id !== currentAccount?.id && partners.some((partner) => partner.id === selectedAccount.id) ? selectedAccount : partners[0] ?? null;
  const isThreadMessage = (message: DirectMessage) => {
    if (!activePartner) return false;
    if (message.senderId || message.recipientId) {
      return message.kind === mode && ((message.senderId === currentAccount?.id && message.recipientId === activePartner.id) || (message.senderId === activePartner.id && message.recipientId === currentAccount?.id));
    }
    return message.partnerId === activePartner.id && message.kind === mode;
  };
  const thread = activePartner ? messages.filter(isThreadMessage).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [];
  const hasUnreadFromPartner = (partner: Account) => getPartnerStats(partner).unreadCount > 0;
  useEffect(() => {
    if (!activePartner || thread.length === 0) return;
    const incomingIds = thread.filter((message) => message.senderId ? message.senderId === activePartner.id && message.recipientId === currentAccount?.id : !message.mine).map((message) => message.id);
    if (incomingIds.length === 0) return;
    setReadMessageIds((ids) => Array.from(new Set([...ids, ...incomingIds])));
  }, [activePartner?.id, currentAccount?.id, mode, thread.length]);
  const incomingRequested = activePartner ? messages.some((message) => isThreadMessage(message) && message.meetingStatus === 'requested' && (message.senderId ? message.senderId !== currentAccount?.id : !message.mine)) : false;
  const outgoingRequested = activePartner ? messages.some((message) => isThreadMessage(message) && message.meetingStatus === 'requested' && (message.senderId ? message.senderId === currentAccount?.id : message.mine)) : false;
  const hasApproved = activePartner ? messages.some((message) => isThreadMessage(message) && message.meetingStatus === 'approved') : false;
  const latestApplication = activePartner && currentAccount ? meetingApplications.find((item) => ((item.applicantId === currentAccount.id && item.partnerId === activePartner.id) || (item.applicantId === activePartner.id && item.partnerId === currentAccount.id))) : null;
  const selectedSchedule = meetingDate && meetingTime ? `${meetingDate}T${meetingTime}:00` : '';
  const meetingButtonLabel = latestApplication?.status === 'pending' ? '申請中' : latestApplication?.status === 'approved' ? '面談可能' : '面談申請';
  return (
    <div className="grid min-h-[calc(100vh-7rem)] min-w-0 grid-rows-[auto_auto_1fr_auto]">
      <div className="grid grid-cols-2 border-b border-slate-100 text-center text-[11px] font-black">
        <button className={`py-3 ${mode === 'direct' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`} onClick={() => setMode('direct')}>個別メッセージ</button>
        <button className={`py-3 ${mode === 'meeting' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`} onClick={() => setMode('meeting')}>面談メッセージ</button>
      </div>
      <div className="relative border-b border-slate-100">
        <button className="absolute left-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-[#050816] text-white shadow-lg ring-2 ring-white" onClick={() => partnerScrollerRef.current?.scrollBy({ left: -240, behavior: 'smooth' })} aria-label="左へスクロール"><ChevronLeft size={18} /></button>
        <button className="absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-[#050816] text-white shadow-lg ring-2 ring-white" onClick={() => partnerScrollerRef.current?.scrollBy({ left: 240, behavior: 'smooth' })} aria-label="右へスクロール"><ChevronLeft size={18} className="rotate-180" /></button>
        <div ref={partnerScrollerRef} className="min-w-0 overflow-x-auto px-14 py-3 [scrollbar-width:thin]">
          <div className="flex w-max min-w-full gap-3">
        {partners.length === 0 ? <span className="text-xs text-slate-500">{mode === 'meeting' ? '承認済みの面談相手はまだいません。' : 'メッセージ相手はまだいません。'}</span> : partners.map((partner) => <button key={partner.id} className="grid w-16 shrink-0 justify-items-center gap-1 text-[10px] font-bold" onClick={() => setSelectedAccountId(partner.id)}><span className="relative"><Avatar account={partner} active={activePartner?.id === partner.id} />{hasUnreadFromPartner(partner) && <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600" aria-label="未読あり" />}</span><span className="w-full truncate">{displayAccountName(partner)}</span></button>)}
          </div>
        </div>
      </div>
      {!activePartner ? (
        <EmptyState icon={<Mail size={28} />} title="メッセージはまだありません" body="検索やプロフィールから相手にメッセージできます。" />
      ) : (
        <div className="overflow-y-auto px-4 py-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button className="flex min-w-0 items-center gap-3" onClick={() => openProfile(activePartner)}><Avatar account={activePartner} /><span className="min-w-0 text-left"><b className="block truncate text-sm">{displayAccountName(activePartner)}</b><span className="text-[11px] text-slate-500">プロフィールを見る</span></span></button>
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
          {thread.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">まだやり取りはありません。</p> : thread.map((message) => {
            const mine = message.senderId ? message.senderId === currentAccount?.id : message.mine;
            return <div key={message.id} className={`mb-3 flex ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${mine ? 'bg-[#050816] text-white' : 'bg-slate-100'}`}>{message.body && <p>{replaceAccountIds(message.body, accounts)}</p>}{message.attachmentUrl && (message.attachmentType === 'image' ? <button className="mt-2 block" onClick={() => setPreviewImage({ url: message.attachmentUrl!, name: message.attachmentName || '添付画像' })}><img src={message.attachmentUrl} alt={message.attachmentName || '添付画像'} className="aspect-square w-44 max-w-full rounded-xl object-cover" /></button> : <a className="mt-2 flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-black text-blue-600" href={message.attachmentUrl} download={message.attachmentName}><Paperclip size={14} />{message.attachmentName || '添付ファイル'}</a>)}<span className="mt-1 block text-[10px] opacity-60">{formatDate(message.createdAt)}</span></div></div>;
          })}
        </div>
      )}
      <div className="border-t border-slate-100 bg-white p-3">
        {attachment && <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600"><span className="truncate">{attachment.name}</span><button onClick={() => setAttachment(undefined)}><X size={14} /></button></div>}
        <div className="flex gap-2">
        <label className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-xl border border-slate-200 text-slate-500">
          <Paperclip size={18} />
          <input className="hidden" type="file" onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            readFileAsDataUrl(file, (url) => setAttachment({ name: file.name, url, type: file.type.startsWith('image/') ? 'image' : 'file' }));
          }} />
        </label>
        <textarea className="field max-h-32 min-h-12 resize-none" placeholder="メッセージを書く" value={draft} onChange={(event) => setDraft(event.target.value)} disabled={!activePartner} />
        <button className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#050816] text-white disabled:opacity-30" disabled={!activePartner || (!draft.trim() && !attachment)} onClick={() => { sendMessage(activePartner, mode, attachment); setAttachment(undefined); }}><Send size={18} /></button>
        </div>
      </div>
      {previewImage && (
        <Modal title={previewImage.name} onClose={() => setPreviewImage(null)}>
          <img src={previewImage.url} alt={previewImage.name} className="max-h-[70vh] w-full rounded-2xl object-contain" />
        </Modal>
      )}
    </div>
  );
}

function AuthPage({ accounts, setAccounts, setCurrentAccountId, setPage, flash, onAuthenticated }: { accounts: Account[]; setAccounts: (accounts: Account[]) => void; setCurrentAccountId: (id: string) => void; setPage: (page: Page) => void; flash: (message: string) => void; onAuthenticated: (user: SupabaseUserLike, fallbackRole: Role, fallbackPhone: string) => { profileComplete: boolean } }) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [role, setRole] = useState<Role>('entrepreneur');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const normalizedEmail = email.trim().toLowerCase();
  async function login() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && isSupabaseEmailConfirmed(data.user)) {
        const synced = onAuthenticated(data.user, role, phone);
        setPage(synced.profileComplete ? 'feed' : 'profileEdit');
        flash(synced.profileComplete ? 'ログインしました' : 'ログインしました。プロフィールを作成してください');
        return;
      }
      if (error?.message?.toLowerCase().includes('email not confirmed')) {
        setAuthMessage('メール認証が完了していません。確認メールのURLを押してからログインしてください。届かない場合は下の再送ボタンを押してください。');
        return;
      }
    }
    const account = accounts.find((item) => item.email.trim().toLowerCase() === normalizedEmail && item.password === password && item.emailVerified);
    if (!account) {
      setAuthMessage('メールアドレスまたはパスワードが違います。');
      return;
    }
    setCurrentAccountId(account.id);
    setPage(account.accountName || account.name ? 'feed' : 'profileEdit');
    flash('ログインしました');
  }
  async function sendConfirmation(resend = false, force = false) {
    const existing = accounts.find((account) => account.email.trim().toLowerCase() === normalizedEmail);
    if (existing?.emailVerified && !force) {
      setAuthMessage('すでに登録済みです。ログイン画面に戻ってログインしてください。');
      setMode('login');
      setSent(false);
      flash('すでに登録済みです');
      return;
    }
    if (!normalizedEmail) {
      setAuthMessage('メールアドレスを入力してください。');
      return;
    }
    if (password.length < 6) {
      setAuthMessage('パスワードは6文字以上で入力してください。');
      return;
    }
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
    const response = await fetch('/api/send-signup-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        phone,
        role,
        redirectTo,
        resend,
        force,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (result.alreadyRegistered) {
        setAuthMessage('すでに登録済みです。ログイン画面に戻ってログインしてください。');
        setMode('login');
        setSent(false);
        flash('すでに登録済みです');
        return;
      }
      setAuthMessage(result.error || '確認メール送信に失敗しました。時間をおいて再度お試しください。');
      return;
    }
    setAuthMessage(resend ? '確認メールを再送しました。メール内のURLを押すと認証が完了します。' : '確認メールを送信しました。メール内のURLを押すと認証が完了します。');
    setSent(true);
    flash(resend ? '確認メールを再送しました' : '確認メールを送信しました');
  }
  async function complete() {
    if (accounts.some((account) => account.email.trim().toLowerCase() === normalizedEmail)) {
      setAuthMessage('すでに登録済みです。ログイン画面に戻ってログインしてください。');
      setMode('login');
      return;
    }
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setAuthMessage('Supabase接続がないため、メール認証を確認できません。');
      return;
    }
    const { data, error } = await supabase.auth.getUser();
    const user = data.user;
    if (error || !user?.email || !isSupabaseEmailConfirmed(user) || user.email.trim().toLowerCase() !== normalizedEmail) {
      setAuthMessage('まだメール認証が完了していません。確認メールのURLを押してから、もう一度このボタンを押してください。');
      flash('メール認証が未完了です');
      return;
    }
    onAuthenticated(user, role, phone);
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
        {mode === 'signup' ? (!sent ? <button className="primary mt-5 w-full" disabled={!email || !phone || !password} onClick={() => sendConfirmation(false)}>確認メールを送信する</button> : <div className="mt-5 grid gap-2"><button className="primary w-full" onClick={complete}>メール認証を確認する</button><button className="secondary w-full" onClick={() => sendConfirmation(true)}>確認メールを再送する</button></div>) : <div className="mt-5 grid gap-2"><button className="primary w-full" disabled={!email || !password} onClick={login}>ログイン</button><button className="secondary w-full" disabled={!email} onClick={() => sendConfirmation(true, true)}>確認メールを再送する</button></div>}
        {(sent || authMessage) && <p className="mt-3 text-xs leading-6 text-slate-500">{authMessage || 'メールの確認URLを押してから、プロフィール作成へ進んでください。'}</p>}
      </div>
    </div>
  );
}

function MyPage({ currentAccount, accounts, posts, blogs, setPage, openComposer, openBlogComposer, reactToPost, startEditPost, hidePost, deletePost, startEditBlog, hideBlog, deleteBlog }: { currentAccount: Account | null; accounts: Account[]; posts: Post[]; blogs: BlogArticle[]; setPage: (page: Page) => void; openComposer: () => void; openBlogComposer: () => void; reactToPost: (postId: string, type: 'like' | 'save' | 'meeting') => void; startEditPost: (post: Post) => void; hidePost: (postId: string) => void; deletePost: (postId: string) => void; startEditBlog: (blog: BlogArticle) => void; hideBlog: (blogId: string) => void; deleteBlog: (blogId: string) => void }) {
  const [socialModal, setSocialModal] = useState<'following' | 'followers' | null>(null);
  const postsRef = useRef<HTMLElement | null>(null);
  if (!currentAccount) {
    return <EmptyState icon={<ShieldCheck size={28} />} title="アカウント作成が必要です" body="メール認証後にプロフィールを作成するとマイページが表示されます。" action="アカウント作成へ" onAction={() => setPage('auth')} />;
  }
  const normalized = normalizeAccount(currentAccount);
  const followingAccounts = normalized.followingIds.map((id) => accounts.find((account) => account.id === id)).filter(Boolean) as Account[];
  const followerAccounts = normalized.followerIds.map((id) => accounts.find((account) => account.id === id)).filter(Boolean) as Account[];
  const modalAccounts = socialModal === 'following' ? followingAccounts : followerAccounts;
  const setupItems = [
    { label: '会社名・肩書きを登録', done: Boolean(currentAccount.company && currentAccount.title), action: '編集する', onClick: () => setPage('profileEdit') },
    { label: '会社の想いと事業内容を書く', done: Boolean(currentAccount.bio && currentAccount.mission), action: 'ストーリーを書く', onClick: () => setPage('profileEdit') },
    { label: '実績・KPI・案件詳細を整理', done: Boolean(currentAccount.achievements && currentAccount.dealDetails), action: '数字を入力', onClick: () => setPage('profileEdit') },
    { label: '最初の投稿で近況を共有', done: posts.length > 0, action: '投稿する', onClick: openComposer },
    { label: 'ブログで会社紹介を公開', done: blogs.length > 0, action: 'ブログを書く', onClick: openBlogComposer },
  ];
  const completedSetup = setupItems.filter((item) => item.done).length;
  const nextSetup = setupItems.find((item) => !item.done);
  const completionRate = Math.round((completedSetup / setupItems.length) * 100);
  return (
    <div className="bg-[#f5f8fb]">
      <ProfileHero account={currentAccount} accounts={accounts} isMine posts={posts} setPage={setPage} hideCover onPostsClick={() => postsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} onFollowingClick={() => setSocialModal('following')} onFollowersClick={() => setSocialModal('followers')} onTicketsClick={() => setPage('tickets')} />
      <div className="mx-auto grid max-w-6xl gap-4 px-3 py-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-6">
        <main className="grid gap-4">
          <div className="contents">
            <div className="contents">
              <div>
                <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black tracking-[0.18em] text-blue-600">COMPANY PAGE</p>
                      <h2 className="mt-1 text-lg font-black tracking-tight">会社ページを育てる</h2>
                      <p className="mt-1 max-w-xl text-xs font-bold leading-5 text-slate-500">Wantedlyの会社紹介のように、事業内容、想い、実績、ストーリーを積み上げるマイページです。</p>
                    </div>
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-black text-blue-600 ring-1 ring-blue-100">{completionRate}%</div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${completionRate}%` }} />
                  </div>
                  {nextSetup ? (
                    <button className="mt-3 flex w-full items-center justify-between rounded-2xl bg-[#101828] px-3 py-2.5 text-left text-xs font-black text-white" onClick={nextSetup.onClick}>
                      <span>{nextSetup.label}</span>
                      <span className="opacity-80">{nextSetup.action}</span>
                    </button>
                  ) : (
                    <div className="mt-3 rounded-2xl bg-emerald-50 p-2.5 text-xs font-black text-emerald-700">基本準備は完了しています。ストーリーと投稿を継続して成長を見せましょう。</div>
                  )}
                </section>
              </div>
              <div><CompanyStorySection eyebrow="WHAT WE DO" title="なにをやっているのか" body={currentAccount.bio || '事業内容はまだ登録されていません。プロフィール編集で、誰のどんな課題をどう解決しているのかを書きましょう。'} muted={!currentAccount.bio} /></div>
              <div><CompanyStorySection eyebrow="WHY" title="なぜやるのか" body={currentAccount.mission || 'ミッションはまだ登録されていません。事業を始めた背景、実現したい未来、社会に届けたい価値を書きましょう。'} muted={!currentAccount.mission} /></div>
              <div><CompanyStorySection eyebrow="HOW" title="どうやっているのか" body={currentAccount.culture || '事業の進め方やチームの価値観はまだ登録されていません。顧客への向き合い方、開発姿勢、組織文化を書きましょう。'} muted={!currentAccount.culture} /></div>
              <div>
                <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black tracking-[0.18em] text-blue-600">STORY</p>
                      <h2 className="mt-1 text-base font-black">会社のストーリー</h2>
                    </div>
                    <button className="text-xs font-black text-blue-600" onClick={openBlogComposer}>ストーリーを書く</button>
                  </div>
                  {blogs.length === 0 ? (
                    <EmptyState compact icon={<FileText size={24} />} title="ストーリーはまだありません" body="会社紹介、創業背景、顧客事例、チームの考え方を書けます。" action="書く" onAction={openBlogComposer} />
                  ) : (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">{blogs.slice(0, 4).map((blog) => <MiniBlogCard key={blog.id} blog={blog} />)}</div>
                  )}
                </section>
              </div>
            </div>
          </div>

          <section ref={postsRef} className="rounded-[24px] bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between border-b border-[#eff3f4] px-4 py-2.5">
              <div>
                <p className="text-[10px] font-black tracking-[0.18em] text-blue-600">POSTS</p>
                <h2 className="text-base font-black">最近の投稿</h2>
              </div>
              <button className="text-xs font-black text-blue-600" onClick={openComposer}>投稿する</button>
            </div>
            {posts.length === 0 ? <EmptyState compact icon={<FileText size={24} />} title="投稿はまだありません" body="投稿するとここに保存され、フィードにも表示されます。" action="投稿する" onAction={openComposer} /> : <div className="divide-y divide-[#eff3f4]">{posts.map((post) => <PostCard key={post.id} post={post} author={currentAccount} currentAccount={currentAccount} openProfile={() => undefined} reactToPost={reactToPost} startEditPost={startEditPost} hidePost={hidePost} deletePost={deletePost} />)}</div>}
          </section>
        </main>

        <aside className="grid gap-4 lg:sticky lg:top-16 lg:self-start">
          <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-[10px] font-black tracking-[0.18em] text-blue-600">ACTIONS</p>
            <div className="mt-3 grid gap-2">
              <button className="primary w-full" onClick={() => setPage('profileEdit')}><Settings size={15} />プロフィールを編集</button>
              <button className="secondary w-full" onClick={openComposer}><Plus size={15} />投稿する</button>
              <button className="secondary w-full" onClick={openBlogComposer}><FileText size={15} />ブログを書く</button>
            </div>
          </section>
          <CompanyInfoPanel account={currentAccount} />
          <CultureMap account={currentAccount} />
        </aside>
      </div>
      {socialModal && (
        <Modal title={socialModal === 'following' ? 'フォロー中' : 'フォロワー'} onClose={() => setSocialModal(null)}>
          {modalAccounts.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">まだメンバーはいません。</p> : (
            <div className="grid max-h-[60vh] gap-2 overflow-y-auto">
              {modalAccounts.map((account) => (
                <div key={account.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3">
                  <Avatar account={account} />
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-sm">{displayAccountName(account)}</b>
                    <span className="text-xs text-slate-500">{account.role === 'entrepreneur' ? '起業家' : '投資家'} / {account.company || '会社名未設定'}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function ProfileEditPage({ accounts, currentAccount, setAccounts, setCurrentAccountId, setPage, flash }: { accounts: Account[]; currentAccount: Account | null; setAccounts: (accounts: Account[]) => void; setCurrentAccountId: (id: string) => void; setPage: (page: Page) => void; flash: (message: string) => void }) {
  const [form, setForm] = useState<Account>(currentAccount ?? emptyAccount);
  const [contactMessage, setContactMessage] = useState('');
  useEffect(() => setForm(currentAccount ?? emptyAccount), [currentAccount?.id]);
  function update(key: keyof Account, value: string | number | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  async function requestEmailChange() {
    if (!currentAccount || !form.email.trim()) return;
    const nextEmail = form.email.trim().toLowerCase();
    if (nextEmail === currentAccount.email.trim().toLowerCase()) {
      setContactMessage('現在のメールアドレスと同じです。');
      return;
    }
    if (accounts.some((account) => account.id !== currentAccount.id && account.email.trim().toLowerCase() === nextEmail)) {
      setContactMessage('このメールアドレスはすでに登録されています。');
      return;
    }
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setContactMessage('Supabase接続がないため、確認メールを送信できません。');
      return;
    }
    const { error } = await supabase.auth.updateUser(
      { email: nextEmail },
      { emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined },
    );
    setContactMessage(error ? `確認メール送信に失敗しました：${error.message}` : '新しいメールアドレスへ確認メールを送信しました。メール内のURLを押した後、「メール認証を確認して変更」を押してください。');
    if (!error) flash('確認メールを送信しました');
  }
  async function confirmEmailChange() {
    if (!currentAccount) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setContactMessage('Supabase接続がないため、メール認証を確認できません。');
      return;
    }
    const { data, error } = await supabase.auth.getUser();
    const userEmail = data.user?.email?.trim().toLowerCase();
    const nextEmail = form.email.trim().toLowerCase();
    if (error || !data.user?.email_confirmed_at || userEmail !== nextEmail) {
      setContactMessage('まだ新しいメールアドレスの認証が確認できません。確認メールのURLを押してから再度お試しください。');
      return;
    }
    setAccounts(accounts.map((account) => account.id === currentAccount.id ? { ...account, email: data.user!.email || form.email, emailVerified: true } : account));
    setContactMessage('メールアドレスを変更しました。');
    flash('メールアドレスを変更しました');
  }
  async function savePhoneOnly() {
    if (!currentAccount) return;
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.updateUser({ data: { phone: form.phone } });
    setAccounts(accounts.map((account) => account.id === currentAccount.id ? { ...account, phone: form.phone } : account));
    setContactMessage('電話番号を変更しました。');
    flash('電話番号を変更しました');
  }
  function save() {
    const hasIdentityMaterial = Boolean(form.corporateNumber || form.licenseFileName);
    const nextIdentityStatus: IdentityStatus = hasIdentityMaterial ? (form.identityStatus === 'verified' ? 'verified' : 'submitted') : 'none';
    const next: Account = { ...form, id: form.id || crypto.randomUUID(), avatarLabel: form.avatarLabel || (form.accountName || form.name || 'L').slice(0, 1), identityStatus: nextIdentityStatus, verified: hasIdentityMaterial };
    if (currentAccount && next.email.trim().toLowerCase() !== currentAccount.email.trim().toLowerCase()) {
      setContactMessage('メールアドレスは確認メールの認証後に変更されます。先に「確認メールを送る」を押してください。');
      next.email = currentAccount.email;
    }
    const exists = accounts.some((account) => account.id === next.id);
    setAccounts(exists ? accounts.map((account) => account.id === next.id ? next : account) : [...accounts, next]);
    setCurrentAccountId(next.id);
    setPage('mypage');
  }
  const profileSteps = [
    { label: '会社名・代表者・肩書き', done: Boolean(form.company && form.name && form.title) },
    { label: '業界・地域・フェーズ', done: Boolean(form.industry && form.location && form.stage) },
    { label: '会社紹介画像', done: Boolean(form.profileImageUrl || form.avatarUrl) },
    { label: 'なにをやっているのか', done: Boolean(form.bio) },
    { label: 'なぜやるのか', done: Boolean(form.mission) },
    { label: 'どうやっているのか', done: Boolean(form.culture) },
    { label: '実績・KPI・案件詳細', done: Boolean(form.achievements && form.dealDetails) },
    { label: '本人確認', done: Boolean(form.corporateNumber || form.licenseFileName) },
  ];
  const profileStepCount = profileSteps.filter((step) => step.done).length;
  const profileCompletion = Math.round((profileStepCount / profileSteps.length) * 100);
  if (form.role === 'entrepreneur') {
    return (
      <div className="bg-[#f7f9fb] pb-20">
        <section className="bg-white px-4 py-6">
          <div className="mx-auto max-w-3xl">
            <p className="text-[11px] font-black tracking-[0.18em] text-blue-600">COMPANY PROFILE</p>
            <div className="mt-4 flex items-start gap-4">
              <label className="relative grid h-20 w-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                {form.avatarUrl ? <img src={form.avatarUrl} alt={displayAccountName(form)} className="h-full w-full object-cover" /> : <Building2 size={28} className="text-slate-400" />}
                <span className="absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-white text-blue-600 shadow"><Plus size={15} /></span>
                <input className="hidden" type="file" accept="image/*" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  readFileAsDataUrl(file, (url) => update('avatarUrl', url));
                }} />
              </label>
              <div className="min-w-0 flex-1">
                <input className="w-full border-0 bg-transparent text-2xl font-black outline-none placeholder:text-slate-300" placeholder="会社名を入力" value={form.company} onChange={(event) => update('company', event.target.value)} />
                <input className="mt-2 w-full border-0 bg-transparent text-sm font-bold text-slate-500 outline-none placeholder:text-slate-300" placeholder="一言で会社の魅力を表すコピー" value={form.title} onChange={(event) => update('title', event.target.value)} />
                <div className="mt-3 flex flex-wrap gap-2">
                  {[form.industry || '業界未設定', form.location || '地域未設定', form.stage || 'フェーズ未設定'].map((item) => <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700" key={item}>{item}</span>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-4 p-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-100 lg:sticky lg:top-14 lg:self-start">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black tracking-[0.16em] text-blue-600">EDIT FLOW</p>
                <h2 className="mt-1 text-base font-black">会社ページ編集</h2>
                <p className="mt-1 text-xs font-bold leading-5 text-slate-500">左の項目を確認しながら、上から順に入力してください。</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-black text-blue-600 ring-1 ring-blue-100">{profileCompletion}%</div>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>
            <div className="mt-4 grid gap-1">
              {profileSteps.map((step, index) => (
                <div key={step.label} className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-[11px] font-bold">
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${step.done ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{step.done ? '✓' : index + 1}</span>
                  <span className={step.done ? 'text-slate-400 line-through' : 'text-slate-700'}>{step.label}</span>
                </div>
              ))}
            </div>
            <button className="primary mt-4 w-full" onClick={save}>保存する</button>
          </aside>

          <div className="grid gap-4">
          <section className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black tracking-[0.16em] text-blue-600">PROFILE SETUP</p>
                <h2 className="mt-1 text-base font-black">会社ページ完成度</h2>
                <p className="mt-1 text-xs font-bold leading-5 text-slate-500">会社紹介、事業内容、実績、本人確認まで整えます。</p>
              </div>
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-black text-blue-600 ring-1 ring-blue-100">{profileCompletion}%</div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${profileCompletion}%` }} />
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {profileSteps.map((step) => (
                <div key={step.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold">
                  <span className={step.done ? 'text-slate-400 line-through' : 'text-slate-700'}>{step.label}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black ${step.done ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-blue-600 ring-1 ring-blue-100'}`}>{step.done ? '完了' : '未入力'}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-base font-black">基本情報</h2>
            <p className="mt-1 text-xs font-bold text-slate-500">投資家が最初に確認する会社情報です。</p>
            <div className="mt-4 grid gap-3">
              <Input label="アカウント名" value={form.accountName} onChange={(value) => update('accountName', value)} />
              <Input label="代表者名" value={form.name} onChange={(value) => update('name', value)} />
              <div className="grid grid-cols-2 gap-2"><Select label="設立年" value={form.foundedYear} options={foundedYears} onChange={(value) => update('foundedYear', value)} /><Select label="設立月" value={form.foundedMonth} options={foundedMonths} onChange={(value) => update('foundedMonth', value)} /></div>
              <div className="grid grid-cols-2 gap-2"><Select label="業界" value={form.industry} options={industries} onChange={(value) => update('industry', value)} /><Select label="地域" value={form.location} options={locations} onChange={(value) => update('location', value)} /></div>
              <div className="grid grid-cols-2 gap-2"><Select label="従業員数" value={form.employeeSize} options={employeeSizes} onChange={(value) => update('employeeSize', value)} /><Select label="年商規模" value={form.revenueScale} options={revenueScales} onChange={(value) => update('revenueScale', value)} /></div>
            </div>
          </section>

          <section className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-base font-black">ストーリー</h2>
            <p className="mt-1 text-xs font-bold text-slate-500">あなたの会社の想いと事業内容が伝わる文章にしてください。</p>
            <label className="mt-4 grid gap-2 text-[11px] font-bold text-slate-600">
              会社紹介画像
              {form.profileImageUrl && <img src={form.profileImageUrl} alt={form.profileImageName || '会社紹介画像'} className="aspect-[16/9] w-full rounded-2xl object-cover ring-1 ring-slate-100" />}
              <span className="secondary relative min-h-11 overflow-hidden">
                画像を選択
                <input className="absolute inset-0 opacity-0" type="file" accept="image/*" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  update('profileImageName', file.name);
                  readFileAsDataUrl(file, (url) => update('profileImageUrl', url));
                }} />
              </span>
              {form.profileImageName && <span className="truncate text-xs text-slate-500">{form.profileImageName}</span>}
            </label>
            <label className="mt-4 grid gap-1 text-[11px] font-bold text-slate-600">会社紹介・事業の背景<textarea className="field min-h-36 resize-none leading-7" placeholder={'例）私たちは、〇〇業界で起きている「〇〇」という課題を解決するために事業を始めました。\n\n現在は〇〇向けに〇〇を提供しており、利用者は〇〇をより簡単に、早く、安全に行えるようになります。\n\nこの事業で目指しているのは、〇〇な社会をつくることです。今後は〇〇を強化し、〇〇領域まで展開していきます。'} value={form.bio} onChange={(event) => update('bio', event.target.value)} /></label>
            <label className="mt-3 grid gap-1 text-[11px] font-bold text-slate-600">実績・トラクション<textarea className="field min-h-28 resize-none leading-7" placeholder={'例）現在の導入社数は〇社、月間売上は〇万円です。\n\n直近では〇〇を達成し、前月比〇％で成長しています。\n\n主な実績として、〇〇への導入、〇〇との提携、〇〇賞の受賞があります。投資家の方には、〇〇の支援を期待しています。'} value={form.achievements} onChange={(event) => update('achievements', event.target.value)} /></label>
          </section>

          <section className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-black">会社ページ構成</h2>
                <p className="mt-1 text-xs font-bold text-slate-500">採用・資本提携どちらにも伝わるように、想い、文化、チームを整理します。</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-[11px] font-bold text-slate-600">ミッション・実現したい未来<textarea className="field min-h-24 resize-none leading-7" placeholder={'例）私たちは、〇〇を通じて、誰もが〇〇できる社会をつくります。\n\nこの市場で変えたい常識、届けたい価値、10年後に実現したい世界を書いてください。'} value={form.mission || ''} onChange={(event) => update('mission', event.target.value)} /></label>
              <label className="grid gap-1 text-[11px] font-bold text-slate-600">カルチャー・大切にしている価値観<textarea className="field min-h-24 resize-none leading-7" placeholder={'例）顧客の現場から考える、早く試して学ぶ、数字と誠実さを大切にする、など。\n\n普段の意思決定やチームで大切にしている行動を書いてください。'} value={form.culture || ''} onChange={(event) => update('culture', event.target.value)} /></label>
              <label className="grid gap-1 text-[11px] font-bold text-slate-600">チーム紹介<textarea className="field min-h-24 resize-none leading-7" placeholder={'例）代表、開発、営業、CSなど、どんな経験を持つメンバーが集まっているか。\n\nチームの強み、役割分担、これから採用・協力したい人も書けます。'} value={form.teamIntro || ''} onChange={(event) => update('teamIntro', event.target.value)} /></label>
            </div>
          </section>

          <section className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-base font-black">働き方タイプ診断</h2>
            <p className="mt-1 text-xs font-bold text-slate-500">診断結果のように、代表者・チームの意思決定スタイルを投資家へ伝えます。</p>
            <div className="mt-4 grid gap-4">
              <RangeInput label="意思決定スピード" left="慎重に検証" right="すぐ試す" value={form.workStyleSpeed || '3'} onChange={(value) => update('workStyleSpeed', value)} />
              <RangeInput label="チームの進め方" left="個人で深掘り" right="全員で議論" value={form.workStyleTeam || '3'} onChange={(value) => update('workStyleTeam', value)} />
              <RangeInput label="リスクの取り方" left="堅実に積む" right="大胆に挑む" value={form.workStyleRisk || '3'} onChange={(value) => update('workStyleRisk', value)} />
              <label className="grid gap-1 text-[11px] font-bold text-slate-600">自己理解メモ<textarea className="field min-h-24 resize-none leading-7" placeholder={'例）顧客課題が明確な領域では早く検証します。一方で、資金計画や採用では慎重に意思決定します。\n\n投資家や協業先が一緒に動く時に知っておくとよい特徴を書いてください。'} value={form.personalityProfile || ''} onChange={(event) => update('personalityProfile', event.target.value)} /></label>
            </div>
          </section>

          <section className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-base font-black">資金調達・KPI</h2>
            <p className="mt-1 text-xs font-bold text-slate-500">投資判断に必要な数字を見やすく整理します。</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Select label="フェーズ" value={form.stage} options={stages} onChange={(value) => update('stage', value)} />
              <Input label="調達希望額" value={form.fundingGoal} onChange={(value) => update('fundingGoal', value)} />
              <Input label="月次売上" value={form.monthlyRevenue} onChange={(value) => update('monthlyRevenue', value)} />
              <Input label="成長率" value={form.growthRate} onChange={(value) => update('growthRate', value)} />
              <Input label="導入社数" value={form.customerCount} onChange={(value) => update('customerCount', value)} />
            </div>
            <label className="mt-4 grid gap-1 text-[11px] font-bold text-slate-600">案件詳細<textarea className="field min-h-32 resize-none leading-7" placeholder={'例）現在の調達目的、投資家に見てほしいポイント、資金用途、今後12ヶ月の計画、面談で相談したいことを書いてください。'} value={form.dealDetails || ''} onChange={(event) => update('dealDetails', event.target.value)} /></label>
            <label className="mt-3 grid gap-2 text-[11px] font-bold text-slate-600">
              事業計画書・ピッチ資料
              <span className="secondary relative min-h-11 overflow-hidden">
                ファイルを選択
                <input className="absolute inset-0 opacity-0" type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,image/*" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  update('businessPlanName', file.name);
                  readFileAsDataUrl(file, (url) => update('businessPlanUrl', url));
                }} />
              </span>
              {form.businessPlanName && <span className="truncate rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-500">{form.businessPlanName}</span>}
            </label>
          </section>

          <section className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-base font-black">認証・連絡設定</h2>
            {form.identityStatus === 'resubmit' && <p className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-bold leading-6 text-rose-700">本人確認資料に不備があります。法人の場合は法人番号、個人事業主の場合は運転免許証の写真を再提出してください。</p>}
            {currentAccount && (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-3">
                <p className="text-xs font-black text-slate-700">ログイン情報</p>
                <div className="mt-3 grid gap-3">
                  <Input label="メールアドレス" value={form.email} onChange={(value) => update('email', value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <button className="secondary min-h-10 text-[11px]" onClick={requestEmailChange}>確認メールを送る</button>
                    <button className="primary min-h-10 text-[11px]" onClick={confirmEmailChange}>認証を確認</button>
                  </div>
                  <Input label="電話番号" value={form.phone} onChange={(value) => update('phone', value)} />
                  <button className="secondary min-h-10 text-[11px]" onClick={savePhoneOnly}>電話番号だけ変更</button>
                  {contactMessage && <p className="text-xs font-bold leading-5 text-slate-500">{contactMessage}</p>}
                </div>
              </div>
            )}
            <div className="mt-4 grid gap-3">
              <Select label="本人確認種別" value={form.businessType} options={['corporation', 'sole']} displayMap={{ corporation: '法人', sole: '個人事業主' }} onChange={(value) => update('businessType', value)} />
              {form.businessType === 'corporation' ? <Input label="法人番号" value={form.corporateNumber} onChange={(value) => update('corporateNumber', value)} /> : <label className="grid gap-1 text-[11px] font-bold text-slate-600">運転免許証の写真<input className="field" type="file" accept="image/*" onChange={(event) => update('licenseFileName', event.target.files?.[0]?.name || '')} />{form.licenseFileName && <span className="text-slate-500">{form.licenseFileName}</span>}</label>}
              <label className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-600"><input type="checkbox" checked={form.emailNotificationsEnabled} onChange={(event) => update('emailNotificationsEnabled', event.target.checked)} />メール通知を受け取る</label>
              <label className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-600"><input type="checkbox" checked={form.hideSocialGraph} onChange={(event) => update('hideSocialGraph', event.target.checked)} />フォロー・フォロワーリストを非表示にする</label>
            </div>
          </section>

          <button className="primary w-full shadow-sm" onClick={save}>プロフィールを保存する</button>
          </div>
        </div>
      </div>
    );
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
          {currentAccount && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3">
              <p className="text-xs font-black text-slate-700">ログイン情報</p>
              <div className="mt-3 grid gap-3">
                <Input label="メールアドレス" value={form.email} onChange={(value) => update('email', value)} />
                <div className="grid grid-cols-2 gap-2">
                  <button className="secondary min-h-10 text-[11px]" onClick={requestEmailChange}>確認メールを送る</button>
                  <button className="primary min-h-10 text-[11px]" onClick={confirmEmailChange}>メール認証を確認して変更</button>
                </div>
                <Input label="電話番号" value={form.phone} onChange={(value) => update('phone', value)} />
                <button className="secondary min-h-10 text-[11px]" onClick={savePhoneOnly}>電話番号だけ変更する</button>
                {contactMessage && <p className="text-xs font-bold leading-5 text-slate-500">{contactMessage}</p>}
              </div>
            </div>
          )}
          <Input label="名前" value={form.name} onChange={(value) => update('name', value)} />
          <Input label="会社名" value={form.company} onChange={(value) => update('company', value)} />
          <Input label="肩書き" value={form.title} onChange={(value) => update('title', value)} />
          <Select label="業界" value={form.industry} options={industries} onChange={(value) => update('industry', value)} />
          <Select label="地域" value={form.location} options={locations} onChange={(value) => update('location', value)} />
          <Select label="フェーズ" value={form.stage} options={stages} onChange={(value) => update('stage', value)} />
          <div className="grid grid-cols-2 gap-2"><Select label="設立年" value={form.foundedYear} options={foundedYears} onChange={(value) => update('foundedYear', value)} /><Select label="設立月" value={form.foundedMonth} options={foundedMonths} onChange={(value) => update('foundedMonth', value)} /></div>
          <Select label="従業員数" value={form.employeeSize} options={employeeSizes} onChange={(value) => update('employeeSize', value)} />
          <Select label="年商規模" value={form.revenueScale} options={revenueScales} onChange={(value) => update('revenueScale', value)} />
          <label className="grid gap-1 text-[11px] font-bold text-slate-600">実績<textarea className="field min-h-20 resize-none" placeholder="受賞歴、導入実績、投資実績、支援実績など" value={form.achievements} onChange={(event) => update('achievements', event.target.value)} /></label>
          <label className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-600"><input type="checkbox" checked={form.emailNotificationsEnabled} onChange={(event) => update('emailNotificationsEnabled', event.target.checked)} />コメント・面談希望・運営連絡などのメール通知を受け取る</label>
          <label className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-600"><input type="checkbox" checked={form.hideSocialGraph} onChange={(event) => update('hideSocialGraph', event.target.checked)} />フォロー・フォロワーリストを他のユーザーに非表示にする</label>
          {form.identityStatus === 'resubmit' && <p className="rounded-2xl bg-rose-50 p-3 text-xs font-bold leading-6 text-rose-700">本人確認資料に不備があります。再提出してください。</p>}
          <Select label="本人確認種別" value={form.businessType} options={['corporation', 'sole']} displayMap={{ corporation: '法人', sole: '個人事業主' }} onChange={(value) => update('businessType', value)} />
          {form.businessType === 'corporation' ? <Input label="法人番号" value={form.corporateNumber} onChange={(value) => update('corporateNumber', value)} /> : <label className="grid gap-1 text-[11px] font-bold text-slate-600">運転免許証の写真<input className="field" type="file" accept="image/*" onChange={(event) => update('licenseFileName', event.target.files?.[0]?.name || '')} />{form.licenseFileName && <span className="text-slate-500">{form.licenseFileName}</span>}</label>}
          <Input label="投資可能額" value={form.investmentRange} onChange={(value) => update('investmentRange', value)} />
          <Input label="支援できること" value={form.supportAreas} onChange={(value) => update('supportAreas', value)} />
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

function AdminPage({ accounts, posts, meetingApplications, setAccounts, setPosts, setMessages, setNotices, reviewMeetingApplication, openProfile }: { accounts: Account[]; posts: Post[]; meetingApplications: MeetingApplication[]; setAccounts: (accounts: Account[]) => void; setPosts: (posts: Post[]) => void; setMessages: (updater: DirectMessage[] | ((messages: DirectMessage[]) => DirectMessage[])) => void; setNotices: (updater: Notice[] | ((notices: Notice[]) => Notice[])) => void; reviewMeetingApplication: (applicationId: string, status: 'approved' | 'rejected') => void; openProfile: (account: Account) => void }) {
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSubject, setBroadcastSubject] = useState('Leap運営からのお知らせ');
  const [broadcastEmailBody, setBroadcastEmailBody] = useState('');
  const [broadcastEmailStatus, setBroadcastEmailStatus] = useState('');
  const pendingTickets = accounts.filter((account) => account.ticketRequestStatus === 'pending');
  const hiddenPosts = posts.filter((post) => post.isHidden);
  const pendingMeetings = meetingApplications.filter((application) => application.status === 'pending');
  const activeUsers = accounts.filter((account) => account.email.trim().toLowerCase() !== adminEmail && !account.isDeleted);
  const identitySubmissions = activeUsers.filter((account) => account.corporateNumber || account.licenseFileName || account.identityStatus === 'resubmit');
  const broadcastEmailRecipients = Array.from(new Set(activeUsers.filter(canReceiveBroadcastEmail).map((account) => account.email.trim().toLowerCase())));
  const skippedEmailRecipients = activeUsers.length - broadcastEmailRecipients.length;
  function approveTicket(account: Account) {
    const count = Number(account.ticketRequestPlan.replace('枚', '')) || 1;
    setAccounts(accounts.map((item) => item.id === account.id ? { ...item, ticketBalance: item.ticketBalance + count, ticketRequestStatus: 'none', ticketRequestPlan: '', ticketTransferName: '' } : item));
  }
  function rejectTicket(account: Account) {
    setAccounts(accounts.map((item) => item.id === account.id ? { ...item, ticketRequestStatus: 'none', ticketRequestPlan: '', ticketTransferName: '' } : item));
  }
  function hideUser(account: Account, hidden: boolean) {
    setAccounts(accounts.map((item) => item.id === account.id ? { ...item, isHidden: hidden } : item));
    if (hidden) {
      setNotices((list) => [{ id: crypto.randomUUID(), userId: account.id, body: 'アカウントが非表示となっています', createdAt: new Date().toISOString(), unread: true }, ...list]);
      if (account.emailNotificationsEnabled) void sendDirectEmail(account.email, 'Leap: アカウントが非表示となっています', '運営により、あなたのアカウントは現在非表示となっています。詳細は運営までお問い合わせください。');
    }
  }
  function deleteUser(account: Account) {
    setAccounts(accounts.map((item) => item.id === account.id ? { ...item, isDeleted: true, isHidden: true } : item));
    setPosts(posts.filter((post) => post.authorId !== account.id));
    void sendDirectEmail(account.email, 'Leap: アカウント削除のお知らせ', '運営によりアカウントが削除されました。');
  }
  function approveIdentity(account: Account) {
    setAccounts(accounts.map((item) => item.id === account.id ? { ...item, verified: true, identityStatus: 'verified' } : item));
    setNotices((list) => [{ id: crypto.randomUUID(), userId: account.id, body: '本人確認資料が承認されました', createdAt: new Date().toISOString(), unread: true }, ...list]);
  }
  function removeIdentityMark(account: Account) {
    setAccounts(accounts.map((item) => item.id === account.id ? { ...item, verified: false, identityStatus: 'none' } : item));
    setNotices((list) => [{ id: crypto.randomUUID(), userId: account.id, body: '本人確認済みマークが解除されました', createdAt: new Date().toISOString(), unread: true }, ...list]);
  }
  function requestIdentityResubmission(account: Account) {
    setAccounts(accounts.map((item) => item.id === account.id ? { ...item, verified: false, identityStatus: 'resubmit', corporateNumber: '', licenseFileName: '' } : item));
    setNotices((list) => [{ id: crypto.randomUUID(), userId: account.id, body: '本人確認資料に不備があります。プロフィール編集から再提出してください。', createdAt: new Date().toISOString(), unread: true }, ...list]);
    if (account.emailNotificationsEnabled) void sendDirectEmail(account.email, 'Leap: 本人確認資料の再提出をお願いします', '本人確認資料に不備がありました。プロフィール編集画面から、法人の場合は法人番号、個人事業主の場合は運転免許証の写真を再提出してください。');
  }
  function sendBroadcastMessage() {
    if (!broadcastMessage.trim()) return;
    const now = new Date().toISOString();
    setMessages((list) => [
      ...activeUsers.map((account) => ({ id: crypto.randomUUID(), partnerId: adminAccount.id, senderId: adminAccount.id, recipientId: account.id, kind: 'direct' as const, body: broadcastMessage.trim(), createdAt: now, mine: false })),
      ...list,
    ]);
    setNotices((list) => [
      ...activeUsers.map((account) => ({ id: crypto.randomUUID(), userId: account.id, body: '運営からメッセージが届きました', createdAt: now, unread: true })),
      ...list,
    ]);
    setBroadcastMessage('');
  }
  async function sendBroadcastEmail() {
    if (!broadcastEmailBody.trim()) return;
    const recipients = broadcastEmailRecipients;
    if (recipients.length === 0) {
      setBroadcastEmailStatus('送信対象のメールアドレスがありません。実在するメールアドレス・メール通知オン・削除されていないユーザーのみ送信対象です。');
      return;
    }
    setBroadcastEmailStatus(`${recipients.length}件へ送信中です...`);
    const result = await sendDirectEmail(recipients, broadcastSubject || 'Leap運営からのお知らせ', broadcastEmailBody);
    if (result.ok) {
      const failedText = result.failed ? `（${result.failed}件は失敗）` : '';
      const skippedText = skippedEmailRecipients > 0 ? `\n${skippedEmailRecipients}件はメール未設定・通知オフ・bot等のため送信対象外です。` : '';
      setBroadcastEmailStatus(`${result.sent ?? recipients.length}件へ一斉メールを送信しました。${failedText}${skippedText}${result.error ? `\n${result.error}` : ''}`);
      setBroadcastEmailBody('');
      return;
    }
    setBroadcastEmailStatus(`一斉メール送信に失敗しました：${result.error || '原因不明のエラー'}\n\n確認項目：VercelのRESEND_API_KEYがre_から始まる値か、NOTIFICATION_FROM_EMAILがResendで認証済みドメインのメールかを確認してください。`);
    return;
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
        <h2 className="text-sm font-black">本人確認資料確認</h2>
        {identitySubmissions.length === 0 ? <p className="mt-3 text-sm text-slate-500">確認できる本人確認資料はまだありません。</p> : (
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {identitySubmissions.map((account) => (
              <div key={account.id} className="rounded-2xl bg-slate-50 p-3">
                <button className="flex w-full items-center gap-3 text-left" onClick={() => openProfile(account)}>
                  <Avatar account={account} />
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-sm">{displayAccountName(account)} {account.verified && <CheckCircle2 className="inline text-blue-600" size={14} />}</b>
                    <span className="block truncate text-xs text-slate-500">{account.company || '会社名未設定'} / {account.role === 'entrepreneur' ? '起業家' : '投資家'}</span>
                  </span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black ${account.identityStatus === 'resubmit' ? 'bg-rose-50 text-rose-700' : account.verified ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{account.identityStatus === 'resubmit' ? '再提出依頼中' : account.verified ? '本人確認済み' : '提出済み'}</span>
                </button>
                <div className="mt-3 rounded-2xl bg-white p-3 text-xs font-bold leading-6 text-slate-600">
                  <p>本人確認種別：{account.businessType === 'corporation' ? '法人' : '個人事業主'}</p>
                  {account.businessType === 'corporation' ? <p>法人番号：{account.corporateNumber || '未提出'}</p> : <p>運転免許証：{account.licenseFileName || '未提出'}</p>}
                  <p>登録メール：{account.email || '未登録'}</p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button className="rounded-xl bg-blue-600 px-3 py-2 text-[11px] font-black text-white" onClick={() => approveIdentity(account)}>承認</button>
                  <button className="secondary min-h-9 text-[11px]" onClick={() => removeIdentityMark(account)}>マーク解除</button>
                  <button className="rounded-xl border border-rose-100 px-3 py-2 text-[11px] font-black text-rose-600" onClick={() => requestIdentityResubmission(account)}>再提出依頼</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
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
            {pendingTickets.map((account) => <div key={account.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><Avatar account={account} /><div className="min-w-0 flex-1"><b className="block truncate text-sm">{account.accountName || account.name || account.email}</b><span className="block text-xs text-slate-500">購入枚数：{account.ticketRequestPlan || '1枚'} / 振込名義：{account.ticketTransferName || '未入力'}</span><span className="block text-xs text-slate-500">{account.company || '会社名未設定'}</span></div><div className="grid gap-2"><button className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white" onClick={() => approveTicket(account)}>承認</button><button className="rounded-xl border border-rose-100 px-3 py-2 text-xs font-black text-rose-600" onClick={() => rejectTicket(account)}>非承認</button></div></div>)}
          </div>
        )}
      </section>
      <section className="mt-5 rounded-2xl border border-slate-100 p-4">
        <h2 className="text-sm font-black">メンバー一覧</h2>
        {accounts.length === 0 ? <p className="mt-3 text-sm text-slate-500">登録ユーザーはまだいません。</p> : (
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {activeUsers.map((account) => <div key={account.id} className="rounded-2xl bg-slate-50 p-3"><button className="flex w-full items-center gap-3 text-left" onClick={() => openProfile(account)}><Avatar account={account} /><span className="min-w-0 flex-1"><b className="block truncate text-sm">{account.accountName || account.name || '未設定'}</b><span className="block truncate text-xs text-slate-500">{account.email || 'メール未登録'} / {account.company || '会社名未設定'}</span></span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-500">{account.isHidden ? '非表示' : account.role === 'entrepreneur' ? '起業家' : '投資家'}</span></button><div className="mt-3 grid grid-cols-3 gap-2"><button className="secondary min-h-9 text-[11px]" onClick={() => hideUser(account, false)}>公開</button><button className="secondary min-h-9 text-[11px]" onClick={() => hideUser(account, true)}>非表示</button><button className="secondary min-h-9 text-[11px] text-rose-600" onClick={() => deleteUser(account)}>削除</button></div></div>)}
          </div>
        )}
      </section>
      <section className="mt-5 rounded-2xl border border-slate-100 p-4">
        <h2 className="text-sm font-black">一斉メッセージ・一斉メール</h2>
        <label className="mt-3 grid gap-1 text-[11px] font-bold text-slate-600">全ユーザーへの運営メッセージ<textarea className="field min-h-24 resize-none" value={broadcastMessage} onChange={(event) => setBroadcastMessage(event.target.value)} /></label>
        <button className="primary mt-3 w-full" onClick={sendBroadcastMessage}>全ユーザーへメッセージ送信</button>
        <Input label="メール件名" value={broadcastSubject} onChange={setBroadcastSubject} />
        <label className="mt-3 grid gap-1 text-[11px] font-bold text-slate-600">登録メールアドレスへの一斉DM<textarea className="field min-h-24 resize-none" value={broadcastEmailBody} onChange={(event) => setBroadcastEmailBody(event.target.value)} /></label>
        <p className="mt-2 rounded-2xl bg-blue-50 p-3 text-xs font-bold leading-5 text-blue-700">送信対象：{broadcastEmailRecipients.length}件 / 対象外：{skippedEmailRecipients}件。実在するメールアドレスで、通知オンのユーザーだけに送信します。</p>
        <button className="secondary mt-3 w-full disabled:opacity-50" disabled={broadcastEmailRecipients.length === 0 || !broadcastEmailBody.trim()} onClick={sendBroadcastEmail}>登録メールアドレスへ一斉メール送信</button>
        {broadcastEmailStatus && <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-3 text-xs font-bold leading-6 text-slate-600">{broadcastEmailStatus}</p>}
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

function ProfilePage({ account, accounts, currentAccount, posts, blogs, isFollowing, isMine, follow, message, requestMeeting, openDeal, dealMode, setPage, reactToPost, startEditPost, hidePost, deletePost, startEditBlog, hideBlog, deleteBlog }: { account: Account; accounts: Account[]; currentAccount: Account | null; posts: Post[]; blogs: BlogArticle[]; isFollowing: boolean; isMine: boolean; follow: () => void; message: () => void; requestMeeting: () => void; openDeal: () => void; dealMode: boolean; setPage: (page: Page) => void; reactToPost: (postId: string, type: 'like' | 'save' | 'meeting') => void; startEditPost: (post: Post) => void; hidePost: (postId: string) => void; deletePost: (postId: string) => void; startEditBlog: (blog: BlogArticle) => void; hideBlog: (blogId: string) => void; deleteBlog: (blogId: string) => void }) {
  const [tab, setTab] = useState<'overview' | 'achievements' | 'posts' | 'blogs'>('overview');
  if (dealMode && account.role === 'entrepreneur') return <DealPage account={account} requestMeeting={requestMeeting} />;
  return (
    <div>
      <ProfileHero account={account} accounts={accounts} isMine={isMine} posts={posts} setPage={setPage} compact={tab !== 'overview'} />
      <div className="grid grid-cols-4 border-b border-slate-100 text-center text-[11px] font-bold">
        <button className={`py-2 ${tab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`} onClick={() => setTab('overview')}>概要</button>
        <button className={`py-2 ${tab === 'achievements' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`} onClick={() => setTab('achievements')}>実績</button>
        <button className={`py-2 ${tab === 'posts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`} onClick={() => setTab('posts')}>投稿</button>
        <button className={`py-2 ${tab === 'blogs' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`} onClick={() => setTab('blogs')}>ブログ</button>
      </div>
      {tab === 'overview' && (
        <div className="bg-[#f5f8fb] px-4 py-5 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-5">
              {account.profileImageUrl && (
                <img src={account.profileImageUrl} alt={account.profileImageName || '会社紹介画像'} className="aspect-[16/9] w-full rounded-[28px] object-cover shadow-sm ring-1 ring-slate-100" />
              )}
              <CompanyStorySection eyebrow="WHAT WE DO" title={account.role === 'entrepreneur' ? 'なにをやっているのか' : 'どんな投資をしているのか'} body={account.bio || '事業内容はまだ登録されていません。プロフィール編集から、解決している課題、提供サービス、顧客に届けている価値を記載してください。'} muted={!account.bio} />
              {account.role === 'entrepreneur' && (
                <>
                  <CompanyStorySection eyebrow="WHY" title="なぜやるのか" body={account.mission || '創業の背景や、実現したい未来はまだ登録されていません。なぜこの事業を続けるのか、誰のどんな課題を変えたいのかを書いてください。'} muted={!account.mission} />
                  <CompanyStorySection eyebrow="HOW" title="どうやっているのか" body={account.culture || '事業の進め方、大切にしている価値観、顧客との向き合い方はまだ登録されていません。チームらしさが伝わる内容を書くと、投資家が判断しやすくなります。'} muted={!account.culture} />
                  <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
                    <p className="text-[10px] font-black tracking-[0.18em] text-blue-600">MEMBERS</p>
                    <h3 className="mt-1 text-lg font-black">メンバー</h3>
                    <div className="mt-4 flex gap-4">
                      <Avatar account={account} size="lg" />
                      <div className="min-w-0 flex-1">
                        <b className="block truncate text-sm">{account.name || '代表者名未設定'}</b>
                        <span className="text-xs font-bold text-slate-500">{account.title || '肩書き未設定'}</span>
                        <p className={`mt-3 whitespace-pre-line text-sm leading-7 ${account.teamIntro ? 'text-slate-600' : 'text-slate-400'}`}>{account.teamIntro || 'チーム紹介はまだ登録されていません。創業メンバーの経験、役割、これから仲間にしたい人を書いてください。'}</p>
                      </div>
                    </div>
                  </section>
                  <CultureMap account={account} />
                </>
              )}
              <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.18em] text-blue-600">STORY</p>
                    <h3 className="mt-1 text-lg font-black">ストーリー</h3>
                  </div>
                  {isMine && <button className="secondary min-h-9 px-3 text-[11px]" onClick={() => setPage('profileEdit')}>編集する</button>}
                </div>
                {blogs.length === 0 ? (
                  <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-7 text-slate-500">会社紹介、事業への想い、顧客事例などのブログを書くと、ここに表示されます。</p>
                ) : (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {blogs.slice(0, 2).map((blog) => <MiniBlogCard key={blog.id} blog={blog} />)}
                  </div>
                )}
              </section>
            </div>
            <aside className="grid gap-4 lg:sticky lg:top-4 lg:self-start">
              <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <p className="text-[10px] font-black tracking-[0.18em] text-blue-600">HIGHLIGHT</p>
                <h3 className="mt-1 text-lg font-black">会社のハイライト</h3>
                <KpiGrid account={account} />
                {account.role === 'entrepreneur' && <button className="secondary mt-4 w-full" onClick={openDeal}>案件詳細を見る</button>}
              </section>
              <CompanyInfoPanel account={account} />
              {!isMine && (
                <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="grid gap-2">
                    <button className="primary w-full" onClick={requestMeeting}>面談を申し込む</button>
                    <button className="secondary w-full" onClick={message}>メッセージ</button>
                    <button className="secondary w-full" onClick={follow}>{isFollowing ? 'フォロー解除' : 'フォローする'}</button>
                  </div>
                </section>
              )}
            </aside>
          </div>
        </div>
      )}
      {tab === 'achievements' && (
        <div className="px-3 py-2">
          <TextBlock title="実績" body={account.achievements || '実績はまだ登録されていません。'} muted={!account.achievements} />
        </div>
      )}
      {tab === 'posts' && (
        <div className="divide-y divide-[#e5e7eb]">
          {posts.length === 0 ? <EmptyState icon={<FileText size={28} />} title="投稿はまだありません" body="投稿されるとここに表示されます。" /> : posts.map((post) => <PostCard key={post.id} post={post} author={account} currentAccount={currentAccount} openProfile={() => undefined} reactToPost={reactToPost} startEditPost={startEditPost} hidePost={hidePost} deletePost={deletePost} />)}
        </div>
      )}
      {tab === 'blogs' && (
        <div className="divide-y divide-slate-100">
          {blogs.length === 0 ? <EmptyState icon={<FileText size={28} />} title="ブログはまだありません" body="公開されたブログがここに表示されます。" /> : blogs.map((blog) => <BlogCard key={blog.id} blog={blog} author={account} currentAccount={currentAccount} startEditBlog={startEditBlog} hideBlog={hideBlog} deleteBlog={deleteBlog} />)}
        </div>
      )}
    </div>
  );
}

function CompanyStorySection({ eyebrow, title, body, muted = false }: { eyebrow: string; title: string; body: string; muted?: boolean }) {
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <p className="text-[10px] font-black tracking-[0.18em] text-blue-600">{eyebrow}</p>
      <h3 className="mt-1 text-xl font-black tracking-tight">{title}</h3>
      <p className={`mt-4 whitespace-pre-line text-[15px] font-bold leading-8 ${muted ? 'text-slate-400' : 'text-slate-700'}`}>{body}</p>
    </section>
  );
}

function CultureMap({ account }: { account: Account }) {
  const rows = [
    ['スピード', '慎重に検証', 'すぐ試す', Number(account.workStyleSpeed || 3)],
    ['チーム', '個人で深掘り', '全員で議論', Number(account.workStyleTeam || 3)],
    ['リスク', '堅実に積む', '大胆に挑む', Number(account.workStyleRisk || 3)],
  ] as const;
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <p className="text-[10px] font-black tracking-[0.18em] text-blue-600">CULTURE MAP</p>
      <h3 className="mt-1 text-lg font-black">組織の特徴</h3>
      <div className="mt-4 grid gap-4">
        {rows.map(([label, left, right, value]) => (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between text-[11px] font-black text-slate-500"><span>{left}</span><b className="text-slate-900">{label}</b><span>{right}</span></div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, Math.max(20, value * 20))}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className={`mt-4 whitespace-pre-line text-sm font-bold leading-7 ${account.personalityProfile ? 'text-slate-600' : 'text-slate-400'}`}>{account.personalityProfile || '意思決定やチームの特徴はまだ登録されていません。プロフィール編集で、投資家が一緒に動く時に知っておくとよい特徴を書けます。'}</p>
    </section>
  );
}

function CompanyInfoPanel({ account }: { account: Account }) {
  const rows = [
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
      <TextBlock title="案件詳細" body={account.dealDetails || '案件詳細はまだ登録されていません。'} muted={!account.dealDetails} />
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
    <article className={`relative border-b border-[#eff3f4] px-4 py-3 ${post.isHidden ? 'bg-slate-50' : 'bg-white'}`}>
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
                <b className="truncate text-[14px] font-black text-[#0f1419]">{authorName}</b>
                <span className="shrink-0 text-[11px] font-medium text-[#536471]">・{formatRelativeTime(post.createdAt)}</span>
              </span>
              {secondaryLabel && <span className="mt-0.5 inline-flex rounded-full bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-bold leading-none text-[#536471]">{secondaryLabel}</span>}
            </button>
            <button className="grid h-6 w-6 shrink-0 place-items-center rounded-full hover:bg-slate-50" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={17} className="text-[#536471]" /></button>
          </div>

          <p className="mt-0.5 whitespace-pre-wrap text-[15px] font-normal leading-[1.55] text-[#0f1419]">{renderPostBody(post.body)}</p>
          {post.tags.length > 0 && <div className="mt-0.5 flex flex-wrap gap-x-1.5 gap-y-0.5">{post.tags.map((tag) => <span className="text-[11px] font-semibold text-blue-600" key={tag}>#{tag}</span>)}</div>}
          {post.imageUrl && <button className="mt-1.5 block w-full" onClick={() => setPreviewImage(true)}><img className="aspect-square w-full rounded-2xl object-cover" src={post.imageUrl} alt={post.imageName || '投稿画像'} /></button>}
          {post.attachmentName && <div className="mt-1.5 flex items-center gap-1.5 rounded-2xl bg-slate-50 p-2 text-[11px]"><Paperclip size={13} />{post.attachmentName}</div>}
          <div className="mt-1.5 flex items-center gap-5 text-[12px] font-semibold text-[#536471]">
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
  ] as const;
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-5 border-t border-slate-100 bg-white px-1 py-0.5 shadow-[0_-8px_20px_rgba(15,23,42,0.06)] lg:hidden">
      {tabs.slice(0, 2).map(([key, label, Icon]) => (
        <button key={key} className={`grid justify-items-center gap-0.5 rounded-xl px-1 py-1 text-[9px] font-bold ${page === key ? 'text-blue-600' : 'text-slate-500'}`} onClick={() => setPage(key as Page)}>
          <Icon size={17} />
          <span>{label}</span>
        </button>
      ))}
      <button className="grid justify-items-center gap-0.5 rounded-xl bg-[#050816] px-1 py-1 text-[9px] font-bold text-white" onClick={openComposer} aria-label="投稿する">
        <Plus size={17} />
        <span>投稿</span>
      </button>
      {tabs.slice(2).map(([key, label, Icon]) => (
          <button key={key} className={`grid justify-items-center gap-0.5 rounded-xl px-1 py-1 text-[9px] font-bold ${page === key ? 'text-blue-600' : 'text-slate-500'}`} onClick={() => setPage(key as Page)}>
            <Icon size={17} />
            <span>{label}</span>
          </button>
      ))}
    </nav>
  );
}

function ProfileHero({ account, accounts, isMine, posts, setPage, compact = false, hideCover = false, onPostsClick, onFollowingClick, onFollowersClick, onTicketsClick }: { account: Account; accounts: Account[]; isMine: boolean; posts: Post[]; setPage: (page: Page) => void; compact?: boolean; hideCover?: boolean; onPostsClick?: () => void; onFollowingClick?: () => void; onFollowersClick?: () => void; onTicketsClick?: () => void }) {
  const normalized = normalizeAccount(account);
  const followings = normalized.followingIds.map((id) => accounts.find((item) => item.id === id)).filter(Boolean) as Account[];
  const followers = normalized.followerIds.map((id) => accounts.find((item) => item.id === id)).filter(Boolean) as Account[];
  const visibleFollowings = isMine ? followings : followings.filter((item) => item.role !== 'investor');
  const visibleFollowers = isMine ? followers : followers.filter((item) => item.role !== 'investor');
  const profileLead = account.title || account.bio || '会社の想いと事業内容はまだ登録されていません。';
  return (
    <section className={compact ? 'border-b border-slate-100 bg-white px-3 py-2' : 'overflow-hidden border-b border-slate-100 bg-white'}>
      {compact ? (
        <div className="flex items-center gap-2">
          <Avatar account={account} size="md" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-black">{account.company || account.name || account.accountName || '名前未設定'} {account.verified && <CheckCircle2 className="inline text-blue-600" size={13} />}</h2>
            <p className="truncate text-[11px] font-bold text-slate-500">@{account.accountName || 'account'} / {account.title || account.stage || 'プロフィール未設定'}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="px-4 pb-3 pt-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-3xl bg-white p-1 ring-1 ring-slate-100">
                <Avatar account={account} size="lg" />
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-center gap-1">
                  <h2 className="truncate text-lg font-black tracking-tight text-slate-950">{account.company || account.name || account.accountName || 'プロフィール未設定'}</h2>
                  {account.verified && <CheckCircle2 className="shrink-0 text-blue-600" size={14} />}
                </div>
                <p className="mt-0.5 truncate text-xs font-bold text-slate-600">{account.name || '名前未設定'} / {account.title || '肩書き未設定'}</p>
                <p className="mt-0.5 truncate text-[11px] font-bold text-slate-500">@{account.accountName || 'account'}　{account.location || '地域未設定'}　{account.foundedYear && account.foundedMonth ? `${account.foundedYear}年${account.foundedMonth}` : '設立年月未設定'}</p>
              </div>
              {isMine && (
                <button className="secondary mt-1 min-h-8 shrink-0 px-3 text-[11px]" onClick={() => setPage('profileEdit')}>編集</button>
              )}
            </div>
            <div className="mt-3">
              <p className="whitespace-pre-line text-[13px] font-bold leading-5 text-slate-800">{profileLead}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[account.industry, account.stage, account.employeeSize, account.revenueScale].filter(Boolean).map((item) => <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-black text-slate-600" key={item}>{item}</span>)}
              </div>
              <div className="mt-3 grid grid-cols-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60 text-center text-[10px] font-bold text-slate-500">
                <button className="px-1 py-1.5 hover:bg-white/70" onClick={onPostsClick} disabled={!onPostsClick}><b className="block text-[13px] leading-4 text-slate-950">{posts.length}</b>投稿</button>
                <button className="px-1 py-1.5 hover:bg-white/70" onClick={onFollowingClick} disabled={!onFollowingClick}><b className="block text-[13px] leading-4 text-slate-950">{visibleFollowings.length}</b>フォロー</button>
                <button className="px-1 py-1.5 hover:bg-white/70" onClick={onFollowersClick} disabled={!onFollowersClick}><b className="block text-[13px] leading-4 text-slate-950">{visibleFollowers.length}</b>フォロワー</button>
                <button className="px-1 py-1.5 hover:bg-white/70" onClick={onTicketsClick} disabled={!onTicketsClick}><b className="block text-[13px] leading-4 text-slate-950">{account.role === 'entrepreneur' ? account.ticketBalance : '-'}</b>{account.role === 'entrepreneur' && isMine ? 'チケット' : '確認'}</button>
              </div>
              {isMine && account.identityStatus === 'resubmit' && <p className="mt-3 rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-700">本人確認資料の再提出が必要です</p>}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function SocialList({ title, accounts }: { title: string; accounts: Account[] }) {
  return (
    <div>
      <p className="font-black text-slate-700">{title}</p>
      {accounts.length === 0 ? (
        <p className="mt-1 text-slate-500">なし</p>
      ) : (
        <div className="mt-2 grid gap-2">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
              <Avatar account={account} />
              <span className="min-w-0 flex-1">
                <b className="block truncate text-xs text-slate-800">{displayAccountName(account)}</b>
                <span className="text-[10px] font-bold text-slate-500">{account.role === 'investor' ? '投資家' : '起業家'} / {account.company || '会社名未設定'}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function KpiGrid({ account }: { account: Account }) {
  const items = account.role === 'entrepreneur'
    ? [['調達希望額', account.fundingGoal], ['月次売上', account.monthlyRevenue], ['成長率', account.growthRate], ['導入社数', account.customerCount], ['フェーズ', account.stage], ['累計投資金額', '未入力']]
    : [['投資可能額', account.investmentRange], ['投資領域', account.industry], ['投資ステージ', account.stage], ['支援内容', account.supportAreas], ['地域', account.location], ['累計投資金額', '未入力']];
  return <div className="mt-3 grid grid-cols-3 gap-2">{items.map(([label, value]) => <div className="rounded-2xl border border-slate-100 p-3" key={label}><span className="text-[10px] font-bold text-slate-500">{label}</span><b className="mt-2 block break-words text-xs">{value || '未入力'}</b></div>)}</div>;
}

function EmptyState({ icon, title, body, action, onAction, compact }: { icon: ReactNode; title: string; body: string; action?: string; onAction?: () => void; compact?: boolean }) {
  if (compact) {
    return (
      <div className="px-0 py-0 text-left">
        <div className="flex items-center gap-2.5 rounded-none bg-slate-50 px-3 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">{icon}</div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[13px] font-black">{title}</h2>
            <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{body}</p>
          </div>
          {action && <button className="primary min-h-8 shrink-0 px-3 py-1.5 text-[10px]" onClick={onAction}>{action}</button>}
        </div>
      </div>
    );
  }
  return (
    <div className="grid min-h-52 place-items-center p-5 text-center">
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
      <span className="min-w-0 flex-1"><b className="block truncate text-sm">{displayAccountName(account)}</b><span className="text-xs text-slate-500">{account.role === 'entrepreneur' ? '起業家' : '投資家'} / {account.industry || '業界未入力'}</span></span>
      <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">{account.location || '地域未入力'}</span>
    </button>
  );
}

function Avatar({ account, size = 'md', active }: { account: Account; size?: 'md' | 'feed' | 'lg'; active?: boolean }) {
  const dimension = size === 'lg' ? 'h-20 w-20' : size === 'feed' ? 'h-12 w-12' : 'h-11 w-11';
  const iconSize = size === 'lg' ? 30 : size === 'feed' ? 21 : 17;
  return (
    <span className={`relative grid ${dimension} shrink-0 place-items-center overflow-hidden rounded-full bg-[#f2f4f7] text-slate-400 ring-1 ring-[#e5e7eb]`}>
      {account.avatarUrl ? <img src={account.avatarUrl} alt={displayAccountName(account)} className="h-full w-full object-cover" /> : <Building2 size={iconSize} strokeWidth={1.8} />}
      {active && <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />}
    </span>
  );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto overscroll-contain bg-black/40 p-3">
      <div className="my-3 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[430px] flex-col rounded-[26px] bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between p-5 pb-3">
          <h2 className="text-base font-black">{title}</h2>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-slate-100" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          {children}
        </div>
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

function RangeInput({ label, left, right, value, onChange }: { label: string; left: string; right: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-[11px] font-bold text-slate-600">
      <span className="flex items-center justify-between gap-3"><b>{label}</b><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] text-blue-700">Lv.{value || '3'}</span></span>
      <input className="w-full accent-blue-600" type="range" min="1" max="5" value={value || '3'} onChange={(event) => onChange(event.target.value)} />
      <span className="flex justify-between text-[10px] text-slate-400"><span>{left}</span><span>{right}</span></span>
    </label>
  );
}

function Select({ label, value, options, onChange, displayMap }: { label: string; value: string; options: string[]; onChange: (value: string) => void; displayMap?: Record<string, string> }) {
  return <label className="mt-3 grid gap-1 text-[11px] font-bold text-slate-600">{label}<select className="field" value={value} onChange={(event) => onChange(event.target.value)}><option value="">選択してください</option>{options.map((option) => <option key={option} value={option}>{displayMap?.[option] ?? option}</option>)}</select></label>;
}

function TextBlock({ title, body, muted = false }: { title: string; body: string; muted?: boolean }) {
  return <section className="mt-5"><h3 className="text-sm font-black">{title}</h3><p className={`mt-2 whitespace-pre-line text-[15px] font-bold leading-8 ${muted ? 'text-slate-400' : 'text-slate-700'}`}>{body}</p></section>;
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

function canSeeBlog(blog: BlogArticle, viewer: Account | null, following: string[]) {
  if (blog.visibility === 'public') return true;
  if (!viewer) return false;
  if (blog.authorId === viewer.id) return true;
  if (blog.visibility === 'followers') return following.includes(blog.authorId);
  if (blog.visibility === 'investors') return viewer.role === 'investor';
  if (blog.visibility === 'entrepreneurs') return viewer.role === 'entrepreneur';
  return false;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatRelativeTime(value: string) {
  const created = new Date(value).getTime();
  const diffMs = Date.now() - created;
  if (!Number.isFinite(created)) return '';
  if (diffMs < 30 * 1000) return 'たった今';
  if (diffMs < 60 * 60 * 1000) return `${Math.max(1, Math.floor(diffMs / (60 * 1000)))}分前`;
  if (diffMs < 24 * 60 * 60 * 1000) return `${Math.floor(diffMs / (60 * 60 * 1000))}時間前`;
  if (diffMs < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diffMs / (24 * 60 * 60 * 1000))}日前`;
  return new Date(value).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
}
