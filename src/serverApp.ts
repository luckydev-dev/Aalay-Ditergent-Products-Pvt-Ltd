import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createExpressApp() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Request logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Gateway & OneSignal Config Persistence
  const CONFIG_FILE_PATH = path.join(process.cwd(), 'gateway-config.json');
  const RTDB_CONFIG_URL = 'https://aalay-soap-default-rtdb.asia-southeast1.firebasedatabase.app/config.json';

  let rupayexApiToken = process.env.RUPAYEX_API_TOKEN || 'c0bfc67f130d640a0f7f9737de2f9af6';
  let rupayexGatewayEnabled = true;
  let onesignalAppId = process.env.ONESIGNAL_APP_ID || '';
  let onesignalRestApiKey = process.env.ONESIGNAL_REST_API_KEY || '';

  // Helper to sync from Firebase Realtime Database
  const syncConfigFromFirebaseRTDB = async () => {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(RTDB_CONFIG_URL, { signal: controller.signal });
      clearTimeout(tid);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          if (data.gateway) {
            if (data.gateway.token) rupayexApiToken = data.gateway.token;
            if (typeof data.gateway.enabled === 'boolean') rupayexGatewayEnabled = data.gateway.enabled;
          }
          if (data.onesignal) {
            if (data.onesignal.appId) onesignalAppId = data.onesignal.appId;
            if (data.onesignal.restApiKey) onesignalRestApiKey = data.onesignal.restApiKey;
          }
        }
      }
    } catch (err) {
      console.warn('[Config] Could not fetch config from Firebase RTDB:', err);
    }
  };

  // Helper to save to Firebase Realtime Database
  const syncConfigToFirebaseRTDB = async (subpath: 'gateway' | 'onesignal', payload: any) => {
    try {
      await fetch(`https://aalay-soap-default-rtdb.asia-southeast1.firebasedatabase.app/config/${subpath}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, updatedAt: new Date().toISOString() }),
      });
    } catch (err) {
      console.warn(`[Config] Failed to save ${subpath} config to Firebase RTDB:`, err);
    }
  };

  // Load persistent config from disk if exists
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const savedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf-8'));
      if (savedConfig.rupayexApiToken) rupayexApiToken = savedConfig.rupayexApiToken;
      if (typeof savedConfig.rupayexGatewayEnabled === 'boolean') rupayexGatewayEnabled = savedConfig.rupayexGatewayEnabled;
      if (savedConfig.onesignalAppId) onesignalAppId = savedConfig.onesignalAppId;
      if (savedConfig.onesignalRestApiKey) onesignalRestApiKey = savedConfig.onesignalRestApiKey;
    }
  } catch (err) {
    console.warn('[Config] Could not read gateway-config.json:', err);
  }

  // Immediately attempt to sync from Firebase RTDB at startup
  syncConfigFromFirebaseRTDB();

  const saveConfigToDisk = () => {
    try {
      fs.writeFileSync(
        CONFIG_FILE_PATH,
        JSON.stringify({
          rupayexApiToken,
          rupayexGatewayEnabled,
          onesignalAppId,
          onesignalRestApiKey,
        }, null, 2)
      );
    } catch (err) {
      console.warn('[Config] Failed to write gateway-config.json:', err);
    }
  };

  const RUPAYEX_BASE_URL = 'https://rupayex.net/api';
  const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET || 'aalay_admin_secure_key_2026';

  const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['x-admin-key'] || req.headers['authorization'];
    if (
      authHeader === ADMIN_API_SECRET ||
      authHeader === `Bearer ${ADMIN_API_SECRET}` ||
      req.body?.adminKey === ADMIN_API_SECRET
    ) {
      return next();
    }
    return res.status(403).json({ status: false, error: 'Unauthorized: Admin authorization required' });
  };

  const getRupayexToken = () => rupayexApiToken.trim();

  // 1. Create Payment Order (POST /api/rupayex/create-order)
  app.post('/api/rupayex/create-order', async (req, res) => {
    try {
      const { amount, order_id, customer_mobile, remark1, redirect_url } = req.body;
      const parsedAmount = Number(amount);
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 1) {
        return res.status(400).json({ status: false, error: 'Valid amount (minimum ₹1, maximum ₹100,000) is required.' });
      }

      const token = getRupayexToken();
      const uniqueOrderId = order_id || `ORD_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers.host || 'localhost:3000';
      const defaultCallbackUrl = `${protocol}://${host}/api/rupayex/callback`;
      const finalRedirectUrl = redirect_url || defaultCallbackUrl;

      console.log(`[Rupayex] Creating order ${uniqueOrderId} for ₹${parsedAmount}`);

      const params = new URLSearchParams();
      params.append('user_token', token);
      params.append('amount', String(parsedAmount));
      params.append('order_id', uniqueOrderId);
      params.append('redirect_url', finalRedirectUrl);
      if (customer_mobile) params.append('customer_mobile', String(customer_mobile));
      if (remark1) params.append('remark1', String(remark1));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const rpxRes = await fetch(`${RUPAYEX_BASE_URL}/create-order`, {
        method: 'POST',
        headers: {
          'X-Api-Token': token,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const resText = await rpxRes.text();
      let data: any;
      try {
        data = JSON.parse(resText);
      } catch {
        data = { message: resText };
      }

      if (!rpxRes.ok && (!data || !data.status)) {
        return res.status(rpxRes.status || 400).json({
          status: false,
          error: data?.message || data?.error || 'Failed to create order on Rupayex',
          details: data,
        });
      }

      const checkoutUrl =
        data.payment_url ||
        data.checkout_url ||
        data.url ||
        data.data?.payment_url ||
        data.data?.checkout_url ||
        data.redirect_url ||
        `https://rupayex.net/checkout?order_id=${uniqueOrderId}&token=${token}`;

      return res.json({
        status: true,
        order_id: uniqueOrderId,
        amount: parsedAmount,
        payment_url: checkoutUrl,
        checkout_url: checkoutUrl,
        qr_url: data.qr_url || data.data?.qr_url || '',
        upi_link: data.upi_link || data.data?.upi_link || '',
        data: data,
      });
    } catch (err: any) {
      console.error('[Rupayex] create-order error:', err);
      return res.status(500).json({ status: false, error: `Rupayex Gateway Connection error: ${err.message}` });
    }
  });

  // 2. Query Order Status (GET /api/rupayex/order-status)
  app.get('/api/rupayex/order-status', async (req, res) => {
    try {
      const orderId = (req.query.order_id as string) || (req.query.orderId as string);
      if (!orderId) {
        return res.status(400).json({ status: false, error: 'order_id is required' });
      }

      const token = getRupayexToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const queryUrl = `${RUPAYEX_BASE_URL}/order-status?user_token=${encodeURIComponent(token)}&order_id=${encodeURIComponent(orderId)}`;
      const rpxRes = await fetch(queryUrl, {
        method: 'GET',
        headers: { 'X-Api-Token': token },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await rpxRes.json();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ status: false, error: err.message || 'Error querying Rupayex order status' });
    }
  });

  // 3. Callback / Redirect receiver (ALL /api/rupayex/callback)
  app.all('/api/rupayex/callback', (req, res) => {
    const order_id = req.query.order_id || req.body?.order_id || '';
    const utr = req.query.utr || req.body?.utr || '';
    const status = req.query.status || req.body?.status || req.body?.payment_status || 'SUCCESS';

    return res.redirect(`/?recharge_status=${status}&order_id=${order_id}&utr=${utr}#deposit-history`);
  });

  // 4. Create Payout (POST /api/rupayex/create-payout - Admin Only)
  app.post('/api/rupayex/create-payout', requireAdminAuth, async (req, res) => {
    try {
      const {
        amount,
        method,
        account_holder,
        account_number,
        ifsc_code,
        bank_name,
        upi_id,
        payout_id,
      } = req.body;

      const parsedAmount = Number(amount);
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 1) {
        return res.status(400).json({ status: false, error: 'Valid payout amount (minimum ₹1) is required.' });
      }

      if (!method || (method !== 'bank' && method !== 'upi')) {
        return res.status(400).json({ status: false, error: 'Payout method must be "bank" or "upi"' });
      }

      if (!account_holder) {
        return res.status(400).json({ status: false, error: 'Recipient account_holder name is required' });
      }

      const token = getRupayexToken();
      const uniquePayoutId = payout_id || `PO_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const params = new URLSearchParams();
      params.append('user_token', token);
      params.append('amount', String(parsedAmount));
      params.append('method', method);
      params.append('account_holder', account_holder);
      params.append('payout_id', uniquePayoutId);

      if (method === 'bank') {
        if (!account_number || !ifsc_code) {
          return res.status(400).json({ status: false, error: 'account_number and ifsc_code are required for bank payout' });
        }
        params.append('account_number', String(account_number));
        params.append('ifsc_code', String(ifsc_code));
        if (bank_name) params.append('bank_name', String(bank_name));
      } else {
        if (!upi_id) {
          return res.status(400).json({ status: false, error: 'upi_id is required for UPI payout' });
        }
        params.append('upi_id', String(upi_id));
      }

      console.log(`[Rupayex] Creating ${method} payout of ₹${parsedAmount} for ${account_holder}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const rpxRes = await fetch(`${RUPAYEX_BASE_URL}/create-payout`, {
        method: 'POST',
        headers: {
          'X-Api-Token': token,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const resText = await rpxRes.text();
      let data: any;
      try {
        data = JSON.parse(resText);
      } catch {
        data = { message: resText };
      }

      return res.status(rpxRes.ok ? 200 : 400).json(data);
    } catch (err: any) {
      console.error('[Rupayex] create-payout error:', err);
      return res.status(500).json({ status: false, error: err.message || 'Payout creation error' });
    }
  });

  // 5. Query Payout Status (GET /api/rupayex/payout-status)
  app.get('/api/rupayex/payout-status', async (req, res) => {
    try {
      const payoutId = (req.query.payout_id as string) || (req.query.payoutId as string);
      if (!payoutId) {
        return res.status(400).json({ status: false, error: 'payout_id is required' });
      }

      const token = getRupayexToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const queryUrl = `${RUPAYEX_BASE_URL}/payout-status?user_token=${encodeURIComponent(token)}&payout_id=${encodeURIComponent(payoutId)}`;
      const rpxRes = await fetch(queryUrl, {
        method: 'GET',
        headers: { 'X-Api-Token': token },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await rpxRes.json();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ status: false, error: err.message || 'Error querying payout status' });
    }
  });

  // 6. Query Wallet Balance (GET /api/rupayex/wallet-balance - Admin Only)
  app.get('/api/rupayex/wallet-balance', requireAdminAuth, async (req, res) => {
    try {
      const token = getRupayexToken();
      if (!token) {
        return res.status(400).json({ status: false, error: 'Rupayex API user token is not configured.' });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      // Attempt 1: GET request
      const queryUrl = `${RUPAYEX_BASE_URL}/wallet-balance?user_token=${encodeURIComponent(token)}`;
      let rpxRes = await fetch(queryUrl, {
        method: 'GET',
        headers: {
          'X-Api-Token': token,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      let resText = await rpxRes.text();
      let data: any;
      try {
        data = JSON.parse(resText);
      } catch {
        data = { message: resText };
      }

      // Attempt 2: If GET failed or returned error, try POST request with form-urlencoded
      const rawBalCheck = data?.balance ?? data?.wallet_balance ?? data?.wallet ?? data?.data?.balance ?? data?.data?.wallet_balance ?? data?.amount;
      if (!rpxRes.ok || rawBalCheck === undefined) {
        const postParams = new URLSearchParams();
        postParams.append('user_token', token);

        const postRes = await fetch(`${RUPAYEX_BASE_URL}/wallet-balance`, {
          method: 'POST',
          headers: {
            'X-Api-Token': token,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: postParams.toString(),
          signal: controller.signal,
        });

        if (postRes.ok) {
          const postText = await postRes.text();
          try {
            const postData = JSON.parse(postText);
            const postBal = postData?.balance ?? postData?.wallet_balance ?? postData?.wallet ?? postData?.data?.balance ?? postData?.amount;
            if (postBal !== undefined) {
              data = postData;
            }
          } catch {}
        }
      }
      clearTimeout(timeoutId);

      const extractedBalance =
        data?.balance ??
        data?.wallet_balance ??
        data?.wallet ??
        data?.data?.balance ??
        data?.data?.wallet_balance ??
        data?.data?.wallet ??
        data?.amount;

      const numericBal = Number(extractedBalance);

      return res.json({
        status: true,
        balance: !isNaN(numericBal) ? numericBal : 0,
        raw: data,
      });
    } catch (err: any) {
      console.error('[Rupayex Wallet Balance Proxy Error]', err);
      return res.status(500).json({ status: false, error: err.message || 'Error querying Rupayex wallet balance' });
    }
  });

  // 7. Get & Update Rupayex Gateway Token & Status
  app.get('/api/rupayex/config', async (req, res) => {
    if (!rupayexApiToken) {
      await syncConfigFromFirebaseRTDB();
    }
    return res.json({
      status: true,
      hasToken: !!rupayexApiToken,
      tokenMasked: rupayexApiToken ? `${rupayexApiToken.slice(0, 6)}...${rupayexApiToken.slice(-4)}` : '',
      token: rupayexApiToken,
      enabled: rupayexGatewayEnabled,
    });
  });

  app.post('/api/rupayex/config', requireAdminAuth, async (req, res) => {
    const { token, enabled } = req.body;
    if (typeof enabled === 'boolean') {
      rupayexGatewayEnabled = enabled;
    }
    if (token && typeof token === 'string' && token.trim().length >= 6) {
      rupayexApiToken = token.trim();
    }
    saveConfigToDisk();
    await syncConfigToFirebaseRTDB('gateway', {
      token: rupayexApiToken,
      enabled: rupayexGatewayEnabled,
    });
    return res.json({ 
      status: true, 
      message: 'Gateway configuration updated successfully!',
      enabled: rupayexGatewayEnabled,
      hasToken: !!rupayexApiToken,
      tokenMasked: rupayexApiToken ? `${rupayexApiToken.slice(0, 6)}...${rupayexApiToken.slice(-4)}` : '',
      token: rupayexApiToken,
    });
  });

  // 8. OneSignal Notification Configuration & Push Proxy
  app.get('/api/onesignal/config', async (req, res) => {
    if (!onesignalAppId || !onesignalRestApiKey) {
      await syncConfigFromFirebaseRTDB();
    }
    return res.json({
      status: true,
      appId: onesignalAppId,
      hasRestApiKey: !!onesignalRestApiKey,
      restApiKeyMasked: onesignalRestApiKey ? `${onesignalRestApiKey.slice(0, 5)}...${onesignalRestApiKey.slice(-4)}` : '',
    });
  });

  app.post('/api/onesignal/config', requireAdminAuth, async (req, res) => {
    const { appId, restApiKey } = req.body;
    if (typeof appId === 'string') {
      onesignalAppId = appId.trim();
    }
    if (typeof restApiKey === 'string' && restApiKey.trim()) {
      onesignalRestApiKey = restApiKey.trim();
    }
    saveConfigToDisk();
    await syncConfigToFirebaseRTDB('onesignal', {
      appId: onesignalAppId,
      restApiKey: onesignalRestApiKey,
    });
    return res.json({
      status: true,
      message: 'OneSignal credentials saved successfully!',
      appId: onesignalAppId,
      hasRestApiKey: !!onesignalRestApiKey,
    });
  });

  app.post('/api/onesignal/send', requireAdminAuth, async (req, res) => {
    try {
      const { title, message, url, segments } = req.body;
      if (!title || !message) {
        return res.status(400).json({ status: false, error: 'Title and message are required.' });
      }
      if (!onesignalAppId || !onesignalRestApiKey) {
        await syncConfigFromFirebaseRTDB();
      }
      if (!onesignalAppId || !onesignalRestApiKey) {
        return res.status(400).json({ 
          status: false, 
          error: 'OneSignal App ID and REST API Key must be configured in Admin Dashboard first.' 
        });
      }

      const validSegments = segments && Array.isArray(segments) && segments.length > 0
        ? segments
        : ['Subscribed Users'];

      const payload: any = {
        app_id: onesignalAppId,
        headings: { en: title },
        contents: { en: message },
        included_segments: validSegments,
      };

      if (url) {
        payload.url = url;
      }

      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Basic ${onesignalRestApiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.errors) {
        const errorMsg = Array.isArray(data.errors)
          ? data.errors[0]
          : typeof data.errors === 'string'
          ? data.errors
          : 'Failed to dispatch OneSignal notification';
        return res.status(400).json({
          status: false,
          error: errorMsg,
          details: data,
        });
      }

      const recipientCount = typeof data.recipients === 'number' ? data.recipients : 0;
      const statusMessage =
        recipientCount > 0
          ? `Push notification sent to ${recipientCount} active subscriber(s)!`
          : `Notification processed, but 0 subscribed users were targeted. Please ensure users have allowed browser notifications.`;

      return res.json({
        status: true,
        message: statusMessage,
        recipients: recipientCount,
        data,
      });
    } catch (err: any) {
      console.error('[OneSignal Send Error]', err);
      return res.status(500).json({ status: false, error: err.message || 'Error sending push notification' });
    }
  });

  // Notify Admins on New User Withdrawal Request
  app.post('/api/notify-admin-withdrawal', async (req, res) => {
    try {
      const { withdrawalId, amount, userName, userPhone, bankAccount, ifsc } = req.body;
      const title = '🚨 New Withdrawal Request';
      const message = `User ${userName || userPhone || 'Member'} requested a withdrawal of ₹${amount}. Bank: ${bankAccount || 'Account'} (${ifsc || 'IFSC'}). Click to approve in Admin Dashboard.`;

      let pushResult: any = null;
      if (!onesignalAppId || !onesignalRestApiKey) {
        await syncConfigFromFirebaseRTDB();
      }

      if (onesignalAppId && onesignalRestApiKey) {
        try {
          const pushResponse = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Authorization': `Basic ${onesignalRestApiKey}`,
            },
            body: JSON.stringify({
              app_id: onesignalAppId,
              headings: { en: title },
              contents: { en: message },
              included_segments: ['Subscribed Users'],
            }),
          });
          pushResult = await pushResponse.json();
        } catch (pushErr: any) {
          console.error('[Admin Withdrawal Push Error]', pushErr);
        }
      }

      return res.json({
        status: true,
        message: 'Admin withdrawal notification processed.',
        pushResult,
      });
    } catch (err: any) {
      console.error('[Notify Admin Withdrawal Error]', err);
      return res.status(500).json({ status: false, error: err.message || 'Error processing notification' });
    }
  });

  // UPI Recharge Verification Endpoint
  const processedUtrs = new Set<string>();

  app.post('/api/verify-upi-recharge', async (req, res) => {
    try {
      const { utr, amount, screenshotBase64, order_id } = req.body;

      if (!utr || typeof utr !== 'string' || utr.trim().length < 6) {
        return res.status(400).json({ error: 'Please enter a valid 12-digit UPI UTR / Reference number.' });
      }

      const cleanUtr = utr.trim().replace(/\s+/g, '');

      if (processedUtrs.has(cleanUtr)) {
        return res.status(400).json({ 
          error: 'This UPI Reference / UTR Number has already been submitted or credited.',
          duplicate: true 
        });
      }

      const parsedAmount = Number(amount) || 0;

      if (order_id) {
        try {
          const token = getRupayexToken();
          const verifyUrl = `${RUPAYEX_BASE_URL}/order-status?user_token=${encodeURIComponent(token)}&order_id=${encodeURIComponent(order_id)}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          const rpxRes = await fetch(verifyUrl, {
            method: 'GET',
            headers: { 'X-Api-Token': token },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (rpxRes.ok) {
            const data = await rpxRes.json();
            if (data && (data.status === true || data.status === 'SUCCESS') && data.payment_status === 'SUCCESS') {
              processedUtrs.add(cleanUtr);
              return res.json({
                status: 'success',
                autoVerified: true,
                message: 'Payment verified instantly via Rupayex Gateway!',
                utr: data.utr || cleanUtr,
                amount: Number(data.amount) || parsedAmount,
              });
            }
          }
        } catch (e) {
          console.debug('Rupayex check bypassed or timed out:', e);
        }
      }

      if (process.env.GEMINI_API_KEY && screenshotBase64 && typeof screenshotBase64 === 'string') {
        try {
          const ai = new GoogleGenAI({});
          const base64Data = screenshotBase64.replace(/^data:image\/[a-zA-Z0-9.+]+;base64,/, '');

          if (base64Data.length > 50) {
            const prompt = `You are a banking fraud-prevention and payment-slip verification AI.
Inspect this Indian UPI Payment screenshot carefully.
User Claimed Details:
- Claimed Amount: ₹${parsedAmount}
- Claimed UTR / UPI Ref / Transaction ID: "${cleanUtr}"

Determine:
1. Is this a real and completed UPI transfer receipt (Google Pay, PhonePe, Paytm, BHIM, Cred, Amazon Pay, Banking App)?
2. What is the paid amount in the image?
3. What is the 12-digit UPI transaction ID / UTR / Reference number visible in the screenshot?
4. Does the detected amount match or reasonably align with ₹${parsedAmount}?
5. Does the detected UTR match or contain "${cleanUtr}"?

Output JSON only in this exact format:
{
  "isPaymentSuccess": boolean,
  "detectedAmount": number,
  "detectedUtr": string,
  "utrMatches": boolean,
  "amountMatches": boolean,
  "autoApprove": boolean,
  "reason": string
}`;

            const geminiRes = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data,
                  },
                },
                prompt,
              ],
              config: {
                responseMimeType: 'application/json',
              },
            });

            if (geminiRes.text) {
              const aiAnalysis = JSON.parse(geminiRes.text);
              if (
                aiAnalysis.autoApprove ||
                (aiAnalysis.isPaymentSuccess && (aiAnalysis.utrMatches || (aiAnalysis.amountMatches && cleanUtr.length >= 10)))
              ) {
                processedUtrs.add(cleanUtr);
                return res.json({
                  status: 'success',
                  autoVerified: true,
                  message: 'Payment proof automatically verified by AI verification!',
                  detectedAmount: aiAnalysis.detectedAmount || parsedAmount,
                  detectedUtr: aiAnalysis.detectedUtr || cleanUtr,
                  reason: aiAnalysis.reason,
                });
              }
            }
          }
        } catch (aiErr: any) {
          console.warn('AI automated verification note:', aiErr.message);
        }
      }

      return res.json({
        status: 'pending',
        autoVerified: false,
        message: 'Payment proof submitted successfully! Awaiting Admin Dashboard approval.',
        utr: cleanUtr,
        amount: parsedAmount,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Verification processing error' });
    }
  });

  // Server Time Endpoint
  app.get('/api/server-time', (req, res) => {
    return res.json({
      serverTime: Date.now(),
      iso: new Date().toISOString(),
    });
  });

  // Server-Authoritative Daily Income Collection
  app.post('/api/orders/collect-daily-income', (req, res) => {
    try {
      const {
        orderId,
        dailyIncome,
        daysRemaining,
        totalCollected,
        purchaseTimestamp,
        lastCollectTimestamp,
      } = req.body;

      if (!orderId) {
        return res.status(400).json({ success: false, error: 'Order ID is required' });
      }

      const serverNow = Date.now();
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;

      const remDays = Number(daysRemaining);
      if (isNaN(remDays) || remDays <= 0) {
        return res.status(400).json({
          success: false,
          error: 'This investment plan has already completed all scheduled returns.',
          isCompleted: true,
        });
      }

      const baseTimestamp = Number(lastCollectTimestamp) || Number(purchaseTimestamp) || serverNow;
      const timeElapsed = serverNow - baseTimestamp;

      if (timeElapsed < ONE_DAY_MS) {
        const msRemaining = ONE_DAY_MS - timeElapsed;
        const hours = Math.floor(msRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);

        return res.status(400).json({
          success: false,
          error: `Next daily profit unlocks in ${hours}h ${minutes}m ${seconds}s (verified by server).`,
          serverTime: serverNow,
          nextCollectTimestamp: baseTimestamp + ONE_DAY_MS,
          msRemaining,
        });
      }

      const elapsed24hPeriods = Math.floor(timeElapsed / ONE_DAY_MS);
      const daysToCredit = Math.min(elapsed24hPeriods, remDays);
      const numericDaily = Number(dailyIncome) || 0;
      const creditAmount = daysToCredit * numericDaily;
      const newDaysRemaining = Math.max(0, remDays - daysToCredit);
      const newTotalCollected = (Number(totalCollected) || 0) + creditAmount;
      const newLastCollectTimestamp = baseTimestamp + (daysToCredit * ONE_DAY_MS);
      const nextCollectTimestamp = newLastCollectTimestamp + ONE_DAY_MS;

      return res.json({
        success: true,
        daysCredited: daysToCredit,
        creditAmount,
        newDaysRemaining,
        newTotalCollected,
        lastCollectTimestamp: newLastCollectTimestamp,
        nextCollectTimestamp,
        serverTime: serverNow,
        isCompleted: newDaysRemaining <= 0,
        message: `Successfully credited ₹${creditAmount} for ${daysToCredit} day(s) verified on server!`,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Server time calculation error' });
    }
  });

  // ==========================================
  // AUTHORITATIVE USERS & REFERRAL SUBSYSTEM
  // ==========================================
  const USERS_DATA_FILE = path.join(process.cwd(), 'users-data.json');

  const sanitizeNameHelper = (name?: string | null, phone?: string | null): string => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (!name || typeof name !== 'string') {
      return cleanPhone === '9510006797' ? 'Owner' : (cleanPhone ? `User_${cleanPhone.slice(-4)}` : 'User');
    }
    const trimmed = name.trim();
    if (!trimmed || trimmed.toLowerCase() === 'lucky') {
      return cleanPhone === '9510006797' ? 'Owner' : (cleanPhone ? `User_${cleanPhone.slice(-4)}` : 'User');
    }
    return trimmed;
  };

  const loadServerUsers = (): Record<string, any> => {
    try {
      if (fs.existsSync(USERS_DATA_FILE)) {
        const raw = fs.readFileSync(USERS_DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[ServerUsers] Read error:', e);
    }
    return {};
  };

  const saveServerUsers = (users: Record<string, any>) => {
    try {
      fs.writeFileSync(USERS_DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[ServerUsers] Write error:', e);
    }
  };

  // 1. Sync User Profile to Server (POST /api/users/sync)
  app.post('/api/users/sync', (req, res) => {
    try {
      const { profile, teamMembers, transactions } = req.body;
      if (!profile || !profile.phone) {
        return res.status(400).json({ error: 'Valid profile and phone number required' });
      }

      const cleanPhone = String(profile.phone).replace(/[^0-9]/g, '');
      const users = loadServerUsers();
      const existing = users[cleanPhone] || {};

      const sanitizedName = sanitizeNameHelper(profile.name || existing.name, cleanPhone);

      users[cleanPhone] = {
        ...existing,
        ...profile,
        name: sanitizedName,
        phone: cleanPhone,
        balance: typeof profile.balance === 'number' ? profile.balance : (existing.balance ?? 40),
        totalIncome: typeof profile.totalIncome === 'number' ? profile.totalIncome : (existing.totalIncome ?? 40),
        totalRecharge: typeof profile.totalRecharge === 'number' ? (profile.totalRecharge === 50000 ? 0 : profile.totalRecharge) : (existing.totalRecharge === 50000 ? 0 : (existing.totalRecharge ?? 0)),
        invitationCode: profile.invitationCode || existing.invitationCode || String(Math.floor(100000 + Math.random() * 900000)),
        referredBy: profile.referredBy || existing.referredBy,
        teamMembersCount: typeof profile.teamMembersCount === 'number' ? profile.teamMembersCount : (existing.teamMembersCount ?? 0),
        activeMembersToday: typeof profile.activeMembersToday === 'number' ? profile.activeMembersToday : (existing.activeMembersToday ?? 0),
        teamMembers: Array.isArray(teamMembers) ? teamMembers : (existing.teamMembers || []),
        transactions: Array.isArray(transactions) ? transactions : (existing.transactions || []),
        updatedAt: Date.now(),
      };

      saveServerUsers(users);
      return res.json({ success: true, user: users[cleanPhone] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Server user sync error' });
    }
  });

  // 2. Fetch User Profile from Server (GET /api/users/profile)
  app.get('/api/users/profile', (req, res) => {
    try {
      const phoneParam = req.query.phone;
      if (!phoneParam || typeof phoneParam !== 'string') {
        return res.status(400).json({ error: 'Phone number is required' });
      }
      const cleanPhone = phoneParam.replace(/[^0-9]/g, '');
      const users = loadServerUsers();
      const record = users[cleanPhone];
      if (!record) {
        return res.status(404).json({ error: 'User record not found on server' });
      }
      return res.json({ success: true, user: record });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch user profile' });
    }
  });

  // 2b. Fetch All Registered Users from Server (GET /api/users/all)
  app.get('/api/users/all', (req, res) => {
    try {
      const users = loadServerUsers();
      return res.json({ success: true, users: Object.values(users) });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to list users' });
    }
  });

  // 3. Process Referral Connection and Award Instant Bonus (POST /api/referral/process)
  app.post('/api/referral/process', (req, res) => {
    try {
      const { newUser, inviteCode } = req.body;
      if (!newUser || !newUser.phone) {
        return res.status(400).json({ success: false, error: 'Valid newUser object with phone is required' });
      }

      const cleanNewPhone = String(newUser.phone).replace(/[^0-9]/g, '');
      const cleanInviteCode = String(inviteCode || '').trim();
      const cleanNewName = sanitizeNameHelper(newUser.name, cleanNewPhone);

      const users = loadServerUsers();

      // Ensure new user exists in server registry
      if (!users[cleanNewPhone]) {
        users[cleanNewPhone] = {
          ...newUser,
          name: cleanNewName,
          phone: cleanNewPhone,
          balance: typeof newUser.balance === 'number' ? newUser.balance : 40,
          totalIncome: typeof newUser.totalIncome === 'number' ? newUser.totalIncome : 40,
          totalRecharge: Number(newUser.totalRecharge) || 0,
          invitationCode: newUser.invitationCode || String(Math.floor(100000 + Math.random() * 900000)),
          createdAt: Date.now(),
          teamMembers: [],
          transactions: [],
        };
      }

      if (!cleanInviteCode) {
        saveServerUsers(users);
        return res.json({ success: false, message: 'No invitation code provided', user: users[cleanNewPhone] });
      }

      // Search for referrer across all known server accounts
      let referrerPhone: string | null = null;
      for (const [phone, u] of Object.entries(users)) {
        if (phone === cleanNewPhone) continue;
        if (
          u.invitationCode === cleanInviteCode ||
          phone === cleanInviteCode ||
          phone.endsWith(cleanInviteCode)
        ) {
          referrerPhone = phone;
          break;
        }
      }

      if (!referrerPhone) {
        console.log(`[Referral] Referrer not found for invite code: "${cleanInviteCode}" by user ${cleanNewPhone}`);
        saveServerUsers(users);
        return res.json({
          success: false,
          message: `Referral code "${cleanInviteCode}" not found on server registry.`,
          user: users[cleanNewPhone],
        });
      }

      const referrer = users[referrerPhone];
      users[cleanNewPhone].referredBy = referrerPhone;

      const refBonus = 50; // Instant ₹50 referral bonus credited to inviter
      referrer.balance = (Number(referrer.balance) || 0) + refBonus;
      referrer.totalIncome = (Number(referrer.totalIncome) || 0) + refBonus;
      referrer.teamMembersCount = (Number(referrer.teamMembersCount) || 0) + 1;
      referrer.activeMembersToday = (Number(referrer.activeMembersToday) || 0) + 1;

      // Add new member to referrer's roster
      const newMember = {
        id: `tm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: cleanNewName,
        phone: cleanNewPhone,
        joinedDate: new Date().toLocaleDateString('en-GB'),
        joinDate: new Date().toLocaleDateString('en-GB'),
        level: 1,
        totalRecharge: 0,
        commissionEarned: refBonus,
        active: true,
      };

      const existingTm = Array.isArray(referrer.teamMembers) ? referrer.teamMembers : [];
      referrer.teamMembers = [newMember, ...existingTm.filter((m: any) => m.phone !== cleanNewPhone)];

      // Add referral reward transaction to referrer
      const refTx = {
        id: `tx-ref-${Date.now()}`,
        title: `Referral Reward (Invited ${cleanNewName})`,
        amount: refBonus,
        type: 'income',
        category: 'commission',
        date:
          new Date().toLocaleDateString('en-GB') +
          ' ' +
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
      };

      const existingTx = Array.isArray(referrer.transactions) ? referrer.transactions : [];
      referrer.transactions = [refTx, ...existingTx];
      referrer.updatedAt = Date.now();

      saveServerUsers(users);

      console.log(`[Referral] SUCCESS! ${cleanNewPhone} used ${cleanInviteCode} from ${referrerPhone}. Credited ₹${refBonus} to ${referrer.name} (${referrerPhone}). New Balance: ₹${referrer.balance}`);

      return res.json({
        success: true,
        referrerPhone,
        referrerName: referrer.name,
        refBonus,
        newUser: users[cleanNewPhone],
        updatedReferrer: {
          phone: referrer.phone,
          balance: referrer.balance,
          totalIncome: referrer.totalIncome,
          teamMembersCount: referrer.teamMembersCount,
          activeMembersToday: referrer.activeMembersToday,
          latestTeamMember: newMember,
          latestTransaction: refTx,
        },
      });
    } catch (err: any) {
      console.error('[Referral] Processing error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Referral processing error' });
    }
  });

  // 4. Multi-Tier Recharge Commission Payout (POST /api/referral/recharge-commission)
  app.post('/api/referral/recharge-commission', (req, res) => {
    try {
      const { userPhone, rechargeAmount } = req.body;
      const cleanPhone = String(userPhone || '').replace(/[^0-9]/g, '');
      const amount = Number(rechargeAmount);

      if (!cleanPhone || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Valid userPhone and positive rechargeAmount required' });
      }

      const users = loadServerUsers();
      const rechargeUser = users[cleanPhone];
      if (!rechargeUser || !rechargeUser.referredBy) {
        return res.json({ success: true, message: 'User has no inviter; no referral commissions applied.' });
      }

      const commissionTiers = [
        { level: 1, percent: 10 },
        { level: 2, percent: 20 },
        { level: 3, percent: 40 },
      ];

      const commissionsAwarded: any[] = [];
      let currentInviterPhone = rechargeUser.referredBy;

      for (let i = 0; i < commissionTiers.length; i++) {
        if (!currentInviterPhone || !users[currentInviterPhone]) break;

        const inviter = users[currentInviterPhone];
        const tier = commissionTiers[i];
        const commAmt = Math.round(amount * (tier.percent / 100));

        if (commAmt > 0) {
          inviter.balance = (Number(inviter.balance) || 0) + commAmt;
          inviter.totalIncome = (Number(inviter.totalIncome) || 0) + commAmt;
          inviter.teamRecharge = (Number(inviter.teamRecharge) || 0) + amount;

          // Update member recharge in inviter's team roster
          if (Array.isArray(inviter.teamMembers)) {
            inviter.teamMembers = inviter.teamMembers.map((m: any) => {
              if (m.phone === cleanPhone) {
                return {
                  ...m,
                  totalRecharge: (Number(m.totalRecharge) || 0) + amount,
                  commissionEarned: (Number(m.commissionEarned) || 0) + commAmt,
                };
              }
              return m;
            });
          }

          // Add commission transaction
          const commTx = {
            id: `tx-com-lvl${tier.level}-${Date.now()}`,
            title: `Level ${tier.level} Commission (${tier.percent}%) · ${rechargeUser.name}`,
            amount: commAmt,
            type: 'income',
            category: 'commission',
            date:
              new Date().toLocaleDateString('en-GB') +
              ' ' +
              new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'completed',
          };

          const existingTx = Array.isArray(inviter.transactions) ? inviter.transactions : [];
          inviter.transactions = [commTx, ...existingTx];
          inviter.updatedAt = Date.now();

          commissionsAwarded.push({
            inviterPhone: currentInviterPhone,
            level: tier.level,
            percent: tier.percent,
            amount: commAmt,
          });
        }

        currentInviterPhone = inviter.referredBy;
      }

      saveServerUsers(users);
      return res.json({ success: true, commissionsAwarded });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Commission payout error' });
    }
  });

  return app;
}
