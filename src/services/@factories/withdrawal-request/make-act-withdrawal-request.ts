import { PrismaWithdrawalRequestRepository } from '@/repositories/prisma/prisma-withdrawal-request-repository'
import { PrismaBarberUsersRepository } from '@/repositories/prisma/prisma-barber-users-repository'
import { PrismaCashRegisterRepository } from '@/repositories/prisma/prisma-cash-register-repository'
import { PrismaTransactionRepository } from '@/repositories/prisma/prisma-transaction-repository'
import { PrismaOrganizationRepository } from '@/repositories/prisma/prisma-organization-repository'
import { PrismaProfilesRepository } from '@/repositories/prisma/prisma-profile-repository'
import { PrismaUnitRepository } from '@/repositories/prisma/prisma-unit-repository'
import { ActWithdrawalRequestService } from '@/services/withdrawal-request/act-withdrawal-request'

export function makeActWithdrawalRequest() {
  return new ActWithdrawalRequestService(
    new PrismaWithdrawalRequestRepository(),
    new PrismaBarberUsersRepository(),
    new PrismaCashRegisterRepository(),
    new PrismaTransactionRepository(),
    new PrismaOrganizationRepository(),
    new PrismaProfilesRepository(),
    new PrismaUnitRepository(),
  )
}
