import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  CreditCard,
  Zap,
  Info,
  Loader2,
  History,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const QUICK_AMOUNTS = [
  { amount: 290, popular: false },
  { amount: 700, popular: true, tag: 'Popular' },
  { amount: 900, popular: false },
  { amount: 1500, popular: false },
  { amount: 2100, popular: false },
  { amount: 2850, popular: false },
  { amount: 3299, popular: false },
  { amount: 5000, popular: false },
];

interface RechargeViewProps {
  initialTab?: 'recharge' | 'history';
}

export const RechargeView: React.FC<RechargeViewProps> = ({ initialTab = 'recharge' }) => {
  const { user, rechargePresetAmount, setSubScreen, showToast, rechargeRequests } = useApp();

  const [activeTab, setActiveTab] = useState<'recharge' | 'history'>(initialTab);
  const [selectedAmount, setSelectedAmount] = useState<number>(rechargePresetAmount && rechargePresetAmount >= 290 ? rechargePresetAmount : 700);
  const [customAmount, setCustomAmount] = useState<string>(
    String(rechargePresetAmount && rechargePresetAmount >= 290 ? rechargePresetAmount : 700)
  );
  const [selectedChannel, setSelectedChannel] = useState<'A' | 'B'>('A');
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  // Check callback redirect parameters upon returning from Rupayex
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const rStatus = searchParams.get('recharge_status');
      const orderId = searchParams.get('order_id');
      if (rStatus === 'SUCCESS' || window.location.hash.includes('deposit-history')) {
        setActiveTab('history');
        if (orderId) {
          showToast(`Rupayex Payment completed for order ${orderId}!`);
        }
      }
    }
  }, [showToast]);

  const handleSelectQuick = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount(String(amt));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    setSelectedAmount(Number(val) || 0);
  };

  // 1-Click Pay via Rupayex Gateway (Direct Redirect to checkout)
  const handlePayViaRupayex = async () => {
    if (selectedAmount < 290) {
      showToast('Minimum deposit amount is ₹290.');
      return;
    }

    setIsCreatingOrder(true);
    showToast('Redirecting to payment gateway...');

    try {
      const res = await fetch('/api/rupayex/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedAmount,
          customer_mobile: user.phone,
          remark1: `Channel${selectedChannel}_${user.phone}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.status) {
        showToast(data.error || 'Failed to initialize payment order. Please try again.');
        setIsCreatingOrder(false);
        return;
      }

      const checkoutUrl = data.payment_url || data.checkout_url || data.url;
      const orderId = data.order_id;

      // Track order in pending storage for background auto-polling
      try {
        localStorage.setItem(
          'pending_rupayex_recharge',
          JSON.stringify({
            amount: selectedAmount,
            orderRef: orderId,
            channel: `Rupayex (Channel ${selectedChannel})`,
            createdAt: Date.now(),
          })
        );
      } catch (e) {}

      // Direct redirection to checkout page (NO modal or dialogs)
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        showToast('Payment link not received. Please try again.');
        setIsCreatingOrder(false);
      }
    } catch (err: any) {
      showToast(`Gateway connection error: ${err.message}`);
      setIsCreatingOrder(false);
    }
  };

  // User's deposits
  const myRequests = rechargeRequests.filter(
    (r) => r.uid === user.uid || r.userPhone === user.phone
  );

  const filteredHistory = myRequests.filter((r) => {
    if (historyFilter === 'all') return true;
    return r.status === historyFilter;
  });

  return (
    <div className="min-h-screen bg-[#f0f4f9] text-slate-900 pb-28 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ============================================================ */}
      {/* TOP BLUE HEADER                                              */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-b from-[#003b95] via-[#003584] to-[#042d70] text-white pt-3 pb-8 px-4 rounded-b-[36px] shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'history') {
                setActiveTab('recharge');
              } else {
                setSubScreen('none');
              }
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={22} className="stroke-[2.5]" />
          </button>

          <h1 className="text-lg font-extrabold tracking-wide text-white">
            {activeTab === 'history' ? 'Deposit History' : 'Recharge'}
          </h1>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'recharge' ? 'history' : 'recharge')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title={activeTab === 'history' ? 'Recharge' : 'History'}
          >
            <History size={20} />
          </button>
        </div>

        {/* Wallet Balance Pill & Amount */}
        <div className="flex flex-col items-center justify-center text-center relative z-10 pt-1 pb-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold tracking-wider uppercase backdrop-blur-xs shadow-xs mb-2">
            <CreditCard size={13} className="text-white stroke-[2.5]" />
            <span>WALLET BALANCE</span>
          </div>

          <div className="text-4xl font-black text-white tracking-tight flex items-baseline justify-center">
            <span className="font-extrabold mr-1">₹</span>
            <span>{user.balance.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BODY CONTENT (EXACT RECHARGE PAGE AS IN SCREENSHOTS)        */}
      {/* ============================================================ */}
      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4 relative z-20">
        {activeTab === 'recharge' ? (
          <>
            {/* CARD 1: ENTER AMOUNT & QUICK AMOUNTS */}
            <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-slate-900">Enter amount</span>
                <span className="text-xs text-slate-400 font-medium">Tap a quick amount below</span>
              </div>

              {/* Amount Display / Input Box */}
              <div className="bg-[#f0f4f9] rounded-2xl p-4 flex items-center shadow-inner">
                <span className="text-2xl font-extrabold text-slate-900 mr-2 select-none">₹</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customAmount}
                  onChange={handleCustomChange}
                  placeholder="290"
                  className="bg-transparent text-3xl font-black text-slate-900 w-full focus:outline-none tracking-tight"
                />
              </div>

              {/* Quick Amount Buttons (2 rows x 4 cols) */}
              <div className="grid grid-cols-4 gap-2.5 pt-1">
                {QUICK_AMOUNTS.map((item) => {
                  const isSelected = selectedAmount === item.amount;
                  return (
                    <button
                      key={item.amount}
                      type="button"
                      onClick={() => handleSelectQuick(item.amount)}
                      className={`relative py-3 px-1 rounded-2xl text-center font-extrabold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#003b95] text-white shadow-md shadow-[#003b95]/30'
                          : 'bg-[#f0f4f9] text-slate-800 hover:bg-[#e4ecf7] border border-slate-200/50'
                      }`}
                    >
                      {item.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full bg-[#f44336] text-white text-[9px] font-black uppercase shadow-xs whitespace-nowrap">
                          {item.tag || 'Popular'}
                        </span>
                      )}
                      <span>₹{item.amount.toLocaleString('en-IN')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CARD 2: PAYMENT METHOD (CHANNEL A & CHANNEL B) */}
            <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 space-y-3">
              <h3 className="text-base font-extrabold text-slate-900 mb-1">Payment method</h3>

              {/* Channel A */}
              <div
                onClick={() => setSelectedChannel('A')}
                className={`rounded-2xl p-3.5 flex items-center gap-3 transition-all cursor-pointer ${
                  selectedChannel === 'A'
                    ? 'border-2 border-[#003b95] bg-[#edf3fc]'
                    : 'border border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Radio Button */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedChannel === 'A' ? 'border-[#003b95]' : 'border-slate-300'
                  }`}
                >
                  {selectedChannel === 'A' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#003b95]" />
                  )}
                </div>

                {/* Channel Icon */}
                <div className="w-11 h-11 rounded-2xl bg-[#003b95] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Zap size={20} className="fill-white text-white" />
                </div>

                {/* Channel Labels */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-slate-900 tracking-tight">CHANNEL A</div>
                  <div className="text-xs text-slate-400 font-medium">Instant UPI / Card / NetBanking</div>
                </div>
              </div>

              {/* Channel B */}
              <div
                onClick={() => setSelectedChannel('B')}
                className={`rounded-2xl p-3.5 flex items-center gap-3 transition-all cursor-pointer ${
                  selectedChannel === 'B'
                    ? 'border-2 border-[#003b95] bg-[#edf3fc]'
                    : 'border border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Radio Button */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedChannel === 'B' ? 'border-[#003b95]' : 'border-slate-300'
                  }`}
                >
                  {selectedChannel === 'B' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#003b95]" />
                  )}
                </div>

                {/* Channel Icon */}
                <div className="w-11 h-11 rounded-2xl bg-[#003b95] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Zap size={20} className="fill-white text-white" />
                </div>

                {/* Channel Labels */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-slate-900 tracking-tight">CHANNEL B</div>
                  <div className="text-xs text-slate-400 font-medium">Instant UPI / Card / NetBanking</div>
                </div>
              </div>
            </div>

            {/* CARD 3: HOW IT WORKS */}
            <div className="bg-white rounded-[28px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-[#003b95] text-white flex items-center justify-center">
                  <Info size={13} className="stroke-[3]" />
                </div>
                <span className="text-sm font-extrabold text-slate-900">How it works</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {/* Step 1 */}
                <div className="py-2.5 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#edf3fc] text-[#003b95] text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <span className="text-slate-600 font-semibold leading-relaxed">
                    Minimum deposit amount is ₹290.
                  </span>
                </div>

                {/* Step 2 */}
                <div className="py-2.5 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#edf3fc] text-[#003b95] text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <span className="text-slate-600 font-semibold leading-relaxed">
                    Pay and submit within the given time window.
                  </span>
                </div>

                {/* Step 3 */}
                <div className="py-2.5 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#edf3fc] text-[#003b95] text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <span className="text-slate-600 font-semibold leading-relaxed">
                    Your balance is credited automatically once payment is confirmed.
                  </span>
                </div>

                {/* Step 4 */}
                <div className="py-2.5 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#edf3fc] text-[#003b95] text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <span className="text-slate-600 font-semibold leading-relaxed">
                    For any payment issue, contact customer support.
                  </span>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* FIXED BOTTOM ACTION BUTTON: "↑ Continue ₹[selectedAmount]"   */}
            {/* ============================================================ */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 z-40 max-w-md mx-auto">
              <button
                type="button"
                onClick={handlePayViaRupayex}
                disabled={isCreatingOrder || selectedAmount < 290}
                className="w-full py-4 rounded-2xl bg-[#003b95] hover:bg-[#002f78] active:scale-[0.98] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#003b95]/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-white" />
                    <span>Connecting to Gateway...</span>
                  </>
                ) : (
                  <>
                    <ArrowUp size={18} className="stroke-[3]" />
                    <span>Continue ₹{selectedAmount.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* DEPOSIT HISTORY TAB */
          <div className="space-y-3 pt-2">
            <div className="bg-white rounded-2xl p-3 border border-slate-100 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(['all', 'approved', 'pending', 'rejected'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setHistoryFilter(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer ${
                      historyFilter === s
                        ? 'bg-[#003b95] text-white shadow-xs font-black'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('recharge')}
                className="px-3 py-1.5 bg-blue-50 text-[#003b95] rounded-xl text-xs font-bold shrink-0 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                + New Deposit
              </button>
            </div>

            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-700 block">
                      Ref: {item.id}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                      item.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-600'
                        : item.status === 'rejected'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {item.status === 'approved' && <CheckCircle size={11} />}
                    {item.status === 'rejected' && <XCircle size={11} />}
                    {item.status === 'pending' && <Clock size={11} />}
                    <span>{item.status === 'approved' ? 'Credited' : item.status}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400">Method</div>
                    <div className="text-xs font-bold text-slate-800">
                      {item.channel || 'Rupayex Gateway'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Amount</div>
                    <div className="text-lg font-black text-[#003b95]">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredHistory.length === 0 && (
              <div className="bg-white rounded-3xl p-10 text-center space-y-3 border border-slate-100 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <History size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Deposit History</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {historyFilter === 'all'
                    ? 'No deposit transactions recorded yet.'
                    : `No deposits found matching "${historyFilter}".`}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('recharge')}
                  className="px-5 py-2.5 rounded-xl bg-[#003b95] text-white font-bold text-xs shadow-md shadow-blue-900/15 transition-all cursor-pointer"
                >
                  Make a Deposit
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
