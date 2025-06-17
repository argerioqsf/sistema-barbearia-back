import { PrismaWithdrawalRequestRepository } from '@/repositories/prisma/prisma-withdrawal-request-repository'
import { PrismaBarberUsersRepository } from '@/repositories/prisma/prisma-barber-users-repository'
import { PrismaProfilesRepository } from '@/repositories/prisma/prisma-profile-repository'
import { PrismaUnitRepository } from '@/repositories/prisma/prisma-unit-repository'
import { PrismaOrganizationRepository } from '@/repositories/prisma/prisma-organization-repository'
import { CreateWithdrawalRequestService } from '@/services/withdrawal-request/create-withdrawal-request'

export function makeCreateWithdrawalRequest() {
  return new CreateWithdrawalRequestService(
    new PrismaWithdrawalRequestRepository(),
    new PrismaBarberUsersRepository(),
    new PrismaProfilesRepository(),
    new PrismaUnitRepository(),
    new PrismaOrganizationRepository(),
  )
}
