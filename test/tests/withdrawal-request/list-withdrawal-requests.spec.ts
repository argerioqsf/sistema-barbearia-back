import { describe, it, expect, beforeEach } from 'vitest'
import { ListWithdrawalRequestsService } from '../../../src/services/withdrawal-request/list-withdrawal-requests'
import { FakeWithdrawalRequestRepository } from '../../helpers/fake-repositories'
import { WithdrawalRequestStatus } from '@prisma/client'

describe('List withdrawal requests service', () => {
  let repo: FakeWithdrawalRequestRepository
  let service: ListWithdrawalRequestsService

  beforeEach(() => {
    repo = new FakeWithdrawalRequestRepository()
    repo.requests.push(
      {
        id: 'r1',
        applicantId: 'u1',
        unitId: 'unit-1',
        amount: 10,
        transactionId: null,
        status: 'WAITING' as WithdrawalRequestStatus,
        userWhoActedId: null,
        createdAt: new Date(),
        applicant: { id: 'u1', profile: null } as any,
        unit: { id: 'unit-1', organizationId: 'org-1', totalBalance: 0, allowsLoan: false, name: '', slug: '' },
        transaction: null,
        userWhoActed: null,
      } as any,
    )
    repo.requests.push(
      {
        id: 'r2',
        applicantId: 'u2',
        unitId: 'unit-2',
        amount: 10,
        transactionId: null,
        status: 'WAITING' as WithdrawalRequestStatus,
        userWhoActedId: null,
        createdAt: new Date(),
        applicant: { id: 'u2', profile: null } as any,
        unit: { id: 'unit-2', organizationId: 'org-2', totalBalance: 0, allowsLoan: false, name: '', slug: '' },
        transaction: null,
        userWhoActed: null,
      } as any,
    )
    service = new ListWithdrawalRequestsService(repo)
  })

  it('lists for barber by applicant', async () => {
    const res = await service.execute({ sub: 'u1', role: 'BARBER', unitId: 'unit-1', organizationId: 'org-1' } as any)
    expect(res.requests).toHaveLength(1)
    expect(res.requests[0].id).toBe('r1')
  })

  it('lists for manager by unit', async () => {
    const res = await service.execute({ sub: 'm1', role: 'MANAGER', unitId: 'unit-2', organizationId: 'org-2' } as any)
    expect(res.requests).toHaveLength(1)
    expect(res.requests[0].id).toBe('r2')
  })

  it('lists for owner by organization', async () => {
    const res = await service.execute({ sub: 'o1', role: 'OWNER', unitId: 'unit-1', organizationId: 'org-1' } as any)
    expect(res.requests).toHaveLength(1)
    expect(res.requests[0].id).toBe('r1')
  })

  it('lists all for admin', async () => {
    const res = await service.execute({ sub: 'a1', role: 'ADMIN', unitId: 'unit-1', organizationId: 'org-1' } as any)
    expect(res.requests).toHaveLength(2)
  })

  it('throws when user not found', async () => {
    await expect(service.execute({ sub: '', role: 'ADMIN', unitId: 'unit-1', organizationId: 'org-1' } as any)).rejects.toThrow('User not found')
  })
})
