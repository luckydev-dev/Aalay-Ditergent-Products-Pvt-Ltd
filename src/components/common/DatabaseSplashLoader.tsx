import React from 'react';
import { Database, ShieldCheck, Factory } from 'lucide-react';

interface DatabaseSplashLoaderProps {
  statusText?: string;
  imageSrc?: string;
}

export const DatabaseSplashLoader: React.FC<DatabaseSplashLoaderProps> = ({
  statusText = 'Loading verified platform state...',
}) => {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#0B0E14] text-white p-6 select-none overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Ambient Minimalist Glow Orbs */}
      <div className="absolute w-80 h-80 -top-20 -left-20 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute w-80 h-80 -bottom-20 -right-20 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative flex flex-col items-center text-center max-w-sm w-full z-10 animate-in fade-in duration-300">
        {/* Sleek Dark Minimalist Brand Logo Emblem */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-emerald-500/30 via-emerald-400/20 to-amber-500/30 blur-xl opacity-70 animate-pulse" />
          
          <div className="relative w-20 h-20 rounded-3xl p-0.5 bg-gradient-to-br from-emerald-400 via-emerald-500 to-amber-500 shadow-2xl">
            <div className="w-full h-full rounded-[22px] bg-[#0F141C] flex items-center justify-center text-emerald-400">
              <Factory size={38} className="stroke-[2.2]" />
            </div>
          </div>
        </div>

        {/* Brand Title */}
        <h1 className="text-xl font-black tracking-tight text-white mb-1 uppercase">
          AALAY ENTERPRISE
        </h1>
        <p className="text-xs font-medium text-slate-400 mb-8">
          Industrial Detergent Manufacturing Platform
        </p>

        {/* Minimalist Progress Bar Indicator */}
        <div className="w-full max-w-xs bg-[#151A23] border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-2.5 px-0.5">
            <span className="text-slate-300 font-medium text-[11px]">{statusText}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          {/* Smooth subtle progress bar */}
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 rounded-full w-3/4 animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>

        {/* Verified Security Badges */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
          <div className="flex items-center gap-1.5">
            <Database size={13} className="text-emerald-400" />
            <span>Encrypted Sync</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-amber-400" />
            <span>Secure System</span>
          </div>
        </div>
      </div>
    </div>
  );
};
