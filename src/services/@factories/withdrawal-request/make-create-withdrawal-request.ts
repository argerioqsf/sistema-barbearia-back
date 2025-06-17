import { PrismaWithdrawalRequestRepository } from '@/repositories/prisma/prisma-withdrawal-request-repository'
import { PrismaBarberUsersRepository } from '@/repositories/prisma/prisma-barber-users-repository'
import { CreateWithdrawalRequestService } from '@/services/withdrawal-request/create-withdrawal-request'

export function makeCreateWithdrawalRequest() {
  return new CreateWithdrawalRequestService(
    new PrismaWithdrawalRequestRepository(),
    new PrismaBarberUsersRepository(),
  )
}
