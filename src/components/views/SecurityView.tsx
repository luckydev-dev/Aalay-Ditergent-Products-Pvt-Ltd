import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Headset,
  Send,
  AlertCircle,
  Check,
  Phone,
  Loader2,
  CheckCircle2,
  KeyRound,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubHeader } from '../common/SubHeader';

export const SecurityView: React.FC = () => {
  const { user, setSubScreen, setShowCustomerService, showToast, updateUserPassword } = useApp();

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const cleanPhone = user.phone.replace(/[^0-9]/g, '');
  const [lastUpdated, setLastUpdated] = useState<string | null>(() => {
    const ts = localStorage.getItem(`aaley_pass_updated_${cleanPhone}`);
    if (ts) {
      const date = new Date(Number(ts));
      return (
        date.toLocaleDateString('en-GB') +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    }
    return null;
  });

  const getPasswordStrength = (pass: string) => {
    if (!pass) return null;
    if (pass.length < 6)
      return { label: 'Too short (min 6)', color: 'text-rose-500', bar: 'w-1/4 bg-rose-500' };
    if (pass.length < 8)
      return { label: 'Fair', color: 'text-amber-500', bar: 'w-2/4 bg-amber-500' };
    const hasNum = /\d/.test(pass);
    const hasLetter = /[a-zA-Z]/.test(pass);
    if (hasNum && hasLetter && pass.length >= 8) {
      return { label: 'Strong', color: 'text-emerald-600', bar: 'w-full bg-emerald-500' };
    }
    return { label: 'Good', color: 'text-blue-500', bar: 'w-3/4 bg-blue-500' };
  };

  const strength = getPasswordStrength(newPass);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!currentPass.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your current password.' });
      showToast('Please enter your current password');
      return;
    }
    if (newPass.length < 6) {
      setStatusMessage({
        type: 'error',
        text: 'New password must be at least 6 characters long.',
      });
      showToast('New password must be at least 6 characters');
      return;
    }
    if (newPass !== confirmPass) {
      setStatusMessage({
        type: 'error',
        text: 'New password and confirm password do not match.',
      });
      showToast('Passwords do not match');
      return;
    }
    if (currentPass === newPass) {
      setStatusMessage({
        type: 'error',
        text: 'New password cannot be the same as your current password.',
      });
      showToast('New password cannot be same as current');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await updateUserPassword(currentPass, newPass);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
        const nowFormatted =
          new Date().toLocaleDateString('en-GB') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastUpdated(nowFormatted);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to update password. Please try again.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const maskedPhone = `${user.phone.slice(0, 3)}*****${user.phone.slice(-2)}`;

  return (
    <div className="min-h-screen pb-24 bg-[#f4f7fb] max-w-md mx-auto">
      <SubHeader title="Security & Password" />

      {/* Top Shield Hero Section */}
      <div className="bg-gradient-to-b from-[#14532d] via-[#15803d] to-[#166534] text-white pt-4 pb-16 px-4 rounded-b-3xl relative text-center overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-[#B2E500]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-2 text-white shadow-inner relative z-10">
          <Shield size={32} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-mono font-bold tracking-wider relative z-10 text-emerald-100">
          <Phone size={12} className="text-emerald-200" />
          <span>{maskedPhone}</span>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-10 space-y-4">
        {/* Owner Administration Shortcut (Only visible if owner) */}
        {user.role === 'owner' && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-4 shadow-md text-white border border-amber-300/40">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Owner Administration</span>
                  <span className="bg-white text-amber-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                    ERP
                  </span>
                </h4>
                <p className="text-xs text-amber-100 font-medium mt-0.5">
                  Platform controls, user accounts and payout approvals.
                </p>
              </div>
              <button
                onClick={() => {
                  setSubScreen('admin');
                  window.history.pushState(null, '', '/admin');
                }}
                className="px-3.5 py-2 rounded-xl bg-white text-amber-900 font-black text-xs shadow-sm hover:bg-amber-50 active:scale-95 transition-all shrink-0"
              >
                Open Admin
              </button>
            </div>
          </div>
        )}

        {/* Account Protection Card */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-black text-slate-900 leading-tight">
              Account Protection
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={12} />
              <span>Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Your login and transactions are protected by encrypted authentication protocols.
          </p>

          {/* Dual Layer Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
            <div className="bg-blue-600 w-1/2 h-full" />
            <div className="bg-emerald-500 w-1/2 h-full" />
          </div>

          {lastUpdated && (
            <div className="text-[11px] text-slate-400 font-medium mt-2 flex items-center gap-1">
              <span>Last updated:</span>
              <span className="text-slate-600 font-bold">{lastUpdated}</span>
            </div>
          )}
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`rounded-2xl p-4 text-xs font-bold flex items-start gap-3 transition-all animate-in fade-in duration-200 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                : 'bg-rose-50 text-rose-800 border border-rose-200 shadow-sm'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-extrabold text-xs">
                {statusMessage.type === 'success' ? 'Success' : 'Error'}
              </div>
              <p className="font-medium text-[11px] mt-0.5 leading-relaxed">
                {statusMessage.text}
              </p>
            </div>
          </div>
        )}

        {/* Login Password Card */}
        <form
          onSubmit={handleUpdate}
          className="bg-white rounded-3xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center shrink-0">
              <KeyRound size={16} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 leading-tight">
                Update Login Password
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Change your sign-in credentials safely anytime.
              </p>
            </div>
          </div>

          {/* Current password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Current password</label>
              <button
                type="button"
                onClick={() => setShowCustomerService(true)}
                className="text-[11px] text-[#15803d] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <HelpCircle size={11} />
                <span>Forgot password?</span>
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={15} />
              </span>
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Enter current password"
                required
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#15803d] focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">New password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={15} />
              </span>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#0047B3] focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Password strength indicator */}
            {strength && (
              <div className="pt-1 space-y-1">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.bar}`} />
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Password strength:</span>
                  <span className={`font-bold ${strength.color}`}>{strength.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Confirm password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={15} />
              </span>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
                className={`w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border text-xs font-medium focus:outline-none focus:bg-white transition-colors ${
                  confirmPass && confirmPass === newPass
                    ? 'border-emerald-400 focus:border-emerald-500'
                    : confirmPass && confirmPass !== newPass
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-slate-200 focus:border-[#15803d]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {confirmPass && (
              <div className="text-[10px] font-bold flex items-center gap-1 mt-0.5">
                {confirmPass === newPass ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Check size={12} className="stroke-[3]" />
                    <span>Passwords match</span>
                  </span>
                ) : (
                  <span className="text-rose-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>Passwords do not match</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 leading-tight">
            Minimum 6 characters. Your phone number remains your login account.
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full py-3.5 rounded-2xl bg-[#15803d] hover:bg-[#166534] active:scale-[0.98] disabled:opacity-60 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 transition-all mt-2 cursor-pointer"
          >
            {isUpdating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Check size={16} className="stroke-[2.5]" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>

        {/* Quick links list */}
        <div className="bg-white rounded-3xl p-2 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100">
          <button
            onClick={() => setSubScreen('bank-details')}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 rounded-2xl text-left border-b border-slate-100/80 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0047B3] flex items-center justify-center shrink-0">
              <Building2 size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Bank Card</div>
              <div className="text-[11px] text-slate-400">Manage your withdrawal bank details</div>
            </div>
          </button>

          <button
            onClick={() => setShowCustomerService(true)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 rounded-2xl text-left border-b border-slate-100/80 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0047B3] flex items-center justify-center shrink-0">
              <Headset size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Customer Support</div>
              <div className="text-[11px] text-slate-400">Chat with support for password assistance</div>
            </div>
          </button>

          <a
            href="https://t.me/aaley_official"
            target="_blank"
            rel="noreferrer"
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 rounded-2xl text-left transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0088cc] flex items-center justify-center shrink-0">
              <Send size={18} className="fill-[#0088cc]" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Official Channel</div>
              <div className="text-[11px] text-slate-400">Join for latest updates</div>
            </div>
          </a>
        </div>

        {/* Warning Note */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Never share your passwords with anyone, including support staff. We will never ask for your password.
          </p>
        </div>
      </div>
    </div>
  );
};
