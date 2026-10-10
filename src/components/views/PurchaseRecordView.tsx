import React, { useState, useEffect } from 'react';
import { ShoppingBag, IndianRupee, TrendingUp, Clock, CheckCircle, ShieldCheck, Lock, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubHeader } from '../common/SubHeader';
import { ProductImage } from '../common/ProductImage';

export const PurchaseRecordView: React.FC = () => {
  const { orders, collectOrderIncome, setSubScreen } = useApp();
  const [activeTab, setActiveTab] = useState<'normal' | 'vip'>('normal');
  const [claimingOrderId, setClaimingOrderId] = useState<string | null>(null);
  
  // Track true server time offset to be immune to client clock alterations
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Fetch real server time from the backend
  useEffect(() => {
    let isMounted = true;
    const fetchServerTime = async () => {
      try {
        const res = await fetch('/api/server-time');
        if (res.ok) {
          const data = await res.json();
          if (data && data.serverTime && isMounted) {
            setServerTimeOffset(data.serverTime - Date.now());
          }
        }
      } catch (e) {
        // Fallback to local clock if endpoint unreachable
      }
    };

    fetchServerTime();

    // Live tick every second
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredOrders = orders.filter((o) => o.type === activeTab);
  const totalInvested = orders.reduce((sum, o) => sum + o.price, 0);
  const totalEarned = orders.reduce((sum, o) => sum + o.totalCollected, 0);

  // Authoritative server timestamp calculation
  const authoritativeNow = currentTime + serverTimeOffset;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const handleCollect = async (orderId: string) => {
    setClaimingOrderId(orderId);
    try {
      await collectOrderIncome(orderId);
    } finally {
      setClaimingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-[#f4f7fb] max-w-md mx-auto">
      <SubHeader title="Purchase Record" />

      <div className="p-4 space-y-4">
        {/* 3 Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white rounded-2xl p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 text-center">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0047B3] flex items-center justify-center mx-auto mb-1.5">
              <ShoppingBag size={16} />
            </div>
            <div className="text-xl font-black text-slate-900">{orders.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
              Total Orders
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 text-center">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0047B3] flex items-center justify-center mx-auto mb-1.5">
              <IndianRupee size={16} />
            </div>
            <div className="text-xl font-black text-[#0047B3]">
              ₹{totalInvested.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
              Invested
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 text-center">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0047B3] flex items-center justify-center mx-auto mb-1.5">
              <TrendingUp size={16} />
            </div>
            <div className="text-xl font-black text-emerald-600">
              ₹{totalEarned.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
              Earned
            </div>
          </div>
        </div>

        {/* Server Time Protection Banner */}
        <div className="bg-blue-50/80 border border-blue-200/60 rounded-2xl p-2.5 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#0047B3] shrink-0" />
            <span className="font-bold text-[11px]">Server-Authoritative 24H Return System</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0047B3]">
            Tamper Proof
          </span>
        </div>

        {/* Toggle Tabs: Normal Orders vs VIP Orders */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center">
          <button
            onClick={() => setActiveTab('normal')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'normal'
                ? 'bg-[#0047B3] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Normal Orders
          </button>
          <button
            onClick={() => setActiveTab('vip')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'vip'
                ? 'bg-[#0047B3] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            VIP Orders
          </button>
        </div>

        {/* Content list or Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 my-8">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-300 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag size={32} />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 mb-1">
              No {activeTab === 'normal' ? 'Normal' : 'VIP'} Orders
            </h4>
            <p className="text-xs text-slate-400 max-w-[220px] mx-auto mb-5">
              Purchase plans to see them here and generate automatic daily returns
            </p>
            <button
              onClick={() => setSubScreen('none')}
              className="px-5 py-2.5 rounded-xl bg-[#0047B3] text-white text-xs font-bold shadow-md hover:bg-[#003d99] active:scale-95 transition-all"
            >
              Explore Plans
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              // Calculate countdown based on server timestamp
              const baseTimestamp = order.lastCollectTimestamp || order.purchaseTimestamp || authoritativeNow;
              const nextCollectTimestamp = order.serverNextCollectTimestamp || (baseTimestamp + ONE_DAY_MS);
              const msRemaining = Math.max(0, nextCollectTimestamp - authoritativeNow);
              const isEligible = msRemaining === 0 && order.daysRemaining > 0;
              const isCompleted = order.daysRemaining <= 0;

              const hours = Math.floor(msRemaining / (1000 * 60 * 60));
              const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);

              const isClaimingThis = claimingOrderId === order.orderId;

              return (
                <div
                  key={order.orderId}
                  className="bg-white rounded-3xl p-4 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {order.orderId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                        isCompleted
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'Active'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 shrink-0">
                      <ProductImage
                        type={order.imageType}
                        imageUrl={order.imageUrl}
                        alt={order.planName}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-900">{order.planName}</h4>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Invested: <b className="text-slate-800">₹{order.price}</b> · Daily:{' '}
                        <b className="text-[#0047B3]">₹{order.dailyIncome}</b>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Days Remaining: {order.daysRemaining}/{order.durationDays} · Collected:{' '}
                        <b className="text-emerald-600">₹{order.totalCollected}</b>
                      </div>
                    </div>
                  </div>

                  {/* Status / Collect Button */}
                  {isCompleted ? (
                    <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5">
                      <CheckCircle size={15} className="text-slate-400" />
                      <span>All Plan Returns Successfully Completed (₹{order.totalCollected})</span>
                    </div>
                  ) : isEligible ? (
                    <button
                      onClick={() => handleCollect(order.orderId)}
                      disabled={isClaimingThis}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-75"
                    >
                      {isClaimingThis ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          <span>Verifying with Server...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={15} />
                          <span>Collect Today's Daily Profit (₹{order.dailyIncome})</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-900 font-bold text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock size={15} className="text-amber-600 animate-pulse" />
                        <span>Next return in:</span>
                      </div>
                      <div className="font-mono font-black text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1">
                        <Lock size={11} />
                        <span>{hours}h {minutes}m {seconds}s</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
