export type UserRole = 'entrepreneur' | 'investor' | 'admin';

export type AppUser = {
  id: string;
  email: string | null;
  role: UserRole;
  profile_completed: boolean;
  is_suspended: boolean;
};

export type EntrepreneurProfile = {
  id: string;
  user_id: string;
  company_name: string;
  founder_name: string;
  location: string | null;
  industry: string | null;
  founded_month: string | null;
  employee_count: number | null;
  tagline: string | null;
  overview: string | null;
  problem: string | null;
  solution: string | null;
  target_customer: string | null;
  business_model: string | null;
  advantage: string | null;
  current_phase: string | null;
  fundraising_amount: number | null;
  fund_usage: string | null;
  investor_support: string | null;
  verified_identity: boolean;
  verified_corporate: boolean;
  verified_interview: boolean;
  verified_revenue: boolean;
  is_fast_growing: boolean;
  is_hidden: boolean;
  payment_status: 'unpaid' | 'pending_review' | 'paid';
  payment_requested_at: string | null;
  paid_at: string | null;
};

export type InvestorProfile = {
  id: string;
  user_id: string;
  full_name: string;
  company_name: string | null;
  position: string | null;
  location: string | null;
  investment_fields: string | null;
  investable_amount: number | null;
  interested_phases: string | null;
  past_investments: string | null;
  support_areas: string | null;
  purpose: string[] | null;
};

export type StartupKpi = {
  id: string;
  entrepreneur_id: string;
  kpi_month: string;
  monthly_revenue: number | null;
  customer_count: number | null;
  mau: number | null;
  retention_rate: number | null;
  gross_margin: number | null;
};

export type ProgressPost = {
  id: string;
  entrepreneur_id: string;
  user_id: string;
  did_today: string;
  metric_change: string | null;
  issue: string | null;
  next_action: string | null;
  related_kpi: string | null;
  tags: string[] | null;
  visibility: string;
  is_hidden: boolean;
  created_at: string;
  entrepreneur_profiles?: EntrepreneurProfile;
};
