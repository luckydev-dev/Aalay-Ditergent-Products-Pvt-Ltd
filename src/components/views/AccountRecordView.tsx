import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Inbox } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubHeader } from '../common/SubHeader';

export const AccountRecordView: React.FC = () => {
  const { transactions } = useApp();
  const [activeTab, setActiveTab] = useState<'income' | 'withdraw'>('income');

  const incomeTx = transactions.filter((t) => t.type === 'income');
  const withdrawTx = transactions.filter((t) => t.type === 'withdraw');

  const currentList = activeTab === 'income' ? incomeTx : withdrawTx;

  const totalIn = incomeTx.reduce((sum, t) => sum + t.amount, 0);
  const totalOut = withdrawTx.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen pb-24 bg-[#f4f7fb] max-w-md mx-auto">
      <SubHeader title="Account Record" />

      <div className="p-4 space-y-4">
        {/* Tab Toggle with Counts */}
        <div className="bg-slate-200/70 p-1 rounded-2xl flex items-center shadow-inner">
          <button
            onClick={() => setActiveTab('income')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'income'
                ? 'bg-[#0047B3] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Income</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'income'
                  ? 'bg-blue-300/30 text-white'
                  : 'bg-slate-300 text-slate-700'
              }`}
            >
              {incomeTx.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'withdraw'
                ? 'bg-[#0047B3] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Withdraw</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'withdraw'
                  ? 'bg-blue-300/30 text-white'
                  : 'bg-slate-300 text-slate-700'
              }`}
            >
              {withdrawTx.length}
            </span>
          </button>
        </div>

        {/* 2 Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-3xl p-4 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <span className="text-emerald-500">↓</span>
              <span>Total in</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{totalIn.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <span className="text-rose-500">↑</span>
              <span>Total out</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{totalOut.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Transaction List or Empty State */}
        {currentList.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 my-8">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#0047B3] flex items-center justify-center mx-auto mb-3">
              <Inbox size={32} />
            </div>
            <h4 className="text-sm font-bold text-slate-700">
              No {activeTab === 'income' ? 'income' : 'withdraw'} records yet
            </h4>
          </div>
        ) : (
          <div className="space-y-2.5">
            {currentList.map((tx) => (
              <div
                key={tx.id}
                className="bg-white rounded-2xl p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowDownLeft size={18} />
                    ) : (
                      <ArrowUpRight size={18} />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 leading-tight">
                      {tx.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {tx.date}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-black ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
