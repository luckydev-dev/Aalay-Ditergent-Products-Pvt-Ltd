# Rupayex Payment Gateway & Automated Payout Integration Plan

Completely remove the legacy Fampay payment gateway and integrate the **Rupayex** payment gateway (`https://rupayex.net/api`) for automated order creation, checkout redirection with live status polling, and instant admin-approved withdrawal payouts.

---

## 1. Gateway Architecture & API Specifications

### Rupayex Credentials & Endpoints
- **Base URL**: `https://rupayex.net/api`
- **Default API Token**: `c0bfc67f130d640a0f7f9737de2f9af6` (configurable via `RUPAYEX_API_TOKEN` environment variable or dynamically updated in the Admin Dashboard).
- **Core APIs**:
  1. **Create Order**: `POST /api/create-order`
     - Headers: `X-Api-Token: <token>`
     - Body: `amount`, `order_id`, `redirect_url`, `customer_mobile`, `remark1`, `user_token`
     - Response: Redirects to Rupayex checkout URL / payment link.
  2. **Query Order Status**: `GET /api/order-status?user_token=<token>&order_id=<order_id>`
     - Response: `{ status: true, order_id, amount, payment_status: "SUCCESS" | "PENDING" | "FAILED", utr, method }`
  3. **Order Callback / Webhook**: `POST /api/rupayex-callback`
     - Payload: `{ order_id, amount, status: "SUCCESS", utr, payment_token }`
  4. **Create Payout (Disbursement)**: `POST /api/create-payout`
     - Headers: `X-Api-Token: <token>`
     - Body: `amount`, `method` (`bank` | `upi`), `account_holder`, `account_number`, `ifsc_code`, `bank_name`, `upi_id`, `payout_id`, `user_token`
     - Response: `{ status: true, message, data: { payout_id, amount, fee, net_amount, method, status } }`
  5. **Query Payout Status**: `GET /api/payout-status?user_token=<token>&payout_id=<payout_id>`
     - Response: `{ status: true, data: { payout_id, amount, fee, net_amount, method, status: "PENDING" | "APPROVED" | "PROCESSING" | "SUCCESS" | "REJECTED", processed_at } }`
  6. **Wallet Balance**: `GET /api/wallet-balance?user_token=<token>`
     - Response: `{ status: true, balance: 15000.00 }`

---

## 2. Server-Side Implementation (`server.ts`)

1. **Remove Old Gateway**:
   - Completely remove `/api/create-fampay-order` and `/api/verify-fampay-order`.
   - Remove all Fampay references, constants, and helper logic.
2. **Add Rupayex Gateway Endpoints**:
   - `POST /api/rupayex/create-order`:
     - Creates order with unique ID (`RPX_ORD_<timestamp>_<random>`).
     - Calls `https://rupayex.net/api/create-order` with headers `X-Api-Token: <token>` and body parameters.
     - Returns `{ status: 'success', order_id, payment_url: checkoutUrl, amount }`.
   - `GET /api/rupayex/order-status`:
     - Calls `https://rupayex.net/api/order-status?user_token=<token>&order_id=<order_id>`.
     - Validates actual transaction state, returning `{ status, payment_status, utr, amount }`.
   - `POST /api/rupayex-callback`:
     - Receives incoming webhook notifications from Rupayex and verifies the transaction.
   - `POST /api/rupayex/create-payout`:
     - Dispatches bank or UPI payouts to Rupayex API.
     - Validates account details (account number, IFSC, bank name, or UPI ID).
     - Returns payout ID and status.
   - `GET /api/rupayex/payout-status`:
     - Queries real-time status of payout requests from Rupayex.
   - `GET /api/rupayex/wallet-balance`:
     - Retrieves the merchant account balance from Rupayex for the Admin Dashboard.
   - `POST /api/rupayex/config`:
     - Allows owner to inspect or configure API tokens at runtime.

---

## 3. Client-Side Recharge Experience (`RechargeView.tsx`)

1. **Seamless Rupayex Checkout Flow**:
   - User selects an amount (e.g., ₹100, ₹290, ₹700, ₹1500, ₹5000) or enters a custom amount.
   - Clicking **"Pay with Rupayex"** contacts `/api/rupayex/create-order` to generate a fresh payment link.
   - Redirects the user or opens the official Rupayex checkout page.
   - App enters an active polling state with a status sheet: *"Waiting for Rupayex payment confirmation..."* with a live spinner.
2. **Instant Auto-Credit on SUCCESS**:
   - When Rupayex returns `payment_status: "SUCCESS"`, the app instantly:
     - Credits the user's wallet balance.
     - Generates a completed transaction record with UTR.
     - Automatically switches to the **Deposit History** tab with a success banner.
3. **Manual Fallback / Offline UPI Option**:
   - Retain optional manual UTR entry if user completed payment through direct UPI link.

---

## 4. Admin Dashboard Automated Payouts (`AdminDashboardView.tsx`)

1. **Rupayex Payout Integration**:
   - In the **Payout Applications (Withdrawals)** tab, when an admin clicks **"Approve Payout"**:
     - The system triggers `/api/rupayex/create-payout` using the recipient's bank account or UPI ID.
     - If the payout is accepted (`PENDING` or `SUCCESS`), records the `payout_id` and updates status to `completed` or `processing`.
     - Displays error details if the Rupayex payout request fails (e.g., insufficient gateway balance, invalid IFSC).
2. **Rupayex Gateway Status & Balance Widget**:
   - In the Admin Dashboard overview/settings, display the live **Rupayex Gateway Balance** (from `GET /api/rupayex/wallet-balance`) so admins can monitor disbursement funds before approving payouts.
   - Provide an option to view or update the Rupayex API Token.

---

## 5. Verification & Testing Plan

1. **Build & Lint Verification**:
   - Run `compile_applet` and `lint_applet` to ensure TypeScript compilation without warnings or errors.
2. **Order Creation & Status Test**:
   - Test creating a Rupayex order with test amounts and checking order status.
3. **Payout Creation Test**:
   - Test the `/api/rupayex/create-payout` endpoint validation and error handling for both bank and UPI transfer modes.
4. **Dev Server Restart & Smoke Testing**:
   - Restart the server and verify full functionality across user recharge and admin payout flows.
