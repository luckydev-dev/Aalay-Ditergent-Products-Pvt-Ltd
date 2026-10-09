export type Language = 'en' | 'hi';

export type ActiveTab = 'home' | 'spin' | 'treasure' | 'team' | 'profile';

export type SubScreen =
  | 'none'
  | 'recharge'
  | 'withdraw'
  | 'bank-details'
  | 'purchase-record'
  | 'account-record'
  | 'withdrawal-history'
  | 'security'
  | 'about-us'
  | 'notifications'
  | 'missions'
  | 'admin';

export type UserRole = 'user' | 'owner';

export interface UserProfile {
  name: string;
  phone: string;
  id: string;
  vipLevel: string;
  balance: number;
  totalRecharge: number;
  totalIncome: number;
  spinsLeft: number;
  invitationCode: string;
  activeMembersToday: number;
  teamMembersCount: number;
  teamRecharge: number;
  level1CommissionRate: number;
  isLoggedIn: boolean;
  avatar?: string;
  role: UserRole;
  uid?: string;
  createdAt?: number;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  isSaved: boolean;
  bankName?: string;
  branch?: string;
  city?: string;
  upiId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  phone: string;
  joinedDate: string;
  level: 1 | 2 | 3;
  totalRecharge: number;
  commissionEarned: number;
  active: boolean;
}

export interface ProductPlan {
  id: string;
  name: string;
  tag?: string;
  tagType?: 'popular' | 'best-value';
  price: number;
  durationDays: number;
  dailyIncome: number;
  totalRevenue: number;
  type: 'normal' | 'vip';
  imageType: 'fevicol' | 'drfixit' | 'mseal' | 'tilefix' | 'laticrete' | 'acrylic';
  imageUrl?: string;
  description: string;
}

export interface PurchasedOrder {
  orderId: string;
  planId: string;
  planName: string;
  price: number;
  dailyIncome: number;
  totalRevenue: number;
  durationDays: number;
  daysRemaining: number;
  purchaseDate: string;
  nextCollectTime: string;
  type: 'normal' | 'vip';
  imageType: string;
  imageUrl?: string;
  totalCollected: number;
}

export interface TransactionRecord {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'withdraw';
  category: 'signup_bonus' | 'recharge' | 'spin_win' | 'plan_income' | 'commission' | 'treasure_code' | 'withdrawal';
  date: string;
  status: 'completed' | 'processing' | 'rejected';
}

export interface WithdrawalRecord {
  id: string;
  amount: number;
  bankAccount: string;
  ifsc: string;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  referenceId: string;
}

export interface TeamMission {
  id: string;
  requiredMembers: number;
  rewardAmount: number;
  claimed: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  date: string;
  read: boolean;
  type: 'announcement' | 'dividend' | 'system';
}

export interface RechargeRequest {
  id: string;
  uid: string;
  userName: string;
  userPhone: string;
  amount: number;
  utr: string;
  screenshotUrl?: string;
  date: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  channel: string;
  autoVerified?: boolean;
  rejectReason?: string;
}
