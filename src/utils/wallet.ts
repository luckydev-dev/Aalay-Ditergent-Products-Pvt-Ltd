export const calculateWalletMetrics = (
  balance: number,
  rawRecharge: number,
  rawIncome: number
) => {
  const currentBalance = Math.max(0, Number(balance) || 0);

  // If total/available balance is 0, recharge and income are 0
  if (currentBalance === 0) {
    return {
      displayTotalRecharge: 0,
      displayTotalIncome: 0,
    };
  }

  const rec = Math.max(0, Number(rawRecharge) || 0);
  const inc = Math.max(0, Number(rawIncome) || 0);
  const totalSum = rec + inc;

  // If no recorded historical recharge or income (e.g. balance added from admin dashboard),
  // show ONLY in total balance with no recharge and no income
  if (totalSum === 0) {
    return {
      displayTotalRecharge: 0,
      displayTotalIncome: 0,
    };
  }

  // If current balance covers or exceeds historical recharge + income, cap displays at actual historical values.
  // Any extra balance (e.g. added from admin dashboard) remains strictly in total balance.
  if (currentBalance >= totalSum) {
    return {
      displayTotalRecharge: rec,
      displayTotalIncome: inc,
    };
  }

  // Otherwise calculate proportional recharge and income based on remaining active balance
  const ratioRecharge = rec / totalSum;
  const calculatedRecharge = Math.round(currentBalance * ratioRecharge);
  const calculatedIncome = Math.max(0, currentBalance - calculatedRecharge);

  return {
    displayTotalRecharge: Math.min(rec, calculatedRecharge),
    displayTotalIncome: Math.min(inc, calculatedIncome),
  };
};

