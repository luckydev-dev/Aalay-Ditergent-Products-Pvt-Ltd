# Admin Permanent Account Deletion & Fresh Re-Registration

Implement a complete, permanent account wipe feature in the Admin Dashboard that thoroughly removes a user's profile, credentials, financial history, and database records across Firebase Realtime Database and local storage, allowing deleted users to register anew as fresh accounts.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices have been confirmed based on user feedback:

- **Confirmed Decision 1**: **Full Data Eradication** — When an account is deleted, all associated data (profile, orders, transaction history, withdrawals, bank details, and security passwords) is wiped completely with no residual traces.
- **Confirmed Decision 2**: **Unrestricted Direct Deletion** — The admin can delete any account directly, including owner accounts, without blocking gates.
- **Confirmed Decision 3**: **Fresh Re-Registration Guarantee** — Once deleted, all registry duplicates and RTDB user nodes are removed so the mobile number can immediately register again as a brand-new user with a fresh ₹40 bonus and isolated state.

---

## 1. Overview & Core Concept

- **What It Does**: Adds a direct **Delete Account** capability within the Admin Dashboard (in both Desktop and Mobile views) that permanently removes user records from Firebase Realtime Database (`users/{uid}`), local system registries (`aaley_all_registered_users`), password caches (`aaley_user_passwords`), and per-phone session keys.
- **Target Audience / Persona**: System Admins and Platform Owners managing user accounts, testing sign-up flows, or removing duplicate/test accounts.
- **Key Value**: Provides a reliable, complete account reset workflow so deleted users can cleanly re-register without encountering "already registered" errors or inheriting stale balance and order records.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Admin Navigates to Directory**: In the Admin Dashboard, Admin opens the **Users** tab (or views the Recent Users table on the Overview tab).
2. **Action Trigger**: Next to "Set VIP", "Wallet", and "Make Owner", each user row/card features a dedicated **Delete** button styled with a trash icon (`Trash2`) and a crisp crimson hover state (`bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30`).
3. **Instant Wiping Execution**: Clicking Delete instantly executes `deleteUserAccountInDb(user.uid, user.phone)`.
4. **Immediate Feedback**: The user is removed from the directory list with smooth reactive filtering, and a confirmation toast appears: *"Account +91 {phone} permanently deleted. New registration now enabled."*
5. **Re-Registration Flow**: When that person subsequently navigates to the Registration screen, the system accepts their mobile number with zero conflicts and initializes a fresh account with ₹40 signup bonus.

### Visual Identity & Theme
- **Color Discipline**: 
  - Structural Surface: Dark navy/slate backdrop (`#0b1730` and `bg-slate-900/90`).
  - Action Accent: Rose/Crimson accent (`#E11D48` / `text-rose-400` / `bg-rose-500/20`) for destructive deletion affordances.
- **Typography & Alignment**:
  - Monospace tabular figures (`tabular-nums font-mono`) for phone numbers and balances.
  - Clear single-line action buttons with `whitespace-nowrap shrink-0`.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Cascading Multi-Storage Cleanup**
  - *Chosen Approach*: Purge records simultaneously across Firebase RTDB (`users/{uid}`), top-level queue references, global localStorage registry (`aaley_all_registered_users`), credential maps (`aaley_user_passwords`), and user-scoped caches (`aaley_*_{phone}`).
  - *Why*: Eliminates phantom entries that could otherwise trigger false duplicate-phone errors during subsequent registration.
- **Decision 2: Active User Session Handling**
  - *Chosen Approach*: If the currently logged-in account is deleted by an admin (or by the owner themselves), trigger `logout()` automatically to return the client to the unauthenticated login screen.
  - *Why*: Prevents orphan sessions and runtime synchronization errors with missing RTDB paths.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Admin Dashboard                      │
│   (Users Directory Table / Mobile User Cards)          │
└──────────────────────────┬─────────────────────────────┘
                           │ 1-Click "Delete" Action
                           ▼
┌────────────────────────────────────────────────────────┐
│      AppContext: deleteUserAccountInDb(uid, phone)     │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────────────┐ ┌──────────────────────┐
│  Firebase Realtime Database  │ │    Local Storage     │
│  - remove(users/{uid})       │ │  - registered_users  │
│  - remove withdrawal_requests│ │  - user_passwords    │
│  - remove recharge_requests  │ │  - user_{phone} keys │
└──────────────────────────────┘ └──────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│         Target Mobile Number Cleaned & Freed           │
│   Ready for immediate fresh registration (/register)   │
└────────────────────────────────────────────────────────┘
```

### Data Model & State Mapping
- **`AppContextType`**:
  - Expose `deleteUserAccountInDb: (targetUid: string, targetPhone?: string) => Promise<boolean>`.
- **`deleteUserAccountInDb` Logic**:
  1. Purge RTDB node `users/${targetUid}` via `set(ref(rtdb, 'users/' + targetUid), null)`.
  2. Filter `targetUid` and `targetPhone` out of `aaley_all_registered_users`.
  3. Remove keys from `aaley_user_passwords` for both `targetPhone` and `targetUid`.
  4. Remove isolated cache entries: `aaley_user_${targetPhone}`, `aaley_bank_${targetPhone}`, `aaley_orders_${targetPhone}`, `aaley_transactions_${targetPhone}`, `aaley_withdrawals_${targetPhone}`.
  5. If `targetUid === user.uid` or `targetPhone === user.phone`, trigger session `logout()`.
- **`AdminDashboardView`**:
  - Add `handleDeleteUser(user: SystemUserItem)` with toast feedback.
  - Render Delete button in mobile cards grid and desktop table actions column.
