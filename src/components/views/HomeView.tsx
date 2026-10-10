import React, { useState } from 'react';
import { CreditCard, Download, ClipboardList, QrCode, Headset, BarChart3, Coins, ShoppingCart, Package, Lock, Crown, ShieldAlert, Sparkles, X, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HomePromoBanner } from '../common/HomePromoBanner';
import { ProductImage } from '../common/ProductImage';
import { ProductPlan } from '../../types';
import { PurchaseSuccessModal } from '../modals/PurchaseSuccessModal';

export const HomeView: React.FC = () => {
  const {
    plans,
    buyPlan,
    setSubScreen,
    setShowInviteModal,
    setShowCustomerService,
    user,
    showToast,
  } = useApp();

  const [activePlanTab, setActivePlanTab] = useState<'normal' | 'vip'>('normal');

  // Purchase Celebration & VIP Lock Modal States
  const [celebrationPlan, setCelebrationPlan] = useState<ProductPlan | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);
  const [lockedVipPlan, setLockedVipPlan] = useState<ProductPlan | null>(null);

  // Check user VIP status (VIP 0 / Normal = non-VIP, VIP 1+ / Owner = VIP eligible)
  const userVip = String(user.vipLevel || '').trim().toUpperCase();
  const isUserVipEligible =
    user.role === 'owner' ||
    (userVip !== '' &&
      userVip !== 'VIP 0' &&
      userVip !== 'VIP0' &&
      userVip !== '0' &&
      userVip !== 'NORMAL');

  // Filter plans based on active tab
  const displayPlans = (plans || []).filter((p) => p.type === activePlanTab);

  const handlePlanPurchase = (plan: ProductPlan) => {
    // 1. VIP Gating Check
    if (plan.type === 'vip' && !isUserVipEligible) {
      setLockedVipPlan(plan);
      return;
    }

    // 2. Execute Purchase
    const result = buyPlan(plan.id);

    if (result.success && result.purchasedPlan) {
      // Trigger Celebration Particles & Modal
      setCelebrationPlan(result.purchasedPlan);
      setIsCelebrationOpen(true);
    }
  };

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 space-y-4 max-w-md mx-auto relative">
      {/* 1. Top Branded Promotional Banner */}
      <HomePromoBanner />

      {/* 2. Quick Action Icons Row */}
      <div className="bg-white rounded-2xl p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
        {/* Recharge */}
        <button
          onClick={() => setSubScreen('recharge')}
          className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-transform cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center mb-1 shadow-xs">
            <CreditCard size={20} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-bold text-slate-700">Recharge</span>
        </button>

        {/* Withdraw */}
        <button
          onClick={() => setSubScreen('withdraw')}
          className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-transform cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center mb-1 shadow-xs">
            <Download size={20} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-bold text-slate-700">Withdraw</span>
        </button>

        {/* Mission */}
        <button
          onClick={() => setSubScreen('missions')}
          className="flex flex-col items-center justify-center flex-1 py-1 relative active:scale-95 transition-transform cursor-pointer"
        >
          <span className="absolute -top-1.5 right-2 px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-black rounded-full shadow-xs">
            New
          </span>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center mb-1 shadow-xs">
            <ClipboardList size={20} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-bold text-slate-700">Mission</span>
        </button>

        {/* Invite */}
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-transform cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center mb-1 shadow-xs">
            <QrCode size={20} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-bold text-slate-700">Invite</span>
        </button>

        {/* Online Customer Service */}
        <button
          onClick={() => setShowCustomerService(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-transform cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center mb-1 shadow-xs">
            <Headset size={20} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-bold text-slate-700">Online</span>
        </button>
      </div>

      {/* 3. Segmented Plan Tab: Normal Plan vs VIP Plan */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/60 shadow-inner">
        <button
          onClick={() => setActivePlanTab('normal')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
            activePlanTab === 'normal'
              ? 'bg-[#15803d] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Normal Plan</span>
        </button>
        <button
          onClick={() => setActivePlanTab('vip')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
            activePlanTab === 'vip'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Crown size={15} className={activePlanTab === 'vip' ? 'fill-slate-950 text-slate-950' : 'text-amber-500'} />
          <span>VIP Plan</span>
          {!isUserVipEligible && (
            <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-slate-900/10 text-slate-700 uppercase">
              Locked
            </span>
          )}
        </button>
      </div>

      {/* VIP Status Banner if viewing VIP plans */}
      {activePlanTab === 'vip' && !isUserVipEligible && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3 text-slate-900 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-sm">
            <Lock size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-xs text-amber-900">VIP Exclusive Access</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase">
                {user.vipLevel || 'Normal User'}
              </span>
            </div>
            <p className="text-[11px] text-amber-900/80 leading-tight mt-0.5">
              Normal users cannot purchase VIP plans. Request VIP level upgrade from Admin!
            </p>
          </div>
        </div>
      )}

      {/* 4. Product Investment Cards */}
      <div className="space-y-4">
        {displayPlans.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center mx-auto mb-3">
              <Package size={26} />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 mb-1">
              No {activePlanTab === 'normal' ? 'Normal' : 'VIP'} Plans Available
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              New high-yield investment product plans will be released soon. Stay tuned!
            </p>
          </div>
        ) : (
          displayPlans.map((plan) => {
            const isPlanVipLocked = plan.type === 'vip' && !isUserVipEligible;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                  isPlanVipLocked ? 'border-amber-200/80 bg-amber-50/20' : 'border-slate-100'
                }`}
              >
                {/* Top-right decorative ribbon */}
                {plan.tag && (
                  <div
                    className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs ${
                      plan.type === 'vip'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950'
                        : plan.tagType === 'popular'
                        ? 'bg-gradient-to-r from-emerald-600 to-[#15803d]'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600'
                    }`}
                  >
                    {plan.tag}
                  </div>
                )}

                {/* VIP Product Ribbon Badge if applicable */}
                {plan.type === 'vip' && (
                  <div className="mb-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 font-black text-[10px] uppercase">
                    <Crown size={12} className="fill-amber-500 text-amber-600" />
                    <span>VIP EXCLUSIVE PLAN</span>
                  </div>
                )}

                {/* Product Top Header */}
                <div className="mb-3 pr-16">
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-black text-[#15803d] tracking-tight">
                      ₹{plan.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      /{plan.durationDays} Days
                    </span>
                  </div>
                </div>

                {/* Body: Product Image + Daily/Total Returns */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Product Visual Container */}
                  <div className="w-28 h-28 shrink-0 relative">
                    <ProductImage type={plan.imageType} imageUrl={plan.imageUrl} alt={plan.name} className="w-full h-full" />
                    {isPlanVipLocked && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center text-amber-400 p-1 text-center">
                        <Lock size={22} className="mb-1 text-amber-300" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-white">VIP ONLY</span>
                      </div>
                    )}
                  </div>

                  {/* Statistics Grid */}
                  <div className="flex-1 space-y-2.5">
                    {/* Daily Return */}
                    <div className="bg-slate-50/90 rounded-2xl p-2.5 flex items-center justify-between border border-slate-100/80">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <BarChart3 size={15} className="text-[#15803d]" />
                        <span>Daily</span>
                      </div>
                      <span className="text-sm font-extrabold text-slate-900">
                        ₹{plan.dailyIncome.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Total Return */}
                    <div className="bg-slate-50/90 rounded-2xl p-2.5 flex items-center justify-between border border-slate-100/80">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Coins size={15} className="text-amber-500" />
                        <span>Total</span>
                      </div>
                      <span className="text-sm font-black text-[#15803d]">
                        ₹{plan.totalRevenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buy Button or Locked VIP Button */}
                {isPlanVipLocked ? (
                  <button
                    onClick={() => handlePlanPurchase(plan)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-500 active:scale-[0.98] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Lock size={16} />
                    <span>Locked for Normal Users (Requires VIP)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handlePlanPurchase(plan)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#15803d] via-[#16a34a] to-[#22c55e] hover:from-[#166534] hover:to-[#15803d] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-900/15 transition-all cursor-pointer"
                  >
                    <ShoppingCart size={17} />
                    <span>Buy Now</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Unique Celebration Modal on Purchase */}
      <PurchaseSuccessModal
        plan={celebrationPlan}
        isOpen={isCelebrationOpen}
        onClose={() => setIsCelebrationOpen(false)}
        onViewRecord={() => setSubScreen('purchase-record')}
      />

      {/* VIP Locked Explanation Modal */}
      {lockedVipPlan && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-amber-200 text-slate-900 relative animate-scale-up">
            <button
              onClick={() => setLockedVipPlan(null)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center pt-2 mb-4 space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                <Lock size={28} />
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                VIP Restriction Active
              </span>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                VIP Level Required
              </h3>
              <p className="text-xs text-slate-500 px-2 leading-relaxed">
                Normal users cannot buy VIP products. This product ({lockedVipPlan.name}) is reserved exclusively for upgraded VIP members.
              </p>
            </div>

            <div className="bg-amber-50/80 rounded-2xl p-3 border border-amber-200 text-xs text-amber-900 space-y-1 mb-5">
              <div className="font-bold flex items-center gap-1.5">
                <Crown size={14} className="text-amber-600" />
                <span>Your Current Status: {user.vipLevel || 'Normal User'}</span>
              </div>
              <p className="text-[11px] text-amber-800">
                To upgrade to VIP 1+ status, contact our Admin support team or reach out via Customer Service.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setLockedVipPlan(null);
                  setShowCustomerService(true);
                }}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Headset size={16} />
                <span>Contact Admin to Upgrade VIP Level</span>
              </button>

              <button
                onClick={() => setLockedVipPlan(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
