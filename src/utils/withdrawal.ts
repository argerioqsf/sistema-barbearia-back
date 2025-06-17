export function validateWithdrawal(amount: number, balanceUser: number, balanceUnit: number, allowsLoan: boolean): number {
  if (amount < 0) {
    throw new Error('Negative values cannot be passed on withdrawals')
  }
  const remaining = balanceUser > 0 ? balanceUser - amount : -amount
  if (remaining < 0) {
    if (!allowsLoan) {
      throw new Error('Insufficient balance for withdrawal')
    }
    if (-remaining > balanceUnit) {
      throw new Error('Withdrawal amount greater than unit balance')
    }
  }
  return remaining
}
