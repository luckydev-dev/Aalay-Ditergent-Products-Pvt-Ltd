import React from 'react';
import { ShieldCheck, Factory, Sparkles } from 'lucide-react';

interface DatabaseSplashLoaderProps {
  statusText?: string;
  imageSrc?: string;
}

export const DatabaseSplashLoader: React.FC<DatabaseSplashLoaderProps> = ({
  statusText = 'Loading Aalay...',
  imageSrc = 'https://i.ibb.co/JWBdHWpv/profile-picture.png',
}) => {
  const profileImg = imageSrc || 'https://i.ibb.co/JWBdHWpv/profile-picture.png';

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white text-slate-900 p-6 select-none overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Ambient Minimalist Glow Orbs */}
      <div className="absolute w-80 h-80 -top-20 -left-20 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute w-80 h-80 -bottom-20 -right-20 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative flex flex-col items-center text-center max-w-sm w-full z-10 animate-in fade-in duration-300">
        {/* Sleek Minimalist Brand Logo Emblem with User Profile Picture */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-emerald-500/20 via-emerald-400/15 to-amber-500/20 blur-xl opacity-70 animate-pulse" />
          
          <div className="relative w-22 h-22 rounded-full p-0.5 bg-gradient-to-br from-[#15803d] via-emerald-500 to-amber-500 shadow-xl overflow-hidden flex items-center justify-center">
            <img
              src={profileImg}
              alt="Aalay Profile Logo"
              className="w-full h-full object-cover rounded-full bg-white"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://i.ibb.co/JWBdHWpv/profile-picture.png';
              }}
            />
          </div>
        </div>

        {/* Brand Title */}
        <h1 className="text-xl font-black tracking-tight text-slate-900 mb-1 uppercase">
          AALAY ENTERPRISE
        </h1>
        <p className="text-xs font-semibold text-slate-500 mb-8">
          Detergent Powder & Soap Manufacturing
        </p>

        {/* Minimalist Progress Bar Indicator */}
        <div className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-lg backdrop-blur-md mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2.5 px-0.5">
            <span className="text-slate-600 font-semibold text-[11px]">{statusText}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          {/* Smooth subtle progress bar */}
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-[#15803d] via-emerald-500 to-amber-500 rounded-full w-3/4 animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>

        {/* Verified Security Badges */}
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#15803d]" />
            <span>Fast & Instant</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-amber-500" />
            <span>Verified Official</span>
          </div>
        </div>
      </div>
    </div>
  );
};

