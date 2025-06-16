import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetSaleController } from '../../../src/http/controllers/sale/get-sale-controller'
import * as factory from '../../../src/services/@factories/sale/make-get-sale'

describe('GetSaleController', () => {
  const execute = vi.fn()
  const service = { execute }

  beforeEach(() => {
    vi.spyOn(factory, 'makeGetSale').mockReturnValue(service as any)
    vi.clearAllMocks()
  })

  it('should return sale if found', async () => {
    execute.mockResolvedValue({ sale: { id: '1' } })
    const request = { params: { id: '1' } } as any
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any

    await GetSaleController(request, reply)

    expect(factory.makeGetSale).toHaveBeenCalled()
    expect(execute).toHaveBeenCalledWith({ id: '1' })
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith({ id: '1' })
  })

  it('should return 404 when not found', async () => {
    execute.mockResolvedValue({ sale: null })
    const request = { params: { id: '2' } } as any
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any

    await GetSaleController(request, reply)

    expect(reply.status).toHaveBeenCalledWith(404)
    expect(reply.send).toHaveBeenCalledWith({ message: 'Sale not found' })
  })
})
