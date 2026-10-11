# Implementation Plan - Fix Plan Purchase Balance Deduction Bug

## Problem
When a user purchases a plan (e.g. ₹280) when their total `balance` is higher than their tracked sub-wallets (`totalRecharge` + `totalIncome`), the previous deduction logic calculated `newBalance = newRecharge + newIncome` which resulted in `0`, incorrectly wiping out any leftover balance (e.g., ₹50 remaining from ₹330 total balance).

## Proposed Changes
- Update `buyPlan` in `src/context/AppContext.tsx`:
  - Calculate `newBalance = Math.max(0, currentBalance - plan.price)`.
  - Deduct from `totalRecharge` first, then `totalIncome`.
  - Ensure sub-wallets correctly sum up to `newBalance` so leftover balance (e.g. ₹50) is preserved accurately in the user's wallet.

## Verification
- Compile and lint applet.
- Test balance subtraction logic to verify leftover balance is preserved correctly after purchases.
