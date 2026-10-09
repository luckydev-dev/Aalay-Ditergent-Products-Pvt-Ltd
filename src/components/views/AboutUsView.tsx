import React from 'react';
import { Rocket, ShieldCheck, Users, Send } from 'lucide-react';
import { SubHeader } from '../common/SubHeader';

export const AboutUsView: React.FC = () => {
  return (
    <div className="min-h-screen pb-24 bg-[#f4f7fb] max-w-md mx-auto">
      <SubHeader title="About Us" />

      {/* Top Blue Hero */}
      <div className="bg-[#25208F] text-white pt-6 pb-16 px-6 text-center rounded-b-3xl">
        <h2 className="text-3xl font-black tracking-tight text-white mb-2">
          AALAY
        </h2>
        <p className="text-xs text-blue-100 max-w-xs mx-auto leading-relaxed mb-4">
          A premier Indian detergent company offering powerful washing powders and long-lasting detergent cake soaps.
        </p>
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#8ED000] text-[10px] font-black uppercase tracking-wider text-[#17145F]">
          ABOUT THE BRAND
        </span>
      </div>

      <div className="px-4 -mt-8 relative z-10 space-y-4">
        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Aalay was founded with a dedicated vision: providing powerful, affordable, and fabric-safe cleaning solutions to every household. We manufacture high-performance washing powders with active oxygen stain lifters and durable detergent cake soaps infused with natural lemon & neem freshness.
          </p>

          {/* Section 1: Our Mission */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <Rocket size={18} className="text-[#8ED000]" />
              <span>Our mission</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pl-6">
              To deliver spotless whiteness, deep fabric stain removal, and rewarding wholesale dealership earnings to our community nationwide.
            </p>
          </div>

          {/* Section 2: Safety & Trust */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <ShieldCheck size={18} className="text-emerald-600" />
              <span>Safety & trust</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pl-6">
              Our products are biodegradable, phosphate-conscious, and skin-friendly. All platform transactions and dealership earnings are backed by secure automated banking channels.
            </p>
          </div>

          {/* Section 3: Community */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900">
              <Users size={18} className="text-[#25208F]" />
              <span>Community</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pl-6 mb-2">
              Join our growing national network on Telegram for real-time distributor support, daily reward codes, and new product announcements.
            </p>

            <a
              href="https://t.me/aaley_official"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 rounded-2xl bg-[#25208F] hover:bg-[#17145F] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-900/15 transition-all"
            >
              <Send size={16} className="fill-white" />
              <span>Join Telegram Channel</span>
            </a>
          </div>

          <div className="text-center text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100">
            Last updated October 2026 · Aalay Detergent Care
          </div>
        </div>

        {/* Disclaimer footer box */}
        <div className="bg-slate-100/70 border border-slate-200/60 rounded-2xl p-4 text-[11px] text-slate-500 leading-relaxed">
          This page describes how Aalay works in general terms. Washing powder and detergent cake distribution plans, daily returns, commission rates, and withdrawal rules shown inside the app are operative.
        </div>
      </div>
    </div>
  );
};
