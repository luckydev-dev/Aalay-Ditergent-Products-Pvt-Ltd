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

  // If already initialized with same App ID, return true
  if (isInitialized && currentAppId === cleanAppId) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push((OneSignal: any) => {
          try {
            if (OneSignal?.User?.PushSubscription?.optIn) {
              OneSignal.User.PushSubscription.optIn();
            }
          } catch (err) {
            console.warn('[OneSignal] OptIn check notice:', err);
          }
        });
      } catch (e) {}
    }
    return true;
  }

  try {
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    const initPromise = new Promise<boolean>((resolve) => {
      window.OneSignalDeferred!.push(async (OneSignal: any) => {
        try {
          if (!OneSignal.initialized) {
            await OneSignal.init({
              appId: cleanAppId,
              allowLocalhostAsSecureOrigin: true,
              notifyButton: {
                enable: false,
              },
              serviceWorkerParam: { scope: '/' },
              serviceWorkerPath: '/OneSignalSDKWorker.js',
            });
          }

          isInitialized = true;
          currentAppId = cleanAppId;
          console.log('[OneSignal] SDK Initialized for App ID:', cleanAppId.slice(0, 8) + '...');

          // If browser notification permission is granted, ensure user push subscription is opted-in
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              if (OneSignal?.User?.PushSubscription?.optIn) {
                await OneSignal.User.PushSubscription.optIn();
              }
            } catch (optErr) {
              console.warn('[OneSignal] Post-init optIn notice:', optErr);
            }
          }

          resolve(true);
        } catch (initErr) {
          console.warn('[OneSignal] Init error:', initErr);
          resolve(false);
        }
      });
    });

    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), 8000);
    });

    return await Promise.race([initPromise, timeoutPromise]);
  } catch (e) {
    console.warn('[OneSignal] Setup error:', e);
    return false;
  }
}

export async function requestOneSignalPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  return new Promise<boolean>((resolve) => {
    let resolved = false;
    const safeResolve = (val: boolean) => {
      if (!resolved) {
        resolved = true;
        resolve(val);
      }
    };

    // Safety timeout if browser prompt is pending or user ignores prompt
    const timeout = setTimeout(() => {
      const isGranted = 'Notification' in window && Notification.permission === 'granted';
      safeResolve(isGranted);
    }, 10000);

    try {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          if (OneSignal?.Notifications?.requestPermission) {
            await OneSignal.Notifications.requestPermission();
          } else if ('Notification' in window) {
            await Notification.requestPermission();
          }

          if (OneSignal?.User?.PushSubscription?.optIn) {
            await OneSignal.User.PushSubscription.optIn();
          }
        } catch (err) {
          console.warn('[OneSignal] Permission request notice:', err);
        } finally {
          clearTimeout(timeout);
          const isGranted = 'Notification' in window && Notification.permission === 'granted';
          safeResolve(isGranted);
        }
      });
    } catch (e) {
      clearTimeout(timeout);
      const isGranted = 'Notification' in window && Notification.permission === 'granted';
      safeResolve(isGranted);
    }
  });
}

export async function isOneSignalPushSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export async function getOneSignalSubscriptionStatus(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  return new Promise<boolean>((resolve) => {
    let resolved = false;
    const safeResolve = (val: boolean) => {
      if (!resolved) {
        resolved = true;
        resolve(val);
      }
    };

    const timeout = setTimeout(() => {
      safeResolve(Notification.permission === 'granted');
    }, 2000);

    try {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push((OneSignal: any) => {
        clearTimeout(timeout);
        try {
          const optedIn = OneSignal?.User?.PushSubscription?.optedIn;
          safeResolve(!!optedIn || Notification.permission === 'granted');
        } catch {
          safeResolve(Notification.permission === 'granted');
        }
      });
    } catch {
      clearTimeout(timeout);
      safeResolve(Notification.permission === 'granted');
    }
  });
}

