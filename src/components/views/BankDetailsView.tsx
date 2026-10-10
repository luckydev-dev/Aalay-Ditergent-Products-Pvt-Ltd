import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  CreditCard,
  Hash,
  Save,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Lock,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubHeader } from '../common/SubHeader';
import { lookupIFSCDetailsLive, getLocalBankInfo, BankInfo } from '../../utils/ifscHelper';

export const BankDetailsView: React.FC = () => {
  const { bankDetails, saveBankDetails, setSubScreen, showToast } = useApp();

  const [accountHolderName, setAccountHolderName] = useState(bankDetails.accountHolderName || '');
  const [accountNumber, setAccountNumber] = useState(bankDetails.accountNumber || '');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(bankDetails.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(bankDetails.ifscCode || '');
  const [upiId, setUpiId] = useState(bankDetails.upiId || '');

  // Live IFSC lookup state
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(() => getLocalBankInfo(bankDetails.ifscCode || ''));
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Trigger IFSC live detection as user types
  useEffect(() => {
    const clean = ifscCode.trim().toUpperCase();
    if (clean.length < 4) {
      setBankInfo(null);
      return;
    }

    // Instant local name lookup from first 4 characters
    const local = getLocalBankInfo(clean);
    setBankInfo(local);

    // If full 11 chars IFSC, trigger live branch lookup
    if (clean.length === 11) {
      setIsLookingUp(true);
      lookupIFSCDetailsLive(clean).then((live) => {
        if (live) {
          setBankInfo(live);
        }
        setIsLookingUp(false);
      });
    }
  }, [ifscCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountHolderName.trim()) {
      showToast('Please enter account holder name');
      return;
    }
    if (!accountNumber.trim() || accountNumber.length < 8) {
      showToast('Please enter a valid bank account number');
      return;
    }
    if (accountNumber !== confirmAccountNumber) {
      showToast('Account numbers do not match');
      return;
    }
    const cleanIFSC = ifscCode.trim().toUpperCase();
    if (!cleanIFSC || cleanIFSC.length !== 11) {
      showToast('Please enter valid 11-digit IFSC code (e.g. SBIN0001234)');
      return;
    }

    setIsSaving(true);
    saveBankDetails({
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: cleanIFSC,
      bankName: bankInfo?.bankName || 'Verified Bank',
      branch: bankInfo?.branch,
      city: bankInfo?.city,
      upiId: upiId.trim() || undefined,
    });

    setTimeout(() => {
      setIsSaving(false);
      showToast('Bank details linked successfully!');
      setSubScreen('none');
    }, 600);
  };

  const isAccountMatch =
    accountNumber.length > 0 &&
    confirmAccountNumber.length > 0 &&
    accountNumber === confirmAccountNumber;

  return (
    <div className="min-h-screen pb-24 bg-[#f4f7fb] max-w-md mx-auto">
      <SubHeader title="Bank Details & Withdrawal" />

      <div className="p-4 space-y-4">
        {/* Dynamic Bank Passbook / Card Visualizer */}
        <div
          className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden transition-all duration-300"
          style={{
            background: bankInfo?.themeColor
              ? `linear-gradient(135deg, ${bankInfo.themeColor} 0%, #052e16 100%)`
              : 'linear-gradient(135deg, #15803d 0%, #052e16 100%)',
          }}
        >
          {/* Background watermarks */}
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <Building2 size={160} />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-44">
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-200/90 block">
                  OFFICIAL WITHDRAWAL ACCOUNT
                </span>
                <h3 className="text-base font-black tracking-tight text-white mt-0.5 flex items-center gap-1.5">
                  {bankInfo ? bankInfo.bankName : 'Connect Your Bank'}
                  {bankInfo?.isVerifiedLive && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-400/30">
                      <CheckCircle2 size={10} /> Verified
                    </span>
                  )}
                </h3>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <CreditCard size={20} className="text-white" />
              </div>
            </div>

            {/* Middle: Masked / Live Account number */}
            <div className="my-auto">
              <div className="text-xs text-emerald-100/90 font-mono tracking-widest">
                {accountNumber
                  ? accountNumber.length > 8
                    ? `${accountNumber.slice(0, 4)} •••• •••• ${accountNumber.slice(-4)}`
                    : accountNumber
                  : '•••• •••• •••• ••••'}
              </div>
              {bankInfo?.branch && (
                <div className="text-[11px] text-emerald-200/80 font-medium mt-0.5">
                  Branch: {bankInfo.branch} {bankInfo.city ? `(${bankInfo.city})` : ''}
                </div>
              )}
            </div>

            {/* Bottom Row */}
            <div className="flex items-end justify-between pt-2 border-t border-white/15">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-200/80 block">
                  ACCOUNT HOLDER
                </span>
                <span className="text-xs font-black tracking-wide text-white uppercase">
                  {accountHolderName || 'YOUR FULL NAME'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-200/80 block">
                  IFSC CODE
                </span>
                <span className="text-xs font-mono font-black text-amber-300">
                  {ifscCode || 'IFSC CODE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Bank Name Preview Pill */}
        {bankInfo && (
          <div
            className="rounded-2xl p-3 border flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200"
            style={{
              backgroundColor: bankInfo.badgeBg || '#e6f0fa',
              borderColor: `${bankInfo.themeColor}33`,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs"
                style={{ backgroundColor: bankInfo.themeColor }}
              >
                {bankInfo.shortName.slice(0, 3)}
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 leading-tight">
                  {bankInfo.bankName}
                </div>
                <div className="text-[10px] text-slate-600 font-medium">
                  {bankInfo.branch
                    ? `${bankInfo.branch}, ${bankInfo.city || ''}`
                    : `Recognized Bank (${bankInfo.bankCode})`}
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={11} /> Auto Detected
            </span>
          </div>
        )}

        {/* Bank Binding Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 space-y-4"
        >
          {/* Field 1: Account Holder Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <User size={14} className="text-[#0047B3]" />
              <span>Account Holder Name</span>
            </label>
            <input
              type="text"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              placeholder="Full name matching your bank account"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0047B3] focus:bg-white transition-all placeholder-slate-400"
            />
          </div>

          {/* Field 2: Account Number */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <CreditCard size={14} className="text-[#0047B3]" />
              <span>Account Number</span>
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter bank account number"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-[#0047B3] focus:bg-white transition-all placeholder-slate-400 font-mono tracking-wider"
            />
          </div>

          {/* Field 3: Confirm Account Number */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <CreditCard size={14} className="text-[#0047B3]" />
                <span>Confirm Account Number</span>
              </label>
              {confirmAccountNumber.length > 0 && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                    isAccountMatch ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {isAccountMatch ? (
                    <>
                      <Check size={11} strokeWidth={2.5} />
                      <span>Matches</span>
                    </>
                  ) : (
                    <>
                      <X size={11} strokeWidth={2.5} />
                      <span>Do not match</span>
                    </>
                  )}
                </span>
              )}
            </div>
            <input
              type="text"
              value={confirmAccountNumber}
              onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Re-enter bank account number"
              className={`w-full px-4 py-3 rounded-2xl bg-slate-50/80 border text-slate-900 text-xs font-semibold focus:outline-none focus:bg-white transition-all placeholder-slate-400 font-mono tracking-wider ${
                confirmAccountNumber.length > 0
                  ? isAccountMatch
                    ? 'border-emerald-400 focus:border-emerald-500'
                    : 'border-rose-400 focus:border-rose-500'
                  : 'border-slate-200 focus:border-[#0047B3]'
              }`}
            />
          </div>

          {/* Field 4: IFSC Code with live bank lookup */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Hash size={14} className="text-[#0047B3]" />
                <span>IFSC Code</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                11 Characters (e.g. SBIN0001234)
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                maxLength={11}
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="ENTER 11-DIGIT IFSC CODE"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-[#0047B3] focus:bg-white transition-all placeholder-slate-400 font-mono uppercase tracking-widest"
              />
              {isLookingUp && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <div className="w-3.5 h-3.5 border-2 border-[#0047B3]/30 border-t-[#0047B3] rounded-full animate-spin" />
                  <span>Checking...</span>
                </div>
              )}
            </div>
          </div>

          {/* Field 5: Optional UPI ID */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <QrCode size={14} className="text-[#0047B3]" />
                <span>UPI ID / VPA (Optional)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Fast settlement</span>
            </div>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value.toLowerCase())}
              placeholder="e.g. mobile@upi, name@okaxis"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-[#0047B3] focus:bg-white transition-all placeholder-slate-400"
            />
          </div>

          {/* Security Guarantee Note */}
          <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-500">
            <Lock size={12} className="text-emerald-600 shrink-0" />
            <span>256-bit encrypted. Payouts processed directly to this account.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#15803d] to-[#16a34a] hover:from-[#166534] hover:to-[#15803d] active:scale-[0.98] text-white font-black text-xs tracking-wide shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Linking Bank Account...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Bank Details</span>
              </>
            )}
          </button>
        </form>

        {/* Withdrawal rules snippet */}
        <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
            <ShieldCheck size={15} className="text-[#15803d]" />
            <span>Bank Linking Policy</span>
          </div>
          <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 leading-relaxed">
            <li>Ensure the account holder name strictly matches your official bank records.</li>
            <li>Double-check your IFSC code to avoid delayed transfers.</li>
            <li>Withdrawal requests are processed Monday through Sunday between 08:00 - 18:00.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
