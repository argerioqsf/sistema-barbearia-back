import { describe, it, expect } from 'vitest'
import { ActWithdrawalRequestService } from '../../../src/services/withdrawal-request/act-withdrawal-request'
import {
  FakeWithdrawalRequestRepository,
  FakeOrganizationRepository,
  FakeProfilesRepository,
  FakeUnitRepository,
} from '../../helpers/fake-repositories'
import { makeProfile, makeUser, defaultUnit, defaultOrganization, defaultUser } from '../../helpers/default-values'
import { WithdrawalRequestStatus } from '@prisma/client'

type SetupOptions = {
  userBalance?: number
  unitBalance?: number
  orgBalance?: number
  allowsLoan?: boolean
  loanValue?: number | null
}

function setup(options: SetupOptions = {}) {
  const withdrawRepo = new FakeWithdrawalRequestRepository()
  const organization = { ...defaultOrganization, totalBalance: options.orgBalance ?? 0 }
  const organizationRepo = new FakeOrganizationRepository(organization)
  const unit = { ...defaultUnit, totalBalance: options.unitBalance ?? 0, allowsLoan: options.allowsLoan ?? false }
  const unitRepo = new FakeUnitRepository(unit)
  const profileRepo = new FakeProfilesRepository()
  const service = new ActWithdrawalRequestService(
    withdrawRepo,
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
    loanValue: options.loanValue ?? null,
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

  const token = { sub: approver.id, role: 'MANAGER', unitId: unit.id, organizationId: organization.id } as any

  return { service, withdrawRepo, organizationRepo, profileRepo, unitRepo, request, token }
}

describe('Act withdrawal request service', () => {
  it('accepts request with sufficient balance', async () => {
    const ctx = setup({ userBalance: 30, unitBalance: 100 })
    const res = await ctx.service.execute('wr1', WithdrawalRequestStatus.ACCEPTED, ctx.token)
    expect(res.request.status).toBe('ACCEPTED')
    expect(ctx.profileRepo.profiles[0].totalBalance).toBe(30)
    expect(ctx.unitRepo.unit.totalBalance).toBe(100)
    expect(ctx.organizationRepo.organization.totalBalance).toBe(0)
  })

  it('accepts request using unit loan', async () => {
    const ctx = setup({ userBalance: -10, unitBalance: 40, orgBalance: 40, allowsLoan: true, loanValue: 10 })
    await ctx.service.execute('wr1', WithdrawalRequestStatus.ACCEPTED, ctx.token)
    expect(ctx.profileRepo.profiles[0].totalBalance).toBe(-10)
    expect(ctx.unitRepo.unit.totalBalance).toBe(40)
    expect(ctx.organizationRepo.organization.totalBalance).toBe(40)
  })

  it('cancels request', async () => {
    const ctx = setup({ userBalance: 30 })
    const res = await ctx.service.execute('wr1', WithdrawalRequestStatus.CANCELLED, ctx.token)
    expect(res.request.status).toBe('CANCELLED')
    expect(ctx.withdrawRepo.requests[0].userWhoActedId).toBe('manager-1')
    expect(ctx.profileRepo.profiles[0].totalBalance).toBe(50)
  })

  it('rejects request with loan returning values', async () => {
    const ctx = setup({ userBalance: -10, unitBalance: 40, orgBalance: 40, loanValue: 10 })
    const res = await ctx.service.execute('wr1', WithdrawalRequestStatus.REJECTED, ctx.token)
    expect(res.request.status).toBe('REJECTED')
    expect(ctx.profileRepo.profiles[0].totalBalance).toBe(0)
    expect(ctx.unitRepo.unit.totalBalance).toBe(50)
    expect(ctx.organizationRepo.organization.totalBalance).toBe(50)
  })

  it('throws when unauthorized role', async () => {
    const ctx = setup()
    const token = { sub: 'x', role: 'BARBER', unitId: 'unit-1', organizationId: 'org-1' } as any
    await expect(ctx.service.execute('wr1', WithdrawalRequestStatus.REJECTED, token)).rejects.toThrow('Unauthorized')
  })
})
