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

function aiAvatarDataUri(label: string, index: number) {
  const palette = [
    ['#dbeafe', '#dcfce7'],
    ['#fce7f3', '#e0f2fe'],
    ['#fef3c7', '#ede9fe'],
    ['#cffafe', '#f0fdf4'],
  ][index % 4];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${palette[0]}"/><stop offset="1" stop-color="${palette[1]}"/></linearGradient></defs><rect width="160" height="160" rx="80" fill="url(#g)"/><circle cx="116" cy="34" r="11" fill="#34d399"/><text x="80" y="96" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" font-weight="800" fill="#0f172a">${label}</text></svg>`;
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
    avatarLabel: name.slice(0, 1),
    avatarUrl: aiAvatarDataUri(name.slice(0, 1), index),
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
    avatarLabel: name.slice(0, 1),
    avatarUrl: aiAvatarDataUri(name.slice(0, 1), index + 30),
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
  const date = new Date();
  let daysBack = postIndex;
  const day = date.getDay();
  if (day === 0) daysBack += 2;
  if (day === 6) daysBack += 1;
  date.setDate(date.getDate() - daysBack);
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() - 1);
  date.setHours(9 + ((accountIndex * 3 + postIndex * 2) % 11), (accountIndex * 17 + postIndex * 11) % 60, 0, 0);
  return date.toISOString();
}

