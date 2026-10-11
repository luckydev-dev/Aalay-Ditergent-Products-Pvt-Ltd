import React from 'react';
import {
  Settings,
  Briefcase,
  Gift,
  Info,
  Building2,
  UserCheck,
  TrendingUp,
  History,
  Bell,
  Download,
  LogOut,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Crown,
  ShieldAlert,
  Copy,
  Check,
  Lock,
  KeyRound,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateWalletMetrics } from '../../utils/wallet';

export const ProfileView: React.FC = () => {
  const { user, logout, setSubScreen, setActiveTab, showToast, transactions } = useApp();
  const [copiedId, setCopiedId] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const { displayTotalRecharge, displayTotalIncome } = calculateWalletMetrics(
    user.balance,
    user.totalRecharge,
    user.totalIncome
  );

  const displayId = user.id || (user.phone ? user.phone.slice(-6) : '9516797');

  const handleCopyId = () => {
    navigator.clipboard?.writeText(displayId);
    setCopiedId(true);
    showToast(`Account ID ${displayId} copied!`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyCode = () => {
    if (user.invitationCode) {
      navigator.clipboard?.writeText(user.invitationCode);
      setCopiedCode(true);
      showToast(`Invite Code ${user.invitationCode} copied!`);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDownloadApp = () => {
    showToast('Aalay Official App downloaded! Install package ready.');
  };

  const openAdminDashboard = () => {
    setSubScreen('admin');
    window.history.pushState(null, '', '/admin');
  };

  return (
    <div className="min-h-screen pb-24 bg-[#f4f7fb] max-w-md mx-auto">
      {/* Top Green Hero Section */}
      <div className="bg-gradient-to-b from-[#14532d] via-[#15803d] to-[#166534] text-white pt-6 pb-20 px-5 relative rounded-b-3xl shadow-md">
        {/* Settings button */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black tracking-tight text-white">Profile</h1>
          <button
            onClick={() => setSubScreen('security')}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* User Info Lockup */}
        <div className="flex items-center gap-3.5">
          {/* Avatar with user profile picture */}
          <div className="w-16 h-16 rounded-full bg-white p-0.5 shadow-md border-2 border-white/80 relative overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src={user.avatar || 'https://i.ibb.co/JWBdHWpv/profile-picture.png'}
              alt={user.name || 'User Profile'}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://i.ibb.co/JWBdHWpv/profile-picture.png';
              }}
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-white leading-tight">
              {user.name}
            </h2>
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* VIP badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fbf2d9] text-[#b47a00] text-[10px] font-black shadow-xs">
                <Crown size={12} className="fill-[#b47a00]" />
                <span>{user.vipLevel}</span>
              </span>

              {/* Upgraded Premium Interactive ID Pill */}
              <button
                type="button"
                onClick={handleCopyId}
                className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 hover:bg-black/35 active:scale-95 backdrop-blur-md text-white text-[11px] font-black tracking-wide border border-white/40 shadow-sm transition-all cursor-pointer ring-1 ring-white/10"
                title="Tap to copy Account ID"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse shrink-0" />
                <span className="text-[9px] font-black bg-white/20 text-blue-100 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  ID
                </span>
                <span className="font-mono tracking-wider font-black text-white text-[11px]">
                  {displayId}
                </span>
                {copiedId ? (
                  <span className="inline-flex items-center gap-0.5 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tight animate-in zoom-in-90 duration-150">
                    <Check size={10} className="stroke-[3]" />
                    <span>Copied</span>
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                    <Copy size={10} className="text-white/80 group-hover:text-white" />
                  </span>
                )}
              </button>

              {/* Quick Invite Code Pill */}
              {user.invitationCode && (
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/25 hover:bg-amber-400/35 active:scale-95 backdrop-blur-md text-amber-100 text-[11px] font-black tracking-wide border border-amber-300/40 shadow-sm transition-all cursor-pointer"
                  title="Tap to copy Invite Code"
                >
                  <span className="text-[9px] font-black bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                    CODE
                  </span>
                  <span className="font-mono tracking-wider font-black text-amber-100 text-[11px]">
                    {user.invitationCode}
                  </span>
                  {copiedCode ? (
                    <span className="inline-flex items-center gap-0.5 bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tight animate-in zoom-in-90 duration-150">
                      <Check size={10} className="stroke-[3]" />
                      <span>Copied</span>
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-amber-300/20 group-hover:bg-amber-300/30 flex items-center justify-center transition-colors">
                      <Copy size={10} className="text-amber-200 group-hover:text-amber-100" />
                    </span>
                  )}
                </button>
              )}

              {/* Role Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  user.role === 'owner'
                    ? 'bg-amber-400 text-amber-950 border border-amber-300 shadow-xs'
                    : 'bg-white/20 text-white'
                }`}
              >
                {user.role === 'owner' ? (
                  <>
                    <Crown size={11} className="text-amber-950" />
                    <span>OWNER</span>
                  </>
                ) : (
                  <span>USER</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Main Balance Card */}
      <div className="px-4 -mt-14 relative z-10 space-y-4">
        <div className="bg-white rounded-3xl p-5 shadow-[0_6px_25px_rgba(0,0,0,0.06)] border border-slate-100">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
            <Briefcase size={12} className="text-slate-400" />
            <span>AVAILABLE BALANCE</span>
          </div>

          <div className="text-3xl font-black text-[#0047B3] tracking-tight mb-4">
            ₹{user.balance.toLocaleString('en-IN')}
          </div>

          {/* Sub Stats: TOTAL RECHARGE | TOTAL INCOME */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100/80">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                TOTAL RECHARGE
              </div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                ₹{displayTotalRecharge.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100/80">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                TOTAL INCOME
              </div>
              <div className="text-base font-extrabold text-emerald-600 mt-0.5">
                ₹{displayTotalIncome.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Recharge & Withdraw Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSubScreen('recharge')}
              className="py-3 rounded-2xl bg-[#15803d] hover:bg-[#166534] active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/15 transition-all cursor-pointer"
            >
              <ArrowUpRight size={16} />
              <span>Recharge</span>
            </button>

            <button
              onClick={() => setSubScreen('withdraw')}
              className="py-3 rounded-2xl bg-white hover:bg-slate-50 active:scale-95 border-2 border-slate-200 text-[#15803d] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowDownLeft size={16} />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* Owner Admin Dashboard Button (Only visible if owner role in profile) */}
        {user.role === 'owner' && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-4 shadow-lg text-white border border-amber-300/40 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
                  <ShieldAlert size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black tracking-wide uppercase">Owner Admin Panel</span>
                    <span className="bg-white text-amber-900 text-[9px] font-black px-1.5 py-0.2 rounded-md">LIVE</span>
                  </div>
                  <p className="text-[11px] text-amber-100 font-medium mt-0.5">
                    User directory, roles, balances & payout approvals
                  </p>
                </div>
              </div>

              <button
                onClick={openAdminDashboard}
                className="px-4 py-2.5 bg-white hover:bg-amber-50 active:scale-95 text-amber-900 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1 shrink-0"
              >
                <span>Admin</span>
                <ChevronRight size={14} className="stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* 4 Quick Icon Buttons: Orders, Treasure, About, Bank Card */}
        <div className="bg-white rounded-3xl p-3.5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-around">
          {/* Orders */}
          <button
            onClick={() => setSubScreen('purchase-record')}
            className="flex flex-col items-center justify-center p-2 flex-1 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center mb-1.5 shadow-xs">
              <Briefcase size={20} className="stroke-[2.2px]" />
            </div>
            <span className="text-xs font-bold text-slate-700">Orders</span>
          </button>

          {/* Treasure */}
          <button
            onClick={() => setActiveTab('spin')}
            className="flex flex-col items-center justify-center p-2 flex-1 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center mb-1.5 shadow-xs">
              <Gift size={20} className="stroke-[2.2px]" />
            </div>
            <span className="text-xs font-bold text-slate-700">Treasure</span>
          </button>

          {/* About */}
          <button
            onClick={() => setSubScreen('about-us')}
            className="flex flex-col items-center justify-center p-2 flex-1 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center mb-1.5 shadow-xs">
              <Info size={20} className="stroke-[2.2px]" />
            </div>
            <span className="text-xs font-bold text-slate-700">About</span>
          </button>

          {/* Bank Card */}
          <button
            onClick={() => setSubScreen('bank-details')}
            className="flex flex-col items-center justify-center p-2 flex-1 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center mb-1.5 shadow-xs">
              <Building2 size={20} className="stroke-[2.2px]" />
            </div>
            <span className="text-xs font-bold text-slate-700">Bank Card</span>
          </button>
        </div>

        {/* ACCOUNT Section List */}
        <div className="bg-white rounded-3xl p-2 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100">
          <div className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
            ACCOUNT
          </div>

          {/* Admin Dashboard List Item (Only if user has 'owner' role) */}
          {user.role === 'owner' && (
            <button
              onClick={openAdminDashboard}
              className="w-full px-4 py-3.5 flex items-center justify-between bg-amber-50/80 hover:bg-amber-100/80 active:bg-amber-200/80 transition-colors border-b border-amber-200/80 rounded-2xl mb-1 text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <div className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                    <span>Admin Dashboard</span>
                    <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase">Owner</span>
                  </div>
                  <div className="text-xs text-amber-800 font-medium">
                    Users, roles, balances & payout approvals
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-amber-700" />
            </button>
          )}

          {/* 1. Change Password */}
          <button
            onClick={() => setSubScreen('security')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-100/80 rounded-2xl cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center shrink-0">
                <Lock size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-900">
                  Change Password
                </div>
                <div className="text-xs text-slate-400">
                  Update login and account safety
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>

          {/* 2. Information */}
          <button
            onClick={() => setSubScreen('security')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-100/80 rounded-2xl cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center shrink-0">
                <UserCheck size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-900">
                  Information
                </div>
                <div className="text-xs text-slate-400">
                  Security credentials and profile
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>

          {/* 3. Balance Details */}
          <button
            onClick={() => setSubScreen('account-record')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-100/80 rounded-2xl cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center shrink-0">
                <TrendingUp size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-900">
                  Balance Details
                </div>
                <div className="text-xs text-slate-400">
                  Every credit and debit
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>

          {/* 3. Deposit Details */}
          <button
            onClick={() => setSubScreen('deposit-history')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-100/80 rounded-2xl cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center shrink-0">
                <Wallet size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-900">
                  Deposit Details
                </div>
                <div className="text-xs text-slate-400">
                  UPI transfers, UTR & approvals
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>

          {/* 4. Withdrawal Details */}
          <button
            onClick={() => setSubScreen('withdrawal-history')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-100/80 rounded-2xl cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center shrink-0">
                <History size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-900">
                  Withdrawal Details
                </div>
                <div className="text-xs text-slate-400">
                  Payout requests and status
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>

          {/* 4. Notification Center */}
          <button
            onClick={() => setSubScreen('notifications')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-100/80 rounded-2xl cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center shrink-0">
                <Bell size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-900">
                  Notification Center
                </div>
                <div className="text-xs text-slate-400">
                  Announcements and alerts
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>

          {/* 5. App Download */}
          <button
            onClick={handleDownloadApp}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-100/80 rounded-2xl cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center shrink-0">
                <Download size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-900">
                  App Download
                </div>
                <div className="text-xs text-slate-400">
                  Download our official app
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>

          {/* 6. Logout */}
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-rose-50 active:bg-rose-100 transition-colors rounded-2xl text-rose-600 cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-100/80 text-rose-600 flex items-center justify-center shrink-0">
                <LogOut size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-rose-600">
                  Logout
                </div>
                <div className="text-xs text-rose-400">
                  Sign out of this device
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-rose-400" />
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-rose-50/60 shadow-inner">
              <LogOut size={26} className="translate-x-0.5" />
            </div>

            <h3 id="logout-title" className="text-lg font-black text-slate-900 tracking-tight mb-2">
              Confirm Logout
            </h3>
            
            <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
              Are you sure you want to sign out? This will end your active session and reset local application cache on this device.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-black transition-all cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black transition-all shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
