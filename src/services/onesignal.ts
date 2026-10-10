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

  // If already initialized with the same App ID, return true
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
            console.warn('[OneSignal] OptIn check error:', err);
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

          // If native notification permission is already granted, opt-in OneSignal push subscription
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

  // 1. Fast path: check native browser Notification API permission
  if ('Notification' in window) {
    // If already granted, immediately try to opt in OneSignal user subscription and return true!
    if (Notification.permission === 'granted') {
      try {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async (OneSignal: any) => {
          try {
            if (OneSignal?.User?.PushSubscription?.optIn) {
              await OneSignal.User.PushSubscription.optIn();
            }
          } catch (e) {}
        });
      } catch (e) {}
      return true;
    }

    // If denied by user, return false
    if (Notification.permission === 'denied') {
      return false;
    }
  }

  // 2. Request permission with generous timeout for human interaction (30 seconds)
  try {
    let granted = false;

    // Use OneSignal SDK requestPermission if available, or native Notification.requestPermission
    if (window.OneSignal?.Notifications?.requestPermission) {
      try {
        const result = await Promise.race([
          window.OneSignal.Notifications.requestPermission(),
          new Promise<any>((resolve) => setTimeout(() => resolve(false), 30000))
        ]);
        granted = result === true || result === 'granted' || (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted');
      } catch (sdkErr) {
        console.warn('[OneSignal] SDK requestPermission notice:', sdkErr);
      }
    }

    if (!granted && 'Notification' in window) {
      try {
        const permResult = await Promise.race([
          Notification.requestPermission(),
          new Promise<NotificationPermission>((resolve) => setTimeout(() => resolve(Notification.permission), 30000))
        ]);
        granted = permResult === 'granted' || Notification.permission === 'granted';
      } catch (nativeErr) {
        console.warn('[OneSignal] Native requestPermission notice:', nativeErr);
      }
    }

    // Final check on permission status
    if ('Notification' in window && Notification.permission === 'granted') {
      granted = true;
    }

    if (granted) {
      try {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async (OneSignal: any) => {
          try {
            if (OneSignal?.User?.PushSubscription?.optIn) {
              await OneSignal.User.PushSubscription.optIn();
            }
          } catch (e) {}
        });
      } catch (e) {}
    }

    return granted;
  } catch (err) {
    console.warn('[Push] requestOneSignalPushPermission error:', err);
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  }
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
    }, 2000);

    try {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        if (done) return;
        try {
          if (OneSignal?.User?.PushSubscription) {
            const optedIn = OneSignal.User.PushSubscription.optedIn;
            if (!done) {
              done = true;
              clearTimeout(timer);
              resolve(!!optedIn || (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'));
            }
          } else {
            if (!done) {
              done = true;
              clearTimeout(timer);
              resolve(typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted');
            }
          }
        } catch {
          if (!done) {
            done = true;
            clearTimeout(timer);
            resolve(typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted');
          }
        }
      });
    } catch {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted');
      }
    }
  });
}
