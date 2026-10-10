import React from 'react';
import { CheckCircle2, TrendingUp, Coins, Calendar, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { ProductPlan } from '../../types';
import { ProductImage } from '../common/ProductImage';

interface PurchaseSuccessModalProps {
  plan: ProductPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onViewRecord: () => void;
}

export const PurchaseSuccessModal: React.FC<PurchaseSuccessModalProps> = ({
  plan,
  isOpen,
  onClose,
  onViewRecord,
}) => {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      {/* Main Card Container */}
      <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl border border-emerald-500/30 p-5 shadow-2xl overflow-hidden text-white z-[10000]">
        {/* Subtle Static Accent Glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center transition-all z-10 cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Top Header Badge */}
        <div className="text-center pt-2 mb-4 space-y-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-2">
            <CheckCircle2 size={32} className="stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
            <span>Investment Activated</span>
          </div>

          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Purchase Successful
          </h3>
          <p className="text-xs text-slate-400">
            Daily profit cycle starts now. Earn income automatically!
          </p>
        </div>

        {/* Product Details Box */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 shrink-0 rounded-xl bg-slate-900 p-1 border border-slate-800 overflow-hidden">
              <ProductImage type={plan.imageType} imageUrl={plan.imageUrl} alt={plan.name} className="w-full h-full object-cover rounded-lg" />
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${plan.type === 'vip' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {plan.type === 'vip' ? 'VIP PRODUCT' : 'NORMAL PLAN'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white truncate leading-snug">
                {plan.name}
              </h4>
              <div className="text-xs font-bold text-emerald-400 font-mono">
                Paid: ₹{plan.price.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase mb-0.5">
                <TrendingUp size={12} className="text-emerald-400" />
                <span>Daily Profit</span>
              </div>
              <div className="text-sm font-extrabold text-emerald-400 font-mono">
                +₹{plan.dailyIncome.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase mb-0.5">
                <Coins size={12} className="text-amber-400" />
                <span>Total Return</span>
              </div>
              <div className="text-sm font-extrabold text-amber-400 font-mono">
                ₹{plan.totalRevenue.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-medium">
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-slate-400" />
              Duration: <strong className="text-white">{plan.durationDays} Days</strong>
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck size={13} /> Active
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2">
          <button
            onClick={() => {
              onViewRecord();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <span>View Active Products</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-all cursor-pointer"
          >
            Close & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

