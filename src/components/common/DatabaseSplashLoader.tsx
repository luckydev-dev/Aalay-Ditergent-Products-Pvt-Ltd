import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';

interface DatabaseSplashLoaderProps {
  statusText?: string;
  imageSrc?: string;
}

const DEFAULT_PROFILE_IMAGE = 'https://i.ibb.co/JWBdHWpv/profile-picture.png';

export const DatabaseSplashLoader: React.FC<DatabaseSplashLoaderProps> = ({
  statusText = 'Loading...',
  imageSrc = DEFAULT_PROFILE_IMAGE,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#031f11] text-white p-6 select-none overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Ambient Logo-Matching Green Blur Glow Orbs */}
      <div className="absolute w-96 h-96 -top-20 -left-20 bg-[#8ED000]/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute w-96 h-96 -bottom-20 -right-20 bg-[#15803d]/30 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute w-64 h-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#B2E500]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative flex flex-col items-center text-center max-w-sm w-full z-10 animate-in fade-in duration-300">
        {/* Simple Profile Picture Emblem */}
        <div className="relative mb-6">
          {/* Subtle Outer Glow Ring */}
          <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-emerald-500 via-lime-400 to-emerald-600 opacity-60 blur-md animate-pulse" />
          
          {/* Outer Border */}
          <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-br from-emerald-400 to-lime-300 shadow-2xl">
            {/* Inner White Frame */}
            <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden flex items-center justify-center">
              <img
                src={imageSrc}
                alt="Aalay Profile"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE;
                }}
              />
            </div>
          </div>
        </div>

        {/* Brand Title */}
        <h1 className="text-2xl font-black tracking-tight text-white mb-1">
          AALAY ENTERPRISE
        </h1>
        <p className="text-xs font-semibold text-emerald-300/80 mb-7">
          Detergent Cake & High-Yield Rewards
        </p>

        {/* Simple Status & Progress Line */}
        <div className="w-full max-w-xs bg-[#052b17]/80 border border-emerald-500/25 rounded-2xl p-4 shadow-xl backdrop-blur-md mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-100 mb-2.5 px-0.5">
            <span className="text-emerald-200">{statusText}</span>
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
          </div>

          {/* Minimal shimmer progress bar */}
          <div className="w-full h-1.5 bg-emerald-950/90 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-400 rounded-full w-2/3 animate-[shimmer_1.4s_infinite]" />
          </div>
        </div>

        {/* Verified Security Badges */}
        <div className="flex items-center gap-3 text-[11px] font-bold text-emerald-300/70">
          <div className="flex items-center gap-1.5">
            <Database size={13} className="text-emerald-400" />
            <span>Database Connected</span>
          </div>
          <span className="text-emerald-700">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-lime-400" />
            <span>Encrypted Session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
