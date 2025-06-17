import { BarberUsersRepository } from '@/repositories/barber-users-repository'
import { WithdrawalRequestRepository } from '@/repositories/withdrawal-request-repository'

interface CreateWithdrawalRequestRequest {
  userId: string
  amount: number
}

export class CreateWithdrawalRequestService {
  constructor(
    private repository: WithdrawalRequestRepository,
    private userRepository: BarberUsersRepository,
  ) {}

  private verifyWithdrawal(user: any, amount: number) {
    const balanceUser = user.profile?.totalBalance ?? 0
    const balanceUnit = user.unit?.totalBalance ?? 0
    const remaining = balanceUser > 0 ? balanceUser - amount : -amount
    if (amount < 0) {
      throw new Error('Negative values \u200b\u200bcannot be passed on withdrawals')
    }
    if (remaining < 0) {
      if (!user.unit?.allowsLoan) {
        throw new Error('Insufficient balance for withdrawal')
      }
      if (-remaining > balanceUnit) {
        throw new Error('Withdrawal amount greater than unit balance')
      }
    }
  }

  async execute({ userId, amount }: CreateWithdrawalRequestRequest) {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new Error('User not found')

    this.verifyWithdrawal(user, amount)

    const request = await this.repository.create({
      applicant: { connect: { id: userId } },
      unit: { connect: { id: user.unitId } },
      amount,
    })

    return { request }
  }
}
