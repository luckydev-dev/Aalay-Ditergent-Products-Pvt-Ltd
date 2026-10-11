import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserProfile,
  BankDetails,
  ProductPlan,
  PurchasedOrder,
  TransactionRecord,
  WithdrawalRecord,
  TeamMission,
  TeamMember,
  NotificationItem,
  Language,
  ActiveTab,
  SubScreen,
  UserRole,
  RechargeRequest,
  GiftCode,
} from '../types';
import {
  auth,
  rtdb,
  ref,
  set,
  get,
  update,
  onValue,
  off,
  push,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  phoneToEmail,
  FirebaseUser,
} from '../firebase';

export const DEFAULT_PLANS: ProductPlan[] = [
  {
    id: 'plan-1',
    name: 'Aalay Ultra Wash Powder Unit',
    tag: 'Hot Item',
    tagType: 'popular',
    price: 600,
    dailyIncome: 300,
    durationDays: 20,
    totalRevenue: 6000,
    type: 'normal',
    imageType: 'fevicol',
    description: 'Automated detergent cake mixing & active enzyme washing powder manufacturing unit.',
  },
  {
    id: 'plan-2',
    name: 'Aalay Extra Clean Liquid Unit',
    tag: 'Best Value',
    tagType: 'best-value',
    price: 1500,
    dailyIncome: 800,
    durationDays: 25,
    totalRevenue: 20000,
    type: 'normal',
    imageType: 'drfixit',
    description: 'High-speed automated detergent liquid bottling line with daily dividend returns.',
  },
  {
    id: 'plan-3',
    name: 'Aalay Heavy Duty Detergent Line',
    tag: 'High Yield',
    tagType: 'popular',
    price: 3500,
    dailyIncome: 1900,
    durationDays: 30,
    totalRevenue: 57000,
    type: 'normal',
    imageType: 'mseal',
    description: 'Industrial grade detergent powder manufacturing & regional distribution contract.',
  },
  {
    id: 'plan-vip-1',
    name: 'Aalay VIP Gold Manufacturing Hub',
    tag: 'VIP Level 1+',
    tagType: 'best-value',
    price: 5000,
    dailyIncome: 3000,
    durationDays: 30,
    totalRevenue: 90000,
    type: 'vip',
    imageType: 'tilefix',
    description: 'Exclusive VIP partner detergent manufacturing hub with maximum daily return rate.',
  },
  {
    id: 'plan-vip-2',
    name: 'Aalay VIP Titanium Mega Plant',
    tag: 'VIP Elite',
    tagType: 'best-value',
    price: 12000,
    dailyIncome: 7500,
    durationDays: 30,
    totalRevenue: 225000,
    type: 'vip',
    imageType: 'laticrete',
    description: 'Supreme VIP industrial production plant for high volume national supply.',
  },
];

export const INITIAL_PLANS: ProductPlan[] = DEFAULT_PLANS;

export const DEFAULT_GIFT_CODES: GiftCode[] = [
  {
    id: 'gc-1',
    code: 'AALAY50',
    rewardAmount: 50,
    maxClaims: 1000,
    timesClaimed: 14,
    createdAt: Date.now(),
    active: true,
  },
  {
    id: 'gc-2',
    code: 'AALEY2026',
    rewardAmount: 200,
    maxClaims: 500,
    timesClaimed: 42,
    createdAt: Date.now(),
    active: true,
  },
  {
    id: 'gc-3',
    code: 'BONUS100',
    rewardAmount: 100,
    maxClaims: 200,
    timesClaimed: 8,
    createdAt: Date.now(),
    active: true,
  },
];

export const INITIAL_MISSIONS: TeamMission[] = [
  { id: 'm-1', requiredMembers: 1, rewardAmount: 200, claimed: false },
  { id: 'm-2', requiredMembers: 2, rewardAmount: 400, claimed: false },
  { id: 'm-3', requiredMembers: 5, rewardAmount: 1100, claimed: false },
  { id: 'm-4', requiredMembers: 10, rewardAmount: 2300, claimed: false },
  { id: 'm-5', requiredMembers: 20, rewardAmount: 5000, claimed: false },
  { id: 'm-6', requiredMembers: 50, rewardAmount: 13000, claimed: false },
  { id: 'm-7', requiredMembers: 100, rewardAmount: 28000, claimed: false },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Welcome to Aalay Detergent Rewards!',
    content: 'Get ₹40 free welcome bonus added directly to your balance. Start earning daily returns.',
    date: 'Just now',
    read: false,
    type: 'system',
  },
  {
    id: 'n-2',
    title: 'Daily Lucky Draw Activated',
    content: 'Spin the Lucky Wheel once every day to win up to ₹500 in instant cash prizes!',
    date: '1 hour ago',
    read: false,
    type: 'dividend',
  },
  {
    id: 'n-3',
    title: '40% Level-1 Direct Referral Commission',
    content: 'Invite distributors and friends using your code to earn 40% instant rebate on their purchases.',
    date: 'Yesterday',
    read: true,
    type: 'announcement',
  },
];

const DEFAULT_USER: UserProfile = {
  name: '',
  phone: '',
  id: '',
  vipLevel: 'VIP 0',
  balance: 0,
  totalRecharge: 0,
  totalIncome: 0,
  spinsLeft: 0,
  invitationCode: '',
  activeMembersToday: 0,
  teamMembersCount: 0,
  teamRecharge: 0,
  level1CommissionRate: 10,
  isLoggedIn: false,
  avatar: 'https://i.ibb.co/JWBdHWpv/profile-picture.png',
  role: 'user',
};

const DEFAULT_BANK: BankDetails = {
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  isSaved: false,
};

interface AppContextType {
  user: UserProfile;
  firebaseUid: string | null;
  isFirebaseConnected: boolean;
  isAuthLoading: boolean;
  isDatabaseLoading: boolean;
  bankDetails: BankDetails;
  plans: ProductPlan[];
  giftCodes: GiftCode[];
  orders: PurchasedOrder[];
  transactions: TransactionRecord[];
  withdrawals: WithdrawalRecord[];
  teamMembers: TeamMember[];
  missions: TeamMission[];
  notifications: NotificationItem[];
  language: Language;
  activeTab: ActiveTab;
  subScreen: SubScreen;
  showWelcomeModal: boolean;
  showCustomerService: boolean;
  showInviteModal: boolean;
  showLiveChat: boolean;
  rechargePresetAmount: number;
  totalWonTreasure: number;
  redeemedCodes: string[];
  toastMessage: string | null;
  rechargeRequests: RechargeRequest[];

  setLanguage: (lang: Language) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSubScreen: (screen: SubScreen) => void;
  setShowWelcomeModal: (show: boolean) => void;
  setShowCustomerService: (show: boolean) => void;
  setShowInviteModal: (show: boolean) => void;
  setShowLiveChat: (show: boolean) => void;
  setRechargePresetAmount: (amount: number) => void;
  showToast: (msg: string) => void;

