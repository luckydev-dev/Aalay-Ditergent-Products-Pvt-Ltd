// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));
  app.use((req, res, next) => {
    console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] ${req.method} ${req.url}`);
    next();
  });
  let rupayexApiToken = process.env.RUPAYEX_API_TOKEN || "c0bfc67f130d640a0f7f9737de2f9af6";
  const RUPAYEX_BASE_URL = "https://rupayex.net/api";
  const getRupayexToken = () => rupayexApiToken.trim();
  app.post("/api/rupayex/create-order", async (req, res) => {
    try {
      const { amount, order_id, customer_mobile, remark1, redirect_url } = req.body;
      const parsedAmount = Number(amount);
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 1) {
        return res.status(400).json({ status: false, error: "Valid amount (minimum \u20B91, maximum \u20B9100,000) is required." });
      }
      const token = getRupayexToken();
      const uniqueOrderId = order_id || `ORD_${Date.now()}_${Math.floor(1e3 + Math.random() * 9e3)}`;
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers.host || "localhost:3000";
      const defaultCallbackUrl = `${protocol}://${host}/api/rupayex/callback`;
      const finalRedirectUrl = redirect_url || defaultCallbackUrl;
      console.log(`[Rupayex] Creating order ${uniqueOrderId} for \u20B9${parsedAmount}`);
      const params = new URLSearchParams();
      params.append("user_token", token);
      params.append("amount", String(parsedAmount));
      params.append("order_id", uniqueOrderId);
      params.append("redirect_url", finalRedirectUrl);
      if (customer_mobile) params.append("customer_mobile", String(customer_mobile));
      if (remark1) params.append("remark1", String(remark1));
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15e3);
      const rpxRes = await fetch(`${RUPAYEX_BASE_URL}/create-order`, {
        method: "POST",
        headers: {
          "X-Api-Token": token,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString(),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const resText = await rpxRes.text();
      let data;
      try {
        data = JSON.parse(resText);
      } catch {
        data = { message: resText };
      }
      if (!rpxRes.ok && (!data || !data.status)) {
        return res.status(rpxRes.status || 400).json({
          status: false,
          error: data?.message || data?.error || "Failed to create order on Rupayex",
          details: data
        });
      }
      const checkoutUrl = data.payment_url || data.checkout_url || data.url || data.data?.payment_url || data.data?.checkout_url || data.redirect_url || `https://rupayex.net/checkout?order_id=${uniqueOrderId}&token=${token}`;
      return res.json({
        status: true,
        order_id: uniqueOrderId,
        amount: parsedAmount,
        payment_url: checkoutUrl,
        checkout_url: checkoutUrl,
        qr_url: data.qr_url || data.data?.qr_url || "",
        upi_link: data.upi_link || data.data?.upi_link || "",
        data
      });
    } catch (err) {
      console.error("[Rupayex] create-order error:", err);
      return res.status(500).json({ status: false, error: `Rupayex Gateway Connection error: ${err.message}` });
    }
  });
  app.get("/api/rupayex/order-status", async (req, res) => {
    try {
      const orderId = req.query.order_id || req.query.orderId;
      if (!orderId) {
        return res.status(400).json({ status: false, error: "order_id is required" });
      }
      const token = getRupayexToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12e3);
      const queryUrl = `${RUPAYEX_BASE_URL}/order-status?user_token=${encodeURIComponent(token)}&order_id=${encodeURIComponent(orderId)}`;
      const rpxRes = await fetch(queryUrl, {
        method: "GET",
        headers: {
          "X-Api-Token": token
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await rpxRes.json();
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ status: false, error: err.message || "Error querying Rupayex order status" });
    }
  });
  app.all("/api/rupayex/callback", (req, res) => {
    const order_id = req.query.order_id || req.body?.order_id || "";
    const utr = req.query.utr || req.body?.utr || "";
    const status = req.query.status || req.body?.status || req.body?.payment_status || "SUCCESS";
    return res.redirect(`/?recharge_status=${status}&order_id=${order_id}&utr=${utr}#deposit-history`);
  });
  app.post("/api/rupayex/create-payout", async (req, res) => {
    try {
      const {
        amount,
        method,
        account_holder,
        account_number,
        ifsc_code,
        bank_name,
        upi_id,
        payout_id
      } = req.body;
      const parsedAmount = Number(amount);
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 1) {
        return res.status(400).json({ status: false, error: "Valid payout amount (minimum \u20B91) is required." });
      }
      if (!method || method !== "bank" && method !== "upi") {
        return res.status(400).json({ status: false, error: 'Payout method must be "bank" or "upi"' });
      }
      if (!account_holder) {
        return res.status(400).json({ status: false, error: "Recipient account_holder name is required" });
      }
      const token = getRupayexToken();
      const uniquePayoutId = payout_id || `PO_${Date.now()}_${Math.floor(1e3 + Math.random() * 9e3)}`;
      const params = new URLSearchParams();
      params.append("user_token", token);
      params.append("amount", String(parsedAmount));
      params.append("method", method);
      params.append("account_holder", account_holder);
      params.append("payout_id", uniquePayoutId);
      if (method === "bank") {
        if (!account_number || !ifsc_code) {
          return res.status(400).json({ status: false, error: "account_number and ifsc_code are required for bank payout" });
        }
        params.append("account_number", String(account_number));
        params.append("ifsc_code", String(ifsc_code));
        if (bank_name) params.append("bank_name", String(bank_name));
      } else {
        if (!upi_id) {
          return res.status(400).json({ status: false, error: "upi_id is required for UPI payout" });
        }
        params.append("upi_id", String(upi_id));
      }
      console.log(`[Rupayex] Creating ${method} payout of \u20B9${parsedAmount} for ${account_holder}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15e3);
      const rpxRes = await fetch(`${RUPAYEX_BASE_URL}/create-payout`, {
        method: "POST",
        headers: {
          "X-Api-Token": token,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString(),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const resText = await rpxRes.text();
      let data;
      try {
        data = JSON.parse(resText);
      } catch {
        data = { message: resText };
      }
      return res.status(rpxRes.ok ? 200 : 400).json(data);
    } catch (err) {
      console.error("[Rupayex] create-payout error:", err);
      return res.status(500).json({ status: false, error: err.message || "Payout creation error" });
    }
  });
  app.get("/api/rupayex/payout-status", async (req, res) => {
    try {
      const payoutId = req.query.payout_id || req.query.payoutId;
      if (!payoutId) {
        return res.status(400).json({ status: false, error: "payout_id is required" });
      }
      const token = getRupayexToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12e3);
      const queryUrl = `${RUPAYEX_BASE_URL}/payout-status?user_token=${encodeURIComponent(token)}&payout_id=${encodeURIComponent(payoutId)}`;
      const rpxRes = await fetch(queryUrl, {
        method: "GET",
        headers: {
          "X-Api-Token": token
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await rpxRes.json();
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ status: false, error: err.message || "Error querying payout status" });
    }
  });
  app.get("/api/rupayex/wallet-balance", async (req, res) => {
    try {
      const token = getRupayexToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12e3);
      const queryUrl = `${RUPAYEX_BASE_URL}/wallet-balance?user_token=${encodeURIComponent(token)}`;
      const rpxRes = await fetch(queryUrl, {
        method: "GET",
        headers: {
          "X-Api-Token": token
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await rpxRes.json();
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ status: false, error: err.message || "Error querying Rupayex wallet balance" });
    }
  });
  app.get("/api/rupayex/config", (req, res) => {
    return res.json({
      status: true,
      hasToken: !!rupayexApiToken,
      tokenMasked: rupayexApiToken ? `${rupayexApiToken.slice(0, 6)}...${rupayexApiToken.slice(-4)}` : "",
      token: rupayexApiToken
    });
  });
  app.post("/api/rupayex/config", (req, res) => {
    const { token } = req.body;
    if (token && typeof token === "string" && token.trim().length >= 6) {
      rupayexApiToken = token.trim();
      return res.json({ status: true, message: "Rupayex API Token updated successfully!" });
    }
    return res.status(400).json({ status: false, error: "Valid API token is required" });
  });
  const processedUtrs = /* @__PURE__ */ new Set();
  app.post("/api/verify-upi-recharge", async (req, res) => {
    try {
      const { utr, amount, screenshotBase64, order_id, phone, name } = req.body;
      if (!utr || typeof utr !== "string" || utr.trim().length < 6) {
        return res.status(400).json({ error: "Please enter a valid 12-digit UPI UTR / Reference number." });
      }
      const cleanUtr = utr.trim().replace(/\s+/g, "");
      if (processedUtrs.has(cleanUtr)) {
        return res.status(400).json({
          error: "This UPI Reference / UTR Number has already been submitted or credited.",
          duplicate: true
        });
      }
      const parsedAmount = Number(amount) || 0;
      if (order_id) {
        try {
          const token = getRupayexToken();
          const verifyUrl = `${RUPAYEX_BASE_URL}/order-status?user_token=${encodeURIComponent(token)}&order_id=${encodeURIComponent(order_id)}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6e3);
          const rpxRes = await fetch(verifyUrl, {
            method: "GET",
            headers: { "X-Api-Token": token },
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (rpxRes.ok) {
            const data = await rpxRes.json();
            if (data && (data.status === true || data.status === "SUCCESS") && data.payment_status === "SUCCESS") {
              processedUtrs.add(cleanUtr);
              return res.json({
                status: "success",
                autoVerified: true,
                message: "Payment verified instantly via Rupayex Gateway!",
                utr: data.utr || cleanUtr,
                amount: Number(data.amount) || parsedAmount
              });
            }
          }
        } catch (e) {
          console.debug("Rupayex check bypassed or timed out:", e);
        }
      }
      if (process.env.GEMINI_API_KEY && screenshotBase64 && typeof screenshotBase64 === "string") {
        try {
          const ai = new GoogleGenAI({});
          const base64Data = screenshotBase64.replace(/^data:image\/[a-zA-Z0-9.+]+;base64,/, "");
          if (base64Data.length > 50) {
            const prompt = `You are a banking fraud-prevention and payment-slip verification AI.
Inspect this Indian UPI Payment screenshot carefully.
User Claimed Details:
- Claimed Amount: \u20B9${parsedAmount}
- Claimed UTR / UPI Ref / Transaction ID: "${cleanUtr}"

Determine:
1. Is this a real and completed UPI transfer receipt (Google Pay, PhonePe, Paytm, BHIM, Cred, Amazon Pay, Banking App)?
2. What is the paid amount in the image?
3. What is the 12-digit UPI transaction ID / UTR / Reference number visible in the screenshot?
4. Does the detected amount match or reasonably align with \u20B9${parsedAmount}?
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
              model: "gemini-2.5-flash",
              contents: [
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Data
                  }
                },
                prompt
              ],
              config: {
                responseMimeType: "application/json"
              }
            });
            if (geminiRes.text) {
              const aiAnalysis = JSON.parse(geminiRes.text);
              if (aiAnalysis.autoApprove || aiAnalysis.isPaymentSuccess && (aiAnalysis.utrMatches || aiAnalysis.amountMatches && cleanUtr.length >= 10)) {
                processedUtrs.add(cleanUtr);
                return res.json({
                  status: "success",
                  autoVerified: true,
                  message: "Payment proof automatically verified by AI verification!",
                  detectedAmount: aiAnalysis.detectedAmount || parsedAmount,
                  detectedUtr: aiAnalysis.detectedUtr || cleanUtr,
                  reason: aiAnalysis.reason
                });
              }
            }
          }
        } catch (aiErr) {
          console.warn("AI automated verification note (will route to Admin Dashboard):", aiErr.message);
        }
      }
      return res.json({
        status: "pending",
        autoVerified: false,
        message: "Payment proof submitted successfully! Awaiting Admin Dashboard approval.",
        utr: cleanUtr,
        amount: parsedAmount
      });
    } catch (err) {
      return res.status(500).json({ error: err.message || "Verification processing error" });
    }
  });
  app.get("/api/server-time", (req, res) => {
    return res.json({
      serverTime: Date.now(),
      iso: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.post("/api/orders/collect-daily-income", (req, res) => {
    try {
      const {
        orderId,
        dailyIncome,
        durationDays,
        daysRemaining,
        totalCollected,
        purchaseTimestamp,
        lastCollectTimestamp
      } = req.body;
      if (!orderId) {
        return res.status(400).json({ success: false, error: "Order ID is required" });
      }
      const serverNow = Date.now();
      const ONE_DAY_MS = 24 * 60 * 60 * 1e3;
      const remDays = Number(daysRemaining);
      if (isNaN(remDays) || remDays <= 0) {
        return res.status(400).json({
          success: false,
          error: "This investment plan has already completed all scheduled returns.",
          isCompleted: true
        });
      }
      const baseTimestamp = Number(lastCollectTimestamp) || Number(purchaseTimestamp) || serverNow;
      const timeElapsed = serverNow - baseTimestamp;
      if (timeElapsed < ONE_DAY_MS) {
        const msRemaining = ONE_DAY_MS - timeElapsed;
        const hours = Math.floor(msRemaining / (1e3 * 60 * 60));
        const minutes = Math.floor(msRemaining % (1e3 * 60 * 60) / (1e3 * 60));
        const seconds = Math.floor(msRemaining % (1e3 * 60) / 1e3);
        return res.status(400).json({
          success: false,
          error: `Next daily profit unlocks in ${hours}h ${minutes}m ${seconds}s (verified by server). Device date modifications are rejected.`,
          serverTime: serverNow,
          nextCollectTimestamp: baseTimestamp + ONE_DAY_MS,
          msRemaining
        });
      }
      const elapsed24hPeriods = Math.floor(timeElapsed / ONE_DAY_MS);
      const daysToCredit = Math.min(elapsed24hPeriods, remDays);
      const numericDaily = Number(dailyIncome) || 0;
      const creditAmount = daysToCredit * numericDaily;
      const newDaysRemaining = Math.max(0, remDays - daysToCredit);
      const newTotalCollected = (Number(totalCollected) || 0) + creditAmount;
      const newLastCollectTimestamp = baseTimestamp + daysToCredit * ONE_DAY_MS;
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
        message: `Successfully credited \u20B9${creditAmount} for ${daysToCredit} day(s) verified on server!`
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message || "Server time calculation error" });
    }
  });
  const isProd = process.env.NODE_ENV === "production" || fs.existsSync(path.resolve(__dirname, "dist"));
  if (isProd) {
    console.log("Running in static PRODUCTION mode serving from dist/");
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    console.log("Running in DEVELOPMENT mode with Vite middleware");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom"
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }
  const port = process.env.PORT || 3e3;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
startServer();
