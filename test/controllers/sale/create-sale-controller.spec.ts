import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateSaleController } from '../../../src/http/controllers/sale/create-sale-controller'
import * as factory from '../../../src/services/@factories/sale/make-create-sale'

describe('CreateSaleController', () => {
  const execute = vi.fn()
  const service = { execute }

  beforeEach(() => {
    vi.spyOn(factory, 'makeCreateSale').mockReturnValue(service as any)
    execute.mockResolvedValue({ sale: { id: '1' } })
    vi.clearAllMocks()
  })

  it('should create a sale', async () => {
    const request = {
      body: {
        method: 'CASH',
        items: [{ serviceId: 's1', quantity: 1 }],
        clientId: 'client1',
      },
      user: { sub: 'user1' },
    } as any
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any

    await CreateSaleController(request, reply)

    expect(factory.makeCreateSale).toHaveBeenCalled()
    expect(execute).toHaveBeenCalledWith({
      method: 'CASH',
      items: [{ serviceId: 's1', quantity: 1 }],
      clientId: 'client1',
      userId: 'user1',
      paymentStatus: 'PENDING',
    })
    expect(reply.status).toHaveBeenCalledWith(201)
    expect(reply.send).toHaveBeenCalledWith({ id: '1' })
  })
})
