// OneSignal Web SDK v16 Helper Service with Bulletproof Timeouts
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

  // If already initialized with the same App ID, return true
  if (isInitialized && currentAppId === cleanAppId) {
    return true;
  }

  try {
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    const initPromise = new Promise<boolean>((resolve) => {
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
          console.log('[OneSignal] Initialized with App ID:', cleanAppId.slice(0, 8) + '...');
          resolve(true);
        } catch (initErr) {
          console.warn('[OneSignal] Init error:', initErr);
          resolve(false);
        }
      });
    });

    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), 4000);
    });

    return await Promise.race([initPromise, timeoutPromise]);
  } catch (e) {
    console.warn('[OneSignal] Setup error:', e);
    return false;
  }
}

export async function requestOneSignalPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // 1. Native browser Notification API permission request
  if ('Notification' in window) {
    try {
      if (Notification.permission === 'granted') {
        return true;
      }
      if (Notification.permission === 'denied') {
        return false;
      }

      const nativePerm = await Promise.race([
        Notification.requestPermission(),
        new Promise<NotificationPermission>((resolve) => setTimeout(() => resolve('default'), 4000))
      ]);

      if (nativePerm === 'granted') {
        if (window.OneSignal?.Notifications?.requestPermission) {
          try {
            await window.OneSignal.Notifications.requestPermission();
          } catch {}
        }
        return true;
      } else if (nativePerm === 'denied') {
        return false;
      }
    } catch (e) {
      console.warn('[Push] Native Notification.requestPermission error:', e);
    }
  }

  // 2. OneSignal SDK permission request with strict 4-second timeout
  return new Promise((resolve) => {
    let done = false;

    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        const isGranted = typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
        resolve(isGranted);
      }
    }, 4000);

    try {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        if (done) return;
        try {
          if (OneSignal.Notifications) {
            const permission = await OneSignal.Notifications.requestPermission();
            if (!done) {
              done = true;
              clearTimeout(timer);
              resolve(permission === true || permission === 'granted');
            }
          } else {
            if (!done) {
              done = true;
              clearTimeout(timer);
              const isGranted = typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
              resolve(isGranted);
            }
          }
        } catch (err) {
          console.warn('[OneSignal] Permission request error:', err);
          if (!done) {
            done = true;
            clearTimeout(timer);
            resolve(false);
          }
        }
      });
    } catch (err) {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(false);
      }
    }
  });
}

export async function isOneSignalPushSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export async function getOneSignalSubscriptionStatus(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if ('Notification' in window && Notification.permission === 'granted') {
    return true;
  }

  return new Promise((resolve) => {
    let done = false;

    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        const isGranted = typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
        resolve(isGranted);
      }
    }, 2500);

    try {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        if (done) return;
        try {
          if (OneSignal.User?.PushSubscription) {
            const optedIn = OneSignal.User.PushSubscription.optedIn;
            if (!done) {
              done = true;
              clearTimeout(timer);
              resolve(!!optedIn);
            }
          } else {
            if (!done) {
              done = true;
              clearTimeout(timer);
              resolve(Notification.permission === 'granted');
            }
          }
        } catch {
          if (!done) {
            done = true;
            clearTimeout(timer);
            resolve(false);
          }
        }
      });
    } catch {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(false);
      }
    }
  });
}
