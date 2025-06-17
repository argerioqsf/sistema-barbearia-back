import { PrismaWithdrawalRequestRepository } from '@/repositories/prisma/prisma-withdrawal-request-repository'
import { PrismaOrganizationRepository } from '@/repositories/prisma/prisma-organization-repository'
import { PrismaProfilesRepository } from '@/repositories/prisma/prisma-profile-repository'
import { PrismaUnitRepository } from '@/repositories/prisma/prisma-unit-repository'
import { ActWithdrawalRequestService } from '@/services/withdrawal-request/act-withdrawal-request'

export function makeActWithdrawalRequest() {
  return new ActWithdrawalRequestService(
    new PrismaWithdrawalRequestRepository(),
    new PrismaOrganizationRepository(),
    new PrismaProfilesRepository(),
    new PrismaUnitRepository(),
  )
}
