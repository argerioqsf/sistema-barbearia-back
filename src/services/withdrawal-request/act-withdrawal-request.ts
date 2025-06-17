import { UserToken } from '@/http/controllers/authenticate-controller'
import { BarberUsersRepository } from '@/repositories/barber-users-repository'
import { CashRegisterRepository } from '@/repositories/cash-register-repository'
import { OrganizationRepository } from '@/repositories/organization-repository'
import { ProfilesRepository } from '@/repositories/profiles-repository'
import { TransactionRepository } from '@/repositories/transaction-repository'
import { UnitRepository } from '@/repositories/unit-repository'
import { WithdrawalRequestRepository } from '@/repositories/withdrawal-request-repository'
import { TransactionType, WithdrawalRequestStatus } from '@prisma/client'

export class ActWithdrawalRequestService {
  constructor(
    private repository: WithdrawalRequestRepository,
    private userRepository: BarberUsersRepository,
    private cashRegisterRepository: CashRegisterRepository,
    private transactionRepository: TransactionRepository,
    private organizationRepository: OrganizationRepository,
    private profileRepository: ProfilesRepository,
    private unitRepository: UnitRepository,
  ) {}

  async execute(id: string, status: WithdrawalRequestStatus, user: UserToken) {
    const request = await this.repository.findById(id)
    if (!request) throw new Error('Request not found')
    if (request.status !== 'WAITING') throw new Error('Request already processed')

    if (user.role === 'MANAGER' && request.unitId !== user.unitId) {
      throw new Error('Unauthorized')
    }
    if (user.role === 'OWNER' && request.unit.organizationId !== user.organizationId) {
      throw new Error('Unauthorized')
    }
    if (user.role !== 'MANAGER' && user.role !== 'OWNER' && user.role !== 'ADMIN') {
      throw new Error('Unauthorized')
    }

    if (status === 'ACCEPTED') {
      const approver = await this.userRepository.findById(user.sub)
      if (!approver) throw new Error('User not found')
      const session = await this.cashRegisterRepository.findOpenByUnit(approver.unitId)
      if (!session) throw new Error('Cash register closed')

      const transaction = await this.transactionRepository.create({
        user: { connect: { id: approver.id } },
        unit: { connect: { id: approver.unitId } },
        session: { connect: { id: session.id } },
        affectedUser: { connect: { id: request.applicantId } },
        type: TransactionType.WITHDRAWAL,
        description: 'Withdrawal request',
        amount: request.applicant.profile?.totalBalance ?? 0,
      })

      try {
        const increment = -transaction.amount
        await this.profileRepository.incrementBalance(request.applicantId, increment)
        await this.unitRepository.incrementBalance(approver.unitId, increment)
        await this.organizationRepository.incrementBalance(approver.organizationId, increment)
        return {
          request: await this.repository.update(id, {
            status,
            transaction: { connect: { id: transaction.id } },
            userWhoActed: { connect: { id: approver.id } },
          }),
        }
      } catch (e) {
        await this.transactionRepository.delete(transaction.id)
        throw e
      }
    }

    return {
      request: await this.repository.update(id, {
        status,
        userWhoActed: { connect: { id: user.sub } },
      }),
    }
  }
}
