import { PrismaSaleRepository } from '@/repositories/prisma/prisma-sale-repository'
import { PrismaBarberUsersRepository } from '@/repositories/prisma/prisma-barber-users-repository'
import { PrismaCashRegisterRepository } from '@/repositories/prisma/prisma-cash-register-repository'
import { PrismaTransactionRepository } from '@/repositories/prisma/prisma-transaction-repository'
import { PrismaOrganizationRepository } from '@/repositories/prisma/prisma-organization-repository'
import { PrismaProfilesRepository } from '@/repositories/prisma/prisma-profile-repository'
import { PrismaUnitRepository } from '@/repositories/prisma/prisma-unit-repository'
import { PrismaBarberServiceRepository } from '@/repositories/prisma/prisma-barber-service-repository'
import { PrismaBarberProductRepository } from '@/repositories/prisma/prisma-barber-product-repository'
import { SetSaleStatusService } from '@/services/sale/set-sale-status'

export function makeSetSaleStatus() {
  const saleRepository = new PrismaSaleRepository()
  const barberUserRepository = new PrismaBarberUsersRepository()
  const cashRegisterRepository = new PrismaCashRegisterRepository()
  const transactionRepository = new PrismaTransactionRepository()
  const organizationRepository = new PrismaOrganizationRepository()
  const profileRepository = new PrismaProfilesRepository()
  const unitRepository = new PrismaUnitRepository()
  const barberServiceRepository = new PrismaBarberServiceRepository()
  const barberProductRepository = new PrismaBarberProductRepository()
  return new SetSaleStatusService(
    saleRepository,
    barberUserRepository,
    barberServiceRepository,
    barberProductRepository,
    cashRegisterRepository,
    transactionRepository,
    organizationRepository,
    profileRepository,
    unitRepository,
  )
}
