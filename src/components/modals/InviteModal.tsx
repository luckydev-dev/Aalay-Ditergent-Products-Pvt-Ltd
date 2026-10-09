import React, { useState } from 'react';
import { X, Copy, Check, Share2, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InviteModal: React.FC = () => {
  const { showInviteModal, setShowInviteModal, user, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!showInviteModal) return null;

  const inviteLink = `${window.location.origin}/?ref=${user.invitationCode || '883921'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    showToast('Invitation link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative border border-slate-100">
        <button
          onClick={() => setShowInviteModal(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0047B3]/10 text-[#0047B3] flex items-center justify-center mx-auto mb-2">
            <Users size={24} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Invite Friends & Earn
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Earn across all 3 tiers: Level 1 (10%), Level 2 (20%), and Level 3 (40% MAX)!
          </p>
        </div>

        {/* QR Code Graphic Box */}
        <div className="w-36 h-36 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-2 mx-auto mb-4 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800">
            {/* Simulated QR Pattern */}
            <rect x="10" y="10" width="24" height="24" fill="currentColor" rx="2" />
            <rect x="14" y="14" width="16" height="16" fill="#ffffff" />
            <rect x="18" y="18" width="8" height="8" fill="currentColor" />

            <rect x="66" y="10" width="24" height="24" fill="currentColor" rx="2" />
            <rect x="70" y="14" width="16" height="16" fill="#ffffff" />
            <rect x="74" y="18" width="8" height="8" fill="currentColor" />

            <rect x="10" y="66" width="24" height="24" fill="currentColor" rx="2" />
            <rect x="14" y="70" width="16" height="16" fill="#ffffff" />
            <rect x="18" y="74" width="8" height="8" fill="currentColor" />

            <rect x="42" y="15" width="16" height="6" fill="currentColor" />
            <rect x="42" y="28" width="10" height="6" fill="currentColor" />
            <rect x="15" y="42" width="6" height="16" fill="currentColor" />
            <rect x="28" y="42" width="10" height="6" fill="currentColor" />
            <rect x="44" y="44" width="12" height="12" fill="#0047B3" rx="2" />
            <rect x="66" y="42" width="20" height="6" fill="currentColor" />
            <rect x="42" y="66" width="6" height="20" fill="currentColor" />
            <rect x="56" y="66" width="30" height="6" fill="currentColor" />
            <rect x="66" y="78" width="10" height="12" fill="currentColor" />
          </svg>
        </div>

        {/* Invitation Code Display */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 mb-4 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Your Invitation Code
          </div>
          <div className="text-2xl font-black text-[#0047B3] tracking-widest mt-0.5">
            {user.invitationCode}
          </div>
        </div>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className="w-full py-3.5 px-4 rounded-xl bg-[#0047B3] hover:bg-[#003d99] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all mb-2"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Link Copied!' : 'Copy Invitation Link'}</span>
        </button>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Aalay Daily Income',
                text: `Join Aalay with my code ${user.invitationCode} and get ₹40 signup bonus!`,
                url: inviteLink,
              }).catch(() => {});
            } else {
              handleCopy();
            }
          }}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
        >
          <Share2 size={14} />
          <span>Share via Social / WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
