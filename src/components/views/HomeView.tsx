import React, { useState } from 'react';
import { CreditCard, Download, ClipboardList, QrCode, Headset, BarChart3, Coins, ShoppingCart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HomePromoBanner } from '../common/HomePromoBanner';
import { ProductImage } from '../common/ProductImage';

export const HomeView: React.FC = () => {
  const {
    plans,
    buyPlan,
    setSubScreen,
    setShowInviteModal,
    setShowCustomerService,
    user,
  } = useApp();

  const [activePlanTab, setActivePlanTab] = useState<'normal' | 'vip'>('normal');

  const filteredPlans = plans.filter((p) => p.type === activePlanTab);

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 space-y-4 max-w-md mx-auto">
      {/* 1. Top Branded Promotional Banner */}
      <HomePromoBanner />

      {/* 2. Quick Action Icons Row */}
      <div className="bg-white rounded-2xl p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center justify-between">
        {/* Recharge */}
        <button
          onClick={() => setSubScreen('recharge')}
          className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-transform"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0047B3] flex items-center justify-center mb-1 shadow-xs">
            <CreditCard size={20} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-bold text-slate-700">Recharge</span>
        </button>

        {/* Withdraw */}
        <button
          onClick={() => setSubScreen('withdraw')}
          className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-transform"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0047B3] flex items-center justify-center mb-1 shadow-xs">
            <Download size={20} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-bold text-slate-700">Withdraw</span>
        </button>

        {/* Mission (With 'New' badge) */}
        <button
          onClick={() => setSubScreen('missions')}
          className="flex flex-col items-center justify-center flex-1 py-1 relative active:scale-95 transition-transform"
        >
          <span className="absolute -top-1.5 right-2 px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-black rounded-full shadow-xs">
            New
          </span>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0047B3] flex items-center justify-center mb-1 shadow-xs">
            <ClipboardList size={20} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-bold text-slate-700">Mission</span>
        </button>

        {/* Invite */}
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-transform"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0047B3] flex items-center justify-center mb-1 shadow-xs">
            <QrCode size={20} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-bold text-slate-700">Invite</span>
        </button>

        {/* Online Customer Service */}
        <button
          onClick={() => setShowCustomerService(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-transform"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0047B3] flex items-center justify-center mb-1 shadow-xs">
            <Headset size={20} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-bold text-slate-700">Online</span>
        </button>
      </div>

      {/* 3. Segmented Plan Tab: Normal Plan vs VIP Plan */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/60 shadow-inner">
        <button
          onClick={() => setActivePlanTab('normal')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
            activePlanTab === 'normal'
              ? 'bg-[#0047B3] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Normal Plan
        </button>
        <button
          onClick={() => setActivePlanTab('vip')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
            activePlanTab === 'vip'
              ? 'bg-[#0047B3] text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          VIP Plan
        </button>
      </div>

      {/* 4. Product Investment Cards */}
      <div className="space-y-4">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden transition-all duration-200 hover:shadow-lg"
          >
            {/* Top-right decorative ribbon */}
            {plan.tag && (
              <div
                className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs ${
                  plan.tagType === 'popular'
                    ? 'bg-gradient-to-r from-blue-600 to-[#0047B3]'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600'
                }`}
              >
                {plan.tag}
              </div>
            )}

            {/* Product Top Header */}
            <div className="mb-3 pr-16">
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-black text-[#0047B3] tracking-tight">
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
              <div className="w-28 h-28 shrink-0">
                <ProductImage type={plan.imageType} imageUrl={plan.imageUrl} alt={plan.name} className="w-full h-full" />
              </div>

              {/* Statistics Grid */}
              <div className="flex-1 space-y-2.5">
                {/* Daily Return */}
                <div className="bg-slate-50/90 rounded-2xl p-2.5 flex items-center justify-between border border-slate-100/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <BarChart3 size={15} className="text-[#0047B3]" />
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
                  <span className="text-sm font-black text-[#0047B3]">
                    ₹{plan.totalRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={() => buyPlan(plan.id)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0047B3] to-[#005cdb] hover:from-[#003d99] hover:to-[#004ea8] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-900/15 transition-all"
            >
              <ShoppingCart size={17} />
              <span>Buy Now</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
