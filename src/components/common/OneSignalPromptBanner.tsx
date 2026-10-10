import React, { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { requestOneSignalPushPermission } from '../../services/onesignal';
import { useApp } from '../../context/AppContext';

export const OneSignalPromptBanner: React.FC = () => {
  const { user, showToast } = useApp();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    // Only proceed if user is logged in
    if (!user || !user.isLoggedIn) {
      setIsVisible(false);
      return;
    }

    // Check if user already granted permission or dismissed the prompt
    const dismissed = localStorage.getItem('onesignal_prompt_dismissed');
    if (dismissed === 'true') {
      return;
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        return;
      }
    }

    // Delay showing prompt by 5 seconds after login/register
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission !== 'granted') {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [user?.isLoggedIn]);

  const handleAllowNotifications = async () => {
    setIsSubmitting(true);
    try {
      const granted = await requestOneSignalPushPermission();
      if (granted) {
        showToast('Push notifications enabled for daily rewards!');
      } else {
        showToast('Notification permission checked.');
      }
      localStorage.setItem('onesignal_prompt_dismissed', 'true');
      setIsVisible(false);
    } catch (e) {
      localStorage.setItem('onesignal_prompt_dismissed', 'true');
      setIsVisible(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('onesignal_prompt_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9990] w-full max-w-sm px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white border border-slate-200 rounded-3xl p-4.5 shadow-2xl text-slate-900 relative overflow-hidden">
        {/* Ambient Subtle Accent Glow */}
        <div className="absolute -top-10 -left-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer"
          aria-label="Dismiss notification prompt"
        >
          <X size={15} />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#15803d] to-[#16a34a] flex items-center justify-center text-white font-black shrink-0 shadow-md shadow-emerald-900/15">
            <Bell size={22} className="stroke-[2.2]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs font-extrabold text-slate-900 tracking-tight">Enable Push Alerts</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#15803d] font-black text-[9px] uppercase">
                Instant Updates
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Get notified immediately when daily income arrives, withdrawals approve, or gift bonus drops!
            </p>

            <div className="flex items-center gap-2 mt-3.5">
              <button
                onClick={handleAllowNotifications}
                disabled={isSubmitting}
                className="flex-1 py-2 px-3 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/15 cursor-pointer active:scale-95"
              >
                <Check size={14} className="stroke-[3]" />
                <span>{isSubmitting ? 'Enabling...' : 'Allow Notifications'}</span>
              </button>

              <button
                onClick={handleDismiss}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

