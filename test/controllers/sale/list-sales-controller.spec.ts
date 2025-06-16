import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ListSalesController } from '../../../src/http/controllers/sale/list-sales-controller'
import * as factory from '../../../src/services/@factories/sale/make-list-sales'

describe('ListSalesController', () => {
  const execute = vi.fn()
  const service = { execute }

  beforeEach(() => {
    vi.spyOn(factory, 'makeListSales').mockReturnValue(service as any)
    execute.mockResolvedValue({ sales: [{ id: '1' }] })
    vi.clearAllMocks()
  })

  it('should list sales for user', async () => {
    const user = { sub: '1', unitId: 'unit-1', role: 'ADMIN', organizationId: 'org' }
    const request = { user } as any
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() } as any

    await ListSalesController(request, reply)

    expect(factory.makeListSales).toHaveBeenCalled()
    expect(execute).toHaveBeenCalledWith(user)
    expect(reply.status).toHaveBeenCalledWith(200)
    expect(reply.send).toHaveBeenCalledWith([{ id: '1' }])
  })
})
