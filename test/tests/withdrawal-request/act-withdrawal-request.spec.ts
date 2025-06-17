import { describe, it, expect, beforeEach } from 'vitest'
import { ActWithdrawalRequestService } from '../../../src/services/withdrawal-request/act-withdrawal-request'
import {
  FakeWithdrawalRequestRepository,
  FakeBarberUsersRepository,
  FakeCashRegisterRepository,
  FakeTransactionRepository,
  FakeOrganizationRepository,
  FakeProfilesRepository,
  FakeUnitRepository,
} from '../../helpers/fake-repositories'
import { makeProfile, makeUser, defaultUnit, defaultOrganization, defaultUser } from '../../helpers/default-values'
import { WithdrawalRequestStatus } from '@prisma/client'

type SetupOptions = { userBalance?: number; unitBalance?: number; orgBalance?: number; allowsLoan?: boolean }

function setup(options: SetupOptions = {}) {
  const withdrawRepo = new FakeWithdrawalRequestRepository()
  const userRepo = new FakeBarberUsersRepository()
  const cashRepo = new FakeCashRegisterRepository()
  const transactionRepo = new FakeTransactionRepository()
  const organization = { ...defaultOrganization, totalBalance: options.orgBalance ?? 0 }
  const organizationRepo = new FakeOrganizationRepository(organization)
  const unit = { ...defaultUnit, totalBalance: options.unitBalance ?? 0, allowsLoan: options.allowsLoan ?? false }
  const unitRepo = new FakeUnitRepository(unit)
  const profileRepo = new FakeProfilesRepository()
  const service = new ActWithdrawalRequestService(
    withdrawRepo,
    userRepo,
    cashRepo,
    transactionRepo,
    organizationRepo,
    profileRepo,
    unitRepo,
  )

  const profile = makeProfile('p1', 'barber-1', options.userBalance ?? 0)
  profileRepo.profiles.push(profile)
  const applicant = makeUser('barber-1', profile, unit)
  const request = {
    id: 'wr1',
    applicantId: applicant.id,
    unitId: unit.id,
    amount: 20,
    transactionId: null,
    status: 'WAITING' as WithdrawalRequestStatus,
    userWhoActedId: null,
    createdAt: new Date(),
    applicant: applicant,
    unit: unit,
    transaction: null,
    userWhoActed: null,
  }
  withdrawRepo.requests.push(request as any)

  const approver = { ...defaultUser, id: 'manager-1', unitId: unit.id, organizationId: organization.id, profile: null }
  userRepo.users.push(approver)

  cashRepo.session = {
    id: 's1',
    openedById: approver.id,
    unitId: unit.id,
    openedAt: new Date(),
    closedAt: null,
    initialAmount: 0,
    finalAmount: null,
    user: {},
    transactions: [],
    sales: [],
  } as any

  const token = { sub: approver.id, role: 'MANAGER', unitId: unit.id, organizationId: organization.id } as any

  return { service, withdrawRepo, userRepo, cashRepo, transactionRepo, organizationRepo, profileRepo, unitRepo, request, token }
}

describe('Act withdrawal request service', () => {
  it('accepts request with sufficient balance', async () => {
    const ctx = setup({ userBalance: 50, unitBalance: 100 })
    const res = await ctx.service.execute('wr1', WithdrawalRequestStatus.ACCEPTED, ctx.token)
    expect(res.request.status).toBe('ACCEPTED')
    expect(ctx.profileRepo.profiles[0].totalBalance).toBe(30)
    expect(ctx.unitRepo.unit.totalBalance).toBe(100)
    expect(ctx.organizationRepo.organization.totalBalance).toBe(0)
    expect(ctx.transactionRepo.transactions).toHaveLength(1)
    expect(ctx.withdrawRepo.requests[0].transactionId).toBe(ctx.transactionRepo.transactions[0].id)
  })

  it('accepts request using unit loan', async () => {
    const ctx = setup({ userBalance: 10, unitBalance: 50, orgBalance: 50, allowsLoan: true })
    await ctx.service.execute('wr1', WithdrawalRequestStatus.ACCEPTED, ctx.token)
    expect(ctx.profileRepo.profiles[0].totalBalance).toBe(-10)
    expect(ctx.unitRepo.unit.totalBalance).toBe(40)
    expect(ctx.organizationRepo.organization.totalBalance).toBe(40)
  })

  it('cancels request', async () => {
    const ctx = setup()
    const res = await ctx.service.execute('wr1', WithdrawalRequestStatus.CANCELLED, ctx.token)
    expect(res.request.status).toBe('CANCELLED')
    expect(ctx.withdrawRepo.requests[0].userWhoActedId).toBe('manager-1')
    expect(ctx.transactionRepo.transactions).toHaveLength(0)
  })

  it('throws when unauthorized role', async () => {
    const ctx = setup()
    const token = { sub: 'x', role: 'BARBER', unitId: 'unit-1', organizationId: 'org-1' } as any
    await expect(ctx.service.execute('wr1', WithdrawalRequestStatus.REJECTED, token)).rejects.toThrow('Unauthorized')
  })
})
