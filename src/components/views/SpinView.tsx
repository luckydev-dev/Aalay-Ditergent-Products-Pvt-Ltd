import React, { useState, useEffect } from 'react';
import {
  Coins,
  Gem,
  Star,
  Trophy,
  Crown,
  Zap,
  Frown,
  Flame,
  Volume2,
  Gift,
  Play,
  Send,
  Sparkles,
  Megaphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Clockwise perimeter cell indices mapping to grid positions [row, col]
// 0: (0,0) -> ₹5
// 1: (0,1) -> ₹10
// 2: (0,2) -> ₹15
// 3: (1,2) -> ₹500
// 4: (2,2) -> ₹5000
// 5: (2,1) -> Sorry
// 6: (2,0) -> ₹1000
// 7: (1,0) -> ₹50
const PERIMETER_CELLS = [
  { id: 0, label: '₹5', amount: 5, icon: Coins, row: 0, col: 0 },
  { id: 1, label: '₹10', amount: 10, icon: Gem, row: 0, col: 1 },
  { id: 2, label: '₹15', amount: 15, icon: Star, row: 0, col: 2 },
  { id: 3, label: '₹500', amount: 500, icon: Crown, row: 1, col: 2 },
  { id: 4, label: '₹5000', amount: 5000, icon: Flame, row: 2, col: 2 },
  { id: 5, label: 'Sorry', amount: 0, icon: Frown, row: 2, col: 1 },
  { id: 6, label: '₹1000', amount: 1000, icon: Zap, row: 2, col: 0 },
  { id: 7, label: '₹50', amount: 50, icon: Trophy, row: 1, col: 0 },
];

const WINNERS_FEED = [
  '881****10 won ₹5',
  '800****95 won ₹5',
  '799****79 won ₹5',
  '986****50 won ₹10',
  '836****12 won ₹15',
  '951****97 won ₹50',
  '912****43 won ₹5',
  '974****81 won ₹500',
];

export const SpinView: React.FC = () => {
  const {
    user,
    spinLuckyDraw,
    redeemGiftCode,
    totalWonTreasure,
    redeemedCodes,
    showToast,
  } = useApp();

  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [giftInput, setGiftInput] = useState('');
  const [winModalData, setWinModalData] = useState<{ amount: number; message: string } | null>(null);
  const [marqueeIndex, setMarqueeIndex] = useState(0);

  // Live winners marquee animation
  useEffect(() => {
    const timer = setInterval(() => {
      setMarqueeIndex((prev) => (prev + 1) % WINNERS_FEED.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Web Audio synthetic click tone
  const playBeep = (freq = 440) => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      // AudioContext might be blocked before first user interaction
    }
  };

  const handleStartSpin = () => {
    if (user.spinsLeft <= 0) {
      showToast('No spins left today! Recharge or check back tomorrow.');
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    setWinModalData(null);

    // Pick target prize (favoring realistic wins like ₹5, ₹10, ₹15, ₹50)
    const roll = Math.random();
    let targetId = 0; // ₹5
    if (roll < 0.45) targetId = 0; // ₹5
    else if (roll < 0.70) targetId = 1; // ₹10
    else if (roll < 0.85) targetId = 2; // ₹15
    else if (roll < 0.95) targetId = 7; // ₹50
    else targetId = 3; // ₹500

    let current = activeCellIndex ?? 0;
    const totalSteps = 24 + targetId; // 3 full cycles + offset
    let step = 0;
    let delay = 60;

    const runStep = () => {
      current = (current + 1) % 8;
      setActiveCellIndex(current);
      playBeep(350 + current * 40);
      step++;

      if (step < totalSteps) {
        // Slow down toward the end
        if (totalSteps - step < 8) {
          delay += 40;
        } else if (totalSteps - step < 4) {
          delay += 70;
        }
        setTimeout(runStep, delay);
      } else {
        // Spin finished
        setIsSpinning(false);
        const winningItem = PERIMETER_CELLS.find((p) => p.id === current) || PERIMETER_CELLS[0];
        spinLuckyDraw(winningItem.amount);

        // Win popup
        setWinModalData({
          amount: winningItem.amount,
          message:
            winningItem.amount > 0
              ? `Congratulations! You won ₹${winningItem.amount}!`
              : 'Better luck next time!',
        });
      }
    };

    runStep();
  };

  const handleRedeemGift = (e: React.FormEvent) => {
    e.preventDefault();
    const res = redeemGiftCode(giftInput);
    if (res.success) {
      setGiftInput('');
    } else {
      showToast(res.message);
    }
  };

  // Helper to render grid cell
  const renderCell = (row: number, col: number) => {
    if (row === 1 && col === 1) {
      // Center cell: SPIN
      return (
        <div
          key="center-spin"
          className="aspect-square rounded-2xl bg-gradient-to-b from-[#0055d4] to-[#003894] text-white flex flex-col items-center justify-center p-2 shadow-inner border border-blue-400/30"
        >
          <span className="text-base sm:text-lg font-black tracking-wider">SPIN</span>
          <span className="text-[10px] text-blue-200 font-extrabold uppercase mt-0.5">
            {user.spinsLeft} LEFT
          </span>
        </div>
      );
    }

    const item = PERIMETER_CELLS.find((p) => p.row === row && p.col === col);
    if (!item) return null;

    const isActive = activeCellIndex === item.id;
    const IconComponent = item.icon;

    return (
      <div
        key={`cell-${item.id}`}
        className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all duration-150 relative ${
          isActive
            ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-900 shadow-[0_0_18px_rgba(251,191,36,0.8)] scale-105 border-2 border-white z-10'
            : 'bg-white/10 backdrop-blur-xs text-white border border-white/15 hover:bg-white/15'
        }`}
      >
        <IconComponent
          size={24}
          className={`mb-1 transition-transform ${
            isActive ? 'scale-115 text-slate-950' : 'text-emerald-200'
          }`}
        />
        <span
          className={`text-xs font-black tracking-tight ${
            isActive ? 'text-slate-950' : 'text-white'
          }`}
        >
          {item.label}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 pt-2 px-3 sm:px-4 bg-gradient-to-b from-[#063b1b] via-[#14532d] to-[#032210] text-white max-w-md mx-auto relative overflow-hidden">
      {/* Subtle green ambient blur glows */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#B2E500]/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-52 h-52 bg-[#8ED000]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Title & Tag */}
      <div className="text-center my-3 relative z-10">
        <h2 className="text-2xl font-black tracking-tight text-white mb-1 drop-shadow-sm">
          Happy Lucky Draw
        </h2>
        <div className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-bold text-emerald-100">
          Diverse gifts · daily free spin
        </div>
      </div>

      {/* Live Winners Ticker */}
      <div className="bg-black/25 backdrop-blur-xs rounded-full px-3.5 py-1.5 mb-4 flex items-center gap-2 border border-white/10 text-xs relative z-10">
        <Megaphone size={14} className="text-amber-300 shrink-0" />
        <div className="overflow-hidden flex-1 whitespace-nowrap">
          <span className="text-emerald-100 font-semibold transition-opacity duration-300">
            {WINNERS_FEED[marqueeIndex]} &nbsp;·&nbsp; {WINNERS_FEED[(marqueeIndex + 1) % WINNERS_FEED.length]}
          </span>
        </div>
      </div>

      {/* 3x3 Spin Grid Card */}
      <div className="bg-[#042d15]/90 rounded-3xl p-3.5 sm:p-4 border border-emerald-400/25 shadow-2xl mb-4 relative z-10 backdrop-blur-xs">
        <div className="grid grid-cols-3 gap-2.5">
          {renderCell(0, 0)}
          {renderCell(0, 1)}
          {renderCell(0, 2)}

          {renderCell(1, 0)}
          {renderCell(1, 1)}
          {renderCell(1, 2)}

          {renderCell(2, 0)}
          {renderCell(2, 1)}
          {renderCell(2, 2)}
        </div>

        {/* Start Game Button */}
        <button
          onClick={handleStartSpin}
          disabled={isSpinning}
          className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg mt-4 active:scale-98 transition-all ${
            isSpinning || user.spinsLeft <= 0
              ? 'bg-emerald-900/60 text-emerald-300/60 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#16a34a] via-[#15803d] to-[#166534] hover:from-[#22c55e] hover:to-[#16a34a] text-white shadow-emerald-950/40 cursor-pointer'
          }`}
        >
          <Play size={16} className="fill-white" />
          <span>{isSpinning ? 'Spinning...' : 'Start Game'}</span>
        </button>
      </div>

      {/* Win Celebration Modal */}
      {winModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03190d]/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-3xl p-6 text-center text-slate-900 shadow-2xl animate-in zoom-in-95 border border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">
              {winModalData.amount > 0 ? 'You Won!' : 'Spin Result'}
            </h3>
            <p className="text-2xl font-black text-[#15803d] mb-2 font-mono">
              {winModalData.amount > 0 ? `+₹${winModalData.amount}` : 'Better Luck Next Time'}
            </p>
            <p className="text-xs text-slate-500 mb-5">
              {winModalData.amount > 0
                ? 'Your winnings have been credited to your available balance.'
                : 'Try again tomorrow with your next daily spin.'}
            </p>
            <button
              onClick={() => setWinModalData(null)}
              className="w-full py-3 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Great, Continue
            </button>
          </div>
        </div>
      )}

      {/* 2. Treasure Box Section */}
      <div className="bg-[#042d15]/90 rounded-3xl p-4 sm:p-5 border border-emerald-400/25 shadow-xl space-y-3.5 relative z-10 backdrop-blur-xs">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-base font-black text-white">
            <Gift size={18} className="text-amber-400" />
            <span>Treasure Box</span>
          </div>
          <p className="text-xs text-emerald-200/90 mt-0.5">
            Enter gift code from Telegram to win rewards
          </p>
        </div>

        {/* 3D Gift Graphic */}
        <div className="w-24 h-24 mx-auto flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            {/* Red Gift Box */}
            <rect x="20" y="38" width="60" height="50" rx="4" fill="#dc2626" />
            <rect x="16" y="30" width="68" height="12" rx="3" fill="#b91c1c" />
            {/* Gold Ribbon Vertical */}
            <rect x="44" y="30" width="12" height="58" fill="#fbbf24" />
            {/* Gold Ribbon Horizontal */}
            <rect x="20" y="58" width="60" height="10" fill="#fbbf24" />
            {/* Bow on top */}
            <ellipse cx="42" cy="24" rx="10" ry="6" fill="#f59e0b" transform="rotate(-20 42 24)" />
            <ellipse cx="58" cy="24" rx="10" ry="6" fill="#f59e0b" transform="rotate(20 58 24)" />
            <circle cx="50" cy="25" r="4" fill="#fbbf24" />
          </svg>
        </div>

        {/* Gift code input form */}
        <form onSubmit={handleRedeemGift} className="space-y-2.5">
          <div className="relative">
            <input
              type="text"
              value={giftInput}
              onChange={(e) => setGiftInput(e.target.value)}
              placeholder="Enter your gift code (e.g. AALAY50)"
              className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-emerald-200/60 text-xs font-semibold focus:outline-none focus:border-[#B2E500] focus:bg-white/15"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs tracking-wider uppercase shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Claim Now</span>
          </button>
        </form>

        {/* Hint to join telegram for codes */}
        <div className="text-center">
          <a
            href="https://t.me/aaley_official"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-emerald-200/90 hover:text-white transition-colors underline"
          >
            Get daily code from <b>Telegram channel</b>
          </a>
        </div>

        {/* Mini stats cards: TOTAL WON, BALANCE, CODES USED */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-2 text-center">
            <div className="text-xs font-black text-amber-300">
              ₹{totalWonTreasure}
            </div>
            <div className="text-[9px] uppercase font-bold text-emerald-200/80">
              TOTAL WON
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-2 text-center">
            <div className="text-xs font-black text-white">
              ₹{user.balance}
            </div>
            <div className="text-[9px] uppercase font-bold text-emerald-200/80">
              BALANCE
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-2 text-center">
            <div className="text-xs font-black text-emerald-200">
              {redeemedCodes.length}
            </div>
            <div className="text-[9px] uppercase font-bold text-emerald-200/80">
              CODES USED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
