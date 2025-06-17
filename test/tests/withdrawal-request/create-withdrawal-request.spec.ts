import { describe, it, expect } from 'vitest'
import { CreateWithdrawalRequestService } from '../../../src/services/withdrawal-request/create-withdrawal-request'
import {
  FakeWithdrawalRequestRepository,
  FakeBarberUsersRepository,
  FakeUnitRepository,
  FakeProfilesRepository,
  FakeOrganizationRepository,
} from '../../helpers/fake-repositories'
import { makeProfile, makeUser, defaultUnit } from '../../helpers/default-values'

function setup(options?: { userBalance?: number; unitBalance?: number; allowsLoan?: boolean }) {
  const withdrawRepo = new FakeWithdrawalRequestRepository()
  const userRepo = new FakeBarberUsersRepository()
  const unit = { ...defaultUnit, totalBalance: options?.unitBalance ?? defaultUnit.totalBalance, allowsLoan: options?.allowsLoan ?? defaultUnit.allowsLoan }
  const unitRepo = new FakeUnitRepository(unit)
  const profileRepo = new FakeProfilesRepository()
  const organizationRepo = new FakeOrganizationRepository({ id: 'org-1', name: '', slug: '', ownerId: null, totalBalance: 0, createdAt: new Date() })
  const profile = makeProfile('p1', 'u1', options?.userBalance ?? 0)
  profileRepo.profiles.push(profile)
  const user = makeUser('u1', profile, unit)
  userRepo.users.push(user)
  const service = new CreateWithdrawalRequestService(
    withdrawRepo,
    userRepo,
    profileRepo,
    unitRepo,
    organizationRepo,
  )
  return { service, withdrawRepo, user, unitRepo, profileRepo, organizationRepo }
}

describe('Create withdrawal request service', () => {
  it('creates request when balance sufficient', async () => {
    const { service, withdrawRepo, user, profileRepo, unitRepo, organizationRepo } = setup({ userBalance: 50 })
    const res = await service.execute({ userId: user.id, amount: 30 })
    expect(res.request.amount).toBe(30)
    expect(withdrawRepo.requests).toHaveLength(1)
    expect(profileRepo.profiles[0].totalBalance).toBe(20)
    expect(unitRepo.unit.totalBalance).toBe(0)
    expect(organizationRepo.organization.totalBalance).toBe(0)
    expect(withdrawRepo.requests[0].loanValue).toBeNull()
  })

  it('fails when balance insufficient and loan disallowed', async () => {
    const { service, user } = setup({ userBalance: 10, allowsLoan: false })
    await expect(service.execute({ userId: user.id, amount: 20 })).rejects.toThrow('Insufficient balance for withdrawal')
  })

  it('fails when amount exceeds unit balance', async () => {
    const { service, user } = setup({ userBalance: 10, allowsLoan: true, unitBalance: 5 })
    await expect(service.execute({ userId: user.id, amount: 20 })).rejects.toThrow('Withdrawal amount greater than unit balance')
  })

  it('creates request with loan when allowed', async () => {
    const { service, withdrawRepo, user, profileRepo, unitRepo, organizationRepo } = setup({ userBalance: 10, allowsLoan: true, unitBalance: 100 })
    await service.execute({ userId: user.id, amount: 20 })
    expect(withdrawRepo.requests[0].amount).toBe(20)
    expect(withdrawRepo.requests[0].loanValue).toBe(10)
    expect(profileRepo.profiles[0].totalBalance).toBe(-10)
    expect(unitRepo.unit.totalBalance).toBe(90)
    expect(organizationRepo.organization.totalBalance).toBe(-10)
  })
})
