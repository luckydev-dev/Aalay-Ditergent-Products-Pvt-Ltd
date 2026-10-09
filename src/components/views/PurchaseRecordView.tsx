import React, { useState } from 'react';
import { ShoppingBag, IndianRupee, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubHeader } from '../common/SubHeader';
import { ProductImage } from '../common/ProductImage';

export const PurchaseRecordView: React.FC = () => {
  const { orders, collectOrderIncome, setSubScreen } = useApp();
  const [activeTab, setActiveTab] = useState<'normal' | 'vip'>('normal');

  const filteredOrders = orders.filter((o) => o.type === activeTab);
  const totalInvested = orders.reduce((sum, o) => sum + o.price, 0);
  const totalEarned = orders.reduce((sum, o) => sum + o.totalCollected, 0);

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
            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-3xl p-4 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {order.orderId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-[10px]">
                    Active
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 shrink-0">
                    <ProductImage type={order.imageType} imageUrl={order.imageUrl} alt={order.planName} className="w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-slate-900">{order.planName}</h4>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Invested: <b className="text-slate-800">₹{order.price}</b> · Daily:{' '}
                      <b className="text-[#0047B3]">₹{order.dailyIncome}</b>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Days Left: {order.daysRemaining}/{order.durationDays} · Total Collected:{' '}
                      <b className="text-emerald-600">₹{order.totalCollected}</b>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => collectOrderIncome(order.orderId)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <CheckCircle size={15} />
                  <span>Collect Today's Daily Profit (₹{order.dailyIncome})</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
