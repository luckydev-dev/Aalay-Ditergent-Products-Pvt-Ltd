/**
 * Wallet Metric Calculations
 * 
 * Rules specified by user:
 * 1. Income comes from bonus (e.g. ₹40), spins, daily profit, referrals, gift codes.
 * 2. Recharge comes from deposits. Total Balance = Recharge + Income.
 * 3. When investing in a plan:
 *    - Uses Recharge balance first until Recharge balance reaches ₹0.
 *    - If Recharge is not enough, uses all available Recharge, and the rest from Income.
 *    - If Recharge is ₹0, uses Income.
 * 4. Total Recharge + Total Income always equals Total Available Balance.
 */
export const calculateWalletMetrics = (
  balance: number,
  rawRecharge: number,
  rawIncome: number
) => {
  const currentBalance = Math.max(0, Number(balance) || 0);
  const rec = Math.max(0, Number(rawRecharge) || 0);

  // If user has not recharged (or has the legacy 50000 placeholder):
  // Recharge balance is strictly 0. All active balance is in Total Income.
  if (rec === 0 || rec === 50000) {
    return {
      displayTotalRecharge: 0,
      displayTotalIncome: currentBalance,
    };
  }

  // Active recharge balance cannot exceed available balance.
  // Recharge is consumed first for investments until it reaches 0.
  const displayTotalRecharge = Math.min(rec, currentBalance);
  const displayTotalIncome = Math.max(0, currentBalance - displayTotalRecharge);

  return {
    displayTotalRecharge,
    displayTotalIncome,
  };
};
