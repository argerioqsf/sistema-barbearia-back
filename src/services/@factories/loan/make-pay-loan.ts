import { PrismaLoanRepository } from '@/repositories/prisma/prisma-loan-repository'
import { PrismaProfilesRepository } from '@/repositories/prisma/prisma-profile-repository'
import { PrismaUnitRepository } from '@/repositories/prisma/prisma-unit-repository'
import { PayLoanService } from '@/services/loan/pay-loan'

export function makePayLoanService() {
  return new PayLoanService(
    new PrismaLoanRepository(),
    new PrismaProfilesRepository(),
    new PrismaUnitRepository(),
  )
}
