import React, { useState } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export const LiveChatModal: React.FC = () => {
  const { showLiveChat, setShowLiveChat, user } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: `Hello ${user.name}! Welcome to Pidilite 24x7 Support. How can we help you today with your account, recharge, or withdrawal?`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');

  if (!showLiveChat) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    // Automated smart agent response
    setTimeout(() => {
      let reply = 'Thank you for reaching out! Our financial support team is available 24/7. Your query has been logged.';
      const lower = userText.toLowerCase();

      if (lower.includes('recharge') || lower.includes('deposit')) {
        reply = 'Recharge is instant via Channel A or Channel B using UPI, PhonePe, Paytm, or NetBanking. Minimum deposit is ₹1 (Testing Mode). If your payment was delayed, please allow 2-5 minutes for banking confirmation.';
      } else if (lower.includes('withdraw') || lower.includes('payout')) {
        reply = 'Withdrawals are processed daily between 08:00 AM and 08:00 PM. Minimum withdrawal is ₹1 (Testing Mode). Make sure your Bank Details (Account Number & IFSC) are bound in your profile.';
      } else if (lower.includes('bonus') || lower.includes('code') || lower.includes('gift')) {
        reply = 'You can redeem daily gift codes in the Spin > Treasure Box section! Join our official Telegram channel for fresh active codes.';
      } else if (lower.includes('team') || lower.includes('commission') || lower.includes('referral')) {
        reply = 'You earn an instant 40% Level 1 commission whenever a member you invite purchases a plan! Share your invite link from the Team tab.';
      }

      const botReply: Message = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botReply]);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#03190d]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-[560px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-emerald-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#14532d] via-[#15803d] to-[#16a34a] text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">Aalay Care 24×7</div>
              <div className="text-[10px] text-emerald-200 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B2E500] animate-pulse" /> Online
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowLiveChat(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat message body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2 ${
                m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'border border-emerald-200'
                    : 'bg-[#15803d] text-white'
                }`}
              >
                {m.sender === 'user' ? (
                  <img
                    src={user.avatar || 'https://i.ibb.co/JWBdHWpv/profile-picture.png'}
                    alt="User"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://i.ibb.co/JWBdHWpv/profile-picture.png';
                    }}
                  />
                ) : (
                  <Bot size={14} />
                )}
              </div>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#15803d] text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-xs'
                }`}
              >
                <div>{m.text}</div>
                <div
                  className={`text-[9px] mt-1 text-right ${
                    m.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#15803d]"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-[#15803d] text-white flex items-center justify-center hover:bg-[#166534] active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
