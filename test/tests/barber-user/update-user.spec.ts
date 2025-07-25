import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateUserService } from '../../../src/services/barber-user/update-user'
import {
  InMemoryBarberUsersRepository,
  FakeUnitRepository,
  InMemoryPermissionRepository,
} from '../../helpers/fake-repositories'
import { defaultUnit } from '../../helpers/default-values'
import { makeUser } from '../../factories/make-user.factory'
import { makeProfile } from '../../factories/make-profile.factory'

describe('Update user service', () => {
  let repo: InMemoryBarberUsersRepository
  let unitRepo: FakeUnitRepository
  let service: UpdateUserService
  let permissionRepo: InMemoryPermissionRepository
  let stored: any

  beforeEach(() => {
    repo = new InMemoryBarberUsersRepository()
    unitRepo = new FakeUnitRepository({ ...defaultUnit }, [{ ...defaultUnit }])
    permissionRepo = new InMemoryPermissionRepository()
    service = new UpdateUserService(repo, unitRepo, permissionRepo)
    const user = makeUser()
    const profile = makeProfile({ userId: user.id })
    stored = { ...user, profile }
    repo.users.push(stored)
  })

  it('updates user data', async () => {
    const res = await service.execute({ id: stored.id, name: 'New', phone: '9' })
    expect(res.user.name).toBe('New')
    expect(res.profile?.phone).toBe('9')
  })

  it('updates unit when provided', async () => {
    const unit = { ...defaultUnit, id: 'u2' }
    unitRepo.units.push(unit)
    const res = await service.execute({ id: stored.id, unitId: 'u2' })
    expect(res.user.unitId).toBe('u2')
  })

  it('throws when user not found', async () => {
    await expect(service.execute({ id: 'x' })).rejects.toThrow('User not found')
  })

  it('throws when unit not exists', async () => {
    await expect(service.execute({ id: stored.id, unitId: 'bad' })).rejects.toThrow('Unit not exists')
  })

  it('validates permission against role', async () => {
    permissionRepo.permissions.push({
      id: 'p1',
      name: 'A1',
      unitId: defaultUnit.id,
    })
    ;(permissionRepo.permissions[0] as any).roles = [{ id: 'role-1' }]
    await expect(
      service.execute({ id: stored.id, permissions: ['p2'] })
    ).rejects.toThrow('permission not allowed for role')
  })

  it('adds permissions instead of replacing', async () => {
    repo.users[0].profile = {
      ...repo.users[0].profile,
      roleId: 'role-1',
      permissions: [
        {
          id: 'p1',
          name: 'A1',
          category: 'USER',
          unitId: defaultUnit.id,
        },
      ],
    } as any
    permissionRepo.permissions.push(
      { id: 'p1', name: 'A1', unitId: defaultUnit.id },
      { id: 'p2', name: 'A2', unitId: defaultUnit.id },
    )
    permissionRepo.permissions.forEach((p) =>
      ((p as any).roles = [{ id: 'role-1' }]),
    )
    await service.execute({ id: stored.id, permissions: ['p2'] })
    const ids = repo.users[0].profile?.permissions?.map((p) => p.id)
    expect(ids).toContain('p1')
    expect(ids).toContain('p2')
  })
})
