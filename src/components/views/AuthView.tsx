import React, { useState } from 'react';
import { Phone, Lock, Eye, EyeOff, User, UserPlus, CheckSquare, Square } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HeroFactoryBanner } from '../common/HeroFactoryBanner';

export const AuthView: React.FC = () => {
  const { login, register, showToast, setShowWelcomeModal } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states - pristine and empty for real user entry
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      showToast('Please agree to the Terms & Conditions');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegister) {
        if (!nickname.trim()) {
          showToast('Please enter a nickname');
          setIsLoading(false);
          return;
        }
        if (!password || password.length < 6) {
          showToast('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          showToast('Passwords do not match');
          setIsLoading(false);
          return;
        }

        // Strict pre-check: disallow registering if mobile number exists
        try {
          const stored = localStorage.getItem('aaley_all_registered_users');
          if (stored) {
            const list = JSON.parse(stored);
            const exists = list.some((u: any) => u.phone === cleanPhone);
            if (exists) {
              showToast('This mobile number is already registered. Please login.');
              setIsRegister(false); // Switch to login tab for user convenience
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {}

        const success = await register(cleanPhone, nickname, password, inviteCode);
        if (success) {
          setShowWelcomeModal(true);
        }
      } else {
        await login(cleanPhone, nickname || 'Lucky', password);
      }
    } catch (err: any) {
      showToast(err?.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] max-w-md mx-auto relative flex flex-col justify-between select-none">
      {/* 1. Hero Factory Banner */}
      <div className="relative">
        <HeroFactoryBanner
          onLanguageToggle={() => showToast('Language: English')}
          currentLang="ENG"
        />
      </div>

      {/* 2. Overlapping Curved White Sheet Card */}
      <div className="flex-1 bg-white rounded-t-[32px] px-6 pt-6 pb-8 -mt-6 relative z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs font-medium text-slate-400 mt-1">
              {isRegister
                ? 'Sign up in seconds and start today'
                : 'Login to continue your journey'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {/* If Register: Nickname */}
            {isRegister && (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Nickname"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0047B3] focus:bg-white transition-all placeholder-slate-400"
                />
              </div>
            )}

            {/* Phone Number Field */}
            <div className="relative flex items-center">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Phone size={17} />
              </span>
              <span className="absolute left-10 top-1/2 -translate-y-1/2 text-xs font-black text-slate-700 pr-2 border-r border-slate-200">
                +91
              </span>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter Phone Number"
                className="w-full pl-22 pr-4 py-3.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0047B3] focus:bg-white transition-all placeholder-slate-400 tracking-wide font-mono"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock size={17} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? 'Create New Pass' : 'Enter your Pass'}
                className="w-full pl-11 pr-11 py-3.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0047B3] focus:bg-white transition-all placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0047B3] hover:text-blue-800"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* If Register: Confirm Password */}
            {isRegister && (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={17} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Pass"
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0047B3] focus:bg-white transition-all placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0047B3] hover:text-blue-800"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {/* If Register: Invitation Code */}
            {isRegister && (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <UserPlus size={17} />
                </span>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter Invitation Code"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0047B3] focus:bg-white transition-all placeholder-slate-400"
                />
              </div>
            )}

            {/* Checkbox agreement */}
            <div
              onClick={() => setAgreeTerms(!agreeTerms)}
              className="flex items-center gap-2 pt-1 cursor-pointer select-none text-xs text-slate-600"
            >
              {agreeTerms ? (
                <div className="w-4 h-4 rounded bg-[#0047B3] flex items-center justify-center text-white shrink-0">
                  <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-current stroke-[3] fill-none">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              ) : (
                <div className="w-4 h-4 rounded border border-slate-300 bg-white shrink-0" />
              )}
              <span className="text-[11px] leading-tight">
                {isRegister
                  ? 'I have agree to the '
                  : 'By logging in you agree to the '}
                <span className="font-bold text-[#0047B3] underline">
                  Terms & Conditions
                </span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0047B3] to-[#0055d4] hover:from-[#003894] hover:to-[#0047B3] active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none text-white font-black text-sm tracking-wide shadow-lg shadow-blue-900/20 transition-all mt-4 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isRegister ? 'Creating Account...' : 'Connecting...'}</span>
                </>
              ) : (
                <span>{isRegister ? 'Register Now' : 'Login Now'}</span>
              )}
            </button>
          </form>
        </div>

        {/* Toggle between Login and Register */}
        <div className="text-center pt-6 pb-2 text-xs text-slate-500 font-medium">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="font-bold text-[#0047B3] hover:underline ml-1"
              >
                Login
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="font-bold text-[#0047B3] hover:underline ml-1"
              >
                Register
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
