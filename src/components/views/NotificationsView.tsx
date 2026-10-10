import React from 'react';
import { Bell, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubHeader } from '../common/SubHeader';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead } = useApp();

  const [isPushOptedIn, setIsPushOptedIn] = React.useState<boolean>(false);
  const [isEnablingPush, setIsEnablingPush] = React.useState<boolean>(false);

  React.useEffect(() => {
    import('../../services/onesignal').then(({ getOneSignalSubscriptionStatus }) => {
      getOneSignalSubscriptionStatus().then(setIsPushOptedIn);
    });
  }, []);

  const handleEnablePush = async () => {
    setIsEnablingPush(true);
    try {
      const { requestOneSignalPushPermission } = await import('../../services/onesignal');
      const granted = await requestOneSignalPushPermission();
      setIsPushOptedIn(granted);
    } finally {
      setIsEnablingPush(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-[#f4f7fb] max-w-md mx-auto">
      <SubHeader title="Notification Center" />

      {/* OneSignal Web Push Permission Action Card */}
      <div className="px-4 pt-3">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-4 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Bell size={20} className="text-white" />
            </div>
            <div>
              <h4 className="text-xs font-black">
                {isPushOptedIn ? 'Live Push Notifications Active' : 'Enable Instant Push Notifications'}
              </h4>
              <p className="text-[11px] text-emerald-100 leading-tight mt-0.5">
                {isPushOptedIn
                  ? 'You will receive payout and daily income alerts instantly.'
                  : 'Get instant phone and browser alerts for returns and bonuses.'}
              </p>
            </div>
          </div>

          {!isPushOptedIn && (
            <button
              type="button"
              onClick={handleEnablePush}
              disabled={isEnablingPush}
              className="px-3.5 py-2 rounded-xl bg-white text-emerald-800 font-black text-xs shadow-sm hover:bg-emerald-50 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              {isEnablingPush ? 'Enabling...' : 'Enable'}
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => markNotificationRead(item.id)}
            className={`bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border transition-all cursor-pointer ${
              item.read ? 'border-slate-100' : 'border-emerald-300 ring-2 ring-emerald-50'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    item.read
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-emerald-50 text-[#15803d]'
                  }`}
                >
                  <Bell size={16} />
                </div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">
                  {item.title}
                </h4>
              </div>

              {!item.read && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pl-10 pr-2">
              {item.content}
            </p>

            <div className="text-[10px] text-slate-400 font-medium pl-10 mt-2">
              {item.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
