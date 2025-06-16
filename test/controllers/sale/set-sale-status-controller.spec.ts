import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SetSaleStatusController } from '../../../src/http/controllers/sale/set-sale-status-controller'
import * as factory from '../../../src/services/@factories/sale/make-set-sale-status'

describe('SetSaleStatusController', () => {
  const execute = vi.fn()
  const service = { execute }

  beforeEach(() => {
    vi.spyOn(factory, 'makeSetSaleStatus').mockReturnValue(service as any)
    execute.mockResolvedValue({ sale: { id: '1' } })
    vi.clearAllMocks()
  })

  it('should update sale status', async () => {
    const request = {
      params: { id: '1' },
      body: { paymentStatus: 'PAID' },
      user: { sub: 'user1' },
    } as any
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any

    await SetSaleStatusController(request, reply)

    expect(factory.makeSetSaleStatus).toHaveBeenCalled()
    expect(execute).toHaveBeenCalledWith({
      saleId: '1',
      userId: 'user1',
      paymentStatus: 'PAID',
    })
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith({ id: '1' })
  })
})
