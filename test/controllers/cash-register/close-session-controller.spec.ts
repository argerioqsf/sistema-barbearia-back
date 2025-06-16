import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CloseSessionController } from '../../../src/http/controllers/cash-register/close-session-controller'
import * as factory from '../../../src/services/@factories/cash-register/make-close-session'

describe('CloseSessionController', () => {
  const execute = vi.fn()
  const service = { execute }

  beforeEach(() => {
    vi.spyOn(factory, 'makeCloseSessionService').mockReturnValue(service as any)
    execute.mockResolvedValue({ session: { id: '1' } })
    vi.clearAllMocks()
  })

  it('should close current session and return it', async () => {
    const request = { user: { unitId: 'unit-1' } } as any
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any

    await CloseSessionController(request, reply)

    expect(factory.makeCloseSessionService).toHaveBeenCalled()
    expect(execute).toHaveBeenCalledWith({ unitId: 'unit-1' })
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith({ id: '1' })
  })
})
