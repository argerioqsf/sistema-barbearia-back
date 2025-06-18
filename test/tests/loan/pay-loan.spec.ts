import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PayLoanService } from '../../../src/services/loan/pay-loan'
import {
  FakeLoanRepository,
  FakeProfilesRepository,
  FakeUnitRepository,
  FakeTransactionRepository,
  FakeBarberUsersRepository,
  FakeCashRegisterRepository,
} from '../../helpers/fake-repositories'
import { defaultProfile, defaultUnit, defaultUser } from '../../helpers/default-values'
import { CreateTransactionService } from '../../../src/services/transaction/create-transaction'

let transactionRepo: FakeTransactionRepository
let barberRepo: FakeBarberUsersRepository
let cashRepo: FakeCashRegisterRepository

vi.mock('../../../src/services/@factories/transaction/make-create-transaction', () => ({
  makeCreateTransaction: () => new CreateTransactionService(transactionRepo, barberRepo, cashRepo),
}))

function setup(profileBalance = 50) {
  const loanRepo = new FakeLoanRepository()
  const profileRepo = new FakeProfilesRepository()
  const profile = { ...defaultProfile, totalBalance: profileBalance, user: { id: 'user-1' } as any }
  profileRepo.profiles.push(profile as any)
  const unit = { ...defaultUnit }
  const unitRepo = new FakeUnitRepository(unit)
  transactionRepo = new FakeTransactionRepository()
  barberRepo = new FakeBarberUsersRepository()
  cashRepo = new FakeCashRegisterRepository()
  barberRepo.users.push({ ...defaultUser, id: 'user-1', unit, unitId: unit.id } as any)
  cashRepo.session = {
    id: 'session-1',
    openedById: 'user-1',
    unitId: unit.id,
    openedAt: new Date(),
    closedAt: null,
    initialAmount: 0,
    finalAmount: null,
    transactions: [],
    sales: [],
  }
  const service = new PayLoanService(loanRepo, profileRepo, unitRepo)
  return { service, loanRepo, profileRepo, unitRepo, profile, unit }
}

describe('PayLoanService', () => {
  let ctx: ReturnType<typeof setup>

  beforeEach(() => {
    ctx = setup()
  })

  it('pays a loan when balance is sufficient', async () => {
    const loan = await ctx.loanRepo.create({
      amount: 20,
      user: { connect: { id: ctx.profile.user.id } },
      unit: { connect: { id: ctx.unit.id } },
      transaction: { connect: { id: 'tx1' } },
    })

    const updated = await ctx.service.execute({ loanId: loan.id, userId: ctx.profile.user.id })

    expect(updated.status).toBe('PAID')
    expect(ctx.profile.totalBalance).toBe(30)
    expect(ctx.unitRepo.unit.totalBalance).toBe(20)
  })
})