function createAiPosts(accounts: Account[]): Post[] {
  return accounts.flatMap((account, accountIndex) => Array.from({ length: 5 }, (_, postIndex) => {
    const theme = account.role === 'entrepreneur'
      ? aiPostThemes[(accountIndex + postIndex) % aiPostThemes.length]
      : aiInvestorPostThemes[(accountIndex + postIndex) % aiInvestorPostThemes.length];
    const domain = aiBusinessDomains[accountIndex % aiBusinessDomains.length];
    const entrepreneurBodies = [
      `${account.company}では「${domain}」の導入初期体験を見直しました。${theme}\n\n月間売上は${account.monthlyRevenue}、導入社数は${account.customerCount}。数字の伸びよりも、まずは使い続けてもらえる理由を増やします。`,
      `今日は${domain}の利用企業から、現場で一番時間がかかっている作業を聞きました。想定より手前の工程で詰まっていたので、次の改善は入力前の準備画面に寄せます。\n\n成長率は${account.growthRate}。焦らず、継続利用につながる改善を優先します。`,
      `今週の${account.company}は、営業後のフォロー文面を業界別に分けました。${theme}\n\n導入社数は${account.customerCount}まで増えましたが、まだオンボーディングのばらつきがあるので、来週はテンプレートを整理します。`,
      `${domain}のデモ画面を更新しました。顧客から「最初に何を見ればいいか分かりにくい」と言われたため、成果が出る順番に導線を並べ替えました。\n\n現在の月間売上は${account.monthlyRevenue}、次は商談化率を追います。`,
      `チームで${account.company}のKPIレビューを行いました。${theme}\n\n資金調達では、短期の売上だけでなく、顧客の定着と紹介の流れを説明できる状態にしていきます。`,
    ];
    const investorBodies = [
      `${account.company}の投資メモです。${theme}\n\n今週は${account.industry}領域で、導入後の継続率と顧客単価の変化が見える会社を中心に確認しています。`,
      `${account.industry}領域では、初期の売上よりも「誰が、なぜ、使い続けるか」を見ています。投稿で学習の過程が見える会社は、面談前の理解が進みやすいです。`,
      `最近見ている案件では、創業者が顧客の言葉をどうプロダクトに戻しているかを重視しています。${theme}`,
      `投資判断で大事にしているのは、数字の伸びとその理由がセットで語れることです。${account.investmentRange}の範囲で、初期の勝ち筋が見える会社を追っています。`,
      `${account.company}では、${account.supportAreas}の支援余地がある会社を優先して見ています。投稿に課題と次の打ち手が書かれていると、支援イメージが作りやすいです。`,
    ];
    return {
      id: `ai-post-${account.id}-${postIndex + 1}`,
      authorId: account.id,
      body: account.role === 'entrepreneur'
        ? entrepreneurBodies[postIndex % entrepreneurBodies.length]
        : investorBodies[postIndex % investorBodies.length],
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
  return {
    ...emptyAccount,
    ...account,
    identityStatus,
    followingIds: Array.isArray(account.followingIds) ? account.followingIds : [],
    followerIds: Array.isArray(account.followerIds) ? account.followerIds : [],
    hideSocialGraph: Boolean(account.hideSocialGraph),
    achievements: account.achievements || '',
    isHidden: Boolean(account.isHidden),
    isDeleted: Boolean(account.isDeleted),
    emailNotificationsEnabled: account.emailNotificationsEnabled !== false,
    isBot: Boolean(account.isBot),
    botKind: account.botKind || '',
    age: account.age || '',
    gender: account.gender || '',
    ticketTransferName: account.ticketTransferName || '',
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
  if (error || !data?.data) return null;
  const cloud = data.data as LeapCloudState;
  return { ...cloud, accounts: (cloud.accounts ?? []).map(normalizeAccount), posts: cloud.posts ?? [], messages: cloud.messages ?? [], meetingApplications: cloud.meetingApplications ?? [], notices: cloud.notices ?? [] };
}

async function saveCloudState(state: LeapCloudState) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.from('app_state').upsert({ key: 'leap-main', data: state, updated_at: new Date().toISOString() }, { onConflict: 'key' });
}

function mergeById<T extends { id: string }>(local: T[], cloud: T[]): T[] {
  const map = new Map<string, T>();
  local.forEach((item) => map.set(item.id, item));
  cloud.forEach((item) => map.set(item.id, { ...(map.get(item.id) ?? {} as T), ...item }));
  return Array.from(map.values());
}

function mergeCloudState(local: LeapCloudState, cloud: LeapCloudState): LeapCloudState {
  return {
    accounts: mergeById(local.accounts.map(normalizeAccount), cloud.accounts.map(normalizeAccount)),
    posts: mergeById(local.posts, cloud.posts),
    messages: mergeById(local.messages, cloud.messages),
    meetingApplications: mergeById(local.meetingApplications, cloud.meetingApplications),
    notices: mergeById(local.notices, cloud.notices),
  };
}

function withAdminAccount(accounts: Account[]): Account[] {
  const systemIds = new Set([adminAccount.id, ...aiAccounts.map((account) => account.id)]);
  const normalized = accounts.map(normalizeAccount).filter((account) => !systemIds.has(account.id) && account.email.trim().toLowerCase() !== adminEmail && !account.isBot);
  return [adminAccount, ...aiAccounts, ...normalized];
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
  const [messageDraft, setMessageDraft] = useState('');
  const [messageMode, setMessageMode] = useState<MessageKind>('direct');
  const [menuOpen, setMenuOpen] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [authBootstrapped, setAuthBootstrapped] = useState(false);
  const [authenticatedEmail, setAuthenticatedEmail] = useState('');
  const [systemPostActions, setSystemPostActions] = useState<Record<string, Post['actionUserIds']>>({});

  useEffect(() => saveLocal('leap.accounts', accounts), [accounts]);
  useEffect(() => saveLocal('leap.currentAccountId', currentAccountId), [currentAccountId]);
  useEffect(() => saveLocal('leap.posts', posts), [posts]);
  useEffect(() => saveLocal('leap.messages', messages), [messages]);
  useEffect(() => saveLocal('leap.meetingApplications', meetingApplications), [meetingApplications]);
  useEffect(() => saveLocal('leap.notices', notices), [notices]);
  useEffect(() => saveLocal('leap.following', following), [following]);
  useEffect(() => saveLocal('leap.savedPosts', savedPosts), [savedPosts]);
  useEffect(() => saveLocal('leap.readMessageIds', readMessageIds), [readMessageIds]);
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
  useEffect(() => {
    loadCloudState().then((cloud) => {
      if (cloud) {
        const merged = mergeCloudState({ accounts: accounts.map(normalizeAccount), posts, messages, meetingApplications, notices }, cloud);
        setAccounts(merged.accounts);
        setPosts(merged.posts);
        setMessages(merged.messages);
        setMeetingApplications(merged.meetingApplications);
        setNotices(merged.notices);
      }
      setCloudReady(true);
    });
  }, []);
  useEffect(() => {
    if (!cloudReady) return;
    const timer = window.setInterval(() => {
      loadCloudState().then((cloud) => {
        if (!cloud) return;
        const merged = mergeCloudState({ accounts: accounts.map(normalizeAccount), posts, messages, meetingApplications, notices }, cloud);
        setAccounts(merged.accounts);
        setPosts(merged.posts);
        setMessages(merged.messages);
        setMeetingApplications(merged.meetingApplications);
        setNotices(merged.notices);
      });
    }, 8000);
    return () => window.clearInterval(timer);
  }, [accounts, cloudReady, meetingApplications, messages, notices, posts]);
  useEffect(() => {
    if (!cloudReady) return;
    const timer = window.setTimeout(() => saveCloudState({ accounts: accounts.map(normalizeAccount), posts, messages, meetingApplications, notices }), 700);
    return () => window.clearTimeout(timer);
  }, [accounts, cloudReady, meetingApplications, messages, notices, posts]);
  useEffect(() => {
    if (!cloudReady || authBootstrapped) return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setAuthBootstrapped(true);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user?.email || !isSupabaseEmailConfirmed(user)) {
        setAuthBootstrapped(true);
        return;
      }
      const email = user.email.trim().toLowerCase();
      setAuthenticatedEmail(email);
      const existing = accounts.find((account) => account.email.trim().toLowerCase() === email);
      if (existing) {
        setCurrentAccountId(existing.id);
        setAuthBootstrapped(true);
        return;
      }
      const synced = syncAuthenticatedAccount(user, 'entrepreneur', '');
      setPage(synced.profileComplete ? 'feed' : 'profileEdit');
      flash('メール認証が完了しました。プロフィールを作成してください');
      setAuthBootstrapped(true);
    });
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
  const systemPosts = useMemo(() => createAiPosts(aiAccounts), []);
  const allPosts = useMemo(() => mergeById(systemPosts.map((post) => {
    const actionUserIds = systemPostActions[post.id] ?? post.actionUserIds;
    return { ...post, actionUserIds, likes: actionUserIds.likes.length, saves: actionUserIds.saves.length, meetings: actionUserIds.meetings.length };
  }), posts).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [posts, systemPostActions, systemPosts]);

  const visiblePosts = useMemo(() => allPosts.filter((post) => discoverableAccounts.some((account) => account.id === post.authorId)).filter((post) => canSeePost(post, currentAccount, currentFollowing)).filter((post) => post.visibility !== 'draft' && !post.isHidden), [allPosts, currentAccount, currentFollowing, discoverableAccounts]);
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

  function requestMeeting(account: Account) {
    if (!requireAccount()) return;
    if (account.isBot) {
      const body = 'お問い合わせありがとうございます。参考アカウントのため、面談は受け付けていません。公開プロフィールや投稿に関する質問にはメッセージで回答します。';
      setMessages((list) => [
        { id: crypto.randomUUID(), partnerId: account.id, senderId: account.id, recipientId: currentAccount!.id, kind: 'direct', body, createdAt: new Date().toISOString(), mine: false, meetingStatus: 'rejected' },
        ...list,
      ]);
      setSelectedAccountId(account.id);
      setMessageMode('direct');
      setPage('messages');
      flash('この参考アカウントは面談を受け付けていません');
      return;
    }
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
    const alreadyFollowing = currentFollowing.includes(account.id);
    const nextFollowing = alreadyFollowing ? currentFollowing.filter((id) => id !== account.id) : [...currentFollowing, account.id];
    setAccounts((list) => list.map((item) => {
      if (item.id === currentAccount!.id) return { ...normalizeAccount(item), followingIds: nextFollowing };
      if (item.id === account.id) {
        const followers = normalizeAccount(item).followerIds;
        return { ...normalizeAccount(item), followerIds: alreadyFollowing ? followers.filter((id) => id !== currentAccount!.id) : (followers.includes(currentAccount!.id) ? followers : [...followers, currentAccount!.id]) };
      }
      return normalizeAccount(item);
    }));
    setFollowing(nextFollowing);
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
    <main className="min-h-screen bg-[#eef5ff] text-[#101828] lg:p-6">
      <div className="mx-auto grid h-[100dvh] min-h-[100dvh] w-full max-w-[430px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-white shadow-2xl lg:max-w-6xl lg:grid-cols-[220px_1fr] lg:rounded-[28px]">
        <DesktopNav page={page} setPage={setPage} openTickets={openTickets} isAdmin={isAdmin} />
        <AppHeader page={page} goBack={() => setPage('feed')} openTickets={openTickets} menuOpen={menuOpen} setMenuOpen={setMenuOpen} setPage={setPage} currentAccount={currentAccount} isAdmin={isAdmin} logout={logout} unreadNoticeCount={notices.filter((notice) => notice.unread && (!notice.userId || notice.userId === currentAccount?.id)).length} />

        <section data-app-scroll className="min-h-0 overflow-y-auto pb-20 lg:col-start-2 lg:row-start-2 lg:pb-6">
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
            <MyPage currentAccount={currentAccount} accounts={accountsWithAdmin} posts={posts.filter((post) => post.authorId === currentAccount?.id)} setPage={setPage} openComposer={() => setShowComposer(true)} reactToPost={reactToPost} startEditPost={startEditPost} hidePost={hidePost} deletePost={deletePost} />
          )}
          {page === 'profileEdit' && <ProfileEditPage accounts={accounts} currentAccount={currentAccount} setAccounts={setAccounts} setCurrentAccountId={setCurrentAccountId} setPage={setPage} flash={flash} />}
          {page === 'tickets' && <TicketPage currentAccount={currentAccount} setAccounts={setAccounts} />}
          {page === 'admin' && (isAdmin ? <AdminPage accounts={accounts} posts={posts} meetingApplications={meetingApplications} setAccounts={setAccounts} setPosts={setPosts} setMessages={setMessages} setNotices={setNotices} reviewMeetingApplication={reviewMeetingApplication} openProfile={openProfile} /> : <EmptyState icon={<ShieldCheck size={28} />} title="管理者のみ表示できます" body="管理者アカウントでログインしてください。" action="ログインへ" onAction={() => setPage('auth')} />)}
          {(page === 'profile' || page === 'deal') && selectedAccount && (
            <ProfilePage account={selectedAccount} accounts={accountsWithAdmin} currentAccount={currentAccount} posts={allPosts.filter((post) => post.authorId === selectedAccount.id && canSeePost(post, currentAccount, currentFollowing) && (!post.isHidden || currentAccount?.id === selectedAccount.id))} isFollowing={currentFollowing.includes(selectedAccount.id)} isMine={currentAccount?.id === selectedAccount.id} follow={() => follow(selectedAccount)} message={() => { setSelectedAccountId(selectedAccount.id); setMessageMode('direct'); setPage('messages'); }} requestMeeting={() => requestMeeting(selectedAccount)} openDeal={() => setPage('deal')} dealMode={page === 'deal'} setPage={setPage} reactToPost={reactToPost} startEditPost={startEditPost} hidePost={hidePost} deletePost={deletePost} />
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

      {toast && <div className="fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-full bg-[#050816] px-5 py-3 text-xs font-black text-white shadow-xl">{toast}</div>}
    </main>
  );
}

function AppHeader({ page, goBack, openTickets, menuOpen, setMenuOpen, setPage, currentAccount, isAdmin, logout, unreadNoticeCount }: { page: Page; goBack: () => void; openTickets: () => void; menuOpen: boolean; setMenuOpen: (value: boolean) => void; setPage: (page: Page) => void; currentAccount: Account | null; isAdmin: boolean; logout: () => void | Promise<void>; unreadNoticeCount: number }) {
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
      <div className="grid h-14 grid-cols-[40px_1fr_72px] items-center px-3">
        <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-50" onClick={canBack ? goBack : openTickets} aria-label={canBack ? '戻る' : 'チケット'}>
          {canBack ? <ChevronLeft size={20} /> : <BriefcaseBusiness size={20} />}
        </button>
        <h1 className="text-center text-sm font-black">{title[page]}</h1>
        <div className="flex items-center justify-end gap-1">
          <button className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-slate-50" aria-label="通知" onClick={() => { setPage('notifications'); scrollContentToTop(); }}>
            <Bell size={19} />
            {unreadNoticeCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[9px] font-black leading-none text-white">{unreadNoticeCount > 99 ? '99+' : unreadNoticeCount}</span>}
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-50" aria-label="メニュー" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={20} /></button>
        </div>
      </div>
      {menuOpen && (
        <div className="absolute right-3 top-12 z-40 w-52 rounded-2xl border border-slate-100 bg-white p-2 text-xs font-black shadow-xl">
          {[
            ['feed', 'フィード'],
            ['search', '検索'],
            ['messages', 'メッセージ'],
            ['tickets', '面談チケット'],
            ...(isAdmin ? [['admin', '管理者画面']] : []),
            [currentAccount ? 'profileEdit' : 'auth', '設定'],
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
      {feedTab !== 'following' && <div className="flex gap-2.5 overflow-x-auto border-b border-slate-100 px-3 py-1.5">
        <button className="grid w-14 shrink-0 justify-items-center gap-1 text-[10px] font-bold" onClick={openComposer}>
          <span className="grid h-12 w-12 place-items-center rounded-full border border-blue-500 text-blue-600"><Plus size={22} /></span>
          投稿する
        </button>
        {accounts.map((account) => <button key={account.id} className="grid w-14 shrink-0 justify-items-center gap-1 text-[10px] font-bold" onClick={() => openProfile(account)}><Avatar account={account} active /><span className="w-full truncate">{displayAccountName(account)}</span></button>)}
      </div>}
      {posts.length === 0 ? (
        <EmptyState compact={feedTab === 'following'} icon={<MessageCircle size={28} />} title="まだ投稿がありません" body="投稿すると、指定した公開範囲に合わせてフィードとマイページへ反映されます。" action="投稿する" onAction={openComposer} />
      ) : (
        <div className="divide-y divide-[#e5e7eb]">
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
            {mode === 'direct' && <button className="rounded-xl bg-[#050816] px-3 py-2 text-[11px] font-black text-white disabled:bg-slate-300" disabled={incomingRequested || outgoingRequested || hasApproved} onClick={() => requestMeeting(activePartner)}>{activePartner.isBot ? '面談不可' : outgoingRequested ? '申請中' : hasApproved ? '承認済み' : '面談希望'}</button>}
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
        <input className="field" placeholder="メッセージを書く" value={draft} onChange={(event) => setDraft(event.target.value)} disabled={!activePartner} />
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
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setAuthMessage('Supabase接続がないため、確認メールを送信できません。環境変数を確認してください。');
      return;
    }
    const emailRedirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
    let result = (resend || Boolean(existing) || force)
      ? await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo } })
      : await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data: { phone, role },
        },
      });
    if (result.error && !resend && !force) {
      result = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo } });
    }
    if (result.error) {
      setAuthMessage(`確認メール送信に失敗しました：${result.error.message}`);
    } else {
      setAuthMessage(resend ? '確認メールを再送しました。メール内のURLを押すと認証が完了します。' : '確認メールを送信しました。メール内のURLを押すと認証が完了します。');
    }
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

function MyPage({ currentAccount, accounts, posts, setPage, openComposer, reactToPost, startEditPost, hidePost, deletePost }: { currentAccount: Account | null; accounts: Account[]; posts: Post[]; setPage: (page: Page) => void; openComposer: () => void; reactToPost: (postId: string, type: 'like' | 'save' | 'meeting') => void; startEditPost: (post: Post) => void; hidePost: (postId: string) => void; deletePost: (postId: string) => void }) {
  const [socialModal, setSocialModal] = useState<'following' | 'followers' | null>(null);
  if (!currentAccount) {
    return <EmptyState icon={<ShieldCheck size={28} />} title="アカウント作成が必要です" body="メール認証後にプロフィールを作成するとマイページが表示されます。" action="アカウント作成へ" onAction={() => setPage('auth')} />;
  }
  const normalized = normalizeAccount(currentAccount);
  const followingAccounts = normalized.followingIds.map((id) => accounts.find((account) => account.id === id)).filter(Boolean) as Account[];
  const followerAccounts = normalized.followerIds.map((id) => accounts.find((account) => account.id === id)).filter(Boolean) as Account[];
  const modalAccounts = socialModal === 'following' ? followingAccounts : followerAccounts;
  return (
    <div className="p-4">
      <ProfileHero account={currentAccount} accounts={accounts} isMine posts={posts} setPage={setPage} />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button className="rounded-2xl border border-slate-100 bg-white p-3 text-left text-xs font-black" onClick={() => setSocialModal('following')}><span className="block text-lg">{followingAccounts.length}</span>フォロー一覧を見る</button>
        <button className="rounded-2xl border border-slate-100 bg-white p-3 text-left text-xs font-black" onClick={() => setSocialModal('followers')}><span className="block text-lg">{followerAccounts.length}</span>フォロワー一覧を見る</button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="secondary" onClick={() => setPage('profileEdit')}><Settings size={16} />プロフィールを編集</button>
        <button className="primary" onClick={openComposer}><Plus size={17} />投稿する</button>
      </div>
      <div className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-100">
        {posts.length === 0 ? <EmptyState icon={<FileText size={28} />} title="投稿はまだありません" body="投稿するとここに保存され、公開範囲に合わせてフィードにも表示されます。" /> : <div className="divide-y divide-[#e5e7eb]">{posts.map((post) => <PostCard key={post.id} post={post} author={currentAccount} currentAccount={currentAccount} openProfile={() => undefined} reactToPost={reactToPost} startEditPost={startEditPost} hidePost={hidePost} deletePost={deletePost} />)}</div>}
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

        <div className="mx-auto grid max-w-3xl gap-4 p-4">
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
            <label className="mt-4 grid gap-1 text-[11px] font-bold text-slate-600">会社紹介・事業の背景<textarea className="field min-h-36 resize-none leading-7" placeholder={'例）私たちは、〇〇業界で起きている「〇〇」という課題を解決するために事業を始めました。\n\n現在は〇〇向けに〇〇を提供しており、利用者は〇〇をより簡単に、早く、安全に行えるようになります。\n\nこの事業で目指しているのは、〇〇な社会をつくることです。今後は〇〇を強化し、〇〇領域まで展開していきます。'} value={form.bio} onChange={(event) => update('bio', event.target.value)} /></label>
            <label className="mt-3 grid gap-1 text-[11px] font-bold text-slate-600">実績・トラクション<textarea className="field min-h-28 resize-none leading-7" placeholder={'例）現在の導入社数は〇社、月間売上は〇万円です。\n\n直近では〇〇を達成し、前月比〇％で成長しています。\n\n主な実績として、〇〇への導入、〇〇との提携、〇〇賞の受賞があります。投資家の方には、〇〇の支援を期待しています。'} value={form.achievements} onChange={(event) => update('achievements', event.target.value)} /></label>
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

          <button className="primary sticky bottom-20 z-20 w-full shadow-xl lg:bottom-6" onClick={save}>プロフィールを保存する</button>
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

function ProfilePage({ account, accounts, currentAccount, posts, isFollowing, isMine, follow, message, requestMeeting, openDeal, dealMode, setPage, reactToPost, startEditPost, hidePost, deletePost }: { account: Account; accounts: Account[]; currentAccount: Account | null; posts: Post[]; isFollowing: boolean; isMine: boolean; follow: () => void; message: () => void; requestMeeting: () => void; openDeal: () => void; dealMode: boolean; setPage: (page: Page) => void; reactToPost: (postId: string, type: 'like' | 'save' | 'meeting') => void; startEditPost: (post: Post) => void; hidePost: (postId: string) => void; deletePost: (postId: string) => void }) {
  const [tab, setTab] = useState<'overview' | 'achievements' | 'posts'>('overview');
  if (dealMode && account.role === 'entrepreneur') return <DealPage account={account} requestMeeting={requestMeeting} />;
  return (
    <div>
      <ProfileHero account={account} accounts={accounts} isMine={isMine} posts={posts} setPage={setPage} compact={tab !== 'overview'} />
      <div className="grid grid-cols-3 border-b border-slate-100 text-center text-[11px] font-bold">
        <button className={`py-2 ${tab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`} onClick={() => setTab('overview')}>概要</button>
        <button className={`py-2 ${tab === 'achievements' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`} onClick={() => setTab('achievements')}>実績</button>
        <button className={`py-2 ${tab === 'posts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`} onClick={() => setTab('posts')}>投稿</button>
      </div>
      {tab === 'overview' && (
        <div className="px-4 py-3">
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
      )}
      {tab === 'achievements' && (
        <div className="px-3 py-2">
          <TextBlock title="実績" body={account.achievements || '実績はまだ登録されていません。'} />
        </div>
      )}
      {tab === 'posts' && (
        <div className="divide-y divide-[#e5e7eb]">
          {posts.length === 0 ? <EmptyState icon={<FileText size={28} />} title="投稿はまだありません" body="投稿されるとここに表示されます。" /> : posts.map((post) => <PostCard key={post.id} post={post} author={account} currentAccount={currentAccount} openProfile={() => undefined} reactToPost={reactToPost} startEditPost={startEditPost} hidePost={hidePost} deletePost={deletePost} />)}
        </div>
      )}
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
  const [previewImage, setPreviewImage] = useState(false);
  const isOwner = Boolean(currentAccount && currentAccount.id === post.authorId);
  const actions = post.actionUserIds ?? { likes: [], saves: [], meetings: [] };
  const liked = currentAccount ? actions.likes?.includes(currentAccount.id) : false;
  const saved = currentAccount ? actions.saves?.includes(currentAccount.id) : false;
  const meetingRequested = currentAccount ? actions.meetings?.includes(currentAccount.id) : false;
  const authorName = displayPostAuthorName(author);
  return (
    <article className={`relative px-4 py-3 ${post.isHidden ? 'bg-slate-50' : ''}`}>
      <div className="flex w-full items-start gap-3 text-left">
        <button className="shrink-0" onClick={() => author && openProfile(author)} aria-label={`${authorName}のプロフィールを見る`}>
          {author ? <Avatar account={author} size="feed" /> : <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100"><UserRound size={18} /></span>}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <button className="min-w-0 flex-1 text-left" onClick={() => author && openProfile(author)}>
              <b className="block truncate text-[15px] font-bold leading-5 text-[#0f1419]">{authorName}</b>
              <span className="block text-[13px] leading-5 text-[#536471]">{post.isHidden ? '非表示・' : ''}{visibilityLabels[post.visibility]}・{formatDate(post.createdAt)}</span>
            </button>
            <button className="grid h-7 w-7 shrink-0 place-items-center rounded-full hover:bg-slate-50" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={18} className="text-[#536471]" /></button>
          </div>

          <p className="mt-1 whitespace-pre-line text-[15px] leading-[1.55] text-[#0f1419]">{post.body}</p>
          {post.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{post.tags.map((tag) => <span className="text-[14px] font-semibold text-blue-600" key={tag}>#{tag}</span>)}</div>}
          {post.imageUrl && <button className="mt-2.5 block w-full" onClick={() => setPreviewImage(true)}><img className="aspect-square w-full rounded-2xl object-cover" src={post.imageUrl} alt={post.imageName || '投稿画像'} /></button>}
          {post.attachmentName && <div className="mt-2.5 flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-[13px]"><Paperclip size={15} />{post.attachmentName}</div>}
          <div className="mt-2.5 flex items-center gap-5 text-[13px] font-medium text-[#536471]">
            <button className="inline-flex items-center gap-1.5 text-[#0f1419]" onClick={() => reactToPost(post.id, 'like')} aria-pressed={liked}><Heart size={18} />応援 {post.likes}</button>
            <button className="inline-flex items-center gap-1.5 text-[#0f1419]" onClick={() => reactToPost(post.id, 'save')} aria-pressed={saved}><Bookmark size={18} />保存 {post.saves}</button>
            <button className="inline-flex items-center gap-1.5 text-[#0f1419]" onClick={() => reactToPost(post.id, 'meeting')} aria-pressed={meetingRequested}><UsersRound size={18} />面談 {post.meetings}</button>
            <span className="ml-auto">閲覧 {post.views}</span>
          </div>
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

function BottomTabs({ page, setPage, openComposer }: { page: Page; setPage: (page: Page) => void; openComposer: () => void }) {
  const tabs = [
    ['feed', 'フィード', Home],
    ['search', '検索', Search],
    ['messages', 'メッセージ', Mail],
    ['mypage', 'マイページ', UserRound],
  ] as const;
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-5 border-t border-slate-100 bg-white px-2 py-2 shadow-[0_-10px_28px_rgba(15,23,42,0.08)] lg:hidden">
      {tabs.slice(0, 2).map(([key, label, Icon]) => (
        <button key={key} className={`grid justify-items-center gap-1 rounded-2xl px-1 py-2 text-[9px] font-bold ${page === key ? 'text-blue-600' : 'text-slate-500'}`} onClick={() => setPage(key as Page)}>
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
      <button className="grid justify-items-center gap-1 rounded-2xl bg-[#050816] px-1 py-2 text-[9px] font-bold text-white" onClick={openComposer} aria-label="投稿する">
        <Plus size={18} />
        <span>投稿</span>
      </button>
      {tabs.slice(2).map(([key, label, Icon]) => (
          <button key={key} className={`grid justify-items-center gap-1 rounded-2xl px-1 py-2 text-[9px] font-bold ${page === key ? 'text-blue-600' : 'text-slate-500'}`} onClick={() => setPage(key as Page)}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
      ))}
    </nav>
  );
}

function ProfileHero({ account, accounts, isMine, posts, setPage, compact = false }: { account: Account; accounts: Account[]; isMine: boolean; posts: Post[]; setPage: (page: Page) => void; compact?: boolean }) {
  const normalized = normalizeAccount(account);
  const followings = normalized.followingIds.map((id) => accounts.find((item) => item.id === id)).filter(Boolean) as Account[];
  const followers = normalized.followerIds.map((id) => accounts.find((item) => item.id === id)).filter(Boolean) as Account[];
  const visibleFollowings = isMine ? followings : followings.filter((item) => item.role !== 'investor');
  const visibleFollowers = isMine ? followers : followers.filter((item) => item.role !== 'investor');
  const canShowSocialGraph = isMine || !normalized.hideSocialGraph;
  return (
    <section className={compact ? 'border-b border-slate-100 px-3 py-1.5' : 'rounded-3xl border border-slate-100 p-4'}>
      <div className={`flex items-start ${compact ? 'gap-2' : 'gap-4'}`}>
        <Avatar account={account} size={compact ? 'md' : 'lg'} />
        <div className="min-w-0 flex-1">
          <h2 className={`truncate font-black ${compact ? 'text-sm' : 'text-xl'}`}>{account.name || account.accountName || '名前未設定'} {account.verified && <CheckCircle2 className="inline text-blue-600" size={compact ? 13 : 16} />}</h2>
          <p className={`${compact ? 'mt-0 text-[11px]' : 'mt-1 text-xs'} text-slate-500`}>@{account.accountName || 'account'} / {account.company || '会社名未設定'}</p>
          {!compact && <p className="mt-1 text-xs text-slate-500">{account.location || '地域未設定'}　{account.foundedYear && account.foundedMonth ? `${account.foundedYear}年${account.foundedMonth}` : '設立年月未設定'}　{account.stage || 'フェーズ未設定'}</p>}
          {!compact && account.verified && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700"><CheckCircle2 size={13} />本人確認済み</span>}
          {isMine && account.identityStatus === 'resubmit' && <span className="mt-2 inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-700">本人確認資料の再提出が必要です</span>}
        </div>
      </div>
      {!compact && (
        <>
          <p className="mt-4 whitespace-pre-line text-sm leading-7">{account.bio || '自己紹介は未入力です。'}</p>
          {account.isBot && <p className="mt-3 rounded-2xl bg-indigo-50 p-3 text-xs font-bold leading-6 text-indigo-700">このアカウントはLeapの投稿・検索・メッセージ体験を確認するための参考アカウントです。面談は受け付けていません。</p>}
          <div className="mt-3 flex flex-wrap gap-2">{[account.industry, account.employeeSize, account.revenueScale, account.isBot ? account.age : '', account.isBot ? account.gender : ''].filter(Boolean).map((item) => <span className="pill" key={item}>{item}</span>)}</div>
          <div className="mt-4 flex gap-5 text-xs"><span><b>{posts.length}</b> 投稿</span><span><b>{visibleFollowings.length}</b> フォロー</span><span><b>{visibleFollowers.length}</b> フォロワー</span>{isMine && account.role === 'entrepreneur' && <span><b>{account.ticketBalance}</b> チケット</span>}</div>
          {canShowSocialGraph ? (
            <div className="mt-3 grid gap-3 text-xs text-slate-600">
              <SocialList title="フォロー" accounts={visibleFollowings} />
              <SocialList title="フォロワー" accounts={visibleFollowers} />
            </div>
          ) : <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-bold text-slate-500">このユーザーはフォロー・フォロワーリストを非公開にしています。</p>}
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
  const dimension = size === 'lg' ? 'h-20 w-20 text-xl' : size === 'feed' ? 'h-10 w-10 text-sm' : 'h-11 w-11 text-sm';
  const label = account.avatarLabel || displayAccountName(account).slice(0, 1) || 'L';
  return <span className={`relative grid ${dimension} shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-blue-100 via-white to-emerald-100 font-black ring-1 ring-slate-200`}>{account.avatarUrl ? <img src={account.avatarUrl} alt={displayAccountName(account)} className="h-full w-full object-cover" /> : label}{active && <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />}</span>;
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
