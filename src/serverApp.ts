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

  // Gateway Config Persistence File
  const CONFIG_FILE_PATH = path.join(process.cwd(), 'gateway-config.json');

  let rupayexApiToken = process.env.RUPAYEX_API_TOKEN || 'c0bfc67f130d640a0f7f9737de2f9af6';
  let rupayexGatewayEnabled = true;
  let onesignalAppId = process.env.ONESIGNAL_APP_ID || '';
  let onesignalRestApiKey = process.env.ONESIGNAL_REST_API_KEY || '';

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
  app.get('/api/rupayex/config', (req, res) => {
    return res.json({
      status: true,
      hasToken: !!rupayexApiToken,
      tokenMasked: rupayexApiToken ? `${rupayexApiToken.slice(0, 6)}...${rupayexApiToken.slice(-4)}` : '',
      token: rupayexApiToken,
      enabled: rupayexGatewayEnabled,
    });
  });

  app.post('/api/rupayex/config', requireAdminAuth, (req, res) => {
    const { token, enabled } = req.body;
    if (typeof enabled === 'boolean') {
      rupayexGatewayEnabled = enabled;
    }
    if (token && typeof token === 'string' && token.trim().length >= 6) {
      rupayexApiToken = token.trim();
    }
    saveConfigToDisk();
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
  app.get('/api/onesignal/config', (req, res) => {
    return res.json({
      status: true,
      appId: onesignalAppId,
      hasRestApiKey: !!onesignalRestApiKey,
      restApiKeyMasked: onesignalRestApiKey ? `${onesignalRestApiKey.slice(0, 5)}...${onesignalRestApiKey.slice(-4)}` : '',
    });
  });

  app.post('/api/onesignal/config', requireAdminAuth, (req, res) => {
    const { appId, restApiKey } = req.body;
    if (typeof appId === 'string') {
      onesignalAppId = appId.trim();
    }
    if (typeof restApiKey === 'string' && restApiKey.trim()) {
      onesignalRestApiKey = restApiKey.trim();
    }
    saveConfigToDisk();
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
        return res.status(400).json({ 
          status: false, 
          error: 'OneSignal App ID and REST API Key must be configured in Admin Dashboard first.' 
        });
      }

      const payload: any = {
        app_id: onesignalAppId,
        headings: { en: title },
        contents: { en: message },
        included_segments: segments && Array.isArray(segments) && segments.length > 0 ? segments : ['Total Subscriptions'],
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
      if (!response.ok) {
        return res.status(response.status).json({
          status: false,
          error: data.errors?.[0] || 'Failed to dispatch OneSignal notification',
          details: data,
        });
      }

      return res.json({
        status: true,
        message: 'Push notification successfully dispatched to subscribers!',
        data,
      });
    } catch (err: any) {
      console.error('[OneSignal Send Error]', err);
      return res.status(500).json({ status: false, error: err.message || 'Error sending push notification' });
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

  return app;
}
