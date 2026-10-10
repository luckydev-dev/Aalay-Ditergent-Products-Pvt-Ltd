// OneSignal Web SDK v16 Helper Service
declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
    OneSignal?: any;
  }
}

let isInitialized = false;
let currentAppId = '';

export async function initOneSignal(appId: string): Promise<boolean> {
  if (!appId || typeof appId !== 'string' || !appId.trim()) {
    return false;
  }

  const cleanAppId = appId.trim();

  // If already initialized with the same App ID, don't re-init
  if (isInitialized && currentAppId === cleanAppId) {
    return true;
  }

  try {
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    return new Promise((resolve) => {
      window.OneSignalDeferred!.push(async (OneSignal: any) => {
        try {
          await OneSignal.init({
            appId: cleanAppId,
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
              enable: false,
            },
            serviceWorkerParam: { scope: '/' },
            serviceWorkerPath: '/OneSignalSDKWorker.js',
          });

          isInitialized = true;
          currentAppId = cleanAppId;
          console.log('[OneSignal] Initialized successfully with App ID:', cleanAppId.slice(0, 8) + '...');
          resolve(true);
        } catch (initErr) {
          console.warn('[OneSignal] Init error (safe ignore if offline or invalid App ID):', initErr);
          resolve(false);
        }
      });
    });
  } catch (e) {
    console.warn('[OneSignal] Setup deferred error:', e);
    return false;
  }
}

export async function requestOneSignalPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  return new Promise((resolve) => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        if (OneSignal.Notifications) {
          const permission = await OneSignal.Notifications.requestPermission();
          resolve(permission === true || permission === 'granted');
        } else {
          resolve(false);
        }
      } catch (err) {
        console.warn('[OneSignal] Permission request error:', err);
        resolve(false);
      }
    });
  });
}

export async function isOneSignalPushSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export async function getOneSignalSubscriptionStatus(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return new Promise((resolve) => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        if (OneSignal.User?.PushSubscription) {
          const optedIn = OneSignal.User.PushSubscription.optedIn;
          resolve(!!optedIn);
        } else {
          resolve(Notification.permission === 'granted');
        }
      } catch {
        resolve(false);
      }
    });
  });
}
