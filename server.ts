import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Log server requests
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Secure checkout order creation endpoint for Fampay Gateway (official specifications)
  app.post('/api/create-fampay-order', async (req, res) => {
    try {
      const { amount } = req.body;
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Valid amount is required' });
      }

      // Read API Key from environment, or use the key provided in your documentation example
      const apiKey = process.env.FAMPAY_API_KEY || 'FAM_9B1980E40E5B9DCBA189D08F47A59826D5F306D6';
      
      console.log(`Creating Fampay order for amount: ${amount}`);

      try {
        const createOrderUrl = `https://www.fampaygateway.site/api/create_order.php?amount=${amount}&api_key=${apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        const fampayRes = await fetch(createOrderUrl, { method: 'GET', signal: controller.signal });
        clearTimeout(timeoutId);

        if (!fampayRes.ok) {
          const errorText = await fampayRes.text();
          return res.status(fampayRes.status).json({ error: errorText });
        }

        const data = await fampayRes.json();
        
        if (data && data.status === 'success' && data.data && data.data.order_id) {
          const orderId = data.data.order_id;
          
          // Use the ready-made checkout page as specified in documentation
          const checkoutUrl = `https://www.fampaygateway.site/checkout.php?order_id=${orderId}`;
          
          return res.json({
            checkout_url: checkoutUrl,
            order_id: orderId,
            qr_url: data.data.qr_url || '',
            upi_link: data.data.upi_link || '',
            upi_id: data.data.upi_id || '',
            amount: data.data.amount || amount,
            expires_at: data.data.expires_at || '',
          });
        } else {
          return res.status(400).json({ 
            error: data.message || 'Failed to create order on Fampay Gateway', 
            details: data 
          });
        }
      } catch (err: any) {
        return res.status(500).json({ error: `Fampay Gateway Connection failed: ${err.message}` });
      }
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  // Secure payment verification endpoint for Fampay Gateway (official specifications)
  app.post('/api/verify-fampay-order', async (req, res) => {
    try {
      const { order_id } = req.body;
      if (!order_id) {
        return res.status(400).json({ error: 'order_id is required' });
      }

      const apiKey = process.env.FAMPAY_API_KEY || 'FAM_9B1980E40E5B9DCBA189D08F47A59826D5F306D6';
      const verifyUrl = `https://www.fampaygateway.site/api/verify.php?order_id=${order_id}&api_key=${apiKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const fampayRes = await fetch(verifyUrl, { method: 'GET', signal: controller.signal });
      clearTimeout(timeoutId);
      if (!fampayRes.ok) {
        return res.status(400).json({ error: 'Failed to connect to Fampay Gateway verification server' });
      }

      const data = await fampayRes.json();
      if (data && data.status === 'success') {
        return res.json({
          status: 'success',
          amount: data.data?.amount,
          utr: data.data?.utr,
          payment_time: data.data?.payment_time,
        });
      } else {
        return res.json({
          status: 'pending',
          message: data.message || 'Payment is not verified yet.',
        });
      }
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });

  // UPI Recharge Verification Endpoint (Automated Verification + Screenshot & UTR Processing)
  const processedUtrs = new Set<string>();

  app.post('/api/verify-upi-recharge', async (req, res) => {
    try {
      const { utr, amount, screenshotBase64, order_id, phone, name } = req.body;

      if (!utr || typeof utr !== 'string' || utr.trim().length < 6) {
        return res.status(400).json({ error: 'Please enter a valid 12-digit UPI UTR / Reference number.' });
      }

      const cleanUtr = utr.trim().replace(/\s+/g, '');

      // Check if this UTR was already successfully credited
      if (processedUtrs.has(cleanUtr)) {
        return res.status(400).json({ 
          error: 'This UPI Reference / UTR Number has already been submitted or credited.',
          duplicate: true 
        });
      }

      const parsedAmount = Number(amount) || 0;

      // 1. First, if linked with a Fampay order ID, check gateway confirmation
      if (order_id) {
        try {
          const apiKey = process.env.FAMPAY_API_KEY || 'FAM_9B1980E40E5B9DCBA189D08F47A59826D5F306D6';
          const verifyUrl = `https://www.fampaygateway.site/api/verify.php?order_id=${order_id}&api_key=${apiKey}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          const fampayRes = await fetch(verifyUrl, { method: 'GET', signal: controller.signal });
          clearTimeout(timeoutId);

          if (fampayRes.ok) {
            const data = await fampayRes.json();
            if (data && data.status === 'success') {
              processedUtrs.add(cleanUtr);
              return res.json({
                status: 'success',
                autoVerified: true,
                message: 'Payment verified instantly via Banking Gateway!',
                utr: data.data?.utr || cleanUtr,
                amount: data.data?.amount || parsedAmount,
              });
            }
          }
        } catch (e) {
          console.debug('Fampay check bypassed or timed out:', e);
        }
      }

      // 2. Intelligent AI Vision Verification (Google Gemini 2.5 Flash)
      // Inspects payment screenshot for matching amount and UTR
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
          console.warn('AI automated verification note (will route to Admin Dashboard):', aiErr.message);
        }
      }

      // 3. Fallback: Proof registered for Admin Dashboard approval
      // If automated verification could not confirm 100% instantly,
      // it is safely queued for manual review & approval in the Admin Dashboard!
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

  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve(__dirname, 'dist'));

  if (isProd) {
    console.log('Running in static PRODUCTION mode serving from dist/');
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    console.log('Running in DEVELOPMENT mode with Vite middleware');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
