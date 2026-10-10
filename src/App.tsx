import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthView } from './components/views/AuthView';
import { HomeView } from './components/views/HomeView';
import { SpinView } from './components/views/SpinView';
import { MissionsView } from './components/views/MissionsView';
import { TeamView } from './components/views/TeamView';
import { ProfileView } from './components/views/ProfileView';
import { RechargeView } from './components/views/RechargeView';
import { WithdrawView } from './components/views/WithdrawView';
import { BankDetailsView } from './components/views/BankDetailsView';
import { PurchaseRecordView } from './components/views/PurchaseRecordView';
import { AccountRecordView } from './components/views/AccountRecordView';
import { WithdrawalHistoryView } from './components/views/WithdrawalHistoryView';
import { SecurityView } from './components/views/SecurityView';
import { AboutUsView } from './components/views/AboutUsView';
import { NotificationsView } from './components/views/NotificationsView';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import { BottomNav } from './components/common/BottomNav';
import { WelcomeModal } from './components/modals/WelcomeModal';
import { CustomerServiceSheet } from './components/modals/CustomerServiceSheet';
import { LiveChatModal } from './components/modals/LiveChatModal';
import { InviteModal } from './components/modals/InviteModal';
import { DatabaseSplashLoader } from './components/common/DatabaseSplashLoader';
import { OneSignalPromptBanner } from './components/common/OneSignalPromptBanner';
import { CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {

  const { user, activeTab, subScreen, setSubScreen, toastMessage, setShowWelcomeModal, isDatabaseLoading } = useApp();

  const [isAdminRoute, setIsAdminRoute] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname === '/admin' ||
        window.location.hash === '#admin' ||
        window.location.hash === '#/admin' ||
        window.location.search.includes('admin')
      );
    }
    return false;
  });

  // Keep route in sync with browser URL
  useEffect(() => {
    const handleUrlChange = () => {
      const isAdm =
        window.location.pathname === '/admin' ||
        window.location.hash === '#admin' ||
        window.location.hash === '#/admin' ||
        window.location.search.includes('admin');
      setIsAdminRoute(isAdm);
      if (isAdm && subScreen !== 'admin') {
        setSubScreen('admin');
      } else if (!isAdm && subScreen === 'admin') {
        setSubScreen('none');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    handleUrlChange();

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [subScreen, setSubScreen]);

  // Sync window URL when subScreen is toggled internally
  useEffect(() => {
    if (subScreen === 'admin') {
      if (window.location.pathname !== '/admin' && window.location.hash !== '#/admin') {
        window.history.pushState(null, '', '/admin');
      }
      setIsAdminRoute(true);
    } else {
      if (window.location.pathname === '/admin') {
        window.history.pushState(null, '', '/');
      }
      setIsAdminRoute(false);
    }
  }, [subScreen]);

  // Show welcome modal once on initial visit if not seen
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('aaley_seen_welcome');
    if (!hasSeenWelcome && user.isLoggedIn) {
      sessionStorage.setItem('aaley_seen_welcome', 'true');
      setShowWelcomeModal(true);
    }
  }, [user.isLoggedIn, setShowWelcomeModal]);

  // Full-Screen Branded Splash Loader on Startup
  if (isDatabaseLoading) {
    return <DatabaseSplashLoader imageSrc={user?.avatar} statusText="Loading Aalay..." />;
  }

  // Standalone Full-Screen Admin Dashboard Suite (/admin)
  if (subScreen === 'admin' || isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#041a0e] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] w-full max-w-full overflow-x-hidden relative">
        <AdminDashboardView />
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-bold shadow-2xl border border-slate-700 backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // If user is logged out, show the Auth / Login screen
  if (!user.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#041a0e] relative overflow-hidden flex items-center justify-center sm:p-4">
        {/* Ambient Logo-Matching Green Glow / Blur Orbs */}
        <div className="fixed -top-32 -left-32 w-96 h-96 bg-[#8ED000]/25 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="fixed top-1/3 -right-32 w-96 h-96 bg-[#B2E500]/20 rounded-full blur-[110px] pointer-events-none" />
        <div className="fixed -bottom-32 left-1/4 w-96 h-96 bg-[#15803d]/30 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-white sm:rounded-[36px] sm:shadow-2xl overflow-hidden min-h-screen sm:min-h-[780px] sm:border-[6px] sm:border-[#15803d]/30 relative z-10 flex flex-col justify-between">
          <AuthView />
        </div>
      </div>
    );
  }

  // Active sub-screen rendering
  const renderCurrentView = () => {
    switch (subScreen) {
      case 'recharge':
        return <RechargeView />;
      case 'withdraw':
        return <WithdrawView />;
      case 'bank-details':
        return <BankDetailsView />;
      case 'purchase-record':
        return <PurchaseRecordView />;
      case 'account-record':
        return <AccountRecordView />;
      case 'withdrawal-history':
        return <WithdrawalHistoryView />;
      case 'deposit-history':
        return <RechargeView initialTab="history" />;
      case 'security':
        return <SecurityView />;
      case 'about-us':
        return <AboutUsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'missions':
        return <MissionsView />;
      case 'none':
      default:
        switch (activeTab) {
          case 'home':
            return <HomeView />;
          case 'spin':
            return <SpinView />;
          case 'treasure':
            return <MissionsView />;
          case 'team':
            return <TeamView />;
          case 'profile':
            return <ProfileView />;
          default:
            return <HomeView />;
        }
    }
  };

  return (
    <div className="min-h-screen bg-[#041a0e] relative overflow-hidden flex justify-center items-start sm:p-4 md:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Ambient Logo-Matching Green Glow / Blur Orbs */}
      <div className="fixed -top-32 -left-32 w-96 h-96 bg-[#8ED000]/25 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="fixed top-1/3 -right-32 w-96 h-96 bg-[#B2E500]/20 rounded-full blur-[110px] pointer-events-none" />
      <div className="fixed -bottom-32 left-1/4 w-96 h-96 bg-[#15803d]/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Container Frame */}
      <div className="w-full max-w-md bg-[#f4f7fb] sm:rounded-[36px] sm:shadow-[0_25px_60px_rgba(4,26,14,0.7)] overflow-hidden min-h-screen sm:min-h-[820px] sm:border-[6px] sm:border-[#15803d]/30 relative z-10 flex flex-col">
        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto relative no-scrollbar">
          {renderCurrentView()}
        </main>

        {/* Bottom Navigation (Only visible when on main tabs and subScreen === 'none') */}
        {subScreen === 'none' && <BottomNav />}

        {/* Floating Modals & Sheets */}
        <WelcomeModal />
        <CustomerServiceSheet />
        <LiveChatModal />
        <InviteModal />
        <OneSignalPromptBanner />


        {/* Toast Notification Alert */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#041a0e]/95 text-white text-xs font-bold shadow-xl border border-emerald-500/30 backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
