import { PrismaLoanRepository } from '@/repositories/prisma/prisma-loan-repository'
import { PrismaUnitRepository } from '@/repositories/prisma/prisma-unit-repository'
import { CreateLoanService } from '@/services/loan/create-loan'

export function makeCreateLoanService() {
  return new CreateLoanService(
    new PrismaLoanRepository(),
    new PrismaUnitRepository(),
  )
}
