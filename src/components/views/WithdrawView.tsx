import React, { useState } from 'react';
import {
  ArrowDownLeft,
  Building2,
  Clock,
  ChevronRight,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubHeader } from '../common/SubHeader';
import { getLocalBankInfo } from '../../utils/ifscHelper';

export const WithdrawView: React.FC = () => {
  const { user, bankDetails, requestWithdrawal, setSubScreen, showToast } = useApp();
  const [amount, setAmount] = useState<string>('180');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const numAmount = Number(amount) || 0;
  const serviceFeePercent = 10; // 10% processing fee
  const fee = Math.round((numAmount * serviceFeePercent) / 100);
  const netPayout = Math.max(0, numAmount - fee);

  const bankInfo = getLocalBankInfo(bankDetails.ifscCode || '');

  const quickAmounts = [180, 500, 1000, 2000, 5000, user.balance >= 180 ? Math.floor(user.balance) : 10000];

  const handleQuickAmount = (val: number) => {
    setAmount(String(val));
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankDetails.isSaved || !bankDetails.accountNumber) {
      showToast('Please bind your Bank Account details first');
      setSubScreen('bank-details');
      return;
    }

    if (numAmount < 180) {
      showToast('Minimum withdrawal amount is ₹180');
      return;
    }

    if (numAmount > user.balance) {
      showToast('Insufficient wallet balance');
      return;
    }

    setShowConfirmModal(true);
  };

  const executeConfirmedWithdrawal = () => {
    setIsSubmitting(true);
    const res = requestWithdrawal(numAmount);
    setIsSubmitting(false);
    setShowConfirmModal(false);

    if (res.success) {
      showToast(res.message);
      setTimeout(() => {
        setSubScreen('withdrawal-history');
      }, 700);
    } else {
      showToast(res.message);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-[#f0fdf4] max-w-md mx-auto">
      <SubHeader title="Withdraw Funds" />

      <div className="p-4 space-y-4">
        {/* Available Balance Header */}
        <div className="bg-gradient-to-br from-[#14532d] via-[#15803d] to-[#166534] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 mb-1 flex items-center justify-between">
            <span>WALLET BALANCE</span>
            <span className="bg-white/20 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
              Min. ₹180
            </span>
          </div>
          <div className="text-3xl font-black tracking-tight">
            ₹{user.balance.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-100/90 mt-1 flex items-center gap-1.5">
            <Clock size={12} />
            <span>Withdrawal Hours: Daily 08:00 - 18:00 (Direct NEFT/IMPS)</span>
          </p>
        </div>

        {/* Bound Bank Account Card */}
        <div className="bg-white rounded-3xl p-4 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-emerald-100/60">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={14} className="text-[#15803d]" />
              <span>Payout Destination</span>
            </span>
            <button
              type="button"
              onClick={() => setSubScreen('bank-details')}
              className="text-xs font-black text-[#15803d] hover:underline cursor-pointer"
            >
              {bankDetails.isSaved ? 'Change / Edit' : '+ Add Bank'}
            </button>
          </div>

          {bankDetails.isSaved && bankDetails.accountNumber ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-slate-50 border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm"
                  style={{ backgroundColor: bankInfo?.themeColor || '#15803d' }}
                >
                  {bankInfo?.shortName.slice(0, 3) || 'BNK'}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>{bankDetails.bankName || bankInfo?.bankName || 'Verified Bank'}</span>
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                      <Check size={10} strokeWidth={3} />
                      <span>Bound</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    A/C: ••••{bankDetails.accountNumber.slice(-4)} · {bankDetails.accountHolderName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    IFSC: {bankDetails.ifscCode}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSubScreen('bank-details')}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSubScreen('bank-details')}
              className="w-full p-4 border-2 border-dashed border-emerald-200 rounded-2xl bg-emerald-50/30 text-center hover:bg-emerald-50 transition-colors block cursor-pointer"
            >
              <div className="text-xs font-extrabold text-[#15803d]">
                + Link your Bank Account now
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Required to receive instant IMPS/NEFT withdrawals
              </div>
            </button>
          )}
        </div>

        {/* Withdrawal Form */}
        <form
          onSubmit={handleInitialSubmit}
          className="bg-white rounded-3xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-emerald-100/60 space-y-4"
        >
          {/* Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Withdrawal Amount</label>
              <button
                type="button"
                onClick={() => setAmount(String(Math.floor(user.balance)))}
                className="text-[11px] font-bold text-[#15803d] hover:underline cursor-pointer"
              >
                All (₹{Math.floor(user.balance)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-900 select-none">
                ₹
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="180"
                min="180"
                className="w-full pl-9 pr-4 py-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 text-slate-900 text-base font-black focus:outline-none focus:border-[#15803d] focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((val, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickAmount(val)}
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                  numAmount === val
                    ? 'bg-[#15803d] text-white border-[#15803d] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                ₹{val.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          {/* Payout Calculation Breakdown */}
          <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Gross Withdrawal</span>
              <span className="font-bold text-slate-800">₹{numAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <span>Processing Fee (10%)</span>
              </span>
              <span className="font-bold text-slate-700">-₹{fee.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="font-black text-slate-900">Estimated Received Amount</span>
              <span className="text-base font-black text-emerald-600 font-mono">
                ₹{netPayout.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#15803d] via-[#16a34a] to-[#22c55e] hover:from-[#166534] hover:to-[#15803d] active:scale-[0.98] text-white font-black text-xs tracking-wide shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowDownLeft size={16} />
            <span>Confirm Withdrawal</span>
          </button>
        </form>

        {/* Instructions & Guidelines */}
        <div className="bg-white rounded-3xl p-4 border border-emerald-100/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
            <ShieldCheck size={15} className="text-[#15803d]" />
            <span>Withdrawal Instructions</span>
          </div>
          <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 leading-relaxed">
            <li>Minimum single withdrawal: <strong>₹180</strong>.</li>
            <li>Withdrawal operating window: Daily from <strong>08:00 AM to 06:00 PM</strong>.</li>
            <li>Direct transfer into your linked bank account within 1 - 24 hours.</li>
            <li>You can check real-time settlement status under <em>Withdrawal History</em>.</li>
          </ul>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl space-y-4 border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center mx-auto">
              <ArrowDownLeft size={24} />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">Confirm Withdrawal?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Amount will be sent to your bound bank account.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Withdraw Amount:</span>
                <span className="font-black text-slate-900">₹{numAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee (10%):</span>
                <span className="font-bold text-slate-700">₹{fee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-700 font-bold">You will receive:</span>
                <span className="font-black text-emerald-600">₹{netPayout.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={executeConfirmedWithdrawal}
                className="py-3 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
