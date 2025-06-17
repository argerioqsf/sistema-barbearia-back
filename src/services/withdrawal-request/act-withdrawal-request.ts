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

  private verifyWithdrawal(unit: any, profile: any, amount: number) {
    const balanceUser = profile?.totalBalance ?? 0
    const balanceUnit = unit.totalBalance
    const remaining = balanceUser > 0 ? balanceUser - amount : -amount
    if (amount < 0) {
      throw new Error('Negative values \u200b\u200bcannot be passed on withdrawals')
    }
    if (remaining < 0) {
      if (!unit.allowsLoan) {
        throw new Error('Insufficient balance for withdrawal')
      }
      if (-remaining > balanceUnit) {
        throw new Error('Withdrawal amount greater than unit balance')
      }
    }
  }

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

    if (status === 'CANCELLED') {
      if (user.sub !== request.applicantId && user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }
      return {
        request: await this.repository.update(id, {
          status,
          userWhoActed: { connect: { id: user.sub } },
        }),
      }
    }

    if (status === 'ACCEPTED') {
      const approver = await this.userRepository.findById(user.sub)
      if (!approver) throw new Error('User not found')
      const session = await this.cashRegisterRepository.findOpenByUnit(request.unitId)
      if (!session) throw new Error('Cash register closed')

      this.verifyWithdrawal(request.unit, request.applicant.profile, request.amount)

      const transaction = await this.transactionRepository.create({
        user: { connect: { id: approver.id } },
        unit: { connect: { id: request.unitId } },
        session: { connect: { id: session.id } },
        affectedUser: { connect: { id: request.applicantId } },
        type: TransactionType.WITHDRAWAL,
        description: 'Withdrawal request',
        amount: request.amount,
      })

      try {
        const remaining = request.applicant.profile?.totalBalance > 0
          ? (request.applicant.profile.totalBalance - request.amount)
          : -request.amount
        await this.profileRepository.incrementBalance(request.applicantId, -request.amount)
        if (remaining < 0) {
          await this.unitRepository.incrementBalance(request.unitId, remaining)
          await this.organizationRepository.incrementBalance(request.unit.organizationId, remaining)
        }
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
