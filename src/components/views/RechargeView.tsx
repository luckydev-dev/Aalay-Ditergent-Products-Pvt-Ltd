import React, { useState, useRef } from 'react';
import {
  Zap,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  ExternalLink,
  Loader2,
  Wallet,
  Copy,
  Check,
  Smartphone,
  X,
  Upload,
  Image as ImageIcon,
  Clock,
  ArrowRight,
  ArrowLeft,
  Info,
  CheckCircle,
  Eye,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubHeader } from '../common/SubHeader';

const QUICK_AMOUNTS = [
  { amount: 1, popular: false, tag: 'Test' },
  { amount: 10, popular: false },
  { amount: 100, popular: false },
  { amount: 290, popular: false },
  { amount: 700, popular: true, tag: 'Popular' },
  { amount: 1500, popular: false },
  { amount: 2850, popular: false },
  { amount: 5000, popular: false },
];

const DEFAULT_UPI_ID = '9510006797@superyes';

type StepNumber = 1 | 2 | 3;

export const RechargeView: React.FC = () => {
  const { user, rechargePresetAmount, setSubScreen, showToast, submitRechargeRequest, rechargeRequests } = useApp();

  // Multi-step state: 1 = Select Amount, 2 = Show QR & Pay, 3 = UTR & Screenshot
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);

  // Selected Deposit parameters
  const [selectedAmount, setSelectedAmount] = useState<number>(rechargePresetAmount || 700);
  const [customAmount, setCustomAmount] = useState<string>(String(rechargePresetAmount || 700));
  const [selectedChannel, setSelectedChannel] = useState<'Channel A (Instant UPI)' | 'Channel B (Direct QR)'>(
    'Channel A (Instant UPI)'
  );

  // Payment proof form state
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<{
    status: 'success' | 'pending' | 'error';
    message: string;
    utr?: string;
    amount?: number;
  } | null>(null);

  // Preview screenshot modal
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic UPI string
  const upiPayString = `upi://pay?pa=${DEFAULT_UPI_ID}&pn=Pidilite%20Merchant&am=${selectedAmount}&cu=INR&tn=Recharge_${user.phone}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    upiPayString
  )}&margin=10`;

  // Quick amount click
  const handleSelectQuick = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount(String(amt));
  };

  // Custom amount input
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    setSelectedAmount(Number(val) || 0);
  };

  // Copy UPI ID helper
  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(DEFAULT_UPI_ID);
    setCopiedUpi(true);
    showToast('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Handle image upload & convert to Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (JPG, PNG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size exceeds 10MB limit. Please upload a smaller screenshot.');
      return;
    }

    setScreenshotFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setScreenshotData(result);
      showToast('Payment screenshot attached successfully');
    };
    reader.onerror = () => {
      showToast('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  // Trigger file browser
  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  // Clear uploaded screenshot
  const handleClearScreenshot = () => {
    setScreenshotData(null);
    setScreenshotFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Trigger payment via UPI Intent
  const handleOpenUpiApp = () => {
    if (selectedAmount < 1) {
      showToast('Minimum deposit amount is ₹1');
      return;
    }
    window.location.href = upiPayString;
  };

  // Move from Step 1 to Step 2
  const handleGoToQrStep = () => {
    if (selectedAmount < 1) {
      showToast('Please select or enter an amount (minimum ₹1)');
      return;
    }
    setCurrentStep(2);
    setSubmissionResult(null);
  };

  // Move from Step 2 to Step 3
  const handleGoToUtrStep = () => {
    setCurrentStep(3);
    setSubmissionResult(null);
  };

  // Submit payment proof (Step 3)
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAmount < 1) {
      showToast('Please specify a valid recharge amount (minimum ₹1)');
      return;
    }

    const cleanUtr = utrNumber.trim().replace(/\s+/g, '');
    if (!cleanUtr || cleanUtr.length < 6) {
      showToast('Please enter a valid 12-digit UPI UTR / Reference number');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const res = await submitRechargeRequest({
        amount: selectedAmount,
        utr: cleanUtr,
        screenshotUrl: screenshotData || undefined,
        channel: selectedChannel,
      });

      if (res.autoVerified) {
        setSubmissionResult({
          status: 'success',
          message: res.message || `Payment verified automatically! ₹${selectedAmount} credited to your wallet.`,
          utr: cleanUtr,
          amount: selectedAmount,
        });
        setUtrNumber('');
        handleClearScreenshot();
      } else {
        setSubmissionResult({
          status: 'pending',
          message:
            res.message ||
            'Payment proof submitted successfully! Our admin dashboard will verify and credit your balance.',
          utr: cleanUtr,
          amount: selectedAmount,
        });
        setUtrNumber('');
        handleClearScreenshot();
      }
    } catch (err: any) {
      setSubmissionResult({
        status: 'error',
        message: err.message || 'Submission failed. Please try again.',
      });
      showToast('Error submitting payment proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter requests belonging to this user
  const myRequests = rechargeRequests.filter(
    (r) => r.uid === user.uid || r.userPhone === user.phone
  );

  return (
    <div className="min-h-screen bg-[#070e1e] text-slate-100 pb-24">
      {/* Top Header */}
      <SubHeader
        title="Recharge Wallet"
        onBack={() => {
          if (currentStep > 1 && !submissionResult) {
            setCurrentStep((prev) => (prev - 1) as StepNumber);
          } else {
            setSubScreen('none');
          }
        }}
      />

      <div className="max-w-md mx-auto px-4 pt-3 space-y-4">
        {/* User Balance Banner */}
        <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-4 shadow-lg shadow-blue-950/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold mb-1">
                <Wallet size={14} />
                <span>Current Balance</span>
              </div>
              <div className="text-2xl font-black text-white tracking-tight">
                ₹{user.balance.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-amber-500/20 text-amber-400 text-[11px] font-black rounded-lg border border-amber-500/30">
                {user.vipLevel || 'VIP1'}
              </span>
              <div className="text-[10px] text-slate-400 mt-1 font-medium">User: {user.phone}</div>
            </div>
          </div>
        </div>

        {/* 3-STEP PROGRESS INDICATOR */}
        <div className="bg-[#0b162c] border border-slate-800 rounded-2xl p-3 shadow-sm">
          <div className="flex items-center justify-between relative">
            {/* Step 1 Indicator */}
            <button
              type="button"
              onClick={() => {
                if (!isSubmitting) setCurrentStep(1);
              }}
              className="flex flex-col items-center gap-1.5 z-10 flex-1 cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  currentStep === 1
                    ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-md shadow-blue-600/40'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {currentStep > 1 ? <Check size={14} /> : '1'}
              </div>
              <span
                className={`text-[11px] font-bold ${
                  currentStep === 1 ? 'text-blue-400 font-black' : currentStep > 1 ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                Amount
              </span>
            </button>

            {/* Connecting Line 1-2 */}
            <div
              className={`h-0.5 flex-1 -mt-5 transition-colors ${
                currentStep > 1 ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            />

            {/* Step 2 Indicator */}
            <button
              type="button"
              onClick={() => {
                if (!isSubmitting && selectedAmount >= 1) setCurrentStep(2);
              }}
              className="flex flex-col items-center gap-1.5 z-10 flex-1 cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  currentStep === 2
                    ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-md shadow-blue-600/40'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {currentStep > 2 ? <Check size={14} /> : '2'}
              </div>
              <span
                className={`text-[11px] font-bold ${
                  currentStep === 2 ? 'text-blue-400 font-black' : currentStep > 2 ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                UPI QR
              </span>
            </button>

            {/* Connecting Line 2-3 */}
            <div
              className={`h-0.5 flex-1 -mt-5 transition-colors ${
                currentStep > 2 ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            />

            {/* Step 3 Indicator */}
            <button
              type="button"
              onClick={() => {
                if (!isSubmitting && selectedAmount >= 1) setCurrentStep(3);
              }}
              className="flex flex-col items-center gap-1.5 z-10 flex-1 cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  currentStep === 3
                    ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-md shadow-blue-600/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                3
              </div>
              <span
                className={`text-[11px] font-bold ${
                  currentStep === 3 ? 'text-blue-400 font-black' : 'text-slate-400'
                }`}
              >
                UTR & Proof
              </span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* STEP 1: SELECT AMOUNT & CHANNEL */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Amount Selection Card */}
            <div className="bg-[#0b162c] border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  Select Recharge Amount
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Min: ₹1</span>
              </div>

              {/* Quick Amounts Grid */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {QUICK_AMOUNTS.map((item) => (
                  <button
                    key={item.amount}
                    type="button"
                    onClick={() => handleSelectQuick(item.amount)}
                    className={`py-2.5 px-2 rounded-xl text-center font-bold transition-all relative ${
                      selectedAmount === item.amount
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400 font-black'
                        : 'bg-[#111f3d] text-slate-300 hover:bg-[#16274e] border border-slate-800'
                    }`}
                  >
                    {item.tag && (
                      <span
                        className={`absolute -top-1.5 -right-1 text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                          item.tag === 'Popular' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                        }`}
                      >
                        {item.tag}
                      </span>
                    )}
                    <div className="text-xs">₹{item.amount.toLocaleString('en-IN')}</div>
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₹</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customAmount}
                  onChange={handleCustomChange}
                  placeholder="Enter custom amount"
                  className="w-full bg-[#111f3d] border border-slate-800 focus:border-blue-500 rounded-xl py-2.5 pl-8 pr-3 text-white text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Payment Channel Card */}
            <div className="bg-[#0b162c] border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Payment Channel
                </h3>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck size={13} /> High Success Rate
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChannel('Channel A (Instant UPI)')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedChannel === 'Channel A (Instant UPI)'
                      ? 'border-blue-500 bg-blue-950/40 text-white'
                      : 'border-slate-800 bg-[#111f3d] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-400" /> Channel A
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">UPI QR + All Apps</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel('Channel B (Direct QR)')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedChannel === 'Channel B (Direct QR)'
                      ? 'border-blue-500 bg-blue-950/40 text-white'
                      : 'border-slate-800 bg-[#111f3d] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <QrCode size={14} className="text-blue-400" /> Channel B
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Direct UPI Transfer</div>
                </button>
              </div>
            </div>

            {/* STEP 1 NEXT BUTTON */}
            <button
              type="button"
              onClick={handleGoToQrStep}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>Next: View UPI QR & Pay (₹{selectedAmount.toLocaleString('en-IN')})</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: SHOW QR CODE & UPI DETAILS WITH NEXT BUTTON */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Amount Summary Chip */}
            <div className="bg-[#111f3d] border border-blue-500/30 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Selected Amount</span>
                <div className="text-lg font-black text-white">₹{selectedAmount.toLocaleString('en-IN')}</div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-2.5 py-1 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-950/60 rounded-lg border border-blue-800/60"
              >
                Change Amount
              </button>
            </div>

            {/* QR Card */}
            <div className="bg-[#0b162c] border border-blue-500/40 rounded-2xl p-4 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Scan QR or Pay via UPI
                </h3>
                <span className="text-sm font-black text-amber-400 font-mono">
                  ₹{selectedAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Dynamic QR Display */}
              <div className="flex flex-col items-center justify-center bg-[#070e1e] border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-medium text-slate-300 mb-2">Scan with ANY UPI App to Pay</div>
                <div className="p-2 bg-white rounded-xl shadow-lg shadow-black/40">
                  <img
                    src={qrCodeUrl}
                    alt="UPI Payment QR Code"
                    className="w-44 h-44 object-contain rounded"
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5 flex-wrap justify-center">
                  <span className="text-emerald-400 font-bold">PhonePe</span> • 
                  <span className="text-blue-400 font-bold">Google Pay</span> • 
                  <span className="text-cyan-400 font-bold">Paytm</span> • 
                  <span className="text-orange-400 font-bold">BHIM</span> • 
                  <span>Cred</span>
                </div>
              </div>

              {/* UPI ID with Copy Button */}
              <div className="bg-[#111f3d] border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Official UPI ID</div>
                  <div className="text-sm font-mono font-bold text-white truncate">{DEFAULT_UPI_ID}</div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpiId}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    copiedUpi
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                  }`}
                >
                  {copiedUpi ? (
                    <>
                      <Check size={13} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy UPI</span>
                    </>
                  )}
                </button>
              </div>

              {/* 1-Click Pay with UPI App (Mobile App Launch) */}
              <button
                type="button"
                onClick={handleOpenUpiApp}
                className="w-full py-3 bg-[#111f3d] hover:bg-[#16274e] border border-blue-500/40 text-blue-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Smartphone size={15} />
                <span>Open in PhonePe / GPay / Paytm</span>
                <ExternalLink size={13} className="opacity-70" />
              </button>
            </div>

            {/* Instruction Tip */}
            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-200/90 flex items-start gap-2">
              <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">Next Step:</span> After transferring ₹{selectedAmount}, copy the 12-digit UTR/Ref number and take a screenshot of the payment receipt.
              </div>
            </div>

            {/* STEP 2 BUTTONS: BACK & NEXT */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleGoToUtrStep}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>I Have Paid → Next: Enter UTR</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: UTR AND SCREENSHOT THEN SUBMIT */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <form onSubmit={handleSubmitProof} className="space-y-4 animate-in fade-in duration-200">
            {/* Amount Summary Chip */}
            <div className="bg-[#111f3d] border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Transfer Amount</span>
                <div className="text-lg font-black text-amber-400 font-mono">₹{selectedAmount.toLocaleString('en-IN')}</div>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1"
              >
                <QrCode size={12} />
                <span>View QR Again</span>
              </button>
            </div>

            <div className="bg-[#0b162c] border border-amber-500/40 rounded-2xl p-4 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  Enter UTR & Screenshot
                </h3>
                <span className="text-[11px] text-amber-400 font-semibold">Final Step</span>
              </div>

              {/* 12-Digit UTR Number Input */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  12-Digit UTR / UPI Ref Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9A-Za-z]/g, ''))}
                  placeholder="e.g. 412384759281"
                  maxLength={22}
                  className="w-full bg-[#111f3d] border border-slate-800 focus:border-amber-400 rounded-xl py-3 px-3.5 text-white font-mono text-base tracking-wider focus:outline-none focus:ring-1 focus:ring-amber-400"
                  required
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <Info size={12} className="text-amber-400 shrink-0" />
                  <span>Look for the 12-digit number labeled "UTR", "UPI Ref No", or "Google Transaction ID".</span>
                </p>
              </div>

              {/* Payment Screenshot Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Upload Payment Screenshot <span className="text-slate-400 font-normal">(Recommended)</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                {!screenshotData ? (
                  <div
                    onClick={handlePickFile}
                    className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition-all bg-[#070e1e]/60 hover:bg-[#111f3d]/60 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Upload size={18} />
                    </div>
                    <div className="text-xs font-bold text-slate-200">Click to upload payment screenshot</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, JPEG up to 10MB</div>
                  </div>
                ) : (
                  <div className="bg-[#111f3d] border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        onClick={() => setPreviewModalImg(screenshotData)}
                        className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 shrink-0 cursor-pointer relative group"
                      >
                        <img
                          src={screenshotData}
                          alt="Screenshot"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye size={14} className="text-white" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{screenshotFileName || 'Payment Screenshot'}</div>
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 size={11} /> Attached ready to submit
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handlePickFile}
                        className="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleClearScreenshot}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submission Feedback Result Banner */}
              {submissionResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-medium space-y-1 ${
                    submissionResult.status === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : submissionResult.status === 'pending'
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {submissionResult.status === 'success' && <CheckCircle className="text-emerald-400 shrink-0" size={16} />}
                    {submissionResult.status === 'pending' && <Clock className="text-amber-400 shrink-0" size={16} />}
                    {submissionResult.status === 'error' && <AlertCircle className="text-rose-400 shrink-0" size={16} />}
                    <span>
                      {submissionResult.status === 'success'
                        ? 'Payment Verified & Credited!'
                        : submissionResult.status === 'pending'
                        ? 'Proof Submitted for Admin Approval'
                        : 'Submission Failed'}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">{submissionResult.message}</p>
                  {submissionResult.utr && (
                    <div className="text-[11px] font-mono text-slate-400 pt-1">
                      Submitted UTR: <span className="text-white font-bold">{submissionResult.utr}</span>
                    </div>
                  )}
                  {submissionResult.status === 'success' && (
                    <button
                      type="button"
                      onClick={() => setSubScreen('none')}
                      className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                    >
                      Return to Dashboard
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* STEP 3 BUTTONS: BACK & SUBMIT */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Proof...</span>
                  </>
                ) : (
                  <>
                    <FileCheck size={16} />
                    <span>Submit Payment Proof & Verify</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* User's Recent Recharge History */}
        {myRequests.length > 0 && (
          <div className="bg-[#0b162c] border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock size={13} className="text-blue-400" />
                <span>My Recent Recharge Requests</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-bold">{myRequests.length} submitted</span>
            </div>

            <div className="space-y-2">
              {myRequests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  className="bg-[#111f3d] border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">₹{req.amount}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          req.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : req.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {req.status === 'approved'
                          ? 'Approved ✓'
                          : req.status === 'rejected'
                          ? 'Rejected ✗'
                          : 'Pending Approval ⏳'}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">UTR: {req.utr}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{req.date}</div>
                  </div>

                  {req.screenshotUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewModalImg(req.screenshotUrl || null)}
                      className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 shrink-0"
                    >
                      <img
                        src={req.screenshotUrl}
                        alt="Proof"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security & Support Guarantee */}
        <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-300">Pidilite Secure Payment Guarantee:</span> If your payment is not credited automatically, our admin team verifies the submitted UTR and credits your wallet within 1-3 minutes.
          </div>
        </div>
      </div>

      {/* Full Screenshot Preview Modal */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewModalImg(null)}
        >
          <div
            className="max-w-md w-full bg-[#0b162c] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon size={14} className="text-blue-400" /> Payment Screenshot
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-auto flex items-center justify-center bg-black/60">
              <img
                src={previewModalImg}
                alt="Full Proof"
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
