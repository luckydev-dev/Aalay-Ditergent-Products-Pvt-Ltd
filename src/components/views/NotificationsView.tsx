import React from 'react';
import { Bell, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubHeader } from '../common/SubHeader';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead } = useApp();

  return (
    <div className="min-h-screen pb-24 bg-[#f4f7fb] max-w-md mx-auto">
      <SubHeader title="Notification Center" />

      <div className="p-4 space-y-3">
        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => markNotificationRead(item.id)}
            className={`bg-white rounded-3xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border transition-all cursor-pointer ${
              item.read ? 'border-slate-100' : 'border-blue-200 ring-2 ring-blue-50'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    item.read
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-blue-50 text-[#0047B3]'
                  }`}
                >
                  <Bell size={16} />
                </div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">
                  {item.title}
                </h4>
              </div>

              {!item.read && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
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
