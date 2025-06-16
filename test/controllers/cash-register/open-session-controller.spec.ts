import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OpenSessionController } from '../../../src/http/controllers/cash-register/open-session-controller'
import * as factory from '../../../src/services/@factories/cash-register/make-open-session'

describe('OpenSessionController', () => {
  const execute = vi.fn()
  const service = { execute }

  beforeEach(() => {
    vi.spyOn(factory, 'makeOpenSessionService').mockReturnValue(service as any)
    execute.mockResolvedValue({ session: { id: '1' } })
    vi.clearAllMocks()
  })

  it('should open a new session', async () => {
    const user = { sub: '1', unitId: 'unit-1', role: 'ADMIN', organizationId: 'org' }
    const request = { user, body: { initialAmount: 100 } } as any
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any

    await OpenSessionController(request, reply)

    expect(factory.makeOpenSessionService).toHaveBeenCalled()
    expect(execute).toHaveBeenCalledWith({ initialAmount: 100, user })
    expect(reply.status).toHaveBeenCalledWith(201)
    expect(reply.send).toHaveBeenCalledWith({ id: '1' })
  })
})
