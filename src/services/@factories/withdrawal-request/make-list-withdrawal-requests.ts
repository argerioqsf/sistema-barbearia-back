import { PrismaWithdrawalRequestRepository } from '@/repositories/prisma/prisma-withdrawal-request-repository'
import { ListWithdrawalRequestsService } from '@/services/withdrawal-request/list-withdrawal-requests'

export function makeListWithdrawalRequests() {
  return new ListWithdrawalRequestsService(
    new PrismaWithdrawalRequestRepository(),
  )
}
