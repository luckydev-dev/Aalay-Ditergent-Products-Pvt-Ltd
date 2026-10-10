import React, { useState } from 'react';
import { TrendingUp, IndianRupee, RotateCcw, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubHeader } from '../common/SubHeader';

export const WithdrawalHistoryView: React.FC = () => {
  const { withdrawals } = useApp();
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Processing' | 'Success' | 'Rejected'>('All');

  const filtered = withdrawals.filter((w) => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return w.status === 'pending';
    if (filter === 'Processing') return w.status === 'processing';
    if (filter === 'Success') return w.status === 'completed';
    if (filter === 'Rejected') return w.status === 'rejected';
    return true;
  });

  const totalAmount = withdrawals
    .filter((w) => w.status !== 'rejected')
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="min-h-screen pb-24 bg-[#f4f7fb] max-w-md mx-auto">
      <SubHeader title="Withdrawal History" />

      <div className="p-4 space-y-4">
        {/* Top 2 Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-3xl p-4 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center mb-2">
              <TrendingUp size={20} />
            </div>
            <div className="text-2xl font-black text-slate-900 leading-none">
              {withdrawals.length}
            </div>
            <div className="text-[11px] font-bold text-slate-400 mt-1">
              Total Withdrawals
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#15803d] flex items-center justify-center mb-2">
              <IndianRupee size={20} />
            </div>
            <div className="text-2xl font-black text-[#15803d] leading-none">
              ₹{totalAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] font-bold text-slate-400 mt-1">
              Total Amount
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(['All', 'Pending', 'Processing', 'Success', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-[#15803d] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Records List or Empty State */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 my-10">
            <div className="w-16 h-16 rounded-full bg-emerald-50/70 text-[#15803d]/40 flex items-center justify-center mx-auto mb-3">
              <RotateCcw size={32} />
            </div>
            <h4 className="text-sm font-bold text-slate-400">
              No withdrawal records found
            </h4>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((w) => (
              <div
                key={w.id}
                className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Ref: {w.referenceId}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      w.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-600'
                        : w.status === 'processing'
                        ? 'bg-amber-50 text-amber-600'
                        : w.status === 'pending'
                        ? 'bg-blue-50 text-[#0047B3]'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {w.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-lg font-black text-slate-900">
                      ₹{w.amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      To Bank: ****{w.bankAccount.slice(-4)} ({w.ifsc})
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-400">
                    {w.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
