import { PrismaTransactionRepository } from '@/repositories/prisma/prisma-transaction-repository'
import { PrismaUnitRepository } from '@/repositories/prisma/prisma-unit-repository'
import { IncrementBalanceUnitService } from '@/services/unit/increment-balance-unit'

export function makeIncrementBalanceService() {
  return new IncrementBalanceUnitService(
    new PrismaUnitRepository(),
    new PrismaTransactionRepository(),
  )
}
