import React from 'react';
import { Gift, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WelcomeModal: React.FC = () => {
  const { showWelcomeModal, setShowWelcomeModal } = useApp();

  if (!showWelcomeModal) return null;

  const handleJoinTelegram = () => {
    window.open('https://t.me/aaley_official', '_blank');
    setShowWelcomeModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03190d]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-emerald-500/20 relative animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Decorative ambient blur orb */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#8ED000]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Title & Tagline */}
        <div className="text-center mb-5 relative z-10">
          <h2 className="text-2xl font-black text-[#0a3d1b] tracking-tight mb-1">
            Welcome to Aalay
          </h2>
          <p className="text-xs font-bold text-[#15803d]">
            Washing Powder, Detergent Cake & Fast Daily Payouts
          </p>
        </div>

        {/* Signup Bonus Card */}
        <div className="bg-gradient-to-r from-[#14532d] via-[#15803d] to-[#166534] rounded-2xl p-4 text-white flex items-center gap-4 mb-3.5 shadow-md relative z-10 overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Gift size={26} className="text-[#B2E500]" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
              FREE SIGNUP BONUS
            </div>
            <div className="text-3xl font-black tracking-tight text-[#B2E500]">₹40</div>
          </div>
        </div>

        {/* Deposit & Withdraw limits grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">
              MIN DEPOSIT
            </div>
            <div className="text-xl font-black text-[#15803d]">₹290</div>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">
              MIN WITHDRAW
            </div>
            <div className="text-xl font-black text-[#15803d]">₹180</div>
          </div>
        </div>

        {/* Invitation Commission Section */}
        <div className="mb-6 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#15803d]">
              INVITATION COMMISSION
            </span>
            <span className="text-[10px] font-black text-white bg-[#15803d] px-2 py-0.5 rounded-full shadow-xs">
              UP TO 40%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-center">
              <div className="text-[9px] font-bold text-slate-500 uppercase">
                LEVEL 1
              </div>
              <div className="text-lg font-black text-[#15803d]">10%</div>
              <div className="text-[8px] font-bold text-slate-400">Direct</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-center">
              <div className="text-[9px] font-bold text-slate-500 uppercase">
                LEVEL 2
              </div>
              <div className="text-lg font-black text-[#15803d]">20%</div>
              <div className="text-[8px] font-bold text-slate-400">Sub-team</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 text-center shadow-sm">
              <div className="text-[9px] font-black text-emerald-800 uppercase">
                LEVEL 3
              </div>
              <div className="text-lg font-black text-emerald-600">40%</div>
              <div className="text-[8px] font-extrabold text-emerald-700 uppercase">Max Tier</div>
            </div>
          </div>
        </div>

        {/* Action Button: Join Channel */}
        <button
          onClick={handleJoinTelegram}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#15803d] via-[#16a34a] to-[#22c55e] hover:from-[#166534] hover:to-[#15803d] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/25 active:scale-[0.98] transition-all cursor-pointer relative z-10"
        >
          <Send size={18} className="fill-white" />
          <span>Join Telegram Channel</span>
        </button>

        {/* Maybe Later link */}
        <button
          onClick={() => setShowWelcomeModal(false)}
          className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 mt-3 py-1 transition-colors cursor-pointer"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};