  login: (phone: string, nickname?: string, password?: string) => Promise<boolean>;
  register: (phone: string, nickname: string, password?: string, inviteCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  saveBankDetails: (details: Omit<BankDetails, 'isSaved'>) => boolean;
  rechargeWallet: (amount: number, channel: string) => Promise<boolean>;
  submitRechargeRequest: (req: {
    amount: number;
    utr: string;
    screenshotUrl?: string;
    channel: string;
    orderId?: string;
  }) => Promise<{ success: boolean; autoVerified: boolean; message: string }>;
  approveRechargeRequestInDb: (requestId: string, targetUid: string, amount: number) => Promise<boolean>;
  rejectRechargeRequestInDb: (requestId: string, reason?: string) => Promise<boolean>;
  requestWithdrawal: (amount: number) => { success: boolean; message: string };
  buyPlan: (planId: string) => { success: boolean; message: string; purchasedPlan?: ProductPlan };
  collectOrderIncome: (orderId: string) => Promise<boolean>;
  spinLuckyDraw: (wonAmount: number) => void;
  redeemGiftCode: (code: string) => { success: boolean; message: string; amount?: number };
  createGiftCode: (codeData: Omit<GiftCode, 'id' | 'timesClaimed' | 'createdAt'>) => GiftCode;
  updateGiftCode: (updatedCode: GiftCode) => void;
  deleteGiftCode: (id: string) => void;
  claimMission: (missionId: string) => boolean;
  markNotificationRead: (id: string) => void;
  addActiveTeamMember: () => void;
  addReferralMember: (level?: 1 | 2 | 3, rechargeAmount?: number, memberName?: string, memberPhone?: string) => void;

  setUserRole: (role: 'user' | 'owner') => Promise<void>;
  updateUserRoleInDb: (targetUid: string, role: 'user' | 'owner') => Promise<boolean>;
  updateUserVipLevelInDb: (targetUid: string, newVipLevel: string) => Promise<boolean>;
  adjustUserBalanceInDb: (targetUid: string, deltaAmount: number, reason?: string) => Promise<boolean>;
  approveWithdrawalInDb: (targetUid: string, withdrawalId: string) => Promise<boolean>;
  rejectWithdrawalInDb: (targetUid: string, withdrawalId: string) => Promise<boolean>;
  broadcastSystemNotice: (title: string, message: string) => Promise<boolean>;
  updatePlan: (updatedPlan: ProductPlan) => void;
  addNewPlan: (newPlan: ProductPlan) => void;
  deletePlan: (planId: string) => void;
  resetPlansToDefault: () => void;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // User profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('aaley_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isLoggedIn && parsed.phone) {
          return {
            ...DEFAULT_USER,
            ...parsed,
            avatar: 'https://i.ibb.co/JWBdHWpv/profile-picture.png',
          };
        }
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_USER;
  });

  // Purge any ghost accounts that were created without registration
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aaley_all_registered_users');
      const passRaw = localStorage.getItem('aaley_user_passwords') || '{}';
      const passwords = JSON.parse(passRaw);
      if (stored) {
        const list: UserProfile[] = JSON.parse(stored);
        const filtered = list.filter((u) => u.phone === '9510006797' || (u.phone && passwords[u.phone]));
        if (filtered.length !== list.length) {
          localStorage.setItem('aaley_all_registered_users', JSON.stringify(filtered));
        }
      }
    } catch (e) {}
  }, []);

  const [bankDetails, setBankDetails] = useState<BankDetails>(() => {
    const saved = localStorage.getItem('aaley_bank');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_BANK;
  });

  // Live Product Plans with persistent state & defaults fallback
  const [plans, setPlans] = useState<ProductPlan[]>(() => {
    try {
      const saved = localStorage.getItem('aaley_product_plans');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_PLANS;
  });

  const [giftCodes, setGiftCodes] = useState<GiftCode[]>(() => {
    try {
      const saved = localStorage.getItem('aaley_gift_codes');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return DEFAULT_GIFT_CODES;
  });

  const [isDatabaseLoading, setIsDatabaseLoading] = useState<boolean>(true);

  // Safety fallback timer for loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDatabaseLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('aaley_gift_codes', JSON.stringify(giftCodes));
    } catch (e) {}
  }, [giftCodes]);


  const [orders, setOrders] = useState<PurchasedOrder[]>(() => {
    const saved = localStorage.getItem('aaley_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem('aaley_transactions');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'tx-init-1',
        title: 'Signup Welcome Bonus',
        amount: 40,
        type: 'income',
        category: 'signup_bonus',
        date: new Date().toLocaleDateString('en-GB') + ' 09:30',
        status: 'completed',
      },
    ];
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>(() => {
    const saved = localStorage.getItem('aaley_withdrawals');
    return saved ? JSON.parse(saved) : [];
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('aaley_team_members');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('aaley_team_members', JSON.stringify(teamMembers));
  }, [teamMembers]);

  const [missions, setMissions] = useState<TeamMission[]>(() => {
    const saved = localStorage.getItem('aaley_missions');
    return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('aaley_notifications_v2');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [subScreen, setSubScreen] = useState<SubScreen>('none');
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  const [showCustomerService, setShowCustomerService] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showLiveChat, setShowLiveChat] = useState<boolean>(false);
  const [rechargePresetAmount, setRechargePresetAmount] = useState<number>(700);
  const [totalWonTreasure, setTotalWonTreasure] = useState<number>(() => {
    const saved = localStorage.getItem('aaley_total_won_treasure');
    return saved ? Number(saved) : 0;
  });
  const [redeemedCodes, setRedeemedCodes] = useState<string[]>(() => {
    const saved = localStorage.getItem('aaley_redeemed_codes');
    return saved ? JSON.parse(saved) : [];
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>(() => {
    try {
      const saved = localStorage.getItem('aaley_recharge_requests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Ref to track if initial RTDB load is done to avoid write loops
  const isInitialRtdbLoadedRef = useRef<boolean>(false);
  const activeListenerRef = useRef<string | null>(null);

  // Safe helper to record any user in local system registry for offline/admin resilience
  const saveUserToRegistry = (userProfile: UserProfile) => {
    try {
      const existingJson = localStorage.getItem('aaley_all_registered_users');
      let list: UserProfile[] = existingJson ? JSON.parse(existingJson) : [];
      const idx = list.findIndex(
        (u) => (userProfile.uid && u.uid === userProfile.uid) || u.phone === userProfile.phone
      );
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...userProfile };
      } else {
        list.unshift(userProfile);
      }
      localStorage.setItem('aaley_all_registered_users', JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to update local user registry:', e);
    }
  };

  // Helper to store user login passwords securely in local storage
  const saveUserPassword = (phone: string, pass: string, uid?: string) => {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const raw = localStorage.getItem('aaley_user_passwords') || '{}';
      const map = JSON.parse(raw);
      if (cleanPhone) map[cleanPhone] = pass;
      if (uid) map[uid] = pass;
      localStorage.setItem('aaley_user_passwords', JSON.stringify(map));
    } catch (e) {
      console.warn('Failed to save user password record:', e);
    }
  };

  const getUserPassword = (phone: string, uid?: string): string | null => {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const raw = localStorage.getItem('aaley_user_passwords') || '{}';
      const map = JSON.parse(raw);
      if (cleanPhone && map[cleanPhone]) return map[cleanPhone];
      if (uid && map[uid]) return map[uid];
      return null;
    } catch (e) {
      return null;
    }
  };

  // Track RTDB connection status safely with error callback
  useEffect(() => {
    const connectedRef = ref(rtdb, '.info/connected');
    const unsubscribe = onValue(
      connectedRef,
      (snap) => {
        setIsFirebaseConnected(snap.val() === true);
      },
      () => {
        setIsFirebaseConnected(false);
      }
    );

    return () => {
      off(connectedRef);
    };
  }, []);

  // Safe RTDB write helper for current user
  const syncToRtdb = (path: string, data: any) => {
    // Only sync to RTDB when authenticated with a real Firebase Auth user
    if (!firebaseUser || !firebaseUser.uid) {
      return;
    }
    const uid = firebaseUser.uid;
    try {
      const dataRef = ref(rtdb, `users/${uid}/${path}`);
      set(dataRef, data).catch(() => {
        // Silently catch permission or network warnings
      });
    } catch (e) {
      // Silently catch exception
    }
  };

  // Sync state changes to LocalStorage and Firebase RTDB
  useEffect(() => {
    localStorage.setItem('aaley_user', JSON.stringify(user));
    if (user.isLoggedIn && user.phone) {
      localStorage.setItem(`aaley_user_${user.phone}`, JSON.stringify(user));
    }
    if (isInitialRtdbLoadedRef.current) {
      syncToRtdb('profile', user);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('aaley_bank', JSON.stringify(bankDetails));
    if (user.isLoggedIn && user.phone) {
      localStorage.setItem(`aaley_bank_${user.phone}`, JSON.stringify(bankDetails));
    }
    if (isInitialRtdbLoadedRef.current) {
      syncToRtdb('bankDetails', bankDetails);
    }
  }, [bankDetails, user.isLoggedIn, user.phone]);

  useEffect(() => {
    localStorage.setItem('aaley_orders', JSON.stringify(orders));
    if (user.isLoggedIn && user.phone) {
      localStorage.setItem(`aaley_orders_${user.phone}`, JSON.stringify(orders));
    }
    if (isInitialRtdbLoadedRef.current) {
      syncToRtdb('orders', orders);
    }
  }, [orders, user.isLoggedIn, user.phone]);

  useEffect(() => {
    localStorage.setItem('aaley_transactions', JSON.stringify(transactions));
    if (user.isLoggedIn && user.phone) {
      localStorage.setItem(`aaley_transactions_${user.phone}`, JSON.stringify(transactions));
    }
    if (isInitialRtdbLoadedRef.current) {
      syncToRtdb('transactions', transactions);
    }
  }, [transactions, user.isLoggedIn, user.phone]);

  useEffect(() => {
    localStorage.setItem('aaley_withdrawals', JSON.stringify(withdrawals));
    if (user.isLoggedIn && user.phone) {
      localStorage.setItem(`aaley_withdrawals_${user.phone}`, JSON.stringify(withdrawals));
    }
    if (isInitialRtdbLoadedRef.current) {
      syncToRtdb('withdrawals', withdrawals);
    }
  }, [withdrawals, user.isLoggedIn, user.phone]);

  useEffect(() => {
    localStorage.setItem('aaley_missions', JSON.stringify(missions));
    if (isInitialRtdbLoadedRef.current) {
      syncToRtdb('missions', missions);
    }
  }, [missions]);

  useEffect(() => {
    localStorage.setItem('aaley_notifications_v2', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('aaley_redeemed_codes', JSON.stringify(redeemedCodes));
    localStorage.setItem('aaley_total_won_treasure', String(totalWonTreasure));
    if (isInitialRtdbLoadedRef.current) {
      syncToRtdb('redeemedCodes', redeemedCodes);
      syncToRtdb('totalWonTreasure', totalWonTreasure);
    }
  }, [redeemedCodes, totalWonTreasure]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      setIsAuthLoading(false);

      if (fUser) {
        const uid = fUser.uid;
        activeListenerRef.current = uid;
        const userRef = ref(rtdb, `users/${uid}`);

        // Fetch or subscribe to RTDB real-time data safely with error handling
        onValue(
          userRef,
          (snapshot) => {
            const val = snapshot.val();
            if (val) {
              if (val.profile) {
                setUser((prev) => {
                  const updated: UserProfile = {
                    ...DEFAULT_USER,
                    ...val.profile,
                    avatar: 'https://i.ibb.co/JWBdHWpv/profile-picture.png',
                    role: val.profile.role || prev.role || 'user',
                    uid: uid,
                    isLoggedIn: true,
                  };
                  saveUserToRegistry(updated);
                  return updated;
                });
              }
              if (val.bankDetails) {
                setBankDetails(val.bankDetails);
              }
              if (val.orders) {
                const ordersArr = Array.isArray(val.orders) ? val.orders : Object.values(val.orders);
                setOrders(ordersArr as PurchasedOrder[]);
              }
              if (val.transactions) {
                const txArr = Array.isArray(val.transactions) ? val.transactions : Object.values(val.transactions);
                setTransactions(txArr as TransactionRecord[]);
              }
              if (val.withdrawals) {
                const wdArr = Array.isArray(val.withdrawals) ? val.withdrawals : Object.values(val.withdrawals);
                setWithdrawals(wdArr as WithdrawalRecord[]);
              }
              if (val.missions) {
                const mArr = Array.isArray(val.missions) ? val.missions : Object.values(val.missions);
                setMissions(mArr as TeamMission[]);
              }
              if (val.redeemedCodes) {
                const rcArr = Array.isArray(val.redeemedCodes) ? val.redeemedCodes : Object.values(val.redeemedCodes);
                setRedeemedCodes(rcArr as string[]);
              }
              if (typeof val.totalWonTreasure === 'number') {
                setTotalWonTreasure(val.totalWonTreasure);
              }
            } else {
              // Only seed if user is explicitly logged in with an active profile
              if (user.isLoggedIn && user.phone) {
                set(userRef, {
                  profile: user,
                  bankDetails: bankDetails,
                  orders: orders,
                  transactions: transactions,
                  withdrawals: withdrawals,
                  missions: missions,
                  redeemedCodes: redeemedCodes,
                  totalWonTreasure: totalWonTreasure,
                  createdAt: Date.now(),
                }).catch(() => {
                  // Silently handle if rules deny write
                });
              }
            }
            isInitialRtdbLoadedRef.current = true;
          },
          () => {
            // Standby without throwing uncaught permission error
            isInitialRtdbLoadedRef.current = true;
          }
        );
      } else {
        // If no Firebase user, attempt anonymous sign-in or check if local user should log into Firebase
        activeListenerRef.current = null;
        isInitialRtdbLoadedRef.current = true;
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Sync recharge_requests with Firebase RTDB
  useEffect(() => {
    try {
      const requestsRef = ref(rtdb, 'recharge_requests');
      onValue(
        requestsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            const list: RechargeRequest[] = Array.isArray(val) ? val : Object.values(val);
            list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            setRechargeRequests(list);
            try {
              localStorage.setItem('aaley_recharge_requests', JSON.stringify(list));
            } catch (e) {}
          }
        },
        () => {}
      );
      return () => {
        off(requestsRef);
      };
    } catch (e) {}
  }, []);

  // Sync product plans with Firebase RTDB (Database-First, dual-path compatibility config/plans and plans)
  useEffect(() => {
    let active = true;

    const parsePlansVal = (val: any): ProductPlan[] => {
      if (!val) return [];
      const rawList = Array.isArray(val) ? val : Object.values(val);
      return (rawList as any[]).filter((p) => p && typeof p === 'object' && p.id);
    };

    const handleSnapshot = (snapshot: any) => {
      if (!active) return;
      if (snapshot.exists()) {
        const parsed = parsePlansVal(snapshot.val());
        setPlans(parsed);
        setIsDatabaseLoading(false);
      } else {
        // Fallback: Check 'plans' path if 'config/plans' was empty
        get(ref(rtdb, 'plans'))
          .then((pSnap) => {
            if (!active) return;
            if (pSnap.exists()) {
              setPlans(parsePlansVal(pSnap.val()));
            } else {
              setPlans([]);
            }
            setIsDatabaseLoading(false);
          })
          .catch(() => {
            if (active) setIsDatabaseLoading(false);
          });
      }
    };

    try {
      const configPlansRef = ref(rtdb, 'config/plans');
      onValue(configPlansRef, handleSnapshot, () => {
        // If config/plans had read failure, try reading root plans
        get(ref(rtdb, 'plans'))
          .then((pSnap) => {
            if (!active) return;
            if (pSnap.exists()) {
              setPlans(parsePlansVal(pSnap.val()));
            } else {
              setPlans([]);
            }
            setIsDatabaseLoading(false);
          })
          .catch(() => {
            if (active) setIsDatabaseLoading(false);
          });
      });

      return () => {
        active = false;
        off(configPlansRef);
      };
    } catch (e) {
      setIsDatabaseLoading(false);
    }
  }, []);

  // Sync Gift Codes from Realtime Database
  useEffect(() => {
    let active = true;

    const parseGiftVal = (val: any): GiftCode[] => {
      if (!val) return [];
      const rawList = Array.isArray(val) ? val : Object.values(val);
      return (rawList as any[])
        .filter((g) => g && typeof g === 'object' && g.id && g.code)
        .map((g) => ({
          id: String(g.id),
          code: String(g.code).toUpperCase(),
          rewardAmount: Number(g.rewardAmount) || 0,
          maxClaims: Number(g.maxClaims) || 0,
          timesClaimed: Number(g.timesClaimed) || 0,
          expiresAt: g.expiresAt ? String(g.expiresAt) : undefined,
          claimedBy: Array.isArray(g.claimedBy) ? g.claimedBy : [],
          createdAt: Number(g.createdAt) || Date.now(),
          active: g.active !== undefined ? Boolean(g.active) : true,
        }));
    };

    const handleSnapshot = (snapshot: any) => {
      if (!active) return;
      if (snapshot.exists() && snapshot.val()) {
        const parsed = parseGiftVal(snapshot.val());
        setGiftCodes(parsed);
      } else {
        get(ref(rtdb, 'gift_codes'))
          .then((snap) => {
            if (!active) return;
            if (snap.exists() && snap.val()) {
              setGiftCodes(parseGiftVal(snap.val()));
            } else {
              const seedFlag = localStorage.getItem('aaley_gift_codes_seeded');
              if (!seedFlag) {
                DEFAULT_GIFT_CODES.forEach((gc) => {
                  set(ref(rtdb, `config/gift_codes/${gc.id}`), gc).catch(() => {});
                  set(ref(rtdb, `gift_codes/${gc.id}`), gc).catch(() => {});
                });
                localStorage.setItem('aaley_gift_codes_seeded', 'true');
                setGiftCodes(DEFAULT_GIFT_CODES);
              } else {
                setGiftCodes([]);
              }
            }
          })
          .catch(() => {});
      }
    };

    try {
      const configGiftRef = ref(rtdb, 'config/gift_codes');
      onValue(configGiftRef, handleSnapshot, () => {
        get(ref(rtdb, 'gift_codes'))
          .then((snap) => {
            if (!active) return;
            if (snap.exists() && snap.val()) {
              setGiftCodes(parseGiftVal(snap.val()));
            } else {
              setGiftCodes([]);
            }
          })
          .catch(() => {});
      });

      return () => {
        active = false;
        off(configGiftRef);
      };
    } catch (e) {}
  }, []);

  // Fetch OneSignal config and initialize client SDK
  useEffect(() => {
    let initialized = false;

    // 1. Check API endpoint
    fetch('/api/onesignal/config')
      .then((res) => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type') || '';
        return ct.includes('application/json') ? res.json() : null;
      })
      .then((data) => {
        if (data && data.appId) {
          initialized = true;
          import('../services/onesignal').then(({ initOneSignal }) => {
            initOneSignal(data.appId);
          });
        }
      })
      .catch((err) => {
        console.warn('OneSignal config fetch notice:', err);
      });

    // 2. Real-time Firebase RTDB config backup check
    try {
      const osRef = ref(rtdb, 'config/onesignal');
      onValue(osRef, (snap) => {
        if (snap.exists() && snap.val()) {
          const val = snap.val();
          const appId = typeof val === 'string' ? val : val.appId;
          if (appId) {
            import('../services/onesignal').then(({ initOneSignal }) => {
              initOneSignal(appId);
            });
          }
        }
      }, () => {});
    } catch (e) {}
  }, []);

  // Helper to prevent duplicate credits for the same order
  const isOrderAlreadyCredited = (orderId: string): boolean => {
    try {
      const raw = localStorage.getItem('credited_rupayex_orders');
      const list: string[] = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) && list.includes(orderId);
    } catch {
      return false;
    }
  };

  const markOrderCredited = (orderId: string) => {
    try {
      const raw = localStorage.getItem('credited_rupayex_orders');
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(orderId)) {
        list.push(orderId);
        localStorage.setItem('credited_rupayex_orders', JSON.stringify(list));
      }
    } catch (e) {
      console.error('Error saving credited order ID', e);
    }
  };

  // Continuous background auto-detection for pending Rupayex recharge orders
  useEffect(() => {
    let isVerifyingNow = false;

    const checkPendingDepositAutomatically = async () => {
      const pendingRaw = localStorage.getItem('pending_rupayex_recharge');
      if (!pendingRaw || isVerifyingNow) return;

      try {
        const parsed = JSON.parse(pendingRaw);
        if (!parsed || !parsed.amount || !parsed.orderRef) return;

        // If older than 25 minutes, expire order
        if (parsed.createdAt && Date.now() - parsed.createdAt > 25 * 60 * 1000) {
          localStorage.removeItem('pending_rupayex_recharge');
          return;
        }

        // Avoid crediting same order twice
        if (isOrderAlreadyCredited(parsed.orderRef)) {
          localStorage.removeItem('pending_rupayex_recharge');
          return;
        }

        isVerifyingNow = true;
        const res = await fetch(`/api/rupayex/order-status?order_id=${encodeURIComponent(parsed.orderRef)}`);

        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && (data.status === true || data.status === 'SUCCESS') && data.payment_status === 'SUCCESS') {
            // STRICT VERIFICATION PASSED: Confirmed by Rupayex Gateway!
            markOrderCredited(parsed.orderRef);
            localStorage.removeItem('pending_rupayex_recharge');

            const channelName = parsed.channel || 'Rupayex Gateway';
            const utrString = data.utr ? ` | UTR: ${data.utr}` : '';
            const creditedAmt = Number(data.amount) || Number(parsed.amount);

            await rechargeWallet(
              creditedAmt,
              `${channelName} (Auto: ${parsed.orderRef}${utrString})`
            );

            // Add to Deposit History
            const approvedReq: RechargeRequest = {
              id: parsed.orderRef,
              uid: user.uid || `user_${user.phone}`,
              userName: user.name || 'User',
              userPhone: user.phone || '',
              amount: creditedAmt,
              utr: data.utr || parsed.orderRef,
              date:
                new Date().toLocaleDateString('en-GB') +
                ' ' +
                new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: Date.now(),
              status: 'approved',
              channel: 'Rupayex Gateway',
              autoVerified: true,
            };

            setRechargeRequests((prev) => [approvedReq, ...prev.filter((r) => r.id !== parsed.orderRef)]);
            try {
              const currentList = JSON.parse(localStorage.getItem('aaley_recharge_requests') || '[]');
              localStorage.setItem('aaley_recharge_requests', JSON.stringify([approvedReq, ...currentList.filter((r: any) => r.id !== parsed.orderRef)]));
              set(ref(rtdb, `recharge_requests/${parsed.orderRef}`), approvedReq).catch(() => {});
            } catch (e) {}

            showToast(`₹${creditedAmt} received & added to your wallet automatically via Rupayex!`);
          }
        }
      } catch (err) {
        console.debug('Background Rupayex deposit auto-check failed (will retry):', err);
      } finally {
        isVerifyingNow = false;
      }
    };

    // 1. Check immediately on mount
    checkPendingDepositAutomatically();

    // 2. Poll every 4 seconds automatically
    const pollInterval = setInterval(() => {
      checkPendingDepositAutomatically();
    }, 4000);

    // 3. Immediately re-check whenever user returns to tab/app (from payment app)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkPendingDepositAutomatically();
      }
    };

    window.addEventListener('focus', checkPendingDepositAutomatically);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', checkPendingDepositAutomatically);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const login = async (phone: string, nickname?: string, password?: string): Promise<boolean> => {
    const maskedPhone = phone.replace(/[^0-9]/g, '');
    if (!maskedPhone || maskedPhone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number');
      return false;
    }

    const isOwnerPhone = maskedPhone === '9510006797';
    const email = phoneToEmail(maskedPhone);
    const storedPass = getUserPassword(maskedPhone);

    // 1. Strict Registration Verification:
    // Determine if this user is actually registered in local registry or RTDB
    let existingProfile: UserProfile | null = null;
    let existingRtdbData: any = null;

    try {
      const stored = localStorage.getItem('aaley_all_registered_users');
      if (stored) {
        const list: UserProfile[] = JSON.parse(stored);
        const found = list.find((u) => u.phone === maskedPhone);
        if (found) {
          // Verify user was properly registered (has password, is owner, or was registered with timestamp)
          if (storedPass || isOwnerPhone || found.createdAt) {
            existingProfile = found;
          }
        }
      }
    } catch (e) {}

    // Check remote RTDB for registered user if not found locally
    if (!existingProfile && !isOwnerPhone) {
      try {
        const userCheckSnap = await get(ref(rtdb, 'users'));
        if (userCheckSnap.exists()) {
          const allUsersObj = userCheckSnap.val();
          for (const [, v] of Object.entries<any>(allUsersObj)) {
            if (v?.profile?.phone === maskedPhone) {
              existingProfile = v.profile;
              existingRtdbData = v;
              break;
            }
          }
        }
      } catch (e) {}
    }

    // If mobile number has never registered, reject login!
    if (!isOwnerPhone && !existingProfile && !storedPass) {
      showToast('Account not found for this mobile number. Please register first.');
      return false;
    }

    // 2. Password Check:
    if (password && storedPass && password !== storedPass) {
      showToast('Incorrect password. Please enter your valid password.');
      return false;
    }

    const pass = password && password.length >= 6 
      ? password 
      : (storedPass || `aalay_${maskedPhone}_pass`);

    try {
      // 3. Authenticate with Firebase Auth
      let credential;
      try {
        credential = await signInWithEmailAndPassword(auth, email, pass);
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/wrong-password') {
          showToast('Incorrect password. Please enter your valid password.');
          return false;
        }
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          try {
            credential = await createUserWithEmailAndPassword(auth, email, pass);
          } catch {
            credential = await signInAnonymously(auth);
          }
        } else {
          credential = await signInAnonymously(auth);
        }
      }

      const uid = credential?.user?.uid || existingProfile?.uid || `user_${maskedPhone}`;

      // Load specific user record from RTDB if available
      if (!existingRtdbData) {
        try {
          const userRef = ref(rtdb, `users/${uid}`);
          const snap = await get(userRef);
          if (snap.exists()) {
            existingRtdbData = snap.val();
            if (existingRtdbData?.profile) {
              existingProfile = existingRtdbData.profile;
            }
          }
        } catch (dbReadErr) {}
      }

      const isOwnerAccount =
        maskedPhone === '9510006797' ||
        email === 'luckypro387@gmail.com' ||
        existingProfile?.role === 'owner';

      const determinedRole: UserRole = isOwnerAccount ? 'owner' : (existingProfile?.role || 'user');

      // 4. Construct user profile strictly from isolated defaults and user's own data, NEVER from previous session
      const finalUser: UserProfile = {
        ...DEFAULT_USER,
        ...(existingProfile || {}),
        name: nickname || existingProfile?.name || `User_${maskedPhone.slice(-4)}`,
        phone: maskedPhone,
        id: existingProfile?.id || maskedPhone.slice(-6),
        isLoggedIn: true,
        avatar: 'https://i.ibb.co/JWBdHWpv/profile-picture.png',
        role: determinedRole,
        uid: uid,
        balance: typeof existingProfile?.balance === 'number' 
          ? existingProfile.balance 
          : (isOwnerAccount ? 50000 : 40),
        totalIncome: typeof existingProfile?.totalIncome === 'number' 
          ? existingProfile.totalIncome 
          : (isOwnerAccount ? 50000 : 40),
        totalRecharge: typeof existingProfile?.totalRecharge === 'number' 
          ? existingProfile.totalRecharge 
          : (isOwnerAccount ? 50000 : 0),
        vipLevel: existingProfile?.vipLevel || (isOwnerAccount ? 'VIP5' : 'VIP1'),
        spinsLeft: typeof existingProfile?.spinsLeft === 'number' ? existingProfile.spinsLeft : 1,
        invitationCode: existingProfile?.invitationCode || String(Math.floor(100000 + Math.random() * 900000)),
      };

      // 5. Load isolated user-specific data (bank, orders, tx, withdrawals)
      let userBank: BankDetails = DEFAULT_BANK;
      if (existingRtdbData?.bankDetails) {
        userBank = existingRtdbData.bankDetails;
      } else {
        const storedBank = localStorage.getItem(`aaley_bank_${maskedPhone}`);
        if (storedBank) {
          try { userBank = JSON.parse(storedBank); } catch (e) {}
        }
      }

      let userOrders: PurchasedOrder[] = [];
      if (existingRtdbData?.orders) {
        userOrders = Array.isArray(existingRtdbData.orders) ? existingRtdbData.orders : Object.values(existingRtdbData.orders);
      } else {
        const storedOrders = localStorage.getItem(`aaley_orders_${maskedPhone}`);
        if (storedOrders) {
          try { userOrders = JSON.parse(storedOrders); } catch (e) {}
        }
      }

      let userTx: TransactionRecord[] = [];
      if (existingRtdbData?.transactions) {
        userTx = Array.isArray(existingRtdbData.transactions) ? existingRtdbData.transactions : Object.values(existingRtdbData.transactions);
      } else {
        const storedTx = localStorage.getItem(`aaley_transactions_${maskedPhone}`);
        if (storedTx) {
          try { userTx = JSON.parse(storedTx); } catch (e) {}
        } else {
          userTx = [
            {
              id: `tx-init-${Date.now()}`,
              title: isOwnerAccount ? 'Admin Capital' : 'Signup Welcome Bonus',
              amount: isOwnerAccount ? 50000 : 40,
              type: 'income',
              category: 'signup_bonus',
              date: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'completed',
            },
          ];
        }
      }

      let userWithdrawals: WithdrawalRecord[] = [];
      if (existingRtdbData?.withdrawals) {
        userWithdrawals = Array.isArray(existingRtdbData.withdrawals) ? existingRtdbData.withdrawals : Object.values(existingRtdbData.withdrawals);
      } else {
        const storedWd = localStorage.getItem(`aaley_withdrawals_${maskedPhone}`);
        if (storedWd) {
          try { userWithdrawals = JSON.parse(storedWd); } catch (e) {}
        }
      }

      // 6. Set isolated user states
      setUser(finalUser);
      setBankDetails(userBank);
      setOrders(userOrders);
      setTransactions(userTx);
      setWithdrawals(userWithdrawals);

      // Save to active and per-user storage
      localStorage.setItem('aaley_user', JSON.stringify(finalUser));
      localStorage.setItem('aaley_bank', JSON.stringify(userBank));
      localStorage.setItem('aaley_orders', JSON.stringify(userOrders));
      localStorage.setItem('aaley_transactions', JSON.stringify(userTx));
      localStorage.setItem('aaley_withdrawals', JSON.stringify(userWithdrawals));
      localStorage.setItem(`aaley_user_${maskedPhone}`, JSON.stringify(finalUser));
      localStorage.setItem(`aaley_bank_${maskedPhone}`, JSON.stringify(userBank));
      localStorage.setItem(`aaley_orders_${maskedPhone}`, JSON.stringify(userOrders));
      localStorage.setItem(`aaley_transactions_${maskedPhone}`, JSON.stringify(userTx));
      localStorage.setItem(`aaley_withdrawals_${maskedPhone}`, JSON.stringify(userWithdrawals));

      saveUserToRegistry(finalUser);
      saveUserPassword(maskedPhone, pass, uid);

      try {
        await update(ref(rtdb, `users/${uid}/profile`), finalUser);
      } catch (dbWriteErr) {}

      showToast('Login Successful!');
      return true;
    } catch (err: any) {
      showToast(err?.message || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  const register = async (
    phone: string,
    nickname: string,
    password?: string,
    inviteCode?: string
  ): Promise<boolean> => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number');
      return false;
    }

    // 1. Strict Duplicate Check: disallow registering if mobile number already exists in registry
    try {
      const stored = localStorage.getItem('aaley_all_registered_users');
      if (stored) {
        const list: UserProfile[] = JSON.parse(stored);
        const existing = list.find((u) => u.phone === cleanPhone);
        if (existing) {
          showToast('This mobile number is already registered. Please login.');
          return false;
        }
      }
    } catch (e) {}

    // 2. Check current saved user session
    try {
      const savedUserStr = localStorage.getItem('aaley_user');
      if (savedUserStr) {
        const savedUser: UserProfile = JSON.parse(savedUserStr);
        if (savedUser.phone === cleanPhone && savedUser.isLoggedIn) {
          showToast('This mobile number is already registered. Please login.');
          return false;
        }
      }
    } catch (e) {}

    const cleanName = nickname.trim() || `User_${cleanPhone.slice(-4)}`;
    const email = phoneToEmail(cleanPhone);
    const pass = password && password.length >= 6 ? password : `aalay_${cleanPhone}_pass`;

    try {
      let credential;
      try {
        credential = await createUserWithEmailAndPassword(auth, email, pass);
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          showToast('This mobile number is already registered. Please login.');
          return false;
        }

        // Check remote RTDB before any anonymous fallback
        try {
          const userCheckSnap = await get(ref(rtdb, `users`));
          if (userCheckSnap.exists()) {
            const allUsersObj = userCheckSnap.val();
            const existsInDb = Object.values(allUsersObj).some(
              (u: any) => u?.profile?.phone === cleanPhone
            );
            if (existsInDb) {
              showToast('This mobile number is already registered. Please login.');
              return false;
            }
          }
        } catch (dbErr) {}

        console.warn('Firebase Auth fallback to anonymous:', err);
        credential = await signInAnonymously(auth);
      }

      const uid = credential.user.uid;
      const isOwnerByPhone = cleanPhone === '9510006797';
      const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      const generatedId = cleanPhone.slice(-6);

      const newUser: UserProfile = {
        name: cleanName,
        phone: cleanPhone,
        id: generatedId,
        vipLevel: 'VIP1',
        balance: 40, // ₹40 Signup Welcome Bonus!
        totalRecharge: 0,
        totalIncome: 40,
        spinsLeft: 1,
        invitationCode: generatedCode,
        activeMembersToday: 0,
        teamMembersCount: 0,
        teamRecharge: 0,
        level1CommissionRate: 10,
        isLoggedIn: true,
        avatar: 'https://i.ibb.co/JWBdHWpv/profile-picture.png',
        role: isOwnerByPhone ? 'owner' : 'user',
        uid: uid,
        createdAt: Date.now(),
      };

      // Reset state for newly registered account
      setBankDetails(DEFAULT_BANK);
      setOrders([]);
      setWithdrawals([]);
      setTeamMembers([]);
      localStorage.setItem('aaley_bank', JSON.stringify(DEFAULT_BANK));
      localStorage.setItem('aaley_orders', JSON.stringify([]));
      localStorage.setItem('aaley_withdrawals', JSON.stringify([]));
      localStorage.setItem('aaley_team_members', JSON.stringify([]));
      localStorage.setItem(`aaley_bank_${cleanPhone}`, JSON.stringify(DEFAULT_BANK));
      localStorage.setItem(`aaley_orders_${cleanPhone}`, JSON.stringify([]));
      localStorage.setItem(`aaley_withdrawals_${cleanPhone}`, JSON.stringify([]));
      localStorage.setItem(`aaley_team_members_${cleanPhone}`, JSON.stringify([]));

      setUser(newUser);
      localStorage.setItem('aaley_user', JSON.stringify(newUser));
      localStorage.setItem(`aaley_user_${cleanPhone}`, JSON.stringify(newUser));
      saveUserToRegistry(newUser);
      saveUserPassword(cleanPhone, pass, uid);

      const initTx: TransactionRecord = {
        id: `tx-init-${Date.now()}`,
        title: 'Signup Welcome Bonus',
        amount: 40,
        type: 'income',
        category: 'signup_bonus',
        date:
          new Date().toLocaleDateString('en-GB') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
      };
      setTransactions([initTx]);
      localStorage.setItem('aaley_transactions', JSON.stringify([initTx]));
      localStorage.setItem(`aaley_transactions_${cleanPhone}`, JSON.stringify([initTx]));

      // Store in Firebase RTDB safely
      try {
        await set(ref(rtdb, `users/${uid}`), {
          profile: newUser,
          bankDetails: DEFAULT_BANK,
          orders: [],
          transactions: [initTx],
          withdrawals: [],
          teamMembers: [],
          missions: INITIAL_MISSIONS,
          redeemedCodes: [],
          totalWonTreasure: 0,
          createdAt: Date.now(),
        });
      } catch (dbErr) {
        // Silently handled
      }

      setActiveTab('home');
      setSubScreen('none');
      showToast('Registration Successful! ₹40 Welcome Bonus credited.');
      return true;
    } catch (err: any) {
      // Fallback cleanly from DEFAULT_USER
      const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      const fallbackUser: UserProfile = {
        ...DEFAULT_USER,
        name: cleanName,
        phone: cleanPhone,
        id: cleanPhone.slice(-6),
        balance: 40,
        totalIncome: 40,
        totalRecharge: 0,
        spinsLeft: 1,
        invitationCode: generatedCode,
        level1CommissionRate: 10,
        isLoggedIn: true,
        role: cleanPhone === '9510006797' ? 'owner' : 'user',
        avatar: 'https://i.ibb.co/JWBdHWpv/profile-picture.png',
        createdAt: Date.now(),
      };
      setUser(fallbackUser);
      setBankDetails(DEFAULT_BANK);
      setOrders([]);
      setWithdrawals([]);
      setTeamMembers([]);
      localStorage.setItem('aaley_user', JSON.stringify(fallbackUser));
      localStorage.setItem(`aaley_user_${cleanPhone}`, JSON.stringify(fallbackUser));
      saveUserToRegistry(fallbackUser);
      saveUserPassword(cleanPhone, pass);
      setActiveTab('home');
      setSubScreen('none');
      showToast('Registration Successful! ₹40 Welcome Bonus credited.');
      return true;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signout warning:', e);
    }

    // 1. Reset user state to clean unauthenticated default
    setUser(DEFAULT_USER);
    setBankDetails(DEFAULT_BANK);
    setOrders([]);
    setTransactions([]);
    setWithdrawals([]);
    setTeamMembers([]);
    setMissions(INITIAL_MISSIONS);
    setRedeemedCodes([]);
    setTotalWonTreasure(0);

    // 2. Remove active session localStorage keys
    localStorage.removeItem('aaley_user');
    localStorage.removeItem('aaley_bank');
    localStorage.removeItem('aaley_orders');
    localStorage.removeItem('aaley_transactions');
    localStorage.removeItem('aaley_withdrawals');
    localStorage.removeItem('aaley_team_members');
    localStorage.removeItem('aaley_redeemed_codes');
    localStorage.removeItem('aaley_total_won_treasure');

    setSubScreen('none');
    setActiveTab('home');
    showToast('Logged out successfully');
  };

  const updateUserPassword = async (
    currentPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanPhone = user.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      return { success: false, message: 'Please log in to change your password.' };
    }

    if (!currentPass || !currentPass.trim()) {
      return { success: false, message: 'Please enter your current password.' };
    }

    if (!newPass || newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    if (currentPass === newPass) {
      return { success: false, message: 'New password cannot be the same as your current password.' };
    }

    // Verify current password
    const storedPass = getUserPassword(cleanPhone, user.uid);
    const defaultPass = `aalay_${cleanPhone}_pass`;

    const isCurrentValid = storedPass 
      ? currentPass === storedPass 
      : (currentPass === defaultPass || currentPass.length >= 6);

    if (!isCurrentValid) {
      return {
        success: false,
        message: 'Current password is incorrect. Please check and try again.',
      };
    }

    // 1. Save new password locally
    saveUserPassword(cleanPhone, newPass, user.uid);
    localStorage.setItem(`aaley_pass_updated_${cleanPhone}`, String(Date.now()));

    // 2. Update Firebase Auth credential if logged in
    try {
      if (auth.currentUser && !auth.currentUser.isAnonymous) {
        try {
          const email = phoneToEmail(cleanPhone);
          const cred = EmailAuthProvider.credential(email, currentPass);
          await reauthenticateWithCredential(auth.currentUser, cred);
          await updatePassword(auth.currentUser, newPass);
        } catch (reauthErr) {
          try {
            await updatePassword(auth.currentUser, newPass);
          } catch (upErr) {
            console.warn('Firebase direct updatePassword warning:', upErr);
          }
        }
      }
    } catch (authErr) {
      console.warn('Firebase Auth update password failed:', authErr);
    }

    // 3. Update RTDB security metadata
    const uid = user.uid || `user_${cleanPhone}`;
    try {
      await update(ref(rtdb, `users/${uid}/security`), {
        passwordLastChanged: Date.now(),
        hasCustomPassword: true,
      });
    } catch (e) {
      // ignore
    }

    showToast('Password updated successfully!');
    return {
      success: true,
      message: 'Password updated successfully! Your new login password is now active.',
    };
  };

  const saveBankDetails = (details: Omit<BankDetails, 'isSaved'>) => {
    const updated: BankDetails = {
      ...details,
      isSaved: true,
    };
    setBankDetails(updated);
    localStorage.setItem('aaley_bank', JSON.stringify(updated));
    showToast('Bank account linked successfully!');
    return true;
  };

  const rechargeWallet = async (amount: number, channel: string): Promise<boolean> => {
    // Add amount to user balance and totalRecharge
    setUser((prev) => ({
      ...prev,
      balance: prev.balance + amount,
      totalRecharge: prev.totalRecharge + amount,
    }));

    const newTx: TransactionRecord = {
      id: `tx-rech-${Date.now()}`,
      title: `Wallet Deposit via ${channel}`,
      amount: amount,
      type: 'income',
      category: 'recharge',
      date:
        new Date().toLocaleDateString('en-GB') +
        ' ' +
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`₹${amount.toLocaleString('en-IN')} deposited successfully!`);
    return true;
  };

  const submitRechargeRequest = async (params: {
    amount: number;
    utr: string;
    screenshotUrl?: string;
    channel: string;
    orderId?: string;
  }): Promise<{ success: boolean; autoVerified: boolean; message: string }> => {
    const requestId = `REC-${Date.now()}`;
    const nowStr =
      new Date().toLocaleDateString('en-GB') +
      ' ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let isAutoVerified = false;
    let autoMsg = '';

    // Attempt automated verification
    try {
      const verifyRes = await fetch('/api/verify-upi-recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utr: params.utr,
          amount: params.amount,
          screenshotBase64: params.screenshotUrl,
          order_id: params.orderId,
          phone: user.phone,
          name: user.name,
        }),
      });

      const ct = verifyRes.headers.get('content-type') || '';
      if (verifyRes.ok && ct.includes('application/json')) {
        const data = await verifyRes.json();
        if (data.status === 'success' && data.autoVerified) {
          isAutoVerified = true;
          autoMsg = data.message || 'Payment verified automatically via banking gateway!';
        }
      }
    } catch (e) {
      console.debug('Automated verification probe:', e);
    }

    const newReq: RechargeRequest = {
      id: requestId,
      uid: user.uid || `user_${user.phone}`,
      userName: user.name || 'User',
      userPhone: user.phone || '9510006797',
      amount: params.amount,
      utr: params.utr,
      screenshotUrl: params.screenshotUrl || '',
      date: nowStr,
      timestamp: Date.now(),
      status: isAutoVerified ? 'approved' : 'pending',
      channel: params.channel,
      autoVerified: isAutoVerified,
    };

    setRechargeRequests((prev) => [newReq, ...prev.filter((r) => r.id !== requestId)]);
    try {
      const currentList: RechargeRequest[] = JSON.parse(localStorage.getItem('aaley_recharge_requests') || '[]');
      const updated = [newReq, ...currentList.filter((r) => r.id !== requestId)];
      localStorage.setItem('aaley_recharge_requests', JSON.stringify(updated));
    } catch (e) {}

    // Save to Firebase RTDB
    try {
      await set(ref(rtdb, `recharge_requests/${requestId}`), newReq);
    } catch (e) {
      console.debug('RTDB write request error:', e);
    }

    if (isAutoVerified) {
      await rechargeWallet(params.amount, `${params.channel} (Auto UTR: ${params.utr})`);
      showToast(`Payment auto-verified! ₹${params.amount} credited.`);
      return { success: true, autoVerified: true, message: autoMsg };
    } else {
      showToast('Recharge request submitted! Awaiting Admin Dashboard approval.');
      return {
        success: true,
        autoVerified: false,
        message: 'Payment proof submitted! Our admin will review your UTR and credit your wallet.',
      };
    }
  };

  const approveRechargeRequestInDb = async (requestId: string, targetUid: string, amount: number): Promise<boolean> => {
    try {
      // 1. Update in local state & localStorage
      setRechargeRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' as const } : r))
      );
      try {
        const stored = JSON.parse(localStorage.getItem('aaley_recharge_requests') || '[]');
        const updated = stored.map((r: any) => (r.id === requestId ? { ...r, status: 'approved' } : r));
        localStorage.setItem('aaley_recharge_requests', JSON.stringify(updated));
      } catch (e) {}

      // 2. Update in RTDB
      try {
        await update(ref(rtdb, `recharge_requests/${requestId}`), { status: 'approved' });
      } catch (e) {}

      // 3. Credit user's wallet
      const storedUsers = localStorage.getItem('aaley_all_registered_users');
      if (storedUsers) {
        try {
          const list: any[] = JSON.parse(storedUsers);
          const updatedList = list.map((u) => {
            if (u.uid === targetUid || u.phone === targetUid) {
              return {
                ...u,
                balance: (Number(u.balance) || 0) + amount,
                totalRecharge: (Number(u.totalRecharge) || 0) + amount,
              };
            }
            return u;
          });
          localStorage.setItem('aaley_all_registered_users', JSON.stringify(updatedList));
        } catch (e) {}
      }

      try {
        const userProfileRef = ref(rtdb, `users/${targetUid}/profile`);
        const snap = await get(userProfileRef);
        if (snap.exists()) {
          const prof = snap.val();
          const currentBalance = Number(prof.balance) || 0;
          const currentTotalRecharge = Number(prof.totalRecharge) || 0;
          await update(userProfileRef, {
            balance: currentBalance + amount,
            totalRecharge: currentTotalRecharge + amount,
          });

          const txRef = push(ref(rtdb, `users/${targetUid}/transactions`));
          await set(txRef, {
            id: `tx-adm-appr-${Date.now()}`,
            title: `UPI Recharge Approved (Admin Deposit)`,
            amount: amount,
            type: 'income',
            category: 'recharge',
            date:
              new Date().toLocaleDateString('en-GB') +
              ' ' +
              new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'completed',
          });
        }
      } catch (e) {}

      // If active user matches target, update directly in memory
      if (
        targetUid === (firebaseUser?.uid || activeListenerRef.current) ||
        targetUid === user.phone ||
        targetUid === user.uid
      ) {
        setUser((prev) => ({
          ...prev,
          balance: prev.balance + amount,
          totalRecharge: prev.totalRecharge + amount,
        }));
        setTransactions((prev) => [
          {
            id: `tx-adm-appr-${Date.now()}`,
            title: `UPI Recharge Approved (Admin Deposit)`,
            amount: amount,
            type: 'income',
            category: 'recharge',
            date:
              new Date().toLocaleDateString('en-GB') +
              ' ' +
              new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'completed',
          },
          ...prev,
        ]);
      }

      showToast(`Approved! ₹${amount} credited to user wallet.`);
      return true;
    } catch (e) {
      showToast('Failed to approve recharge');
      return false;
    }
  };

  const rejectRechargeRequestInDb = async (requestId: string, reason?: string): Promise<boolean> => {
    try {
      setRechargeRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' as const, rejectReason: reason } : r))
      );
      try {
        const stored = JSON.parse(localStorage.getItem('aaley_recharge_requests') || '[]');
        const updated = stored.map((r: any) =>
          r.id === requestId ? { ...r, status: 'rejected', rejectReason: reason } : r
        );
        localStorage.setItem('aaley_recharge_requests', JSON.stringify(updated));
      } catch (e) {}

      try {
        await update(ref(rtdb, `recharge_requests/${requestId}`), {
          status: 'rejected',
          rejectReason: reason || 'Declined by Admin',
        });
      } catch (e) {}

      showToast('Recharge request rejected.');
      return true;
    } catch (e) {
      showToast('Failed to reject recharge');
      return false;
    }
  };

  const requestWithdrawal = (amount: number): { success: boolean; message: string } => {
    if (!bankDetails.isSaved || !bankDetails.accountNumber) {
      return { success: false, message: 'Please bind your Bank Card first before withdrawing.' };
    }
    if (amount < 180) {
      return { success: false, message: 'Minimum withdrawal amount is ₹180.' };
    }
    if (amount > user.balance) {
      return { success: false, message: 'Insufficient wallet balance.' };
    }

    // Deduct balance
    setUser((prev) => ({
      ...prev,
      balance: prev.balance - amount,
    }));

    const refId = `AALAY${Math.floor(10000000 + Math.random() * 90000000)}`;
    const withdrawalId = `w-${Date.now()}`;
    const dateStr =
      new Date().toLocaleDateString('en-GB') +
      ' ' +
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newWithdrawal: WithdrawalRecord = {
      id: withdrawalId,
      amount: amount,
      bankAccount: bankDetails.accountNumber,
      ifsc: bankDetails.ifscCode,
      date: dateStr,
      status: 'pending',
      referenceId: refId,
    };

    const newTx: TransactionRecord = {
      id: `tx-wd-${Date.now()}`,
      title: `Bank Withdrawal to ***${bankDetails.accountNumber.slice(-4)}`,
      amount: amount,
      type: 'withdraw',
      category: 'withdrawal',
      date: dateStr,
      status: 'pending',
    };

    setWithdrawals((prev) => [newWithdrawal, ...prev]);
    setTransactions((prev) => [newTx, ...prev]);

    // Save to user local storage
    try {
      const stored = JSON.parse(localStorage.getItem('aaley_withdrawals') || '[]');
      localStorage.setItem('aaley_withdrawals', JSON.stringify([newWithdrawal, ...stored]));
    } catch (e) {}

    // Save to global withdrawals list for admin
    const adminItem = {
      uid: user.uid || `user_${user.phone}`,
      userName: user.name || 'User',
      userPhone: user.phone || '9510006797',
      withdrawalId: withdrawalId,
      amount: amount,
      bankAccount: bankDetails.accountNumber,
      ifsc: bankDetails.ifscCode,
      date: dateStr,
      status: 'pending',
      referenceId: refId,
    };

    try {
      const storedGlobal = JSON.parse(localStorage.getItem('aaley_all_withdrawals') || '[]');
      localStorage.setItem('aaley_all_withdrawals', JSON.stringify([adminItem, ...storedGlobal.filter((w: any) => w.withdrawalId !== withdrawalId)]));
    } catch (e) {}

    // Sync to Firebase RTDB under user node and top level withdrawal_requests
    try {
      const uid = user.uid || `user_${user.phone}`;
      set(ref(rtdb, `users/${uid}/withdrawals/${withdrawalId}`), newWithdrawal).catch(() => {});
      set(ref(rtdb, `withdrawal_requests/${withdrawalId}`), adminItem).catch(() => {});
    } catch (e) {}

    // Send push notification to admins
    try {
      fetch('/api/notify-admin-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId,
          amount,
          userName: user.name,
          userPhone: user.phone,
          bankAccount: bankDetails.accountNumber,
          ifsc: bankDetails.ifscCode,
        }),
      }).catch(() => {});
    } catch (e) {}

    showToast('Withdrawal request submitted! Pending Admin approval.');
    return { success: true, message: 'Withdrawal request submitted! Pending Admin approval.' };
  };

  const buyPlan = (planId: string): { success: boolean; message: string; purchasedPlan?: ProductPlan } => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return { success: false, message: 'Plan not found.' };

    // Strict VIP Gating: Normal users cannot purchase VIP products
    if (plan.type === 'vip') {
      const userVip = String(user.vipLevel || '').trim().toUpperCase();
      const isVipEligible =
        user.role === 'owner' ||
        (userVip !== '' &&
          userVip !== 'VIP 0' &&
          userVip !== 'VIP0' &&
          userVip !== '0' &&
          userVip !== 'NORMAL');

      if (!isVipEligible) {
        showToast('VIP Product Locked! Normal users cannot purchase VIP plans.');
        return {
          success: false,
          message:
            'VIP Product Locked! Normal users cannot purchase VIP products. Contact Admin to upgrade your VIP level.',
        };
      }
    }

    if (user.balance < plan.price) {
      setRechargePresetAmount(plan.price);
      setSubScreen('recharge');
      return {
        success: false,
        message: `Insufficient balance! You need ₹${plan.price - user.balance} more. Redirecting to Recharge...`,
      };
    }

    // Deduct balance and create order
    setUser((prev) => ({
      ...prev,
      balance: prev.balance - plan.price,
    }));

    const serverNow = Date.now();
    const newOrder: PurchasedOrder = {
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      dailyIncome: plan.dailyIncome,
      totalRevenue: plan.totalRevenue,
      durationDays: plan.durationDays,
      daysRemaining: plan.durationDays,
      purchaseDate: new Date().toLocaleDateString('en-GB'),
      nextCollectTime: '24h 00m',
      type: plan.type,
      imageType: plan.imageType,
      imageUrl: plan.imageUrl,
      totalCollected: 0,
      purchaseTimestamp: serverNow,
      lastCollectTimestamp: serverNow,
      serverNextCollectTimestamp: serverNow + 24 * 60 * 60 * 1000,
    };

    setOrders((prev) => [newOrder, ...prev]);

    const newTx: TransactionRecord = {
      id: `tx-ord-${Date.now()}`,
      title: `Plan Purchase: ${plan.name}`,
      amount: plan.price,
      type: 'withdraw',
      category: 'plan_income',
      date:
        new Date().toLocaleDateString('en-GB') +
        ' ' +
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Successfully purchased ${plan.name}! Check Purchase Record.`);
    return { success: true, message: `Successfully purchased ${plan.name}!`, purchasedPlan: plan };
  };

  const collectOrderIncome = async (orderId: string): Promise<boolean> => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return false;

    try {
      const res = await fetch('/api/orders/collect-daily-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId,
          dailyIncome: order.dailyIncome,
          durationDays: order.durationDays,
          daysRemaining: order.daysRemaining,
          totalCollected: order.totalCollected,
          purchaseTimestamp: order.purchaseTimestamp,
          lastCollectTimestamp: order.lastCollectTimestamp,
        }),
      });

      const ct = res.headers.get('content-type') || '';
      if (!res.ok || !ct.includes('application/json')) {
        return false;
      }
      const data = await res.json();
      if (!data.success) {
        showToast(data.error || 'Server 24-hour cycle has not completed yet.');
        return false;
      }

      // Validated by server!
      const creditAmount = data.creditAmount;
      setUser((prev) => ({
        ...prev,
        balance: prev.balance + creditAmount,
        totalIncome: prev.totalIncome + creditAmount,
      }));

      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === orderId
            ? {
                ...o,
                totalCollected: data.newTotalCollected,
                daysRemaining: data.newDaysRemaining,
                lastCollectTimestamp: data.lastCollectTimestamp,
                serverNextCollectTimestamp: data.nextCollectTimestamp,
                nextCollectTime: data.newDaysRemaining <= 0 ? 'Completed' : '24h 00m',
              }
            : o
        )
      );

      const newTx: TransactionRecord = {
        id: `tx-inc-${Date.now()}`,
        title: `Daily Profit: ${order.planName}`,
        amount: creditAmount,
        type: 'income',
        category: 'plan_income',
        date:
          new Date().toLocaleDateString('en-GB') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
      };

      setTransactions((prev) => [newTx, ...prev]);
      showToast(data.message || `Collected ₹${creditAmount} daily profit!`);
      return true;
    } catch (err: any) {
      showToast(`Verification error: ${err.message}`);
      return false;
    }
  };

  const spinLuckyDraw = (wonAmount: number) => {
    setUser((prev) => ({
      ...prev,
      balance: prev.balance + wonAmount,
      totalIncome: prev.totalIncome + wonAmount,
      spinsLeft: Math.max(0, prev.spinsLeft - 1),
    }));

    if (wonAmount > 0) {
      const newTx: TransactionRecord = {
        id: `tx-spin-${Date.now()}`,
        title: `Lucky Draw Spin Win`,
        amount: wonAmount,
        type: 'income',
        category: 'spin_win',
        date:
          new Date().toLocaleDateString('en-GB') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const sanitizeGiftCodeForFirebase = (gc: GiftCode): Record<string, any> => {
    const clean: Record<string, any> = {};
    Object.entries(gc).forEach(([key, val]) => {
      if (val !== undefined) {
        clean[key] = val;
      }
    });
    return clean;
  };

  const redeemGiftCode = (codeInput: string): { success: boolean; message: string; amount?: number } => {
    const cleanCode = codeInput.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a valid gift code.' };
    }

    if (redeemedCodes.includes(cleanCode)) {
      return { success: false, message: 'This gift code has already been redeemed!' };
    }

    // 1. Check dynamic gift codes created by admin or default list
    const foundCode = giftCodes.find((gc) => gc.code.toUpperCase() === cleanCode && gc.active);

    let rewardAmount = 0;
    if (foundCode) {
      if (foundCode.expiresAt && new Date(foundCode.expiresAt).getTime() < Date.now()) {
        return { success: false, message: 'This gift code has expired.' };
      }
      if (foundCode.maxClaims > 0 && foundCode.timesClaimed >= foundCode.maxClaims) {
        return { success: false, message: 'This gift code has reached its maximum redemption limit.' };
      }
      rewardAmount = foundCode.rewardAmount;
    } else {
      // Fallback preset codes
      const validCodes: Record<string, number> = {
        AALAY50: 50,
        AALEY50: 50,
        BISCUIT100: 100,
        AALAY2026: 200,
        AALEY2026: 200,
        BONUS40: 40,
        TELEGRAM77: 77,
        LUCKY88: 88,
      };
      rewardAmount = validCodes[cleanCode] || (cleanCode.length >= 4 ? 35 : 0);
    }

    if (rewardAmount <= 0) {
      return { success: false, message: 'Invalid gift code. Check Telegram or contact Admin for active codes!' };
    }

    // Increment times claimed if dynamic
    if (foundCode) {
      const updatedGc: GiftCode = {
        ...foundCode,
        timesClaimed: foundCode.timesClaimed + 1,
        claimedBy: [...(foundCode.claimedBy || []), user.phone || user.id],
      };

      setGiftCodes((prev) =>
        prev.map((gc) => (gc.id === foundCode.id ? updatedGc : gc))
      );

      try {
        const cleanData = sanitizeGiftCodeForFirebase(updatedGc);
        set(ref(rtdb, `config/gift_codes/${foundCode.id}`), cleanData).catch(() => {});
        set(ref(rtdb, `gift_codes/${foundCode.id}`), cleanData).catch(() => {});
      } catch (e) {}
    }

    setRedeemedCodes((prev) => [...prev, cleanCode]);
    setTotalWonTreasure((prev) => prev + rewardAmount);

    setUser((prev) => ({
      ...prev,
      balance: prev.balance + rewardAmount,
      totalIncome: prev.totalIncome + rewardAmount,
    }));

    const newTx: TransactionRecord = {
      id: `tx-gift-${Date.now()}`,
      title: `Treasure Box Code (${cleanCode})`,
      amount: rewardAmount,
      type: 'income',
      category: 'treasure_code',
      date:
        new Date().toLocaleDateString('en-GB') +
        ' ' +
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Claimed ₹${rewardAmount} from gift code ${cleanCode}!`);
    return { success: true, message: `Congratulations! ₹${rewardAmount} added to your wallet balance.`, amount: rewardAmount };
  };

  const createGiftCode = (codeData: Omit<GiftCode, 'id' | 'timesClaimed' | 'createdAt'>): GiftCode => {
    try {
      localStorage.setItem('aaley_gift_codes_seeded', 'true');
    } catch (e) {}

    const newCode: GiftCode = {
      ...codeData,
      id: `gc-${Date.now()}`,
      code: codeData.code.trim().toUpperCase(),
      timesClaimed: 0,
      createdAt: Date.now(),
      active: true,
      claimedBy: [],
    };

    setGiftCodes((prev) => {
      const updated = [newCode, ...prev.filter((gc) => gc.code.toUpperCase() !== newCode.code)];
      try {
        localStorage.setItem('aaley_gift_codes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const cleanData = sanitizeGiftCodeForFirebase(newCode);
      set(ref(rtdb, `config/gift_codes/${newCode.id}`), cleanData).catch(() => {});
      set(ref(rtdb, `gift_codes/${newCode.id}`), cleanData).catch(() => {});
    } catch (e) {}

    showToast(`Gift code "${newCode.code}" (₹${newCode.rewardAmount}) created successfully!`);
    return newCode;
  };

  const updateGiftCode = (updatedCode: GiftCode) => {
    try {
      localStorage.setItem('aaley_gift_codes_seeded', 'true');
    } catch (e) {}

    const formatted: GiftCode = {
      ...updatedCode,
      code: updatedCode.code.trim().toUpperCase(),
    };

    setGiftCodes((prev) => {
      const updated = prev.map((gc) => (gc.id === formatted.id ? formatted : gc));
      try {
        localStorage.setItem('aaley_gift_codes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const cleanData = sanitizeGiftCodeForFirebase(formatted);
      set(ref(rtdb, `config/gift_codes/${formatted.id}`), cleanData).catch(() => {});
      set(ref(rtdb, `gift_codes/${formatted.id}`), cleanData).catch(() => {});
    } catch (e) {}

    showToast(`Gift code "${formatted.code}" updated successfully!`);
  };

  const deleteGiftCode = (id: string) => {
    try {
      localStorage.setItem('aaley_gift_codes_seeded', 'true');
    } catch (e) {}

    setGiftCodes((prev) => {
      const updated = prev.filter((gc) => gc.id !== id);
      try {
        localStorage.setItem('aaley_gift_codes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      set(ref(rtdb, `config/gift_codes/${id}`), null).catch(() => {});
      set(ref(rtdb, `gift_codes/${id}`), null).catch(() => {});
    } catch (e) {}

    showToast('Gift code removed successfully.');
  };


  const claimMission = (missionId: string): boolean => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || mission.claimed) return false;

    const realActiveCount = Math.max(
      user.activeMembersToday,
      teamMembers.filter((m) => m.active).length,
      teamMembers.length
    );

    if (realActiveCount < mission.requiredMembers) {
      showToast(`Need ${mission.requiredMembers - realActiveCount} more active member(s) to claim!`);
      return false;
    }

    setUser((prev) => ({
      ...prev,
      balance: prev.balance + mission.rewardAmount,
      totalIncome: prev.totalIncome + mission.rewardAmount,
    }));

    const updatedMissions = missions.map((m) =>
      m.id === missionId ? { ...m, claimed: true } : m
    );
    setMissions(updatedMissions);
    localStorage.setItem('aaley_missions', JSON.stringify(updatedMissions));

    const newTx: TransactionRecord = {
      id: `tx-mis-${Date.now()}`,
      title: `Team Mission Milestone Bonus (${mission.requiredMembers} Active Members)`,
      amount: mission.rewardAmount,
      type: 'income',
      category: 'signup_bonus',
      date:
        new Date().toLocaleDateString('en-GB') +
        ' ' +
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Claimed ₹${mission.rewardAmount.toLocaleString('en-IN')} Mission Bonus!`);
    return true;
  };

  const addReferralMember = (
    level: 1 | 2 | 3 = 1,
    rechargeAmount: number = 700,
    memberName?: string,
    memberPhone?: string
  ) => {
    // Level 1: 10%, Level 2: 20%, Level 3: 40% (max)
    const ratePercent = level === 1 ? 10 : level === 2 ? 20 : 40;
    const rateDecimal = ratePercent / 100;
    const commission = Math.round(rechargeAmount * rateDecimal);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const maskedPhone = memberPhone || `98${Math.floor(10 + Math.random() * 89)}****${randomSuffix}`;
    const name = memberName || `Member_${randomSuffix}`;

    const newMember: TeamMember = {
      id: `tm-${Date.now()}-${randomSuffix}`,
      name: name,
      phone: maskedPhone,
      joinedDate:
        new Date().toLocaleDateString('en-GB') +
        ' ' +
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      level: level,
      totalRecharge: rechargeAmount,
      commissionEarned: commission,
      active: true,
    };

    setTeamMembers((prev) => [newMember, ...prev]);

    setUser((prev) => ({
      ...prev,
      activeMembersToday: prev.activeMembersToday + 1,
      teamMembersCount: prev.teamMembersCount + 1,
      teamRecharge: prev.teamRecharge + rechargeAmount,
      balance: prev.balance + commission,
      totalIncome: prev.totalIncome + commission,
    }));

    const newTx: TransactionRecord = {
      id: `tx-com-${Date.now()}`,
      title: `Level ${level} Commission (${ratePercent}%) · ${name}`,
      amount: commission,
      type: 'income',
      category: 'commission',
      date:
        new Date().toLocaleDateString('en-GB') +
        ' ' +
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Level ${level} referral joined! +₹${commission} (${ratePercent}%) commission credited!`);
  };

  const addActiveTeamMember = () => {
    addReferralMember(1, 700);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const setUserRole = async (newRole: 'user' | 'owner') => {
    setUser((prev) => {
      const updated = { ...prev, role: newRole };
      saveUserToRegistry(updated);
      return updated;
    });
    const uid = firebaseUser?.uid || activeListenerRef.current;
    if (uid) {
      try {
        await update(ref(rtdb, `users/${uid}/profile`), { role: newRole });
      } catch (e) {
        // Silently handled
      }
    }
    showToast(`Role updated to ${newRole.toUpperCase()}`);
  };

  const updateUserRoleInDb = async (targetUid: string, role: 'user' | 'owner'): Promise<boolean> => {
    try {
      // Update local system registry
      const stored = localStorage.getItem('aaley_all_registered_users');
      if (stored) {
        try {
          const list: UserProfile[] = JSON.parse(stored);
          const updatedList = list.map((u) =>
            u.uid === targetUid || u.phone === targetUid ? { ...u, role } : u
          );
          localStorage.setItem('aaley_all_registered_users', JSON.stringify(updatedList));
        } catch (e) {
          // ignore
        }
      }

      await update(ref(rtdb, `users/${targetUid}/profile`), { role });
      if (targetUid === (firebaseUser?.uid || activeListenerRef.current)) {
        setUser((prev) => ({ ...prev, role }));
      }
      showToast(`User role updated to ${role.toUpperCase()}`);
      return true;
    } catch (e: any) {
      // Still succeed locally
      if (targetUid === (firebaseUser?.uid || activeListenerRef.current)) {
        setUser((prev) => ({ ...prev, role }));
      }
      showToast(`User role set to ${role.toUpperCase()}`);
      return true;
    }
  };

  const updateUserVipLevelInDb = async (targetUid: string, newVipLevel: string): Promise<boolean> => {
    try {
      // 1. Update in local registry
      const stored = localStorage.getItem('aaley_all_registered_users');
      if (stored) {
        try {
          const list: UserProfile[] = JSON.parse(stored);
          const updatedList = list.map((u) =>
            u.uid === targetUid || u.phone === targetUid ? { ...u, vipLevel: newVipLevel } : u
          );
          localStorage.setItem('aaley_all_registered_users', JSON.stringify(updatedList));
        } catch (e) {}
      }

      // 2. Update in RTDB
      try {
        await update(ref(rtdb, `users/${targetUid}/profile`), { vipLevel: newVipLevel });
      } catch (e) {
        console.debug('RTDB vip level update error:', e);
      }

      // 3. Update in-memory active user if target matches
      if (
        targetUid === (firebaseUser?.uid || activeListenerRef.current) ||
        targetUid === user.phone ||
        targetUid === user.uid
      ) {
        setUser((prev) => {
          const updated = { ...prev, vipLevel: newVipLevel };
          localStorage.setItem('aaley_user', JSON.stringify(updated));
          return updated;
        });
      }

      showToast(`User VIP level updated to ${newVipLevel}`);
      return true;
    } catch (e: any) {
      if (
        targetUid === (firebaseUser?.uid || activeListenerRef.current) ||
        targetUid === user.phone ||
        targetUid === user.uid
      ) {
        setUser((prev) => ({ ...prev, vipLevel: newVipLevel }));
      }
      showToast(`VIP level set to ${newVipLevel}`);
      return true;
    }
  };

  const adjustUserBalanceInDb = async (
    targetUid: string,
    deltaAmount: number,
    reason?: string
  ): Promise<boolean> => {
    try {
      // Update in local registry
      const stored = localStorage.getItem('aaley_all_registered_users');
      let targetFound = false;
      if (stored) {
        try {
          const list: UserProfile[] = JSON.parse(stored);
          const updatedList = list.map((u) => {
            if (u.uid === targetUid || u.phone === targetUid) {
              targetFound = true;
              return { ...u, balance: Math.max(0, (u.balance || 0) + deltaAmount) };
            }
            return u;
          });
          localStorage.setItem('aaley_all_registered_users', JSON.stringify(updatedList));
        } catch (e) {
          // ignore
        }
      }

      const userProfileRef = ref(rtdb, `users/${targetUid}/profile`);
      try {
        const snap = await get(userProfileRef);
        if (snap.exists()) {
          const prof = snap.val();
          const currentBalance = Number(prof.balance) || 0;
          const newBalance = Math.max(0, currentBalance + deltaAmount);
          await update(userProfileRef, { balance: newBalance });

          const txRef = push(ref(rtdb, `users/${targetUid}/transactions`));
          await set(txRef, {
            id: `tx-admin-${Date.now()}`,
            title: reason || (deltaAmount >= 0 ? 'Admin Wallet Credit' : 'Admin Wallet Adjustment'),
            amount: Math.abs(deltaAmount),
            type: deltaAmount >= 0 ? 'income' : 'withdraw',
            category: 'signup_bonus',
            date:
              new Date().toLocaleDateString('en-GB') +
              ' ' +
              new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'completed',
          });
        }
      } catch (dbErr) {
        // Silently handled
      }

      if (targetUid === (firebaseUser?.uid || activeListenerRef.current) || targetUid === user.phone) {
        setUser((prev) => ({ ...prev, balance: Math.max(0, prev.balance + deltaAmount) }));
      }
      showToast(`Balance adjusted: ${deltaAmount >= 0 ? '+' : ''}₹${deltaAmount}`);
      return true;
    } catch (e) {
      showToast('Error adjusting user balance');
      return false;
    }
  };

  const approveWithdrawalInDb = async (targetUid: string, withdrawalId: string): Promise<boolean> => {
    try {
      // 1. Update in top-level withdrawal_requests node
      try {
        await update(ref(rtdb, `withdrawal_requests/${withdrawalId}`), { status: 'completed' });
      } catch (e) {}

      // 2. Update under user node
      const snap = await get(ref(rtdb, `users/${targetUid}/withdrawals`));
      if (snap.exists()) {
        const val = snap.val();
        let updated: any[];
        if (Array.isArray(val)) {
          updated = val.map((w: any) => (w && w.id === withdrawalId ? { ...w, status: 'completed' } : w));
        } else {
          updated = Object.values(val).map((w: any) => (w && w.id === withdrawalId ? { ...w, status: 'completed' } : w));
        }
        await set(ref(rtdb, `users/${targetUid}/withdrawals`), updated);
      }

      // 3. Update local state if active user
      if (targetUid === user.uid || targetUid === user.phone || targetUid === (firebaseUser?.uid || activeListenerRef.current)) {
        setWithdrawals((prev) =>
          prev.map((w) => (w.id === withdrawalId ? { ...w, status: 'completed' } : w))
        );
        setTransactions((prev) =>
          prev.map((t) => (t.id.includes(withdrawalId) ? { ...t, status: 'completed' } : t))
        );
      }

      // 4. Update localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('aaley_withdrawals') || '[]');
        const updatedStored = stored.map((w: any) => (w.id === withdrawalId ? { ...w, status: 'completed' } : w));
        localStorage.setItem('aaley_withdrawals', JSON.stringify(updatedStored));

        const storedGlobal = JSON.parse(localStorage.getItem('aaley_all_withdrawals') || '[]');
        const updatedGlobal = storedGlobal.map((w: any) => (w.withdrawalId === withdrawalId ? { ...w, status: 'completed' } : w));
        localStorage.setItem('aaley_all_withdrawals', JSON.stringify(updatedGlobal));
      } catch (e) {}

      showToast('Withdrawal payout marked as COMPLETED!');
      return true;
    } catch (e) {
      showToast('Failed to approve withdrawal');
      return false;
    }
  };

  const rejectWithdrawalInDb = async (targetUid: string, withdrawalId: string): Promise<boolean> => {
    try {
      let refundAmount = 0;

      // 1. Update in top-level withdrawal_requests node
      try {
        const reqSnap = await get(ref(rtdb, `withdrawal_requests/${withdrawalId}`));
        if (reqSnap.exists()) {
          refundAmount = Number(reqSnap.val().amount) || 0;
          await update(ref(rtdb, `withdrawal_requests/${withdrawalId}`), { status: 'rejected' });
        }
      } catch (e) {}

      // 2. Update under user node
      const snap = await get(ref(rtdb, `users/${targetUid}/withdrawals`));
      if (snap.exists()) {
        const val = snap.val();
        let entries = Array.isArray(val) ? val : Object.values(val);
        const updated = entries.map((w: any) => {
          if (w && w.id === withdrawalId) {
            if (!refundAmount) refundAmount = Number(w.amount) || 0;
            return { ...w, status: 'rejected' };
          }
          return w;
        });
        await set(ref(rtdb, `users/${targetUid}/withdrawals`), updated);
      }

      // 3. Refund amount to user balance in RTDB & local storage & state
      if (refundAmount > 0) {
        // Profile RTDB
        try {
          const profSnap = await get(ref(rtdb, `users/${targetUid}/profile`));
          if (profSnap.exists()) {
            const currentBal = Number(profSnap.val().balance) || 0;
            await update(ref(rtdb, `users/${targetUid}/profile`), {
              balance: currentBal + refundAmount,
            });
          }
        } catch (e) {}

        // Active user state
        if (targetUid === user.uid || targetUid === user.phone || targetUid === (firebaseUser?.uid || activeListenerRef.current)) {
          setUser((prev) => ({
            ...prev,
            balance: prev.balance + refundAmount,
          }));
          setWithdrawals((prev) =>
            prev.map((w) => (w.id === withdrawalId ? { ...w, status: 'rejected' } : w))
          );
          setTransactions((prev) =>
            prev.map((t) => (t.id.includes(withdrawalId) ? { ...t, status: 'rejected' } : t))
          );
        }

        // Registry localStorage
        try {
          const storedUsers = localStorage.getItem('aaley_all_registered_users');
          if (storedUsers) {
            const list: UserProfile[] = JSON.parse(storedUsers);
            const updatedList = list.map((u) =>
              u.uid === targetUid || u.phone === targetUid ? { ...u, balance: (u.balance || 0) + refundAmount } : u
            );
            localStorage.setItem('aaley_all_registered_users', JSON.stringify(updatedList));
          }
        } catch (e) {}
      }

      // Local storage updates for withdrawals
      try {
        const stored = JSON.parse(localStorage.getItem('aaley_withdrawals') || '[]');
        const updatedStored = stored.map((w: any) => (w.id === withdrawalId ? { ...w, status: 'rejected' } : w));
        localStorage.setItem('aaley_withdrawals', JSON.stringify(updatedStored));

        const storedGlobal = JSON.parse(localStorage.getItem('aaley_all_withdrawals') || '[]');
        const updatedGlobal = storedGlobal.map((w: any) => (w.withdrawalId === withdrawalId ? { ...w, status: 'rejected' } : w));
        localStorage.setItem('aaley_all_withdrawals', JSON.stringify(updatedGlobal));
      } catch (e) {}

      showToast('Withdrawal REJECTED & amount refunded to user account');
      return true;
    } catch (e) {
      showToast('Failed to reject withdrawal');
      return false;
    }
  };

  const broadcastSystemNotice = async (title: string, content: string): Promise<boolean> => {
    try {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title,
        content,
        date: new Date().toLocaleDateString('en-GB'),
        read: false,
        type: 'announcement',
      };
      await push(ref(rtdb, 'announcements'), newNotif);
      setNotifications((prev) => [newNotif, ...prev]);
      showToast('Announcement broadcasted to all users in realtime!');
      return true;
    } catch (e) {
      showToast('Broadcast failed');
      return false;
    }
  };

  const sanitizePlanForFirebase = (plan: ProductPlan): Record<string, any> => {
    const clean: Record<string, any> = {};
    Object.entries(plan).forEach(([key, val]) => {
      if (val !== undefined) {
        clean[key] = val;
      }
    });
    return clean;
  };

  const addNewPlan = (newPlan: ProductPlan) => {
    setPlans((prev) => {
      const updated = [newPlan, ...prev.filter((p) => p.id !== newPlan.id)];
      try {
        localStorage.setItem('aaley_product_plans', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const cleanData = sanitizePlanForFirebase(newPlan);
      set(ref(rtdb, `config/plans/${newPlan.id}`), cleanData).catch(() => {});
      set(ref(rtdb, `plans/${newPlan.id}`), cleanData).catch(() => {});
    } catch (e) {}

    showToast(`New product "${newPlan.name}" added to catalog!`);
  };

  const deletePlan = (planId: string) => {
    setPlans((prev) => {
      const updated = prev.filter((p) => p.id !== planId);
      try {
        localStorage.setItem('aaley_product_plans', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      set(ref(rtdb, `config/plans/${planId}`), null).catch(() => {});
      set(ref(rtdb, `plans/${planId}`), null).catch(() => {});
    } catch (e) {}

    showToast('Product plan removed successfully.');
  };

  const updatePlan = (updatedPlan: ProductPlan) => {
    setPlans((prev) => {
      const updated = prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
      try {
        localStorage.setItem('aaley_product_plans', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const cleanData = sanitizePlanForFirebase(updatedPlan);
      set(ref(rtdb, `config/plans/${updatedPlan.id}`), cleanData).catch(() => {});
      set(ref(rtdb, `plans/${updatedPlan.id}`), cleanData).catch(() => {});
    } catch (e) {}

    showToast(`Product "${updatedPlan.name}" updated successfully!`);
  };

  const resetPlansToDefault = () => {
    setPlans(DEFAULT_PLANS);
    try {
      localStorage.setItem('aaley_product_plans', JSON.stringify(DEFAULT_PLANS));
      set(ref(rtdb, 'config/plans'), null).catch(() => {});
      set(ref(rtdb, 'plans'), null).catch(() => {});
    } catch (e) {}
    showToast('Product catalog restored to default factory preset units.');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        firebaseUid: firebaseUser?.uid || null,
        isFirebaseConnected,
        isAuthLoading,
        isDatabaseLoading,
        bankDetails,
        plans,
        giftCodes,
        orders,
        transactions,
        withdrawals,
        teamMembers,
        missions,
        notifications,
        language,
        activeTab,
        subScreen,
        showWelcomeModal,
        showCustomerService,
        showInviteModal,
        showLiveChat,
        rechargePresetAmount,
        totalWonTreasure,
        redeemedCodes,
        toastMessage,
        rechargeRequests,

        setLanguage,
        setActiveTab,
        setSubScreen,
        setShowWelcomeModal,
        setShowCustomerService,
        setShowInviteModal,
        setShowLiveChat,
        setRechargePresetAmount,
        showToast,

        login,
        register,
        logout,
        updateUserPassword,
        saveBankDetails,
        rechargeWallet,
        submitRechargeRequest,
        approveRechargeRequestInDb,
        rejectRechargeRequestInDb,
        requestWithdrawal,
        buyPlan,
        collectOrderIncome,
        spinLuckyDraw,
        redeemGiftCode,
        createGiftCode,
        updateGiftCode,
        deleteGiftCode,
        claimMission,
        markNotificationRead,
        addActiveTeamMember,
        addReferralMember,

        setUserRole,
        updateUserRoleInDb,
        updateUserVipLevelInDb,
        adjustUserBalanceInDb,
        approveWithdrawalInDb,
        rejectWithdrawalInDb,
        broadcastSystemNotice,
        updatePlan,
        addNewPlan,
        deletePlan,
        resetPlansToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};



export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
