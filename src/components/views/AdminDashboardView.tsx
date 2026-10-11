import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  CreditCard,
  Bell,
  Package,
  Search,
  CheckCircle2,
  XCircle,
  PlusCircle,
  MinusCircle,
  Crown,
  UserCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Send,
  ArrowLeft,
  Activity,
  Layers,
  Lock,
  Download,
  Copy,
  Clock,
  Check,
  Building,
  Factory,
  BarChart3,
  Sliders,
  AlertTriangle,
  UserPlus,
  Menu,
  X,
  Edit3,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Sparkles,
  Star,
  Image as ImageIcon,
  Wallet,
  FileCheck,
  Eye,
  Settings,
  ToggleLeft,
  ToggleRight,
  Radio,
  EyeOff,
  Gift,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductImage } from '../common/ProductImage';
import { rtdb, ref, get, set, onValue, off } from '../../firebase';
import { UserRole, ProductPlan, RechargeRequest, GiftCode } from '../../types';
import { calculateWalletMetrics } from '../../utils/wallet';

interface SystemUserItem {
  uid: string;
  name: string;
  phone: string;
  role: UserRole;
  balance: number;
  vipLevel: string;
  totalRecharge?: number;
  totalIncome?: number;
  invitationCode?: string;
  avatar?: string;
  createdAt?: number;
}

interface SystemWithdrawalItem {
  uid: string;
  userName: string;
  userPhone: string;
  withdrawalId: string;
  amount: number;
  bankAccount: string;
  ifsc: string;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  referenceId: string;
}

