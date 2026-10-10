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
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Main Card Container - Clean White Theme */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xl overflow-hidden text-slate-900 z-[10000] animate-in zoom-in-95 duration-200">
        {/* Subtle Ambient Decorative Blur Orbs */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all z-10 cursor-pointer border border-slate-200/60"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Top Header & Activation Badge */}
        <div className="text-center pt-1 mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 mb-2.5 shadow-sm">
            <CheckCircle2 size={32} className="stroke-[2.5]" />
          </div>

          <div className="flex items-center justify-center mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 font-extrabold text-[11px] uppercase tracking-wider shadow-2xs">
              Investment Activated
            </span>
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Purchase Successful
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Daily profit cycle starts now. Earn income automatically!
          </p>
        </div>

        {/* Product Details Box */}
        <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 shrink-0 rounded-xl bg-white p-1 border border-slate-200 overflow-hidden shadow-2xs">
              <ProductImage type={plan.imageType} imageUrl={plan.imageUrl} alt={plan.name} className="w-full h-full object-cover rounded-lg" />
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${plan.type === 'vip' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                  {plan.type === 'vip' ? 'VIP PRODUCT' : 'NORMAL PLAN'}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 truncate leading-snug">
                {plan.name}
              </h4>
              <div className="text-xs font-black text-emerald-700 font-mono">
                Paid: ₹{plan.price.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
            <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-extrabold uppercase mb-0.5">
                <TrendingUp size={12} className="text-emerald-600" />
                <span>Daily Profit</span>
              </div>
              <div className="text-sm font-black text-emerald-600 font-mono">
                +₹{plan.dailyIncome.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-extrabold uppercase mb-0.5">
                <Coins size={12} className="text-amber-600" />
                <span>Total Return</span>
              </div>
              <div className="text-sm font-black text-amber-600 font-mono">
                ₹{plan.totalRevenue.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-semibold">
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-slate-400" />
              Duration: <strong className="text-slate-900">{plan.durationDays} Days</strong>
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-black">
              <ShieldCheck size={13} /> Active
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <button
            onClick={() => {
              onViewRecord();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <span>View Active Products</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs transition-all cursor-pointer border border-slate-200/80"
          >
            Close & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

