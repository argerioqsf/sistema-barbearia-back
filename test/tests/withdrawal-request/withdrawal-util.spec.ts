import { describe, it, expect } from 'vitest'
import { validateWithdrawal } from '../../../src/utils/withdrawal'

describe('validateWithdrawal util', () => {
  it('throws on negative amount', () => {
    expect(() => validateWithdrawal(-1, 0, 0, false)).toThrow('Negative values cannot be passed on withdrawals')
  })

  it('throws when balance insufficient and loan not allowed', () => {
    expect(() => validateWithdrawal(50, 10, 100, false)).toThrow('Insufficient balance for withdrawal')
  })

  it('throws when amount greater than unit balance', () => {
    expect(() => validateWithdrawal(50, 10, 20, true)).toThrow('Withdrawal amount greater than unit balance')
  })

  it('returns remaining when balance sufficient', () => {
    expect(validateWithdrawal(30, 50, 100, false)).toBe(20)
  })

  it('returns negative remaining when using loan', () => {
    expect(validateWithdrawal(40, 10, 100, true)).toBe(-30)
  })
})
