import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ListSessionsController } from '../../../src/http/controllers/cash-register/list-sessions-controller'
import * as factory from '../../../src/services/@factories/cash-register/make-list-sessions'

describe('ListSessionsController', () => {
  const execute = vi.fn()
  const service = { execute }

  beforeEach(() => {
    vi.spyOn(factory, 'makeListSessionsService').mockReturnValue(service as any)
    execute.mockResolvedValue({ sessions: [{ id: '1' }] })
    vi.clearAllMocks()
  })

  it('should list sessions for user', async () => {
    const user = { sub: '1', unitId: 'unit-1', role: 'ADMIN', organizationId: 'org' }
    const request = { user } as any
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any

    await ListSessionsController(request, reply)

    expect(factory.makeListSessionsService).toHaveBeenCalled()
    expect(execute).toHaveBeenCalledWith(user)
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith([{ id: '1' }])
  })
})
