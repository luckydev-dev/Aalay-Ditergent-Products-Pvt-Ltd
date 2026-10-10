import React from 'react';
import { Headset, Send, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CustomerServiceSheet: React.FC = () => {
  const { showCustomerService, setShowCustomerService, setShowLiveChat } = useApp();

  if (!showCustomerService) return null;

  const handleOpenLiveChat = () => {
    setShowCustomerService(false);
    setShowLiveChat(true);
  };

  const handleJoinTelegram = () => {
    window.open('https://t.me/aalay_official', '_blank');
    setShowCustomerService(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#03190d]/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div
        className="absolute inset-0"
        onClick={() => setShowCustomerService(false)}
      />

      <div className="relative z-10 w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Customer Service
          </h3>
          <button
            onClick={() => setShowCustomerService(false)}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Row 1: Customer Care */}
        <div className="bg-emerald-50/50 border border-emerald-100/70 rounded-2xl p-3.5 mb-3 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#15803d] flex items-center justify-center text-white shrink-0 shadow-sm">
              <Headset size={22} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                Customer Care
              </div>
              <div className="text-xs text-slate-500">
                Live chat support, 24×7 help
              </div>
            </div>
          </div>
          <button
            onClick={handleOpenLiveChat}
            className="px-4 py-2 rounded-xl bg-[#15803d] hover:bg-[#166534] active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            Chat
          </button>
        </div>

        {/* Action Row 2: Official Channel */}
        <div className="bg-emerald-50/50 border border-emerald-100/70 rounded-2xl p-3.5 mb-2 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0088cc] flex items-center justify-center text-white shrink-0 shadow-sm">
              <Send size={20} className="fill-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                Official Channel
              </div>
              <div className="text-xs text-slate-500">
                News, updates & announcements
              </div>
            </div>
          </div>
          <button
            onClick={handleJoinTelegram}
            className="px-4 py-2 rounded-xl bg-[#15803d] hover:bg-[#166534] active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};
