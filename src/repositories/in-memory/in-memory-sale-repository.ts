import {
  Prisma,
  DiscountType,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client'
import {
  SaleRepository,
  DetailedSale,
  DetailedSaleItem,
} from '../sale-repository'
import { randomUUID } from 'crypto'

export class InMemorySaleRepository implements SaleRepository {
  public sales: DetailedSale[] = []

  async create(data: Prisma.SaleCreateInput): Promise<DetailedSale> {
    const saleId = randomUUID()
    const unitId = (data.unit as { connect: { id: string } }).connect.id
    type SaleItemData = {
      service?: { connect: { id: string } }
      product?: { connect: { id: string } }
      quantity: number
      barber?: { connect: { id: string } }
      coupon?: { connect: { id: string } }
      price: number
      discount?: number | null
      discountType?: DiscountType | null
      porcentagemBarbeiro?: number | null
    }
    const itemsData = (data.items as { create: SaleItemData[] }).create
    const items: DetailedSaleItem[] = itemsData.map((it) => ({
      id: randomUUID(),
      saleId,
      serviceId: it.service?.connect.id ?? null,
      productId: it.product?.connect.id ?? null,
      quantity: it.quantity,
      barberId: it.barber?.connect.id ?? null,
      couponId: it.coupon?.connect.id ?? null,
      price: it.price as number,
      discount: it.discount ?? null,
      discountType: it.discountType ?? null,
      porcentagemBarbeiro: it.porcentagemBarbeiro ?? null,
      service: it.service
        ? {
            id: it.service.connect.id,
            name: '',
            description: null,
            imageUrl: null,
            cost: 0,
            price: 0,
            category: null,
            defaultTime: null,
            commissionPercentage: null,
            unitId: 'unit-1',
          }
        : null,
      product: it.product
        ? {
            id: it.product.connect.id,
            name: '',
            description: null,
            imageUrl: null,
            quantity: 0,
            cost: 0,
            commissionPercentage: null,
            price: 0,
            unitId: 'unit-1',
          }
        : null,
      barber: it.barber
        ? {
            id: it.barber.connect.id,
            name: '',
            email: '',
            password: '',
            active: true,
            organizationId: 'org-1',
            unitId: 'unit-1',
            versionToken: 1,
            versionTokenInvalidate: null,
            createdAt: new Date(),
            profile: {
              id: 'profile-' + it.barber.connect.id,
              phone: '',
              cpf: '',
              genre: '',
              birthday: '',
              pix: '',
              roleId: randomUUID(),
              commissionPercentage: it.porcentagemBarbeiro ?? 100,
              totalBalance: 0,
              userId: it.barber.connect.id,
              createdAt: new Date(),
            },
          }
        : null,
      coupon: it.coupon
        ? {
            id: it.coupon.connect.id,
            code: '',
            description: null,
            discount: 0,
            discountType: DiscountType.VALUE,
            imageUrl: null,
            quantity: 0,
            unitId: 'unit-1',
            createdAt: new Date(),
          }
        : null,
    }))
    const sale = {
      id: saleId,
      userId: (data.user as { connect: { id: string } }).connect.id,
      clientId: (data.client as { connect: { id: string } }).connect.id,
      unitId,
      sessionId:
        (data.session as { connect: { id: string } } | undefined)?.connect.id ??
        null,
      couponId:
        (data.coupon as { connect: { id: string } } | undefined)?.connect.id ??
        null,
      total: data.total as number,
      method: data.method as PaymentMethod,
      paymentStatus: data.paymentStatus as PaymentStatus,
      createdAt: new Date(),
      items,
      user: {
        id: (data.user as { connect: { id: string } }).connect.id,
        name: '',
        email: '',
        password: '',
        active: true,
        organizationId: 'org-1',
        unitId: 'unit-1',
        versionToken: 1,
        versionTokenInvalidate: null,
        createdAt: new Date(),
        profile: null,
      },
      client: {
        id: (data.client as { connect: { id: string } }).connect.id,
        name: '',
        email: '',
        password: '',
        active: true,
        organizationId: 'org-1',
        unitId: 'unit-1',
        versionToken: 1,
        versionTokenInvalidate: null,
        createdAt: new Date(),
        profile: null,
      },
      coupon: data.coupon
        ? {
            id: (data.coupon as { connect: { id: string } }).connect.id,
            code: '',
            description: null,
            discount: 0,
            discountType: DiscountType.VALUE,
            imageUrl: null,
            quantity: 0,
            unitId: 'unit-1',
            createdAt: new Date(),
          }
        : null,
      session: null,
      transactions: [],
      unit: {
        id: unitId,
        name: '',
        slug: '',
        organizationId: 'org-1',
        totalBalance: 0,
        allowsLoan: false,
      },
    } as DetailedSale & { unit: { organizationId: string } }
    this.sales.push(sale)
    return sale
  }

  async findMany(where: Prisma.SaleWhereInput = {}): Promise<DetailedSale[]> {
    return this.sales.filter((s) => {
      if (where.unitId && s.unitId !== where.unitId) return false
      if (
        where.unit &&
        'organizationId' in (where.unit as { organizationId: string })
      ) {
        const orgId = (where.unit as { organizationId: string }).organizationId
        const unitOrg =
          (s as { unit?: { organizationId?: string }; organizationId?: string })
            .unit?.organizationId ??
          (s as { organizationId?: string }).organizationId
        return unitOrg === orgId
      }
      return true
    })
  }

  async findById(id: string): Promise<DetailedSale | null> {
    return this.sales.find((s) => s.id === id) ?? null
  }

  async update(
    id: string,
    data: Prisma.SaleUpdateInput,
  ): Promise<DetailedSale> {
    const sale = this.sales.find((s) => s.id === id)
    if (!sale) throw new Error('Sale not found')
    if (data.paymentStatus) {
      sale.paymentStatus = data.paymentStatus as PaymentStatus
    }
    if (data.session && 'connect' in data.session) {
      const sid = (data.session as { connect: { id: string } }).connect.id
      sale.sessionId = sid
      sale.session = {
        id: sid,
        openedById: '',
        unitId: sale.unitId,
        openedAt: new Date(),
        closedAt: null,
        initialAmount: 0,
        finalAmount: null,
      }
    }
    sale.transactions = sale.transactions ?? []
    return sale
  }

  async findManyByDateRange(start: Date, end: Date): Promise<DetailedSale[]> {
    return this.sales.filter((s) => s.createdAt >= start && s.createdAt <= end)
  }

  async findManyByUser(userId: string): Promise<DetailedSale[]> {
    return this.sales.filter((s) => s.userId === userId)
  }

  async findManyByBarber(barberId: string): Promise<DetailedSale[]> {
    return this.sales.filter((s) =>
      s.items.some((i) => i.barberId === barberId),
    )
  }

  async findManyBySession(sessionId: string): Promise<DetailedSale[]> {
    return this.sales.filter((s) => s.sessionId === sessionId)
  }
}
