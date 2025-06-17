import { UserToken } from '@/http/controllers/authenticate-controller'
import { OrganizationRepository } from '@/repositories/organization-repository'
import { ProfilesRepository } from '@/repositories/profiles-repository'
import { UnitRepository } from '@/repositories/unit-repository'
import { WithdrawalRequestRepository } from '@/repositories/withdrawal-request-repository'
import { WithdrawalRequestStatus } from '@prisma/client'

export class ActWithdrawalRequestService {
  constructor(
    private repository: WithdrawalRequestRepository,
    private organizationRepository: OrganizationRepository,
    private profileRepository: ProfilesRepository,
    private unitRepository: UnitRepository,
  ) {}

  async execute(id: string, status: WithdrawalRequestStatus, user: UserToken) {
    const request = await this.repository.findById(id)
    if (!request) throw new Error('Request not found')

      await this.profileRepository.incrementBalance(request.applicantId, request.amount)
      if (request.loanValue) {
        await this.unitRepository.incrementBalance(request.unitId, request.loanValue)
        await this.organizationRepository.incrementBalance(
          request.unit.organizationId,
          request.loanValue,
        )
      }

    if (status === 'REJECTED') {
      await this.profileRepository.incrementBalance(request.applicantId, request.amount)
      if (request.loanValue) {
        await this.unitRepository.incrementBalance(request.unitId, request.loanValue)
        await this.organizationRepository.incrementBalance(
          request.unit.organizationId,
          request.loanValue,
        )
      }
      return {
        request: await this.repository.update(id, {
          status,
          userWhoActed: { connect: { id: user.sub } },
        }),
      const session = await this.cashRegisterRepository.findOpenByUnit(
        request.unitId,
      )
      if (!session) throw new Error('Cash register closed')

      const balanceUser = request.applicant.profile?.totalBalance ?? 0
      const balanceUnit = request.unit.totalBalance
      const remaining = validateWithdrawal(
        request.amount,
        balanceUser,
        balanceUnit,
        request.unit.allowsLoan,
      )

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
        await this.profileRepository.incrementBalance(
          request.applicantId,
          -request.amount,
        )
        if (remaining < 0) {
          await this.unitRepository.incrementBalance(request.unitId, remaining)
          await this.organizationRepository.incrementBalance(
            request.unit.organizationId,
            remaining,
          )
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
