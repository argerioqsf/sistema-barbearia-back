import {
  DiscountType,
  PaymentMethod,
  PaymentStatus,
  SaleItem,
} from '@prisma/client'
import { DetailedSale } from '@/repositories/sale-repository'
import { OrganizationRepository } from '@/repositories/organization-repository'
import { ProfilesRepository } from '@/repositories/profiles-repository'
import { UnitRepository } from '@/repositories/unit-repository'
import { TransactionRepository } from '@/repositories/transaction-repository'

export interface DistributeProfitsDeps {
  organizationRepository: OrganizationRepository
  profileRepository: ProfilesRepository
  unitRepository: UnitRepository
  transactionRepository: TransactionRepository
}

export interface CreateSaleItem {
  serviceId?: string
  productId?: string
  quantity: number
  barberId?: string
  couponCode?: string
  price?: number
}

export interface CreateSaleRequest {
  userId: string
  method: PaymentMethod
  items: CreateSaleItem[]
  clientId: string
  couponCode?: string
  paymentStatus?: PaymentStatus
}

export interface CreateSaleResponse {
  sale: DetailedSale
}

export interface ConnectRelation {
  connect: { id: string }
}

export type DataItem = {
  quantity: number
  service?: { connect: { id?: string } }
  product?: { connect: { id?: string } }
}

export type TempItems = {
  basePrice: number
  price: number
  discount: number
  discountType: DiscountType | null
  porcentagemBarbeiro?: number
  ownDiscount: boolean
  coupon?: { connect: { id: string | null } }
  data: DataItem & {
    barber?: { connect: { id: string } }
    coupon?: { connect: { id: string } }
  }
}

export type SaleItemTemp = Omit<
  SaleItem & {
    coupon?: { connect: { id: string } }
    service?: { connect: { id?: string } }
    product?: { connect: { id?: string } }
    barber?: { connect: { id: string } }
  },
  'id' | 'saleId' | 'serviceId' | 'productId' | 'barberId' | 'couponId'
>

export interface GetSaleRequest {
  id: string
}

export interface GetSaleResponse {
  sale: DetailedSale | null
}

export interface ListSalesResponse {
  sales: DetailedSale[]
}

export interface SetSaleStatusRequest {
  saleId: string
  userId: string
  paymentStatus: PaymentStatus
}

export interface SetSaleStatusResponse {
  sale: DetailedSale
}
