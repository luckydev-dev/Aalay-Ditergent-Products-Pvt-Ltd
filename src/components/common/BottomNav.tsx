import React from 'react';
import { Home, Gift, Zap, Users, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setSubScreen } = useApp();

  const handleTabChange = (tab: ActiveTab) => {
    setSubScreen('none');
    setActiveTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] max-w-md mx-auto">
      <div className="flex items-center justify-around h-16 px-1 relative">
        {/* 1. Home */}
        <button
          onClick={() => handleTabChange('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-[#15803d]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home
            size={22}
            className={`transition-transform duration-200 ${
              activeTab === 'home' ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.8px]'
            }`}
          />
          <span className={`text-[10px] tracking-tight mt-1 ${
            activeTab === 'home' ? 'font-bold text-[#15803d]' : 'font-medium'
          }`}>
            Home
          </span>
        </button>

        {/* 2. Spin */}
        <button
          onClick={() => handleTabChange('spin')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors cursor-pointer ${
            activeTab === 'spin' ? 'text-[#15803d]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Gift
            size={22}
            className={`transition-transform duration-200 ${
              activeTab === 'spin' ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.8px]'
            }`}
          />
          <span className={`text-[10px] tracking-tight mt-1 ${
            activeTab === 'spin' ? 'font-bold text-[#15803d]' : 'font-medium'
          }`}>
            Spin
          </span>
        </button>

        {/* 3. Center Raised Floating Treasure Button (Aalay Vibrant Lime/Emerald Swirl) */}
        <div className="flex-1 flex flex-col items-center justify-center relative -top-3">
          <button
            onClick={() => handleTabChange('treasure')}
            className={`w-13 h-13 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_6px_16px_rgba(22,163,74,0.4)] active:scale-95 cursor-pointer ${
              activeTab === 'treasure'
                ? 'bg-gradient-to-tr from-[#15803d] via-[#16a34a] to-[#22c55e] ring-4 ring-emerald-100 scale-105'
                : 'bg-gradient-to-tr from-[#166534] via-[#15803d] to-[#16a34a] hover:brightness-105'
            }`}
            aria-label="Treasure Missions"
          >
            <Zap size={24} className="text-white fill-white" />
          </button>
          <span
            className={`text-[10px] tracking-tight mt-0.5 ${
              activeTab === 'treasure' ? 'font-bold text-[#15803d]' : 'font-medium text-slate-500'
            }`}
          >
            Treasure
          </span>
        </div>

        {/* 4. Team */}
        <button
          onClick={() => handleTabChange('team')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors cursor-pointer ${
            activeTab === 'team' ? 'text-[#15803d]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users
            size={22}
            className={`transition-transform duration-200 ${
              activeTab === 'team' ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.8px]'
            }`}
          />
          <span className={`text-[10px] tracking-tight mt-1 ${
            activeTab === 'team' ? 'font-bold text-[#15803d]' : 'font-medium'
          }`}>
            Team
          </span>
        </button>

        {/* 5. Profile */}
        <button
          onClick={() => handleTabChange('profile')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors cursor-pointer ${
            activeTab === 'profile' ? 'text-[#15803d]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User
            size={22}
            className={`transition-transform duration-200 ${
              activeTab === 'profile' ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.8px]'
            }`}
          />
          <span className={`text-[10px] tracking-tight mt-1 ${
            activeTab === 'profile' ? 'font-bold text-[#15803d]' : 'font-medium'
          }`}>
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};
