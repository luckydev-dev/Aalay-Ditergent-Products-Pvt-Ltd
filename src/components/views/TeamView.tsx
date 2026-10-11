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
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubHeader } from '../common/SubHeader';

export const TeamView: React.FC = () => {
  const { user, teamMembers, setSubScreen, showToast } = useApp();
  const [activeTierTab, setActiveTierTab] = useState<'all' | '1' | '2' | '3'>('all');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter members by tier
  const filteredMembers = teamMembers.filter((m) => {
    if (activeTierTab === 'all') return true;
    return String(m.level) === activeTierTab;
  });

  // Calculate tier metrics
  const l1Members = teamMembers.filter((m) => m.level === 1);
  const l2Members = teamMembers.filter((m) => m.level === 2);
  const l3Members = teamMembers.filter((m) => m.level === 3);

  const l1Recharge = l1Members.reduce((sum, m) => sum + (m.totalRecharge || 0), 0);
  const l2Recharge = l2Members.reduce((sum, m) => sum + (m.totalRecharge || 0), 0);
  const l3Recharge = l3Members.reduce((sum, m) => sum + (m.totalRecharge || 0), 0);

  const l1Income = l1Members.reduce((sum, m) => sum + (m.commissionEarned || 0), 0);
  const l2Income = l2Members.reduce((sum, m) => sum + (m.commissionEarned || 0), 0);
  const l3Income = l3Members.reduce((sum, m) => sum + (m.commissionEarned || 0), 0);

  const totalCommissionEarned = l1Income + l2Income + l3Income;
  const userInviteCode = user.invitationCode || (user.phone ? user.phone.slice(-6) : '883921');
  const invitationUrl = `${window.location.origin}/?ref=${userInviteCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userInviteCode);
    setCopiedCode(true);
    showToast(`Invitation Code ${userInviteCode} copied!`);
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
      `Join Aalay with my invitation code: ${userInviteCode}\nEarn instant rewards & up to 40% team commission across 3 levels!\nLink: ${invitationUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen pb-28 bg-slate-50 max-w-md mx-auto text-slate-900">
      <SubHeader title="Team & Commission" />

      <div className="p-4 space-y-4">
        {/* Simple Policy Note */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-sm">
            <Info size={16} />
          </div>
          <div className="text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-0.5">Commission Rules</span>
            Referral rewards (10% Level 1, 20% Level 2, 40% Level 3) are credited automatically when members in your team recharge their wallets.
          </div>
        </div>

        {/* Clean Overview Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Team Members
            </span>
            <span className="text-xl font-bold text-slate-900">
              {teamMembers.length || user.teamMembersCount || 0}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Team Recharges
            </span>
            <span className="text-xl font-bold text-slate-900">
              ₹{(l1Recharge + l2Recharge + l3Recharge || user.teamRecharge || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Earned Commission
            </span>
            <span className="text-xl font-bold text-emerald-600">
              ₹{totalCommissionEarned.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* 3 Commission Levels */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers size={16} className="text-emerald-600" />
              <span>3-Level Commission Tiers</span>
            </h3>
            <span className="text-xs text-slate-400">Automatic payouts</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {/* Level 1 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  L1
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Level 1 (Direct)</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">10% Commission</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900">₹{l1Income.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-slate-400">{l1Members.length} members</div>
              </div>
            </div>

            {/* Level 2 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                  L2
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Level 2 (Secondary)</div>
                  <div className="text-[11px] text-emerald-700 font-semibold">20% Commission</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900">₹{l2Income.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-slate-400">{l2Members.length} members</div>
              </div>
            </div>

            {/* Level 3 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                  L3
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Level 3 (Tertiary)</div>
                  <div className="text-[11px] text-emerald-800 font-semibold">40% Commission</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900">₹{l3Income.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-slate-400">{l3Members.length} members</div>
              </div>
            </div>
          </div>
        </div>

        {/* Invite & Referral Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Invite Friends</h4>
              <p className="text-[11px] text-slate-500">Share your referral link to build your team</p>
            </div>
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyCode}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left hover:border-emerald-300 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Code
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {user.invitationCode || '883921'}
                </span>
              </div>
              {copiedCode ? (
                <Check size={16} className="text-emerald-600" />
              ) : (
                <Copy size={15} className="text-slate-400" />
              )}
            </button>

            <button
              onClick={handleCopyLink}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left hover:border-emerald-300 transition-colors flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Link
                </span>
                <span className="text-xs font-bold text-slate-900 truncate block max-w-[90px]">
                  Copy Link
                </span>
              </div>
              {copiedLink ? (
                <Check size={16} className="text-emerald-600" />
              ) : (
                <Copy size={15} className="text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Members Roster */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900">Team Roster</h4>

            {/* Level Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-medium">
              <button
                onClick={() => setActiveTierTab('all')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  activeTierTab === 'all'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All ({teamMembers.length})
              </button>
              <button
                onClick={() => setActiveTierTab('1')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  activeTierTab === '1'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                L1
              </button>
              <button
                onClick={() => setActiveTierTab('2')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  activeTierTab === '2'
                    ? 'bg-emerald-700 text-white font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                L2
              </button>
              <button
                onClick={() => setActiveTierTab('3')}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  activeTierTab === '3'
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                L3
              </button>
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-full overflow-hidden mx-auto mb-2 opacity-60 border border-slate-200">
                <img
                  src="https://i.ibb.co/JWBdHWpv/profile-picture.png"
                  alt="Member Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-slate-500 font-medium">No team members found in this tier</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Share your invitation link to register team members.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembers.map((member, idx) => (
                <div
                  key={member.id || idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={member.avatar || 'https://i.ibb.co/JWBdHWpv/profile-picture.png'}
                      alt={member.phone}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {member.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Level {member.level} • Joined {member.joinDate || 'Recently'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-600">
                      +₹{(member.commissionEarned || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Recharge: ₹{(member.totalRecharge || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
