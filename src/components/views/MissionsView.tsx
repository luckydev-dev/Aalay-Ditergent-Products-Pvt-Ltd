import React from 'react';
import { Users, Trophy, Lock, CheckCircle2, UserPlus, Gift, Sparkles, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubHeader } from '../common/SubHeader';

export const MissionsView: React.FC = () => {
  const { missions, claimMission, user, teamMembers, setShowInviteModal } = useApp();

  const realActiveCount = Math.max(
    user.activeMembersToday,
    teamMembers.filter((m) => m.active).length,
    teamMembers.length
  );

  const nextMission = missions.find((m) => !m.claimed && realActiveCount < m.requiredMembers);
  const neededMembers = nextMission ? nextMission.requiredMembers - realActiveCount : 0;

  const totalRewardsClaimed = missions
    .filter((m) => m.claimed)
    .reduce((sum, m) => sum + m.rewardAmount, 0);

  return (
    <div className="min-h-screen pb-24 bg-[#f4f7fb] max-w-md mx-auto">
      <SubHeader title="Team Missions" />

      <div className="p-4 space-y-4">
        {/* Top Gradient Metric Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#14532d] via-[#15803d] to-[#166534] text-white p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
              <Users size={16} />
              <span>Real Active Team Members</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider text-emerald-300">
              LIVE TRACKING
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-black tracking-tight text-white">
              {realActiveCount}
            </span>
            <span className="text-xs text-emerald-200 font-semibold">
              member{realActiveCount === 1 ? '' : 's'} joined
            </span>
          </div>

          {/* Progress bar to next mission */}
          <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden mb-2 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
              style={{
                width: nextMission
                  ? `${Math.min(100, Math.round((realActiveCount / nextMission.requiredMembers) * 100))}%`
                  : '100%',
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-100 font-medium">
            <span>
              {nextMission
                ? `Need ${neededMembers} more member${neededMembers > 1 ? 's' : ''} to unlock ₹${nextMission.rewardAmount.toLocaleString('en-IN')}`
                : 'All available team missions completed!'}
            </span>
            {totalRewardsClaimed > 0 && (
              <span className="text-emerald-300 font-bold">
                +₹{totalRewardsClaimed.toLocaleString('en-IN')} Claimed
              </span>
            )}
          </div>
        </div>

        {/* Section Header with Real Invite Action */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-[#15803d]" />
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Milestone Cash Bonuses
            </h3>
          </div>

          {/* Real Invitation Action */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#15803d] hover:bg-[#166534] text-white text-xs font-black shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus size={13} />
            <span>Invite Friends</span>
          </button>
        </div>

        {/* Real Missions List */}
        <div className="space-y-3">
          {missions.map((mission) => {
            const isUnlocked = realActiveCount >= mission.requiredMembers;
            const isClaimed = mission.claimed;
            const progress = Math.min(realActiveCount, mission.requiredMembers);
            const percent = Math.min(100, Math.round((progress / mission.requiredMembers) * 100));

            return (
              <div
                key={mission.id}
                className={`bg-white rounded-3xl p-4 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border transition-all ${
                  isClaimed
                    ? 'border-emerald-100 bg-emerald-50/20'
                    : isUnlocked
                    ? 'border-blue-200 shadow-md ring-1 ring-blue-500/20'
                    : 'border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isClaimed
                          ? 'bg-emerald-100 text-emerald-700'
                          : isUnlocked
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isClaimed ? (
                        <CheckCircle2 size={22} className="stroke-[2.5]" />
                      ) : isUnlocked ? (
                        <Gift size={22} className="stroke-[2.5]" />
                      ) : (
                        <Lock size={20} />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          {mission.requiredMembers} Active Member{mission.requiredMembers > 1 ? 's' : ''}
                        </h4>
                        {isUnlocked && !isClaimed && (
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-500 text-white text-[9px] font-black animate-pulse">
                            READY
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-black text-emerald-600 block mt-0.5">
                        +₹{mission.rewardAmount.toLocaleString('en-IN')} Cash Bonus
                      </span>
                    </div>
                  </div>

                  {/* Status / Claim Button */}
                  <div>
                    {isClaimed ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100/80 text-emerald-800 text-xs font-black">
                        <CheckCircle2 size={13} />
                        <span>Claimed</span>
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => claimMission(mission.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles size={13} />
                        <span>Claim ₹{mission.rewardAmount}</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold">
                        <Lock size={12} />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar inside mission card */}
                {!isClaimed && (
                  <div className="pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>Progress</span>
                      <span className={isUnlocked ? 'text-emerald-600 font-extrabold' : ''}>
                        {progress} / {mission.requiredMembers} members ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isUnlocked ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* How Team Missions Work Explanatory Card */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.04)] border border-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900">
            <Trophy size={16} className="text-amber-500" />
            <span>How Team Missions Work</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            1. Share your invitation link or code with friends and family.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            2. When invited members register and activate their account, your team progress counter increases in real-time.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            3. Each milestone unlocks an instant non-withdrawable cash reward credited straight to your balance.
          </p>
        </div>
      </div>
    </div>
  );
};
