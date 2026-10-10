import React from 'react';
import { Database, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

interface DatabaseSplashLoaderProps {
  statusText?: string;
}

export const DatabaseSplashLoader: React.FC<DatabaseSplashLoaderProps> = ({
  statusText = 'Loading live database & real-time plans...',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#051838] text-white p-6 select-none overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background radial ambient lights */}
      <div className="absolute w-96 h-96 -top-20 -left-20 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-96 h-96 -bottom-20 -right-20 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Main branded container */}
      <div className="relative flex flex-col items-center text-center max-w-sm w-full z-10">
        {/* Animated Brand Emblem with glowing spinning outer rings */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
          {/* Outer glowing pulsing ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-amber-400 opacity-30 blur-md animate-ping" />

          {/* Rotating dashed ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-400/50 animate-spin [animation-duration:8s]" />

          {/* Counter-rotating gradient border ring */}
          <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-t-amber-400 border-r-blue-400 animate-spin [animation-duration:3s]" />

          {/* Central Logo Badge */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0c2b64] to-[#061e47] border border-blue-400/40 shadow-2xl flex flex-col items-center justify-center p-2">
            <span className="text-xl font-black tracking-widest text-amber-400">AALAY</span>
            <span className="text-[8px] font-bold tracking-wider text-blue-200 uppercase mt-0.5">Enterprise</span>
          </div>
        </div>

        {/* Brand Title */}
        <h1 className="text-2xl font-black tracking-tight text-white mb-1 flex items-center gap-2">
          <span>AALAY CHEMICALS</span>
          <Sparkles size={18} className="text-amber-400 animate-bounce" />
        </h1>
        <p className="text-xs font-medium text-blue-200/80 mb-8 max-w-xs">
          Industrial Detergents & High-Yield Investment Platform
        </p>

        {/* Spinner & Live Status Indicator */}
        <div className="w-full bg-[#0a234f]/90 border border-blue-500/20 rounded-2xl p-4 shadow-xl backdrop-blur-md mb-6">
          <div className="flex items-center justify-center gap-3 mb-2.5">
            <RefreshCw size={18} className="text-amber-400 animate-spin shrink-0" />
            <span className="text-xs font-bold text-slate-100">{statusText}</span>
          </div>

          {/* Progress Bar line animation */}
          <div className="w-full h-1.5 bg-blue-950 rounded-full overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 rounded-full w-2/3 animate-[shimmer_1.8s_infinite]" />
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center gap-4 text-[11px] font-bold text-blue-300/70">
          <div className="flex items-center gap-1.5">
            <Database size={13} className="text-emerald-400" />
            <span>Cloud Database Sync</span>
          </div>
          <span className="text-blue-500">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-blue-400" />
            <span>Server-Verified Time</span>
          </div>
        </div>
      </div>
    </div>
  );
};
