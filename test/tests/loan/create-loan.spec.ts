import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateLoanService } from '../../../src/services/loan/create-loan'
import {
  FakeLoanRepository,
  FakeUnitRepository,
  FakeTransactionRepository,
  FakeBarberUsersRepository,
  FakeCashRegisterRepository,
} from '../../helpers/fake-repositories'
import { defaultUnit, defaultUser } from '../../helpers/default-values'
import { CreateTransactionService } from '../../../src/services/transaction/create-transaction'

let transactionRepo: FakeTransactionRepository
let barberRepo: FakeBarberUsersRepository
let cashRepo: FakeCashRegisterRepository

vi.mock('../../../src/services/@factories/transaction/make-create-transaction', () => ({
  makeCreateTransaction: () => new CreateTransactionService(transactionRepo, barberRepo, cashRepo),
}))

function setup(unitBalance = 100) {
  const loanRepo = new FakeLoanRepository()
  const unit = { ...defaultUnit, totalBalance: unitBalance }
  const unitRepo = new FakeUnitRepository(unit)
  transactionRepo = new FakeTransactionRepository()
  barberRepo = new FakeBarberUsersRepository()
  cashRepo = new FakeCashRegisterRepository()
  barberRepo.users.push({ ...defaultUser, unit } as any)
  cashRepo.session = {
    id: 'session-1',
    openedById: defaultUser.id,
    unitId: unit.id,
    openedAt: new Date(),
    closedAt: null,
    initialAmount: 0,
    finalAmount: null,
    transactions: [],
    sales: [],
  }
  const service = new CreateLoanService(loanRepo, unitRepo)
  const userId = 'user-1'
  return { service, loanRepo, unitRepo, userId, unit }
}

describe('CreateLoanService', () => {
  let ctx: ReturnType<typeof setup>

  beforeEach(() => {
    ctx = setup()
  })

  it('creates a loan and decreases unit balance', async () => {
    const loan = await ctx.service.execute({
      userId: ctx.userId,
      unitId: ctx.unit.id,
      amount: 20,
    })

    expect(loan.amount).toBe(20)
    expect(ctx.unitRepo.unit.totalBalance).toBe(80)
    expect(ctx.loanRepo.loans).toHaveLength(1)
  })
})
