import React, { useState } from 'react';
import {
  IndianRupee,
  Users,
  UserPlus,
  Info,
  Copy,
  Share2,
  Check,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubHeader } from '../common/SubHeader';
import { TeamMember } from '../../types';

export const TeamView: React.FC = () => {
  const { user, teamMembers, missions, setSubScreen, setShowInviteModal, showToast } = useApp();
  const [activeTierTab, setActiveTierTab] = useState<'all' | '1' | '2' | '3'>('all');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter members by selected tier tab
  const filteredMembers = teamMembers.filter((m) => {
    if (activeTierTab === 'all') return true;
    return String(m.level) === activeTierTab;
  });

  // Calculate real metrics per level
  const l1Members = teamMembers.filter((m) => m.level === 1);
  const l2Members = teamMembers.filter((m) => m.level === 2);
  const l3Members = teamMembers.filter((m) => m.level === 3);

  const l1Recharge = l1Members.reduce((sum, m) => sum + m.totalRecharge, 0);
  const l2Recharge = l2Members.reduce((sum, m) => sum + m.totalRecharge, 0);
  const l3Recharge = l3Members.reduce((sum, m) => sum + m.totalRecharge, 0);

  const l1Income = l1Members.reduce((sum, m) => sum + m.commissionEarned, 0);
  const l2Income = l2Members.reduce((sum, m) => sum + m.commissionEarned, 0);
  const l3Income = l3Members.reduce((sum, m) => sum + m.commissionEarned, 0);

  const totalCommissionEarned = l1Income + l2Income + l3Income;

  const invitationUrl = `${window.location.origin}/?ref=${user.invitationCode || '883921'}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.invitationCode || '883921');
    setCopiedCode(true);
    showToast('Invitation Code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationUrl);
    setCopiedLink(true);
    showToast('Invitation Link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Join Aalay with my Invitation Code: ${user.invitationCode}\nEarn up to 40% commission across 3 Levels!\nLink: ${invitationUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen pb-24 bg-[#f4f7fb] max-w-md mx-auto">
      <SubHeader title="Team & Commission" />

      <div className="p-4 space-y-4">
        {/* Zero Self-Commission & Real Payout Policy Notice */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 shadow-xs">
          <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">
            !
          </div>
          <div className="text-xs text-amber-900 leading-snug">
            <span className="font-black block mb-0.5">Zero Commission On Personal Deposits</span>
            <span className="text-[11px] text-amber-800">
              Referral commissions (10% L1, 20% L2, 40% L3) are earned <strong>strictly</strong> when members in your downline recharge. No commission is generated on your own wallet deposits.
            </span>
          </div>
        </div>

        {/* Top 3 High-Impact Stat Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white rounded-3xl p-3.5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              <Users size={12} className="text-[#15803d]" />
              <span>MEMBERS</span>
            </div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {teamMembers.length || user.teamMembersCount}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-3.5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              <IndianRupee size={12} className="text-[#15803d]" />
              <span>RECHARGE</span>
            </div>
            <div className="text-xl font-black text-[#15803d] tracking-tight">
              ₹{(l1Recharge + l2Recharge + l3Recharge || user.teamRecharge).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-3.5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-1">
              <Sparkles size={12} />
              <span>EARNED</span>
            </div>
            <div className="text-xl font-black text-emerald-600 tracking-tight">
              ₹{totalCommissionEarned.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* 3 Commission Tier Structure Grid */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <Layers size={17} className="text-[#15803d]" />
                <span>3-Tier Commission Structure</span>
              </h3>
              <p className="text-xs text-slate-500">Tier percentages applied automatically</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Level 1: 10% */}
            <div className="bg-white rounded-3xl p-4 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 transition-all hover:border-emerald-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#15803d] text-white flex items-center justify-center font-black text-base shadow-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight flex items-center gap-1.5">
                      <span>Level 1 (Direct)</span>
                    </h4>
                    <span className="text-xs text-[#15803d] font-extrabold">
                      10% Commission
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-emerald-700">
                    ₹{l1Income.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Earned</div>
                </div>
              </div>

              <div className="grid grid-cols-2 pt-3 text-center">
                <div className="border-r border-slate-100">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    MEMBERS
                  </div>
                  <div className="text-sm font-black text-slate-800 mt-0.5">
                    {l1Members.length}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    TOTAL RECHARGE
                  </div>
                  <div className="text-sm font-black text-slate-800 mt-0.5">
                    ₹{l1Recharge.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Level 2: 20% */}
            <div className="bg-white rounded-3xl p-4 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 transition-all hover:border-emerald-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#166534] text-white flex items-center justify-center font-black text-base shadow-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">
                      Level 2 (Secondary)
                    </h4>
                    <span className="text-xs text-[#166534] font-extrabold">
                      20% Commission
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-emerald-800">
                    ₹{l2Income.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Earned</div>
                </div>
              </div>

              <div className="grid grid-cols-2 pt-3 text-center">
                <div className="border-r border-slate-100">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    MEMBERS
                  </div>
                  <div className="text-sm font-black text-slate-800 mt-0.5">
                    {l2Members.length}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    TOTAL RECHARGE
                  </div>
                  <div className="text-sm font-black text-slate-800 mt-0.5">
                    ₹{l2Recharge.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Level 3: 40% (MAX) */}
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent bg-white rounded-3xl p-4 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border-2 border-amber-300 transition-all">
              <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                    3
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-slate-900 leading-tight">
                        Level 3 (Max Tier)
                      </h4>
                      <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md">
                        MAX
                      </span>
                    </div>
                    <span className="text-xs text-amber-700 font-extrabold">
                      40% Commission (Highest Rate)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-amber-700">
                    ₹{l3Income.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Earned</div>
                </div>
              </div>

              <div className="grid grid-cols-2 pt-3 text-center">
                <div className="border-r border-slate-100">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    MEMBERS
                  </div>
                  <div className="text-sm font-black text-slate-800 mt-0.5">
                    {l3Members.length}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    TOTAL RECHARGE
                  </div>
                  <div className="text-sm font-black text-slate-800 mt-0.5">
                    ₹{l3Recharge.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invitation & Sharing Card */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#15803d] flex items-center justify-center">
                <UserPlus size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Your Invitation Code</h4>
                <p className="text-[11px] text-slate-400">Share with friends to earn up to 40%</p>
              </div>
            </div>
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
            >
              <Share2 size={13} />
              <span>WhatsApp</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyCode}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left hover:border-blue-300 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  INVITATION CODE
                </span>
                <span className="text-sm font-mono font-black text-[#15803d]">
                  {user.invitationCode || '883921'}
                </span>
              </div>
              {copiedCode ? (
                <Check size={16} className="text-emerald-600" />
              ) : (
                <Copy size={16} className="text-slate-400" />
              )}
            </button>

            <button
              onClick={handleCopyLink}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left hover:border-blue-300 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  INVITATION LINK
                </span>
                <span className="text-xs font-bold text-slate-800 truncate block max-w-[100px]">
                  Copy Link
                </span>
              </div>
              {copiedLink ? (
                <Check size={16} className="text-emerald-600" />
              ) : (
                <Copy size={16} className="text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Team Members Roster */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900">Referral Members</h4>

            {/* Level Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => setActiveTierTab('all')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  activeTierTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All ({teamMembers.length})
              </button>
              <button
                onClick={() => setActiveTierTab('1')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  activeTierTab === '1'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                L1 (10%)
              </button>
              <button
                onClick={() => setActiveTierTab('2')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  activeTierTab === '2'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                L2 (20%)
              </button>
              <button
                onClick={() => setActiveTierTab('3')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  activeTierTab === '3'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                L3 (40%)
              </button>
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2 opacity-50 border border-slate-200">
                <img
                  src="https://i.ibb.co/JWBdHWpv/profile-picture.png"
                  alt="Member Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-slate-500 font-medium">No members in this tier yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Share your invitation link to register team members and earn commission!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white shadow-xs shrink-0">
                      <img
                        src="https://i.ibb.co/JWBdHWpv/profile-picture.png"
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{member.name}</span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 rounded-md text-white ${
                            member.level === 1
                              ? 'bg-blue-600'
                              : member.level === 2
                              ? 'bg-indigo-600'
                              : 'bg-amber-600'
                          }`}
                        >
                          L{member.level} ({member.level === 1 ? '10%' : member.level === 2 ? '20%' : '40%'})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {member.phone} · {member.joinedDate}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-600">
                      +₹{member.commissionEarned}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Recharge: ₹{member.totalRecharge}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Team Missions Milestone Integration */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-[#15803d]" />
              <h4 className="text-sm font-black text-slate-900">Active Team Missions & Bonuses</h4>
            </div>
            <button
              onClick={() => setSubScreen('missions')}
              className="text-xs font-bold text-[#15803d] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>View Missions</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Invite active members to unlock milestone cash bonuses up to ₹28,000 credited to your spendable wallet!
          </p>

          {/* Quick Mission Highlight Box */}
          {(() => {
            const realCount = Math.max(teamMembers.length, user.activeMembersToday);
            const nextM = missions.find((m) => !m.claimed && realCount < m.requiredMembers) || missions[0];
            const isReady = nextM && realCount >= nextM.requiredMembers && !nextM.claimed;

            return (
              <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-2xl p-3.5 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider block mb-0.5">
                    NEXT CASH MILESTONE
                  </span>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>{nextM?.requiredMembers || 1} Active Members</span>
                    <span className="text-slate-400 font-normal">
                      ({realCount} / {nextM?.requiredMembers || 1})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 block">
                    +₹{(nextM?.rewardAmount || 200).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => setSubScreen('missions')}
                    className={`mt-1 px-3 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                      isReady
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs animate-pulse'
                        : 'text-[#15803d] hover:underline'
                    }`}
                  >
                    {isReady ? 'Claim Now →' : 'See Milestones →'}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Direct CTA button to invite */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#15803d] via-[#16a34a] to-[#22c55e] hover:from-[#166534] hover:to-[#15803d] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            <UserPlus size={15} />
            <span>Invite Friends to Grow Team</span>
          </button>
        </div>

        {/* How team income works info box */}
        <div className="bg-blue-50/70 border border-blue-200/60 rounded-3xl p-4 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-[#15803d] flex items-center justify-center shrink-0 mt-0.5">
            <Info size={14} />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-900 mb-1">
              Referral Commission Breakdown
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed">
              When someone registers with your link, they are your <strong>Level 1 (10%)</strong>.
              When they invite someone, they become your <strong>Level 2 (20%)</strong>.
              When Level 2 invites members, they become your <strong>Level 3 (40% MAX)</strong>.
              Earnings are credited in real-time to your wallet balance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