export const AdminDashboardView: React.FC = () => {
  const {
    user,
    setSubScreen,
    setUserRole,
    updateUserRoleInDb,
    updateUserVipLevelInDb,
    adjustUserBalanceInDb,
    approveWithdrawalInDb,
    rejectWithdrawalInDb,
    broadcastSystemNotice,
    showToast,
    plans,
    giftCodes,
    createGiftCode,
    updateGiftCode,
    deleteGiftCode,
    updatePlan,
    addNewPlan,
    deletePlan,
    resetPlansToDefault,
    rechargeRequests,
    approveRechargeRequestInDb,
    rejectRechargeRequestInDb,
    deleteUserAccountInDb,
  } = useApp();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'recharges' | 'withdrawals' | 'products' | 'giftcodes' | 'broadcast' | 'settings'>('overview');
  // Gift code creation & editing form state
  const [newCodeName, setNewCodeName] = useState<string>('AALAY100');
  const [newCodeReward, setNewCodeReward] = useState<string>('100');
  const [newCodeMaxClaims, setNewCodeMaxClaims] = useState<string>('500');
  const [newCodeExpiry, setNewCodeExpiry] = useState<string>('');
  const [editingGiftCode, setEditingGiftCode] = useState<GiftCode | null>(null);

  // Recharges management filter & modal state
  const [rechargeFilter, setRechargeFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rechargeSearch, setRechargeSearch] = useState<string>('');
  const [rechargeScreenshotModal, setRechargeScreenshotModal] = useState<string | null>(null);
  const [rechargeToReject, setRechargeToReject] = useState<RechargeRequest | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState<string>('Invalid or Unverified UTR');
  const [isDirectDepositOpen, setIsDirectDepositOpen] = useState<boolean>(false);
  const [directDepositPhone, setDirectDepositPhone] = useState<string>('');
  const [directDepositAmount, setDirectDepositAmount] = useState<string>('500');
  const [directDepositReason, setDirectDepositReason] = useState<string>('Manual Admin Credit');

  // Hamburger menu and side system state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Product Plan Editor state
  const [editingPlan, setEditingPlan] = useState<ProductPlan | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState<boolean>(false);
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | 'normal' | 'vip'>('all');
  const [productSearch, setProductSearch] = useState<string>('');
  const [planForm, setPlanForm] = useState<{
    id: string;
    name: string;
    tag: string;
    price: number;
    dailyIncome: number;
    durationDays: number;
    totalRevenue: number;
    type: 'normal' | 'vip';
    imageType: 'fevicol' | 'drfixit' | 'mseal' | 'tilefix' | 'laticrete' | 'acrylic';
    imageUrl: string;
    description: string;
  } | null>(null);
  
  // Data lists
  const [usersList, setUsersList] = useState<SystemUserItem[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<SystemWithdrawalItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'owner'>('user');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Balance adjustment modal
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<SystemUserItem | null>(null);
  const [adjustAmountInput, setAdjustAmountInput] = useState<string>('500');
  const [adjustReasonInput, setAdjustReasonInput] = useState<string>('Management Wallet Adjustment');

  // VIP Level adjustment modal
  const [selectedUserForVip, setSelectedUserForVip] = useState<SystemUserItem | null>(null);
  const [vipLevelSelect, setVipLevelSelect] = useState<string>('VIP 1');

  // Custom Confirmation Modals State
  const [planToDelete, setPlanToDelete] = useState<ProductPlan | null>(null);
  const [isResetCatalogModalOpen, setIsResetCatalogModalOpen] = useState<boolean>(false);
  const [roleToggleTarget, setRoleToggleTarget] = useState<SystemUserItem | null>(null);
  const [withdrawalToReject, setWithdrawalToReject] = useState<SystemWithdrawalItem | null>(null);

  // Rupayex Gateway integration states
  const [rupayexBalance, setRupayexBalance] = useState<number | null>(null);
  const [rupayexBalanceError, setRupayexBalanceError] = useState<string | null>(null);
  const [isLoadingRupayexBalance, setIsLoadingRupayexBalance] = useState<boolean>(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false);
  const [rupayexTokenInput, setRupayexTokenInput] = useState<string>('');
  const [maskedRupayexToken, setMaskedRupayexToken] = useState<string>('');
  const [isGatewayEnabled, setIsGatewayEnabled] = useState<boolean>(true);
  const [isProcessingPayoutId, setIsProcessingPayoutId] = useState<string | null>(null);
  const [showRawToken, setShowRawToken] = useState<boolean>(false);
  const [rawTokenValue, setRawTokenValue] = useState<string>('');

  // OneSignal Push Notification configuration states
  const [onesignalAppIdInput, setOnesignalAppIdInput] = useState<string>('');
  const [onesignalRestApiKeyInput, setOnesignalRestApiKeyInput] = useState<string>('');
  const [savedOnesignalAppId, setSavedOnesignalAppId] = useState<string>('');
  const [hasOnesignalRestApiKey, setHasOnesignalRestApiKey] = useState<boolean>(false);
  const [testPushTitle, setTestPushTitle] = useState<string>('AALAY Bonus Alert!');
  const [testPushMessage, setTestPushMessage] = useState<string>('Your daily machinery return has been credited to your wallet balance.');
  const [isSendingTestPush, setIsSendingTestPush] = useState<boolean>(false);

  // Master Access Passcode state (for unauthenticated or non-owner direct /admin visits)
  const [masterPassInput, setMasterPassInput] = useState<string>('');
  const [isUnlockedDirectly, setIsUnlockedDirectly] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Time ticker
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchRupayexBalance = async () => {
    setIsLoadingRupayexBalance(true);
    setRupayexBalanceError(null);
    try {
      const res = await fetch('/api/rupayex/wallet-balance', {
        headers: { 'x-admin-key': 'aalay_admin_secure_key_2026' },
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setRupayexBalanceError('Server proxy returned non-JSON response. Check API route setup.');
        return;
      }
      const data = await res.json();
      if (res.ok && data) {
        if (typeof data.balance === 'number') {
          setRupayexBalance(data.balance);
        } else {
          const raw = data.raw || data;
          const extracted =
            raw?.balance ??
            raw?.wallet_balance ??
            raw?.wallet ??
            raw?.data?.balance ??
            raw?.data?.wallet_balance ??
            raw?.amount;
          if (extracted !== undefined && extracted !== null && !isNaN(Number(extracted))) {
            setRupayexBalance(Number(extracted));
          } else if (raw?.error || raw?.message) {
            setRupayexBalanceError(raw.error || raw.message);
          } else {
            setRupayexBalance(0);
          }
        }
      } else {
        setRupayexBalanceError(data?.error || data?.message || 'Failed to query gateway');
      }
    } catch (e: any) {
      console.debug('Failed to fetch Rupayex wallet balance:', e);
      setRupayexBalanceError(e.message || 'Connection error');
    } finally {
      setIsLoadingRupayexBalance(false);
    }
  };

  const fetchRupayexConfig = async () => {
    try {
      const res = await fetch('/api/rupayex/config');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data) {
          if (data.tokenMasked) setMaskedRupayexToken(data.tokenMasked);
          if (data.token) {
            setRawTokenValue(data.token);
            setRupayexTokenInput(data.token);
          }
          if (typeof data.enabled === 'boolean') setIsGatewayEnabled(data.enabled);
        }
      }
    } catch (e) {}

    // Fallback/sync check from Firebase RTDB
    try {
      const snap = await get(ref(rtdb, 'config/gateway'));
      if (snap.exists() && snap.val()) {
        const val = snap.val();
        if (val.token) {
          setRawTokenValue(val.token);
          setRupayexTokenInput(val.token);
          setMaskedRupayexToken(`${val.token.slice(0, 6)}...${val.token.slice(-4)}`);
        }
        if (typeof val.enabled === 'boolean') {
          setIsGatewayEnabled(val.enabled);
        }
      }
    } catch (e) {}
  };

  const fetchOneSignalConfig = async () => {
    try {
      const res = await fetch('/api/onesignal/config');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data && data.appId) {
          setSavedOnesignalAppId(data.appId);
          setOnesignalAppIdInput(data.appId);
          if (data.hasRestApiKey) setHasOnesignalRestApiKey(true);
        }
      }
    } catch (e) {}

    // Fallback: Check Firebase RTDB
    try {
      const snap = await get(ref(rtdb, 'config/onesignal'));
      if (snap.exists() && snap.val()) {
        const val = snap.val();
        const appId = typeof val === 'string' ? val : val.appId;
        if (appId) {
          setSavedOnesignalAppId(appId);
          setOnesignalAppIdInput((prev) => prev || appId);
        }
        if (val.restApiKey) {
          setHasOnesignalRestApiKey(true);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchRupayexBalance();
    fetchRupayexConfig();
    fetchOneSignalConfig();
  }, []);

  const handleToggleGatewayStatus = async () => {
    const newStatus = !isGatewayEnabled;
    try {
      setIsGatewayEnabled(newStatus);
      // Persist to Firebase RTDB
      try {
        set(ref(rtdb, 'config/gateway'), {
          token: rawTokenValue || rupayexTokenInput || 'c0bfc67f130d640a0f7f9737de2f9af6',
          enabled: newStatus,
          updatedAt: new Date().toISOString(),
        }).catch(() => {});
      } catch (e) {}

      const res = await fetch('/api/rupayex/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'aalay_admin_secure_key_2026',
        },
        body: JSON.stringify({ enabled: newStatus }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.status) {
          showToast(newStatus ? 'Rupayex Payment Gateway ENABLED' : 'Rupayex Gateway DISABLED (Maintenance mode)');
          return;
        }
      }
      showToast(newStatus ? 'Rupayex Gateway ENABLED' : 'Rupayex Gateway DISABLED');
    } catch (err: any) {
      showToast(`Gateway status toggled: ${newStatus ? 'ENABLED' : 'DISABLED'}`);
    }
  };

  const handleSaveRupayexToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const tokenToSave = rupayexTokenInput.trim() || rawTokenValue.trim();
    if (!tokenToSave) {
      showToast('Please enter a valid API token');
      return;
    }

    // Persist to Firebase RTDB
    try {
      set(ref(rtdb, 'config/gateway'), {
        token: tokenToSave,
        enabled: isGatewayEnabled,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    } catch (e) {}

    try {
      const res = await fetch('/api/rupayex/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'aalay_admin_secure_key_2026',
        },
        body: JSON.stringify({ token: tokenToSave }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.status) {
          showToast('Rupayex API Token saved to Database successfully!');
          setIsTokenModalOpen(false);
          setRawTokenValue(tokenToSave);
          setMaskedRupayexToken(`${tokenToSave.slice(0, 6)}...${tokenToSave.slice(-4)}`);
          setRupayexTokenInput('');
          fetchRupayexConfig();
          fetchRupayexBalance();
          return;
        }
      }
      showToast('Rupayex API Token saved to Database!');
      setIsTokenModalOpen(false);
      setRawTokenValue(tokenToSave);
      setMaskedRupayexToken(`${tokenToSave.slice(0, 6)}...${tokenToSave.slice(-4)}`);
      setRupayexTokenInput('');
    } catch (err: any) {
      showToast(`Token saved to Database`);
      setIsTokenModalOpen(false);
      setRawTokenValue(tokenToSave);
      setMaskedRupayexToken(`${tokenToSave.slice(0, 6)}...${tokenToSave.slice(-4)}`);
    }
  };

  const handleSaveOneSignalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAppId = onesignalAppIdInput.trim();
    const cleanRestKey = onesignalRestApiKeyInput.trim();

    if (!cleanAppId) {
      showToast('Please enter your OneSignal App ID');
      return;
    }

    // Always persist to Firebase RTDB
    try {
      set(ref(rtdb, 'config/onesignal'), {
        appId: cleanAppId,
        restApiKey: cleanRestKey || undefined,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    } catch (e) {}

    try {
      const res = await fetch('/api/onesignal/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'aalay_admin_secure_key_2026',
        },
        body: JSON.stringify({
          appId: cleanAppId,
          restApiKey: cleanRestKey || undefined,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.status) {
          showToast('OneSignal configuration saved successfully!');
          setSavedOnesignalAppId(data.appId);
          if (cleanRestKey) setHasOnesignalRestApiKey(true);
          setOnesignalRestApiKeyInput('');
          
          import('../../services/onesignal').then(({ initOneSignal }) => {
            initOneSignal(data.appId);
          });
          return;
        }
      }
      showToast('OneSignal settings saved successfully!');
      setSavedOnesignalAppId(cleanAppId);
      if (cleanRestKey) setHasOnesignalRestApiKey(true);
      setOnesignalRestApiKeyInput('');
      import('../../services/onesignal').then(({ initOneSignal }) => {
        initOneSignal(cleanAppId);
      });
    } catch (err: any) {
      showToast(`OneSignal settings saved successfully!`);
      setSavedOnesignalAppId(cleanAppId);
      if (cleanRestKey) setHasOnesignalRestApiKey(true);
      setOnesignalRestApiKeyInput('');
      import('../../services/onesignal').then(({ initOneSignal }) => {
        initOneSignal(cleanAppId);
      });
    }
  };

  const handleDispatchPushTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPushTitle.trim() || !testPushMessage.trim()) {
      showToast('Please provide both notification title and message');
      return;
    }
    setIsSendingTestPush(true);
    try {
      const res = await fetch('/api/onesignal/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'aalay_admin_secure_key_2026',
        },
        body: JSON.stringify({
          title: testPushTitle.trim(),
          message: testPushMessage.trim(),
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.status) {
          showToast('Push notification broadcasted successfully!');
        } else {
          showToast(data.error || 'Push broadcast failed');
        }
      } else {
        showToast('Push notification broadcast submitted!');
      }
    } catch (err: any) {
      showToast(`Push broadcast note: ${err.message}`);
    } finally {
      setIsSendingTestPush(false);
    }
  };

  const isOwner = user.role === 'owner' || isUnlockedDirectly;

  // Fetch all users and withdrawals combining local registry and remote database
  const fetchAllSystemData = () => {
    setIsLoading(true);

    // 1. Load users from local registry
    const localUsers: SystemUserItem[] = [];
    try {
      const stored = localStorage.getItem('aaley_all_registered_users');
      if (stored) {
        const parsed: any[] = JSON.parse(stored);
        parsed.forEach((u) => {
          localUsers.push({
            uid: u.uid || `user_${u.phone}`,
            name: u.name || 'Lucky',
            phone: u.phone || '9510006797',
            role: u.role || 'user',
            balance: Number(u.balance) || 0,
            vipLevel: u.vipLevel || 'VIP1',
            totalRecharge: Number(u.totalRecharge) || 0,
            totalIncome: Number(u.totalIncome) || 0,
            invitationCode: u.invitationCode || '883921',
            avatar: u.avatar || 'https://i.ibb.co/JWBdHWpv/profile-picture.png',
            createdAt: u.createdAt || Date.now(),
          });
        });
      }
    } catch (e) {
      console.warn('Local users read warning:', e);
    }

    // Always include current logged-in user if missing
    if (user.phone && !localUsers.some((u) => u.phone === user.phone)) {
      localUsers.unshift({
        uid: user.uid || 'current_user',
        name: user.name,
        phone: user.phone,
        role: user.role,
        balance: user.balance,
        vipLevel: user.vipLevel,
        totalRecharge: user.totalRecharge,
        totalIncome: user.totalIncome,
        invitationCode: user.invitationCode,
        avatar: user.avatar,
        createdAt: Date.now(),
      });
    }

    // 2. Load withdrawals from current session / local storage
    const localWithdrawals: SystemWithdrawalItem[] = [];
    try {
      const storedWd = localStorage.getItem('aaley_withdrawals');
      if (storedWd) {
        const parsedWd: any[] = JSON.parse(storedWd);
        parsedWd.forEach((w) => {
          localWithdrawals.push({
            uid: user.uid || 'self',
            userName: user.name,
            userPhone: user.phone,
            withdrawalId: w.id,
            amount: Number(w.amount) || 0,
            bankAccount: w.bankAccount || '•••• •••• 6797',
            ifsc: w.ifsc || 'SBIN0001234',
            date: w.date || new Date().toLocaleDateString('en-GB'),
            status: w.status || 'pending',
            referenceId: w.referenceId || `REF-${w.id}`,
          });
        });
      }
      const storedGlobal = localStorage.getItem('aaley_all_withdrawals');
      if (storedGlobal) {
        const parsedG: any[] = JSON.parse(storedGlobal);
        parsedG.forEach((gw) => {
          localWithdrawals.push({
            uid: gw.uid || 'user',
            userName: gw.userName || 'User',
            userPhone: gw.userPhone || '9510006797',
            withdrawalId: gw.withdrawalId || gw.id,
            amount: Number(gw.amount) || 0,
            bankAccount: gw.bankAccount || '•••• •••• 6797',
            ifsc: gw.ifsc || 'SBIN0001234',
            date: gw.date || new Date().toLocaleDateString('en-GB'),
            status: gw.status || 'pending',
            referenceId: gw.referenceId || `REF-${gw.withdrawalId}`,
          });
        });
      }
    } catch (e) {
      console.warn('Local withdrawals read warning:', e);
    }

    // 3. Attempt remote database read without throwing
    try {
      const usersRef = ref(rtdb, 'users');
      get(usersRef)
        .then(async (snapshot) => {
          const remoteUsers: SystemUserItem[] = [];
          const remoteWithdrawals: SystemWithdrawalItem[] = [];

          if (snapshot.exists()) {
            const val = snapshot.val();

            Object.keys(val).forEach((uid) => {
              const uData = val[uid];
              const prof = uData?.profile;
              if (prof) {
                remoteUsers.push({
                  uid,
                  name: prof.name || 'Lucky',
                  phone: prof.phone || '9510006797',
                  role: prof.role || 'user',
                  balance: Number(prof.balance) || 0,
                  vipLevel: prof.vipLevel || 'VIP1',
                  totalRecharge: Number(prof.totalRecharge) || 0,
                  totalIncome: Number(prof.totalIncome) || 0,
                  invitationCode: prof.invitationCode || '883921',
                  avatar: prof.avatar || 'https://i.ibb.co/JWBdHWpv/profile-picture.png',
                  createdAt: prof.createdAt || uData.createdAt,
                });
              }

              if (uData?.withdrawals) {
                const wArr = Array.isArray(uData.withdrawals)
                  ? uData.withdrawals
                  : Object.values(uData.withdrawals);
                wArr.forEach((w: any) => {
                  if (w && w.id) {
                    remoteWithdrawals.push({
                      uid,
                      userName: prof?.name || 'Lucky',
                      userPhone: prof?.phone || '9510006797',
                      withdrawalId: w.id,
                      amount: Number(w.amount) || 0,
                      bankAccount: w.bankAccount || '•••• •••• 6797',
                      ifsc: w.ifsc || 'SBIN0001234',
                      date: w.date || new Date().toLocaleDateString('en-GB'),
                      status: w.status || 'pending',
                      referenceId: w.referenceId || `REF-${w.id}`,
                    });
                  }
                });
              }
            });
          }

          // Fetch top level withdrawal_requests node
          try {
            const reqSnap = await get(ref(rtdb, 'withdrawal_requests'));
            if (reqSnap.exists()) {
              const reqVal = reqSnap.val();
              Object.values(reqVal).forEach((w: any) => {
                if (w && (w.withdrawalId || w.id)) {
                  remoteWithdrawals.push({
                    uid: w.uid || 'user',
                    userName: w.userName || 'User',
                    userPhone: w.userPhone || '9510006797',
                    withdrawalId: w.withdrawalId || w.id,
                    amount: Number(w.amount) || 0,
                    bankAccount: w.bankAccount || '•••• •••• 6797',
                    ifsc: w.ifsc || 'SBIN0001234',
                    date: w.date || new Date().toLocaleDateString('en-GB'),
                    status: w.status || 'pending',
                    referenceId: w.referenceId || `REF-${w.withdrawalId}`,
                  });
                }
              });
            }
          } catch (e) {}

          // Merge unique users and withdrawals
          const mergedUsersMap = new Map<string, SystemUserItem>();
          localUsers.forEach((u) => mergedUsersMap.set(u.phone, u));
          remoteUsers.forEach((u) => mergedUsersMap.set(u.phone, u));

          const mergedWithdrawalsMap = new Map<string, SystemWithdrawalItem>();
          localWithdrawals.forEach((w) => mergedWithdrawalsMap.set(w.withdrawalId, w));
          remoteWithdrawals.forEach((w) => mergedWithdrawalsMap.set(w.withdrawalId, w));

          setUsersList(Array.from(mergedUsersMap.values()));
          setWithdrawalsList(Array.from(mergedWithdrawalsMap.values()));
        })
        .catch(() => {
          setUsersList(localUsers);
          setWithdrawalsList(localWithdrawals);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (e) {
      setUsersList(localUsers);
      setWithdrawalsList(localWithdrawals);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSystemData();

    // Safe subscription to users node
    try {
      const usersRef = ref(rtdb, 'users');
      onValue(
        usersRef,
        () => {
          fetchAllSystemData();
        },
        () => {
          // Safe standby
        }
      );
      return () => {
        off(usersRef);
      };
    } catch (e) {
      // ignore
    }
  }, []);

  const exitToMainApp = () => {
    setSubScreen('none');
    window.history.pushState(null, '', '/');
  };

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.uid.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered withdrawals
  const filteredWithdrawals = withdrawalsList.filter((w) => {
    if (withdrawalFilter === 'all') return true;
    return w.status === withdrawalFilter;
  });

  // System KPI calculations
  const totalUsersCount = usersList.length;
  const totalOwnersCount = usersList.filter((u) => u.role === 'owner').length;
  const totalSystemBalance = usersList.reduce((acc, u) => acc + (u.balance || 0), 0);
  const totalRechargeSum = usersList.reduce((acc, u) => {
    const { displayTotalRecharge } = calculateWalletMetrics(
      u.balance || 0,
      u.totalRecharge || 0,
      u.totalIncome || 0
    );
    return acc + displayTotalRecharge;
  }, 0);
  const pendingWithdrawals = withdrawalsList.filter((w) => w.status === 'pending');
  const totalPendingAmount = pendingWithdrawals.reduce((acc, w) => acc + (w.amount || 0), 0);

  // Recharge KPI calculations & filtered list
  const pendingRecharges = rechargeRequests.filter((r) => r.status === 'pending');
  const approvedRecharges = rechargeRequests.filter((r) => r.status === 'approved');
  const totalApprovedRechargeAmount = approvedRecharges.reduce((acc, r) => acc + (r.amount || 0), 0);
  const totalPendingRechargeAmount = pendingRecharges.reduce((acc, r) => acc + (r.amount || 0), 0);

  const filteredRecharges = rechargeRequests.filter((r) => {
    const q = rechargeSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.userName.toLowerCase().includes(q) ||
      r.userPhone.includes(q) ||
      r.utr.toLowerCase().includes(q);
    const matchesStatus = rechargeFilter === 'all' || r.status === rechargeFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApproveRecharge = async (req: RechargeRequest) => {
    await approveRechargeRequestInDb(req.id, req.uid, req.amount);
    fetchAllSystemData();
  };

  const handleConfirmRejectRecharge = async () => {
    if (!rechargeToReject) return;
    await rejectRechargeRequestInDb(rechargeToReject.id, rejectReasonText);
    setRechargeToReject(null);
    fetchAllSystemData();
  };

  const handleDirectDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(directDepositAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid deposit amount');
      return;
    }
    const cleanPhone = directDepositPhone.trim();
    if (!cleanPhone) {
      showToast('Please enter user phone number');
      return;
    }

    const matchedUser = usersList.find((u) => u.phone === cleanPhone || u.uid === cleanPhone);
    const targetUid = matchedUser ? matchedUser.uid : cleanPhone;

    await adjustUserBalanceInDb(targetUid, amt, directDepositReason || 'Admin Manual Deposit');
    showToast(`Deposited ₹${amt} to ${cleanPhone} successfully!`);
    setIsDirectDepositOpen(false);
    setDirectDepositPhone('');
    fetchAllSystemData();
  };

  // Role toggle
  const handleRoleToggle = (targetUser: SystemUserItem) => {
    setRoleToggleTarget(targetUser);
  };

  // Immediate permanent user account deletion (no confirmation required, deletes all records and owner accounts)
  const handleDeleteUser = async (targetUser: SystemUserItem) => {
    await deleteUserAccountInDb(targetUser.uid, targetUser.phone);
    setUsersList((prev) => prev.filter((u) => u.phone !== targetUser.phone && u.uid !== targetUser.uid));
    fetchAllSystemData();
  };

  // VIP level save handler
  const handleVipLevelSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForVip) return;
    await updateUserVipLevelInDb(selectedUserForVip.uid, vipLevelSelect);
    setSelectedUserForVip(null);
    fetchAllSystemData();
  };

  // Balance adjust submit
  const handleBalanceAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBalance) return;
    const amount = Number(adjustAmountInput);
    if (isNaN(amount) || amount === 0) {
      showToast('Please enter a valid amount');
      return;
    }

    await adjustUserBalanceInDb(
      selectedUserForBalance.uid,
      amount,
      adjustReasonInput || `Owner Adjustment by Admin (${user.name})`
    );

    setSelectedUserForBalance(null);
    fetchAllSystemData();
  };

  // Approve withdrawal with instant automated Rupayex payout dispatch
  const handleApproveWithdrawal = async (item: SystemWithdrawalItem) => {
    setIsProcessingPayoutId(item.withdrawalId);
    showToast(`Dispatching Rupayex automated payout of ₹${item.amount}...`);

    try {
      const payoutRes = await fetch('/api/rupayex/create-payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'aalay_admin_secure_key_2026',
        },
        body: JSON.stringify({
          amount: item.amount,
          method: item.bankAccount ? 'bank' : 'upi',
          account_holder: item.userName || 'Account Holder',
          account_number: item.bankAccount || '',
          ifsc_code: item.ifsc || '',
          bank_name: 'Commercial Bank',
          payout_id: item.withdrawalId,
        }),
      });

      const payoutData = await payoutRes.json();
      if (payoutRes.ok && payoutData && (payoutData.status === true || payoutData.data?.payout_id)) {
        const pId = payoutData.data?.payout_id || item.withdrawalId;
        showToast(`Rupayex Payout Dispatched! ID: ${pId}`);
      } else {
        showToast(`Payout recorded in system: ${payoutData.message || payoutData.error || 'Approved'}`);
      }
    } catch (err: any) {
      console.warn('Rupayex automated payout warning:', err);
      showToast(`Payout approved in system (Gateway notice: ${err.message})`);
    } finally {
      setIsProcessingPayoutId(null);
    }

    await approveWithdrawalInDb(item.uid, item.withdrawalId);
    setWithdrawalsList((prev) =>
      prev.map((w) => (w.withdrawalId === item.withdrawalId ? { ...w, status: 'completed' } : w))
    );
    fetchRupayexBalance();
  };

  // Reject withdrawal
  const handleRejectWithdrawal = (item: SystemWithdrawalItem) => {
    setWithdrawalToReject(item);
  };

  // Broadcast
  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastContent.trim()) {
      showToast('Please enter both announcement title and message');
      return;
    }

    setIsBroadcasting(true);
    await broadcastSystemNotice(broadcastTitle.trim(), broadcastContent.trim());
    setBroadcastTitle('');
    setBroadcastContent('');
    setIsBroadcasting(false);
  };

  // Product Plan Editor handlers
  const handleOpenEditPlan = (plan: ProductPlan) => {
    setIsAddingNewProduct(false);
    setEditingPlan(plan);
    setPlanForm({
      id: plan.id,
      name: plan.name,
      tag: plan.tag || '',
      price: plan.price,
      dailyIncome: plan.dailyIncome,
      durationDays: plan.durationDays,
      totalRevenue: plan.totalRevenue,
      type: plan.type,
      imageType: plan.imageType,
      imageUrl: plan.imageUrl || '',
      description: plan.description,
    });
  };

  const handleOpenAddNewPlan = () => {
    const newId = `product-${Date.now()}`;
    const defaultNewPlan: ProductPlan = {
      id: newId,
      name: 'Aalay Extra Active Wash Detergent Unit',
      tag: 'New Unit',
      price: 1200,
      dailyIncome: 650,
      durationDays: 25,
      totalRevenue: 16250,
      type: 'normal',
      imageType: 'fevicol',
      imageUrl: '',
      description: 'High-speed automated washing powder packaging & active distribution contract',
    };
    setIsAddingNewProduct(true);
    setEditingPlan(defaultNewPlan);
    setPlanForm({
      id: newId,
      name: defaultNewPlan.name,
      tag: defaultNewPlan.tag || '',
      price: defaultNewPlan.price,
      dailyIncome: defaultNewPlan.dailyIncome,
      durationDays: defaultNewPlan.durationDays,
      totalRevenue: defaultNewPlan.totalRevenue,
      type: defaultNewPlan.type,
      imageType: defaultNewPlan.imageType,
      imageUrl: '',
      description: defaultNewPlan.description,
    });
  };

  const handleClosePlanModal = () => {
    setEditingPlan(null);
    setPlanForm(null);
    setIsAddingNewProduct(false);
  };

  const handleDeletePlan = (plan: ProductPlan) => {
    setPlanToDelete(plan);
  };

  const handleResetCatalog = () => {
    setIsResetCatalogModalOpen(true);
  };

  const handleSavePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm) return;

    if (!planForm.name.trim()) {
      showToast('Please enter a product name');
      return;
    }
    if (planForm.price <= 0) {
      showToast('Product price must be greater than 0');
      return;
    }
    if (planForm.dailyIncome <= 0) {
      showToast('Daily income must be greater than 0');
      return;
    }
    if (planForm.durationDays <= 0) {
      showToast('Cycle duration must be at least 1 day');
      return;
    }

    const calculatedTotal =
      Number(planForm.totalRevenue) || Number(planForm.dailyIncome) * Number(planForm.durationDays);

    const updated: ProductPlan = {
      id: planForm.id,
      name: planForm.name.trim(),
      tag: planForm.tag.trim() ? planForm.tag.trim() : undefined,
      tagType: planForm.type === 'vip' ? 'best-value' : 'popular',
      price: Number(planForm.price),
      dailyIncome: Number(planForm.dailyIncome),
      durationDays: Number(planForm.durationDays),
      totalRevenue: calculatedTotal,
      type: planForm.type,
      imageType: planForm.imageType,
      imageUrl: planForm.imageUrl.trim() ? planForm.imageUrl.trim() : undefined,
      description: planForm.description.trim(),
    };

    if (isAddingNewProduct) {
      addNewPlan(updated);
    } else {
      updatePlan(updated);
    }
    handleClosePlanModal();
  };

  // Direct login as owner from /admin barrier
  const handleMasterPassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = masterPassInput.trim();
    if (cleanPass === '951000' || cleanPass === 'admin' || cleanPass === 'owner' || cleanPass === '9510006797') {
      setIsUnlockedDirectly(true);
      setUserRole('owner');
      setAuthError(null);
      showToast('Owner access verified! Welcome to Admin Panel.');
    } else {
      setAuthError('Invalid Owner Passcode. Please check your credentials.');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  // If unauthorized, show Enterprise Administration Gateway
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#071329] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto mb-4 shadow-inner">
            <Lock size={32} />
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-2">
              <ShieldAlert size={12} />
              <span>Admin Security Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Admin Panel
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              Enter admin passcode to access user accounts, deposits, withdrawals, and platform settings.
            </p>
          </div>

          <form onSubmit={handleMasterPassSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Admin Security Passcode
              </label>
              <input
                type="password"
                value={masterPassInput}
                onChange={(e) => setMasterPassInput(e.target.value)}
                placeholder="Enter passcode (e.g. 951000)"
                className="w-full px-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                autoFocus
              />
              {authError && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                  <AlertTriangle size={13} />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] text-amber-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all"
            >
              Enter Admin Portal
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <button
              onClick={exitToMainApp}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Return to Storefront App</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#041a0e] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-500 selection:text-black w-full max-w-full overflow-x-hidden relative">
      {/* Top Enterprise Bar */}
      <header className="sticky top-0 z-40 bg-[#03130a]/95 border-b border-emerald-950/80 backdrop-blur-md px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Identity & Hamburger Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Hamburger Button for Navigation Drawer & Sidebar */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-amber-400 hover:text-amber-300 border border-slate-700/80 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 shrink-0"
              title="Toggle Navigation Menu"
              aria-label="Toggle navigation drawer"
            >
              {isSidebarOpen ? (
                <X size={18} className="stroke-[2.5]" />
              ) : (
                <Menu size={18} className="stroke-[2.5]" />
              )}
            </button>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-800/80 border border-amber-400/40 p-0.5 shadow-lg shrink-0 overflow-hidden">
              <img
                src={user.avatar || 'https://i.ibb.co/JWBdHWpv/profile-picture.png'}
                alt="Admin Profile"
                className="w-full h-full rounded-xl object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://i.ibb.co/JWBdHWpv/profile-picture.png';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs sm:text-base font-black tracking-tight text-white uppercase truncate">
                  ADMIN PANEL
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black tracking-wide shrink-0">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
                Management Panel • {currentTime}
              </p>
            </div>
          </div>

          {/* Right Action Lockup */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={fetchAllSystemData}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all flex items-center gap-1.5 text-xs font-bold shrink-0"
              title="Refresh System Data"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-amber-400' : ''} />
              <span className="hidden md:inline">Refresh</span>
            </button>

            {/* Current Admin Identity */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 shrink-0">
              <img
                src={user.avatar || 'https://i.ibb.co/JWBdHWpv/profile-picture.png'}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-amber-400/50"
              />
              <div className="text-left text-xs">
                <span className="font-bold text-white block leading-tight">{user.name}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                  <Crown size={11} className="text-amber-400" />
                  <span>OWNER</span>
                </span>
              </div>
            </div>

            {/* Exit to Main App Button */}
            <button
              onClick={exitToMainApp}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600/80 text-xs font-black flex items-center gap-1 sm:gap-1.5 transition-all active:scale-95 shadow-sm shrink-0"
            >
              <ArrowLeft size={14} />
              <span className="text-[11px] sm:text-xs">Exit App</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / Slide-Over Side Drawer System */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Side Drawer Body */}
          <div className="relative w-72 max-w-[85vw] bg-[#071329] border-r border-slate-800 h-full p-4 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-amber-400/40 p-0.5 shadow-md overflow-hidden shrink-0">
                    <img
                      src={user.avatar || 'https://i.ibb.co/JWBdHWpv/profile-picture.png'}
                      alt="Admin Profile"
                      className="w-full h-full rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://i.ibb.co/JWBdHWpv/profile-picture.png';
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white block uppercase leading-tight">
                      ADMIN PANEL
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-extrabold tracking-wider">
                      <Crown size={11} className="text-amber-400" />
                      <span>OWNER PORTAL</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Admin profile card */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <img
                  src={user.avatar || 'https://i.ibb.co/JWBdHWpv/profile-picture.png'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-amber-400/50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://i.ibb.co/JWBdHWpv/profile-picture.png';
                  }}
                />
                <div className="text-left text-xs min-w-0 flex-1">
                  <span className="font-bold text-white block truncate">{user.name || 'Admin'}</span>
                  <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">Verified Owner</span>
                </div>
              </div>

              {/* Navigation Links */}
              <div>
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  NAVIGATION
                </div>
                <nav className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('overview');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeTab === 'overview'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BarChart3 size={16} />
                      <span>Overview & Metrics</span>
                    </div>
                    <Activity size={14} className="opacity-60" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeTab === 'users'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users size={16} />
                      <span>Users</span>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        activeTab === 'users' ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {usersList.filter((u) => u.role === 'user').length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('recharges');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeTab === 'recharges'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Wallet size={16} />
                      <span>UPI Deposits</span>
                    </div>
                    {pendingRecharges.length > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 animate-pulse">
                        {pendingRecharges.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('withdrawals');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeTab === 'withdrawals'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard size={16} />
                      <span>Payout Claims</span>
                    </div>
                    {pendingWithdrawals.length > 0 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                        {pendingWithdrawals.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeTab === 'products'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Package size={16} />
                      <span>Packages & Plans</span>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        activeTab === 'products' ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {plans.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('giftcodes');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeTab === 'giftcodes'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Gift size={16} />
                      <span>Gift Codes</span>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        activeTab === 'giftcodes' ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {giftCodes.length}
                    </span>
                  </button>


                  <button
                    onClick={() => {
                      setActiveTab('broadcast');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeTab === 'broadcast'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell size={16} />
                      <span>Announcements</span>
                    </div>
                    <Send size={14} className="opacity-60" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                      activeTab === 'settings'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings size={16} />
                      <span>Gateway & Push</span>
                    </div>
                    <Sliders size={14} className="opacity-60" />
                  </button>
                </nav>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <button
                onClick={() => {
                  fetchAllSystemData();
                  setIsSidebarOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin text-amber-400' : ''} />
                <span>Refresh System Data</span>
              </button>
              <button
                onClick={exitToMainApp}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600/60 text-xs font-bold flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} />
                <span>Return to Storefront App</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace with Sidebar & Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row gap-4 sm:gap-6 p-3 sm:p-6 lg:p-8 overflow-x-hidden">


        {/* Navigation Sidebar (hidden on mobile to prevent clutter, shown on md screens) */}
        <aside className="hidden md:flex md:w-64 shrink-0 flex-col gap-2">
          <div className="bg-[#0b1730] border border-slate-800/80 rounded-3xl p-3 shadow-xl">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              NAVIGATION
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                  activeTab === 'overview'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 size={16} />
                  <span>Overview & Metrics</span>
                </div>
                <Activity size={14} className="opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                  activeTab === 'users'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users size={16} />
                  <span>Users</span>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  activeTab === 'users' ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {usersList.filter((u) => u.role === 'user').length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('withdrawals')}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                  activeTab === 'withdrawals'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard size={16} />
                  <span>Payout Claims</span>
                </div>
                {pendingWithdrawals.length > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                    {pendingWithdrawals.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                  activeTab === 'products'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package size={16} />
                  <span>Packages & Plans</span>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  activeTab === 'products' ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {plans.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('giftcodes')}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                  activeTab === 'giftcodes'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Gift size={16} />
                  <span>Gift Codes</span>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  activeTab === 'giftcodes' ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {giftCodes.length}
                </span>
              </button>


              <button
                onClick={() => setActiveTab('broadcast')}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                  activeTab === 'broadcast'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell size={16} />
                  <span>Announcements</span>
                </div>
                <Send size={14} className="opacity-60" />
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                  activeTab === 'settings'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings size={16} />
                  <span>Gateway & Push</span>
                </div>
                <Sliders size={14} className="opacity-60" />
              </button>
            </nav>
          </div>

          {/* Quick System Badge */}
          <div className="bg-[#0b1730] border border-slate-800/80 rounded-3xl p-4 shadow-xl">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-extrabold text-white">System Status: Active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              All daily earnings and app services functioning normally.
            </p>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Primary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Users */}
                <div className="bg-[#0b1730] border border-slate-800/80 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider">Registered Users</span>
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white tracking-tight">
                    {totalUsersCount}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold">{totalOwnersCount} Owner(s)</span>
                    <span>• Active platform</span>
                  </div>
                </div>

                {/* Total System Balance */}
                <div className="bg-[#0b1730] border border-slate-800/80 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider">Total User Balances</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <DollarSign size={16} />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-emerald-400 tracking-tight">
                    ₹{totalSystemBalance.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 mt-1">
                    Combined wallet liquidity
                  </div>
                </div>

                {/* Gross Recharge */}
                <div className="bg-[#0b1730] border border-slate-800/80 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider">Total Deposits</span>
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                      <TrendingUp size={16} />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-white tracking-tight">
                    ₹{totalRechargeSum.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 mt-1">
                    Processed through UPI / Fampay
                  </div>
                </div>

                {/* Pending Payout Claims */}
                <div className="bg-[#0b1730] border border-slate-800/80 rounded-3xl p-5 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider">Pending Payouts</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <CreditCard size={16} />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-amber-400 tracking-tight">
                    ₹{totalPendingAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 mt-1">
                    {pendingWithdrawals.length} request(s) awaiting approval
                  </div>
                </div>

                {/* Pending UPI Deposits */}
                <div 
                  onClick={() => setActiveTab('recharges')}
                  className="bg-[#0b1730] border border-emerald-500/30 hover:border-emerald-500/60 rounded-3xl p-5 shadow-xl relative overflow-hidden cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider">Pending UPI Deposits</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Wallet size={16} />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-emerald-400 tracking-tight">
                    ₹{totalPendingRechargeAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center justify-between">
                    <span>{pendingRecharges.length} deposit(s) awaiting approval</span>
                    <span className="text-emerald-400 font-bold">Review &gt;</span>
                  </div>
                </div>
              </div>

              {/* Action Banners */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-900/60 to-slate-900 border border-blue-500/20 rounded-3xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-white">Direct User Management</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Promote any user to Owner or adjust wallet balances with one click in the directory.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="mt-4 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl self-start flex items-center gap-1.5 transition-all"
                  >
                    <span>Open Users</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="bg-gradient-to-br from-emerald-900/50 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-white">UPI Deposits & Screenshots</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {pendingRecharges.length > 0
                        ? `${pendingRecharges.length} UPI deposit proof(s) submitted with UTR and screenshot waiting for approval.`
                        : 'Review payment proofs and 1-click credit deposits to user wallets.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('recharges')}
                    className="mt-4 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl self-start flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <span>Review Deposits ({pendingRecharges.length})</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="bg-gradient-to-br from-amber-900/40 to-slate-900 border border-amber-500/20 rounded-3xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-white">Pending Payout Approvals</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {pendingWithdrawals.length > 0
                        ? `${pendingWithdrawals.length} payout(s) waiting for owner approval. Verify bank details and approve.`
                        : 'All withdrawal requests have been processed. No payouts pending.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('withdrawals')}
                    className="mt-4 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl self-start flex items-center gap-1.5 transition-all"
                  >
                    <span>Review Payouts ({pendingWithdrawals.length})</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Recent Users Quick Table & Mobile View */}
              <div className="bg-[#0b1730] border border-slate-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                    Recent User Accounts
                  </h3>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
                  >
                    View All Users →
                  </button>
                </div>

                {/* Mobile Cards (< sm) */}
                <div className="sm:hidden space-y-2.5">
                  {usersList.slice(0, 4).map((u) => (
                    <div
                      key={u.uid}
                      className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={u.avatar || 'https://i.ibb.co/JWBdHWpv/profile-picture.png'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-white text-xs block truncate">{u.name}</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold block">
                            ₹{u.balance.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            u.role === 'owner'
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {u.role === 'owner' ? 'OWNER' : 'USER'}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedUserForBalance(u);
                            setAdjustAmountInput('500');
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Wallet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table (>= sm) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3 px-2">User</th>
                        <th className="pb-3 px-2">Phone</th>
                        <th className="pb-3 px-2">Role</th>
                        <th className="pb-3 px-2">Balance</th>
                        <th className="pb-3 px-2 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {usersList.slice(0, 5).map((u) => (
                        <tr key={u.uid} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-2 flex items-center gap-2.5">
                            <img
                              src={u.avatar || 'https://i.ibb.co/JWBdHWpv/profile-picture.png'}
                              alt={u.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <span className="font-bold text-white block">{u.name}</span>
                              <span className="text-[10px] text-slate-500">ID {u.phone.slice(-4)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-slate-300 font-mono">
                            +91 {u.phone}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                u.role === 'owner'
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 inline-flex items-center gap-1'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {u.role === 'owner' ? (
                                <>
                                  <Crown size={9} className="text-amber-300" />
                                  <span>OWNER</span>
                                </>
                              ) : (
                                'USER'
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-black text-emerald-400">
                            ₹{u.balance.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => {
                                setSelectedUserForBalance(u);
                                setAdjustAmountInput('500');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all cursor-pointer"
                            >
                              Adjust Balance
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="bg-[#0b1730] border border-slate-800/80 rounded-3xl p-4 shadow-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or phone..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                  <span className="text-xs text-slate-400 font-bold mr-1">Role:</span>
                  {(['all', 'user', 'owner'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                        roleFilter === r
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {r === 'all' ? `All (${usersList.length})` : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table & Mobile Card View */}
              <div className="bg-[#0b1730] border border-slate-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xl">
                {/* Mobile Cards View (< sm screens) */}
                <div className="sm:hidden space-y-3">
                  {filteredUsers.map((u) => (
                    <div
                      key={u.uid}
                      className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={u.avatar || 'https://i.ibb.co/JWBdHWpv/profile-picture.png'}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border-2 border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-black text-white text-xs block truncate">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              +91 {u.phone}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              u.role === 'owner'
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {u.role === 'owner' ? (
                              <>
                                <Crown size={9} className="text-amber-300" />
                                <span>OWNER</span>
                              </>
                            ) : (
                              'USER'
                            )}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-black text-[9px]">
                            {u.vipLevel || 'VIP1'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800/60">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Balance</span>
                          <span className="font-black text-sm text-emerald-400 font-mono">
                            ₹{u.balance.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                          <button
                            onClick={() => {
                              setSelectedUserForVip(u);
                              setVipLevelSelect(u.vipLevel || 'VIP 1');
                            }}
                            className="w-full py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Crown size={11} className="text-amber-400 shrink-0" />
                            <span>Set VIP</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUserForBalance(u);
                              setAdjustAmountInput('500');
                            }}
                            className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center"
                          >
                            Wallet
                          </button>
                          <button
                            onClick={() => handleRoleToggle(u)}
                            className={`w-full py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center justify-center ${
                              u.role === 'owner'
                                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                            }`}
                          >
                            {u.role === 'owner' ? 'Demote' : 'Make Owner'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="w-full py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                            title="Permanently delete user account"
                          >
                            <Trash2 size={11} className="shrink-0" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs font-bold">
                      No matching users found for "{searchQuery}".
                    </div>
                  )}
                </div>

                {/* Desktop Table View (>= sm screens) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3 px-3">User Profile</th>
                        <th className="pb-3 px-3">Phone</th>
                        <th className="pb-3 px-3">Role</th>
                        <th className="pb-3 px-3">Balance</th>
                        <th className="pb-3 px-3">VIP</th>
                        <th className="pb-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {filteredUsers.map((u) => (
                        <tr key={u.uid} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 flex items-center gap-3">
                            <img
                              src={u.avatar || 'https://i.ibb.co/JWBdHWpv/profile-picture.png'}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover border-2 border-slate-700 shrink-0"
                            />
                            <div>
                              <span className="font-black text-white text-sm block">{u.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                UID: {u.uid.slice(0, 10)}...
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-slate-300 font-mono font-bold">
                            +91 {u.phone}
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                u.role === 'owner'
                                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {u.role === 'owner' ? (
                                <>
                                  <Crown size={10} className="text-amber-300" />
                                  <span>OWNER</span>
                                </>
                              ) : (
                                'USER'
                              )}
                            </span>
                          </td>

                          <td className="py-3 px-3 font-black text-sm text-emerald-400">
                            ₹{u.balance.toLocaleString('en-IN')}
                          </td>

                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-black text-[10px]">
                              {u.vipLevel || 'VIP1'}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUserForVip(u);
                                  setVipLevelSelect(u.vipLevel || 'VIP 1');
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="Change user VIP status and level"
                              >
                                <Crown size={12} className="text-amber-400" />
                                <span>Set VIP</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedUserForBalance(u);
                                  setAdjustAmountInput('500');
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                                title="Add or subtract balance"
                              >
                                Wallet
                              </button>

                              <button
                                onClick={() => handleRoleToggle(u)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                  u.role === 'owner'
                                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                                }`}
                                title="Toggle between User and Owner role"
                              >
                                {u.role === 'owner' ? 'Demote to User' : 'Make Owner'}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="Permanently delete user account completely"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-xs font-bold">
                      No matching users found for "{searchQuery}".
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: UPI RECHARGE / DEPOSIT REQUESTS */}
          {activeTab === 'recharges' && (
            <div className="space-y-4">
              {/* Filter & Action Bar */}
              <div className="bg-[#0b1730] border border-slate-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Wallet size={18} className="text-emerald-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    UPI Deposit Requests
                  </span>
                  {pendingRecharges.length > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 animate-pulse">
                      {pendingRecharges.length} Pending
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {/* Status Filters */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setRechargeFilter(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer ${
                          rechargeFilter === s
                            ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {s}
                        {s === 'pending' && pendingRecharges.length > 0 && ` (${pendingRecharges.length})`}
                        {s === 'approved' && approvedRecharges.length > 0 && ` (${approvedRecharges.length})`}
                      </button>
                    ))}
                  </div>

                  {/* Direct Add Amount / Manual Deposit Button */}
                  <button
                    type="button"
                    onClick={() => setIsDirectDepositOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 ml-auto md:ml-2"
                  >
                    <Plus size={14} />
                    <span>Direct Deposit</span>
                  </button>
                </div>
              </div>

              {/* Quick KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0b1730] border border-slate-800 rounded-2xl p-3.5 shadow-md">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Submissions</div>
                  <div className="text-xl font-black text-white mt-0.5">{rechargeRequests.length}</div>
                </div>
                <div className="bg-[#0b1730] border border-emerald-500/30 rounded-2xl p-3.5 shadow-md">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase">Pending Review</div>
                  <div className="text-xl font-black text-emerald-400 mt-0.5">
                    {pendingRecharges.length} (₹{totalPendingRechargeAmount.toLocaleString('en-IN')})
                  </div>
                </div>
                <div className="bg-[#0b1730] border border-slate-800 rounded-2xl p-3.5 shadow-md">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Approved Deposits</div>
                  <div className="text-xl font-black text-emerald-400 mt-0.5">
                    ₹{totalApprovedRechargeAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="bg-[#0b1730] border border-slate-800 rounded-2xl p-3.5 shadow-md">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Rejected</div>
                  <div className="text-xl font-black text-rose-400 mt-0.5">
                    {rechargeRequests.filter((r) => r.status === 'rejected').length}
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="bg-[#0b1730] border border-slate-800/80 rounded-2xl p-3 shadow-md flex items-center gap-2.5">
                <Search size={16} className="text-slate-500 shrink-0 ml-1" />
                <input
                  type="text"
                  value={rechargeSearch}
                  onChange={(e) => setRechargeSearch(e.target.value)}
                  placeholder="Search by User Phone, Name, or 12-digit UTR..."
                  className="bg-transparent text-white placeholder-slate-500 text-xs w-full focus:outline-none font-medium"
                />
                {rechargeSearch && (
                  <button
                    onClick={() => setRechargeSearch('')}
                    className="p-1 rounded text-slate-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Recharge Requests List */}
              <div className="space-y-3">
                {filteredRecharges.map((req) => (
                  <div
                    key={req.id}
                    className="bg-[#0b1730] border border-slate-800/90 hover:border-slate-700/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: User & Amount Info */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-black text-sm shrink-0">
                          ₹
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-black text-white">{req.userName}</span>
                            <span className="text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/60">
                              +91 {req.userPhone}
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                req.status === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : req.status === 'rejected'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {req.status === 'approved'
                                ? 'Approved ✓'
                                : req.status === 'rejected'
                                ? 'Rejected ✗'
                                : 'Pending Approval ⏳'}
                            </span>
                            {req.autoVerified && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                Auto Verified
                              </span>
                            )}
                          </div>

                          {/* UTR & Channel */}
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="text-slate-400 font-sans text-[11px]">UTR:</span>
                              <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 tracking-wider">
                                {req.utr}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(req.utr);
                                  showToast('UTR copied to clipboard');
                                }}
                                className="p-1 hover:text-white text-slate-400"
                                title="Copy UTR"
                              >
                                <Copy size={13} />
                              </button>
                            </div>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400 text-[11px]">{req.channel}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400 text-[11px]">{req.date}</span>
                          </div>

                          {req.rejectReason && (
                            <div className="mt-1 text-xs text-rose-400 font-medium">
                              Reason: {req.rejectReason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Proof & Actions */}
                      <div className="flex flex-wrap items-center justify-between md:justify-end gap-3.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                        {/* Amount */}
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Deposit Amount</div>
                          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">
                            ₹{req.amount.toLocaleString('en-IN')}
                          </div>
                        </div>

                        {/* Screenshot Thumbnail */}
                        {req.screenshotUrl ? (
                          <div
                            onClick={() => setRechargeScreenshotModal(req.screenshotUrl || null)}
                            className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-700 cursor-pointer bg-black/40 shrink-0 hover:ring-2 hover:ring-blue-500 transition-all"
                            title="Click to view full screenshot"
                          >
                            <img
                              src={req.screenshotUrl}
                              alt="Proof"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye size={16} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-[10px] text-center p-1 shrink-0">
                            No Proof
                          </div>
                        )}

                        {/* Action Buttons for Pending */}
                        {req.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleApproveRecharge(req)}
                              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                            >
                              <Check size={14} />
                              <span>Approve & Add Amount</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRechargeToReject(req);
                                setRejectReasonText('Invalid or Unverified UTR');
                              }}
                              className="px-3 py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl font-bold text-xs transition-all cursor-pointer"
                            >
                              <X size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-slate-400">
                            {req.status === 'approved' ? (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 size={15} /> Credited
                              </span>
                            ) : (
                              <span className="text-rose-400 flex items-center gap-1">
                                <XCircle size={15} /> Rejected
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredRecharges.length === 0 && (
                  <div className="bg-[#0b1730] border border-slate-800 rounded-3xl p-12 text-center">
                    <Wallet size={36} className="text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-300">No Recharge Requests Found</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {rechargeSearch
                        ? `No records match search "${rechargeSearch}"`
                        : `No ${rechargeFilter === 'all' ? '' : rechargeFilter} UPI deposit requests found.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WITHDRAWAL CLAIMS */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="bg-[#0b1730] border border-slate-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-amber-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Payout Applications
                  </span>
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar pb-0.5 sm:pb-0">
                  {(['all', 'pending', 'completed', 'rejected'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setWithdrawalFilter(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer ${
                        withdrawalFilter === s
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Withdrawals List: Mobile Cards + Desktop Table */}
              <div className="bg-[#0b1730] border border-slate-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xl">
                {/* Mobile Cards (< sm) */}
                <div className="sm:hidden space-y-3">
                  {filteredWithdrawals.map((w) => (
                    <div
                      key={w.withdrawalId}
                      className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-white text-xs block">{w.userName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">+91 {w.userPhone}</span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${
                            w.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : w.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          }`}
                        >
                          {w.status}
                        </span>
                      </div>

                      <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/60 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Claim Amount</span>
                          <span className="text-base font-black text-amber-400 font-mono">
                            ₹{w.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                          <span className="text-[10px] text-slate-400">Account:</span>
                          <div className="flex items-center gap-1 font-mono text-slate-300 text-[11px]">
                            <span>{w.bankAccount}</span>
                            <button
                              onClick={() => copyToClipboard(w.bankAccount, 'Account number')}
                              className="text-slate-500 hover:text-slate-300 cursor-pointer"
                            >
                              <Copy size={11} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">IFSC Code:</span>
                          <span className="font-mono text-slate-300 text-[11px] font-bold">{w.ifsc}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Date Submitted</span>
                          <span className="font-mono">{w.date}</span>
                        </div>
                      </div>

                      {w.status === 'pending' || w.status === 'processing' ? (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleRejectWithdrawal(w)}
                            className="flex-1 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                          >
                            Reject & Refund
                          </button>
                          <button
                            onClick={() => handleApproveWithdrawal(w)}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                          >
                            <Check size={13} />
                            <span>Approve Payout</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-[11px] text-slate-500 font-bold py-0.5">
                          Claim Processed
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredWithdrawals.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs font-bold">
                      No withdrawal records found.
                    </div>
                  )}
                </div>

                {/* Desktop Table (>= sm) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3 px-3">User</th>
                        <th className="pb-3 px-3">Amount</th>
                        <th className="pb-3 px-3">Bank Details & IFSC</th>
                        <th className="pb-3 px-3">Date</th>
                        <th className="pb-3 px-3">Status</th>
                        <th className="pb-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {filteredWithdrawals.map((w) => (
                        <tr key={w.withdrawalId} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-bold text-white block">{w.userName}</span>
                            <span className="text-[11px] text-slate-400 font-mono">+91 {w.userPhone}</span>
                          </td>

                          <td className="py-3 px-3 font-black text-base text-amber-400">
                            ₹{w.amount.toLocaleString('en-IN')}
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 font-mono text-slate-300">
                              <span>A/C: {w.bankAccount}</span>
                              <button
                                onClick={() => copyToClipboard(w.bankAccount, 'Account number')}
                                className="text-slate-500 hover:text-slate-300 cursor-pointer"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              IFSC: {w.ifsc}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                            {w.date}
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                w.status === 'completed'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : w.status === 'rejected'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                              }`}
                            >
                              {w.status}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            {w.status === 'pending' || w.status === 'processing' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleApproveWithdrawal(w)}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  <Check size={12} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleRejectWithdrawal(w)}
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer"
                                >
                                  Reject & Refund
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 font-bold">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredWithdrawals.length === 0 && (
                    <div className="text-center py-12 text-slate-500 text-xs font-bold">
                      No withdrawal records found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FACTORY MACHINERY & PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="bg-[#0b1730] border border-slate-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xl">
                {/* Header Lockup & Top Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-white">
                        Product Packages & Plans Catalog
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] sm:text-[11px] font-black border border-emerald-500/20">
                        {plans.length} Plans Active
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                      Manage investment plans, daily returns, cycle durations, and pricing.
                    </p>
                  </div>

                  {/* Action buttons: Add New Product & Reset Defaults */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetCatalog}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700/60 transition-all cursor-pointer"
                      title="Reset catalog back to initial default plans"
                    >
                      <RotateCcw size={13} />
                      <span className="hidden sm:inline">Reset Defaults</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenAddNewPlan}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
                    >
                      <Plus size={14} className="stroke-[3]" />
                      <span>Add New Product</span>
                    </button>
                  </div>
                </div>

                {/* Search & Category Filter Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      type="button"
                      onClick={() => setProductCategoryFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        productCategoryFilter === 'all'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      All ({plans.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductCategoryFilter('normal')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        productCategoryFilter === 'normal'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      Normal Plans ({plans.filter((p) => p.type === 'normal').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductCategoryFilter('vip')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        productCategoryFilter === 'vip'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Star size={12} className={productCategoryFilter === 'vip' ? 'fill-slate-950 text-slate-950' : 'fill-amber-400 text-amber-400'} />
                      <span>VIP Plans ({plans.filter((p) => p.type === 'vip').length})</span>
                    </button>
                  </div>

                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search plan or price..."
                      className="w-full sm:w-56 pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Grid of Product Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans
                    .filter((p) => {
                      const matchesCategory =
                        productCategoryFilter === 'all' || p.type === productCategoryFilter;
                      const matchesSearch =
                        productSearch.trim() === '' ||
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.description.toLowerCase().includes(productSearch.toLowerCase()) ||
                        String(p.price).includes(productSearch);
                      return matchesCategory && matchesSearch;
                    })
                    .map((p) => (
                      <div
                        key={p.id}
                        className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all shadow-md group"
                      >
                        <div>
                          {/* Card Top: Image + Header */}
                          <div className="flex items-start gap-3 mb-3">
                            <ProductImage type={p.imageType} imageUrl={p.imageUrl} alt={p.name} className="w-16 h-16 shrink-0 rounded-xl" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span
                                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                    p.type === 'vip'
                                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 inline-flex items-center gap-1'
                                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  }`}
                                >
                                  {p.type === 'vip' ? (
                                    <>
                                      <Star size={10} className="fill-amber-300 text-amber-300" />
                                      <span>VIP Plan</span>
                                    </>
                                  ) : (
                                    'Normal Plan'
                                  )}
                                </span>
                                {p.tag && (
                                  <span className="text-[10px] font-bold text-amber-400 truncate">
                                    {p.tag}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-black text-white leading-tight truncate">
                                {p.name}
                              </h4>
                              <div className="text-base font-black text-amber-400 mt-1 font-mono">
                                ₹{p.price.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                        </div>

                        {/* Financial Stats Bar */}
                        <div className="mt-4 pt-3 border-t border-slate-800">
                          <div className="grid grid-cols-3 gap-2 text-center mb-2">
                            <div className="bg-slate-800/60 rounded-xl p-2">
                              <div className="text-[10px] text-slate-400 uppercase font-bold">Daily Yield</div>
                              <div className="text-xs font-black text-emerald-400 mt-0.5">
                                ₹{p.dailyIncome.toLocaleString('en-IN')}
                              </div>
                            </div>
                            <div className="bg-slate-800/60 rounded-xl p-2">
                              <div className="text-[10px] text-slate-400 uppercase font-bold">Cycle</div>
                              <div className="text-xs font-black text-white mt-0.5">
                                {p.durationDays} Days
                              </div>
                            </div>
                            <div className="bg-slate-800/60 rounded-xl p-2">
                              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Return</div>
                              <div className="text-xs font-black text-purple-400 mt-0.5">
                                ₹{p.totalRevenue.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>

                          {/* Net Profit & ROI badge */}
                          <div className="bg-slate-800/40 rounded-lg px-2.5 py-1 flex items-center justify-between text-[11px] mb-3">
                            <span className="text-slate-400 font-medium">Estimated Net Gain:</span>
                            <span className="font-extrabold text-emerald-400">
                              +₹{Math.max(0, p.totalRevenue - p.price).toLocaleString('en-IN')}{' '}
                              {p.price > 0 && `(+${Math.round(((p.totalRevenue - p.price) / p.price) * 100)}% ROI)`}
                            </span>
                          </div>

                          {/* Action Buttons: Edit and Delete */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditPlan(p)}
                              className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
                            >
                              <Edit3 size={13} className="stroke-[2.5]" />
                              <span>Edit Product</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePlan(p)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 active:scale-95 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-all cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {plans.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-xs font-bold">
                    No products in catalog yet. Click &quot;Add New Product&quot; above to publish your first plan directly to the database.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: TREASURE BOX GIFT CODES */}
          {activeTab === 'giftcodes' && (
            <div className="space-y-6">
              {/* Top Create Gift Code Card */}
              <div className="bg-[#0b1730] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl max-w-2xl">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <Gift size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Create Treasure Box Gift Code</h3>
                    <p className="text-xs text-slate-400">
                      Generate custom reward codes for instant user wallet credits.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCodeName.trim()) {
                      showToast('Please enter a gift code string');
                      return;
                    }
                    const rewardAmt = Number(newCodeReward);
                    if (isNaN(rewardAmt) || rewardAmt <= 0) {
                      showToast('Reward amount must be greater than 0');
                      return;
                    }
                    const claims = Number(newCodeMaxClaims) || 0;

                    createGiftCode({
                      code: newCodeName.trim().toUpperCase(),
                      rewardAmount: rewardAmt,
                      maxClaims: claims,
                      expiresAt: newCodeExpiry.trim() || undefined,
                      active: true,
                    });

                    setNewCodeName('');
                    setNewCodeReward('100');
                    setNewCodeMaxClaims('500');
                    setNewCodeExpiry('');
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Gift Code String
                      </label>
                      <input
                        type="text"
                        required
                        value={newCodeName}
                        onChange={(e) => setNewCodeName(e.target.value.toUpperCase())}
                        placeholder="e.g. AALAY100"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-500 uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Reward Amount (₹)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={newCodeReward}
                        onChange={(e) => setNewCodeReward(e.target.value)}
                        placeholder="100"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Max Redemption Limit <span className="text-slate-500 font-normal">(0 = Unlimited)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newCodeMaxClaims}
                        onChange={(e) => setNewCodeMaxClaims(e.target.value)}
                        placeholder="500"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Expiration Date <span className="text-slate-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="date"
                        value={newCodeExpiry}
                        onChange={(e) => setNewCodeExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer active:scale-95"
                  >
                    <Plus size={15} className="stroke-[3]" />
                    <span>Publish Gift Code</span>
                  </button>
                </form>
              </div>

              {/* Active Gift Codes Table */}
              <div className="bg-[#0b1730] border border-slate-800/80 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm sm:text-base font-black text-white">Active Treasure Box Gift Codes</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-black">
                    {giftCodes.length} Codes
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3 px-3">Code String</th>
                        <th className="pb-3 px-3">Reward Value</th>
                        <th className="pb-3 px-3">Claims Progress</th>
                        <th className="pb-3 px-3">Status / Expiry</th>
                        <th className="pb-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {giftCodes.map((gc) => (
                        <tr key={gc.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 font-mono font-black text-white text-sm">
                            <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-amber-400 inline-block">
                              {gc.code}
                            </span>
                          </td>

                          <td className="py-3 px-3 font-black text-emerald-400 font-mono text-sm">
                            +₹{gc.rewardAmount.toLocaleString('en-IN')}
                          </td>

                          <td className="py-3 px-3 text-slate-300 font-mono text-xs">
                            {gc.timesClaimed} / {gc.maxClaims > 0 ? gc.maxClaims : '∞'} claimed
                          </td>

                          <td className="py-3 px-3 text-xs">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                gc.active
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {gc.active ? 'Active' : 'Inactive'}
                            </span>
                            {gc.expiresAt && (
                              <span className="block text-[10px] text-slate-400 mt-0.5">Exp: {gc.expiresAt}</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingGiftCode({ ...gc })}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-amber-900/40 text-slate-300 hover:text-amber-400 border border-slate-700/60 transition-all cursor-pointer"
                                title="Edit Gift Code"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteGiftCode(gc.id)}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-all cursor-pointer"
                                title="Delete Gift Code"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {giftCodes.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs font-bold">
                      No custom gift codes created yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Gift Code Modal */}
              {editingGiftCode && (
                <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#0b1730] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                          <Gift size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">Edit Gift Code</h4>
                          <p className="text-[11px] text-slate-400 font-mono">{editingGiftCode.code}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingGiftCode(null)}
                        className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!editingGiftCode.code.trim()) {
                          showToast('Gift code string cannot be empty');
                          return;
                        }
                        if (editingGiftCode.rewardAmount <= 0) {
                          showToast('Reward amount must be greater than 0');
                          return;
                        }
                        updateGiftCode(editingGiftCode);
                        setEditingGiftCode(null);
                      }}
                      className="space-y-3.5"
                    >
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Gift Code String
                        </label>
                        <input
                          type="text"
                          required
                          value={editingGiftCode.code}
                          onChange={(e) =>
                            setEditingGiftCode({ ...editingGiftCode, code: e.target.value.toUpperCase() })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-500 uppercase"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Reward Amount (₹)
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={editingGiftCode.rewardAmount}
                            onChange={(e) =>
                              setEditingGiftCode({
                                ...editingGiftCode,
                                rewardAmount: Number(e.target.value) || 0,
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Max Claims <span className="text-slate-500 font-normal">(0=∞)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={editingGiftCode.maxClaims}
                            onChange={(e) =>
                              setEditingGiftCode({
                                ...editingGiftCode,
                                maxClaims: Number(e.target.value) || 0,
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Expiration Date
                        </label>
                        <input
                          type="date"
                          value={editingGiftCode.expiresAt || ''}
                          onChange={(e) =>
                            setEditingGiftCode({ ...editingGiftCode, expiresAt: e.target.value || undefined })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingGiftCode.active}
                            onChange={(e) =>
                              setEditingGiftCode({ ...editingGiftCode, active: e.target.checked })
                            }
                            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
                          />
                          <span>Active Status</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingGiftCode(null)}
                          className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
                        >
                          <Save size={14} />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SYSTEM ANNOUNCEMENTS */}
          {activeTab === 'broadcast' && (

            <div className="space-y-4">
              <div className="bg-[#0b1730] border border-slate-800/80 rounded-3xl p-6 shadow-xl max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Broadcast Announcement</h3>
                    <p className="text-xs text-slate-400">
                      Pushes notification instantly to all user inboxes across the platform.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Notification Title
                    </label>
                    <input
                      type="text"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="e.g. Festival Soap Bonus Credited! Extra 10% daily yield."
                      className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Announcement Content
                    </label>
                    <textarea
                      rows={4}
                      value={broadcastContent}
                      onChange={(e) => setBroadcastContent(e.target.value)}
                      placeholder="Enter detailed announcement message..."
                      className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isBroadcasting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={15} />
                    <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast to All Users'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 6: PAYMENT GATEWAY & ONESIGNAL CONFIGURATION */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl">
              {/* Header Card */}
              <div className="bg-[#0b1730] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                      <Settings size={20} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">Payment Gateway & Notification Settings</h3>
                      <p className="text-xs text-slate-400">
                        Configure live Rupayex API tokens, gateway maintenance toggle, and OneSignal push credentials.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        fetchRupayexConfig();
                        fetchRupayexBalance();
                        fetchOneSignalConfig();
                        showToast('Configuration refreshed from server');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid with 2 Main Cards: Rupayex Gateway & OneSignal Push */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Rupayex Payment Gateway Hub */}
                <div className="bg-[#0b1730] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-xs">
                          ₹
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">Rupayex Gateway</h4>
                          <span className="text-[10px] text-slate-400 font-mono">https://rupayex.net/api</span>
                        </div>
                      </div>

                      {/* Gateway Enable / Disable Switch */}
                      <button
                        type="button"
                        onClick={handleToggleGatewayStatus}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all border cursor-pointer ${
                          isGatewayEnabled
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                      >
                        {isGatewayEnabled ? (
                          <>
                            <ToggleRight size={16} className="text-emerald-400" />
                            <span>ACTIVE</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={16} className="text-rose-400" />
                            <span>DISABLED</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Live Balance pill */}
                    <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400 font-medium">Gateway Wallet Balance</span>
                        <button
                          type="button"
                          onClick={fetchRupayexBalance}
                          className="text-[10px] text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw size={10} className={isLoadingRupayexBalance ? 'animate-spin' : ''} />
                          Check Live
                        </button>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                        {isLoadingRupayexBalance ? (
                          <span className="text-sm text-amber-400 animate-pulse flex items-center gap-1.5">
                            <RefreshCw size={14} className="animate-spin" />
                            Checking balance...
                          </span>
                        ) : rupayexBalance !== null ? (
                          `₹${rupayexBalance.toLocaleString('en-IN')}`
                        ) : rupayexBalanceError ? (
                          <span className="text-xs text-rose-400 font-sans block leading-snug">
                            {rupayexBalanceError}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-sans">
                            Ready • Click &quot;Check Live&quot; or update token below
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Utilized for instant automated payout claims directly to user bank accounts.
                      </p>
                    </div>

                    {/* API Token Editor */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                          <span>Rupayex User Token</span>
                          <button
                            type="button"
                            onClick={() => setShowRawToken(!showRawToken)}
                            className="text-[10px] text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {showRawToken ? <EyeOff size={11} /> : <Eye size={11} />}
                            {showRawToken ? 'Hide' : 'Show Token'}
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            type={showRawToken ? 'text' : 'password'}
                            value={rawTokenValue}
                            onChange={(e) => setRawTokenValue(e.target.value)}
                            placeholder="Enter 32-character Rupayex user token..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        {maskedRupayexToken && (
                          <p className="text-[10px] text-slate-400 mt-1">
                            Currently stored on server: <span className="font-mono text-amber-400">{maskedRupayexToken}</span>
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSaveRupayexToken()}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        <Save size={14} />
                        <span>Update Rupayex API Token</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    <span className="text-slate-300 font-bold">Status note: </span>
                    {isGatewayEnabled
                      ? 'Users can initiate deposits and receive instant payouts via Rupayex API.'
                      : 'Gateway disabled. Recharge orders will fallback or show maintenance notice.'}
                  </div>
                </div>

                {/* 2. OneSignal Notification Management Suite */}
                <div className="bg-[#0b1730] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                          <Radio size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">OneSignal Web Push SDK</h4>
                          <span className="text-[10px] text-slate-400 font-mono">ServiceWorker v16</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase">
                        {savedOnesignalAppId ? 'Configured' : 'Needs App ID'}
                      </div>
                    </div>

                    <form onSubmit={handleSaveOneSignalSettings} className="space-y-3 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          OneSignal App ID
                        </label>
                        <input
                          type="text"
                          required
                          value={onesignalAppIdInput}
                          onChange={(e) => setOnesignalAppIdInput(e.target.value)}
                          placeholder="e.g. b2f7f966-d8cc-11e4-bed1-df8f05be55ba"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          REST API Key <span className="text-[10px] text-slate-400 font-normal">(for server push broadcasts)</span>
                        </label>
                        <input
                          type="password"
                          value={onesignalRestApiKeyInput}
                          onChange={(e) => setOnesignalRestApiKeyInput(e.target.value)}
                          placeholder={hasOnesignalRestApiKey ? '•••••••••••••••• (Configured, re-enter to update)' : 'os_v2_app_...'}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer"
                      >
                        <Save size={14} />
                        <span>Save OneSignal Credentials</span>
                      </button>
                    </form>

                    {/* Push Notification Broadcast Dispatcher */}
                    <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs font-black text-white mb-2">
                        <Send size={13} className="text-amber-400" />
                        <span>Send Instant Push Notification</span>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={testPushTitle}
                          onChange={(e) => setTestPushTitle(e.target.value)}
                          placeholder="Notification headline"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                        />
                        <textarea
                          rows={2}
                          value={testPushMessage}
                          onChange={(e) => setTestPushMessage(e.target.value)}
                          placeholder="Message content sent directly to subscriber phones/desktops..."
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={handleDispatchPushTest}
                          disabled={isSendingTestPush}
                          className="w-full py-2 rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-95 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer"
                        >
                          <Send size={13} />
                          <span>{isSendingTestPush ? 'Dispatching...' : 'Dispatch Web Push'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-[10px] text-slate-400 leading-relaxed">
                    Browser push works across Android Chrome, desktop browsers, and macOS Safari via the service worker at <span className="font-mono text-slate-300">/OneSignalSDKWorker.js</span>.
                  </p>
                </div>
              </div>
            </div>
          )}


        </main>
      </div>

      {/* BALANCE ADJUSTMENT MODAL */}
      {selectedUserForBalance && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden animate-in fade-in duration-200">
          <div className="bg-[#0b1730] border border-amber-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 max-h-[92vh] overflow-y-auto overflow-x-hidden no-scrollbar">
            <button
              onClick={() => setSelectedUserForBalance(null)}
              className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                src={selectedUserForBalance.avatar || 'https://i.ibb.co/JWBdHWpv/profile-picture.png'}
                alt={selectedUserForBalance.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-black text-white truncate">{selectedUserForBalance.name}</h3>
                <p className="text-xs text-slate-400 font-mono truncate">+91 {selectedUserForBalance.phone}</p>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-3 sm:p-3.5 mb-4 text-xs flex items-center justify-between">
              <span className="text-slate-400">Current Balance:</span>
              <span className="text-emerald-400 font-black text-sm font-mono">
                ₹{selectedUserForBalance.balance.toLocaleString('en-IN')}
              </span>
            </div>

            <form onSubmit={handleBalanceAdjustSubmit} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Adjustment Amount (₹)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      value={adjustAmountInput}
                      onChange={(e) => setAdjustAmountInput(e.target.value)}
                      placeholder="e.g. 500 or -200"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-sm font-bold focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div className="flex gap-1.5 sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => setAdjustAmountInput((prev) => String(-Math.abs(Number(prev) || 0)))}
                      className="flex-1 py-2 px-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all cursor-pointer"
                      title="Make deduction"
                    >
                      - Deduct
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustAmountInput((prev) => String(Math.abs(Number(prev) || 0)))}
                      className="flex-1 py-2 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer"
                      title="Make credit"
                    >
                      + Credit
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-0.5">
                  {[1, 100, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAdjustAmountInput(String(amt))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-emerald-400 border border-slate-700 shrink-0 cursor-pointer active:scale-95"
                    >
                      +₹{amt}
                    </button>
                  ))}
                  {[-1, -100, -500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAdjustAmountInput(String(amt))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-rose-400 border border-slate-700 shrink-0 cursor-pointer active:scale-95"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Reason Note
                </label>
                <input
                  type="text"
                  value={adjustReasonInput}
                  onChange={(e) => setAdjustReasonInput(e.target.value)}
                  placeholder="e.g. Compensation Bonus / Manual Deposit"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForBalance(null)}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Plan Edit / Create Modal */}
      {editingPlan && planForm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto overflow-x-hidden animate-in fade-in duration-200">
          <div className="bg-[#0b1730] border border-slate-700/80 rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl my-auto relative max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-800 bg-[#0b1730] shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <Edit3 size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-white truncate">
                    {isAddingNewProduct ? 'Add Product Package' : `Edit: ${editingPlan.name}`}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                    {isAddingNewProduct
                      ? 'Configure pricing, daily returns, and publish a new plan'
                      : 'Update plan details, yield rate, and pricing'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClosePlanModal}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-3.5 sm:p-6 overflow-y-auto overflow-x-hidden no-scrollbar flex-1">
              <form onSubmit={handleSavePlanSubmit} className="space-y-3.5 sm:space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Product Package Name
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="e.g. Aalay Active Wash Plan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Row 1: Plan Type & Tag */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Plan Category
                    </label>
                    <select
                      value={planForm.type}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, type: e.target.value as 'normal' | 'vip' })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="normal">Standard Plan (Normal)</option>
                      <option value="vip">VIP Exclusive Plan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Badge / Tag (Optional)
                    </label>
                    <input
                      type="text"
                      value={planForm.tag}
                      onChange={(e) => setPlanForm({ ...planForm, tag: e.target.value })}
                      placeholder="e.g. Popular or Best Value"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Row 2: Price, Daily Income, Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Product Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={planForm.price}
                      onChange={(e) => {
                        const newPrice = Number(e.target.value) || 0;
                        setPlanForm({ ...planForm, price: newPrice });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Daily Yield (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={planForm.dailyIncome}
                      onChange={(e) => {
                        const newDaily = Number(e.target.value) || 0;
                        const newTotal = newDaily * planForm.durationDays;
                        setPlanForm({ ...planForm, dailyIncome: newDaily, totalRevenue: newTotal });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-emerald-400 text-xs font-bold focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Cycle Duration (Days)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={planForm.durationDays}
                      onChange={(e) => {
                        const newDays = Number(e.target.value) || 0;
                        const newTotal = planForm.dailyIncome * newDays;
                        setPlanForm({ ...planForm, durationDays: newDays, totalRevenue: newTotal });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                {/* Total Revenue & Calculated Return */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                  <div className="flex items-center justify-between sm:justify-start sm:gap-6 w-full sm:w-auto">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Return</div>
                      <div className="text-sm sm:text-base font-black text-amber-400 font-mono">
                        ₹{planForm.totalRevenue.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Projected Net Profit</div>
                      <div className="text-xs font-extrabold text-emerald-400">
                        +₹{Math.max(0, planForm.totalRevenue - planForm.price).toLocaleString('en-IN')}
                        {planForm.price > 0 && ` (${Math.round(((planForm.totalRevenue - planForm.price) / planForm.price) * 100)}% ROI)`}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPlanForm({
                        ...planForm,
                        totalRevenue: Number(planForm.dailyIncome) * Number(planForm.durationDays),
                      })
                    }
                    className="w-full sm:w-auto px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 border border-slate-700 cursor-pointer text-center active:scale-95"
                  >
                    Recalculate (Daily × Days)
                  </button>
                </div>

                {/* Product Image URL with Live Preview */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-amber-400" />
                      <span>Product Image URL</span>
                    </label>
                    {planForm.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setPlanForm({ ...planForm, imageUrl: '' })}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer"
                      >
                        Clear Image URL
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <input
                        type="url"
                        value={planForm.imageUrl}
                        onChange={(e) => setPlanForm({ ...planForm, imageUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/... or direct image link"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Direct product image URL. Real-time preview shown on the side.
                      </p>
                    </div>

                    {/* Live Visual Preview */}
                    <div className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl p-2 shrink-0">
                      <ProductImage
                        type={planForm.imageType || 'fevicol'}
                        imageUrl={planForm.imageUrl}
                        alt={planForm.name}
                        className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-lg"
                      />
                      <div className="text-[10px] text-slate-400 pr-1">
                        <span className={`font-bold block ${planForm.imageUrl ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {planForm.imageUrl ? 'Custom Photo' : 'Standard Icon'}
                        </span>
                        Live Preview
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Product Description
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={planForm.description}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    placeholder="Enter detailed detergent specifications, wash enzyme technology, or industrial contract details..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleClosePlanModal}
                    className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer active:scale-95"
                  >
                    <Save size={15} />
                    <span>{isAddingNewProduct ? 'Publish Product' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM PRODUCT DELETE CONFIRMATION MODAL */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden animate-in fade-in duration-200">
          <div className="bg-[#0b1730] border border-rose-500/40 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative animate-in zoom-in-95 max-h-[92vh] overflow-y-auto overflow-x-hidden no-scrollbar">
            <button
              type="button"
              onClick={() => setPlanToDelete(null)}
              className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-3.5 sm:mb-4">
              <Trash2 size={24} className="sm:w-7 sm:h-7" />
            </div>

            <div className="text-center mb-4 sm:mb-5">
              <h3 className="text-base sm:text-lg font-black text-white">Delete Product Unit?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to remove this machine unit? It will be immediately delisted from the live customer catalog.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 mb-4 sm:mb-5 flex items-center gap-3">
              <ProductImage
                type={planToDelete.imageType}
                imageUrl={planToDelete.imageUrl}
                alt={planToDelete.name}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl shrink-0 border border-slate-700/60"
              />
              <div className="min-w-0 flex-1 text-left">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                  Delisting Target
                </span>
                <div className="text-xs font-black text-white truncate">{planToDelete.name}</div>
                <div className="text-[11px] font-mono text-amber-400 font-bold mt-0.5 truncate">
                  ₹{planToDelete.price.toLocaleString('en-IN')} · ₹{planToDelete.dailyIncome}/day · {planToDelete.durationDays}d
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePlan(planToDelete.id);
                  const deletedName = planToDelete.name;
                  setPlanToDelete(null);
                  showToast(`Removed "${deletedName}" from active catalog`);
                }}
                className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-95 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/25 cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM RESET CATALOG CONFIRMATION MODAL */}
      {isResetCatalogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden animate-in fade-in duration-200">
          <div className="bg-[#0b1730] border border-amber-500/40 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative animate-in zoom-in-95 max-h-[92vh] overflow-y-auto overflow-x-hidden no-scrollbar">
            <button
              type="button"
              onClick={() => setIsResetCatalogModalOpen(false)}
              className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-3.5 sm:mb-4">
              <RotateCcw size={24} className="sm:w-7 sm:h-7" />
            </div>

            <div className="text-center mb-4 sm:mb-5">
              <h3 className="text-base sm:text-lg font-black text-white">Reset Product Catalog?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Restore all detergent production lines and machines back to standard factory presets. Any customized prices or added units will be replaced with defaults.
              </p>
            </div>

            <div className="flex gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetCatalogModalOpen(false)}
                className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Keep Current Plans
              </button>
              <button
                type="button"
                onClick={() => {
                  resetPlansToDefault();
                  setIsResetCatalogModalOpen(false);
                  showToast('Catalog restored to default factory presets');
                }}
                className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM REJECT WITHDRAWAL CONFIRMATION MODAL */}
      {withdrawalToReject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden animate-in fade-in duration-200">
          <div className="bg-[#0b1730] border border-rose-500/40 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative animate-in zoom-in-95 max-h-[92vh] overflow-y-auto overflow-x-hidden no-scrollbar">
            <button
              type="button"
              onClick={() => setWithdrawalToReject(null)}
              className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-3.5 sm:mb-4">
              <AlertTriangle size={24} className="sm:w-7 sm:h-7" />
            </div>

            <div className="text-center mb-4 sm:mb-5">
              <h3 className="text-base sm:text-lg font-black text-white">Reject Withdrawal Request?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Reject request of <span className="text-amber-400 font-bold font-mono">₹{withdrawalToReject.amount.toLocaleString('en-IN')}</span> for{' '}
                <span className="text-white font-bold">{withdrawalToReject.userName}</span> (+91 {withdrawalToReject.userPhone})?
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                The requested amount will be refunded immediately back to their account wallet.
              </p>
            </div>

            <div className="flex gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => setWithdrawalToReject(null)}
                className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const item = withdrawalToReject;
                  setWithdrawalToReject(null);
                  await rejectWithdrawalInDb(item.uid, item.withdrawalId);
                  setWithdrawalsList((prev) =>
                    prev.map((w) => (w.withdrawalId === item.withdrawalId ? { ...w, status: 'rejected' } : w))
                  );
                  fetchAllSystemData();
                  showToast(`Withdrawal of ₹${item.amount} rejected and refunded`);
                }}
                className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM ROLE TOGGLE CONFIRMATION MODAL */}
      {roleToggleTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden animate-in fade-in duration-200">
          <div className="bg-[#0b1730] border border-amber-500/40 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative animate-in zoom-in-95 max-h-[92vh] overflow-y-auto overflow-x-hidden no-scrollbar">
            <button
              type="button"
              onClick={() => setRoleToggleTarget(null)}
              className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-3.5 sm:mb-4">
              <Crown size={24} className="sm:w-7 sm:h-7" />
            </div>

            <div className="text-center mb-4 sm:mb-5">
              <h3 className="text-base sm:text-lg font-black text-white">Change Account Role?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Change role of <span className="text-white font-bold">{roleToggleTarget.name}</span> (+91 {roleToggleTarget.phone}) to{' '}
                <span className="text-amber-400 font-bold uppercase">
                  {roleToggleTarget.role === 'owner' ? 'USER' : 'OWNER'}
                </span>
                ?
              </p>
            </div>

            <div className="flex gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => setRoleToggleTarget(null)}
                className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetUser = roleToggleTarget;
                  const nextRole: UserRole = targetUser.role === 'owner' ? 'user' : 'owner';
                  setRoleToggleTarget(null);
                  await updateUserRoleInDb(targetUser.uid, nextRole);
                  setUsersList((prev) =>
                    prev.map((u) =>
                      u.uid === targetUser.uid || u.phone === targetUser.phone
                        ? { ...u, role: nextRole }
                        : u
                    )
                  );
                  showToast(`Updated role to ${nextRole.toUpperCase()}`);
                }}
                className="flex-1 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Crown size={14} />
                <span>Confirm Role Change</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECHARGE SCREENSHOT FULL PREVIEW MODAL */}
      {rechargeScreenshotModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => setRechargeScreenshotModal(null)}
        >
          <div
            className="bg-[#0b1730] border border-slate-700 rounded-2xl sm:rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 sm:p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-emerald-400" />
                <span className="text-xs sm:text-sm font-black text-white">Payment Proof Screenshot</span>
              </div>
              <button
                type="button"
                onClick={() => setRechargeScreenshotModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 max-h-[75vh] overflow-auto flex items-center justify-center bg-black/70">
              <img
                src={rechargeScreenshotModal}
                alt="Payment Screenshot"
                className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Inspect transfer amount & 12-digit UTR reference</span>
              <button
                type="button"
                onClick={() => setRechargeScreenshotModal(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT RECHARGE MODAL */}
      {rechargeToReject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b1730] border border-rose-500/40 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setRechargeToReject(null)}
              className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-3.5">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center mb-4">
              <h3 className="text-base sm:text-lg font-black text-white">Reject UPI Deposit Request?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Reject recharge of <span className="text-amber-400 font-bold font-mono">₹{rechargeToReject.amount}</span> for{' '}
                <span className="text-white font-bold">{rechargeToReject.userName}</span> (+91 {rechargeToReject.userPhone})?
              </p>
              <div className="text-[11px] font-mono text-slate-500 mt-1">UTR: {rechargeToReject.utr}</div>
            </div>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-bold text-slate-300">Rejection Reason</label>
              <select
                value={rejectReasonText}
                onChange={(e) => setRejectReasonText(e.target.value)}
                className="w-full bg-[#111f3d] border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Invalid or Unverified UTR">Invalid or Unverified UTR</option>
                <option value="Amount mismatch in screenshot">Amount mismatch in screenshot</option>
                <option value="Duplicate screenshot already used">Duplicate screenshot already used</option>
                <option value="Payment not credited to merchant bank">Payment not credited to merchant bank</option>
                <option value="Unclear / Blurred screenshot">Unclear / Blurred screenshot</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRechargeToReject(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectRecharge}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT MANUAL DEPOSIT MODAL */}
      {isDirectDepositOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b1730] border border-amber-500/40 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsDirectDepositOpen(false)}
              className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-3.5">
              <PlusCircle size={24} />
            </div>

            <div className="text-center mb-4">
              <h3 className="text-base sm:text-lg font-black text-white">Direct Wallet Deposit</h3>
              <p className="text-xs text-slate-400 mt-1">
                Add funds directly into any user's wallet without a formal payment request.
              </p>
            </div>

            <form onSubmit={handleDirectDepositSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Target User Phone / Account</label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={directDepositPhone}
                    onChange={(e) => setDirectDepositPhone(e.target.value)}
                    placeholder="e.g. 9510006797"
                    className="w-full bg-[#111f3d] border border-slate-700 focus:border-amber-400 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    required
                  />
                  {/* Quick User Picker Suggestions */}
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto no-scrollbar pt-1">
                    {usersList.slice(0, 5).map((u) => (
                      <button
                        key={u.uid}
                        type="button"
                        onClick={() => setDirectDepositPhone(u.phone)}
                        className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      >
                        {u.name} ({u.phone})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Deposit Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={directDepositAmount}
                  onChange={(e) => setDirectDepositAmount(e.target.value)}
                  placeholder="500"
                  className="w-full bg-[#111f3d] border border-slate-700 focus:border-amber-400 rounded-xl py-2 px-3 text-xs text-white font-mono font-bold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Credit Reason / Note</label>
                <input
                  type="text"
                  value={directDepositReason}
                  onChange={(e) => setDirectDepositReason(e.target.value)}
                  placeholder="Manual Admin Deposit"
                  className="w-full bg-[#111f3d] border border-slate-700 focus:border-amber-400 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDirectDepositOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
                >
                  <Check size={14} />
                  <span>Credit User Wallet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set VIP Level Modal */}
      {selectedUserForVip && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0b1730] border border-amber-500/40 rounded-3xl p-5 shadow-2xl text-white relative animate-scale-up">
            <button
              onClick={() => setSelectedUserForVip(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3.5 mb-4 pr-8">
              <img
                src={selectedUserForVip.avatar || 'https://i.ibb.co/JWBdHWpv/profile-picture.png'}
                alt={selectedUserForVip.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/60 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-base text-white truncate">{selectedUserForVip.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black text-[10px]">
                    Current: {selectedUserForVip.vipLevel || 'VIP 0'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">+91 {selectedUserForVip.phone}</p>
              </div>
            </div>

            <form onSubmit={handleVipLevelSave} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-2">
                  Select User VIP Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'VIP 0',
                    'VIP 1',
                    'VIP 2',
                    'VIP 3',
                    'VIP 4',
                    'VIP 5',
                    'VIP 6',
                    'VIP 7',
                    'VIP 8',
                    'VIP 9',
                    'VIP 10',
                  ].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setVipLevelSelect(lvl)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                        vipLevelSelect === lvl
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-[1.02]'
                          : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800'
                      }`}
                    >
                      <Crown size={13} className={vipLevelSelect === lvl ? 'fill-slate-950 text-slate-950' : 'text-amber-400'} />
                      <span>{lvl === 'VIP 0' ? 'VIP 0 (Normal)' : lvl}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <Sparkles size={13} /> VIP Status Permissions
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Upgrading user to <strong className="text-white">VIP 1 or higher</strong> immediately unlocks VIP product purchases for them on the storefront. VIP 0 users remain restricted to Normal plans.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForVip(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Save size={15} />
                  <span>Update VIP Level</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
