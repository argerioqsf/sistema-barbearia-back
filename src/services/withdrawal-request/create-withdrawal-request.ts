import { BarberUsersRepository } from '@/repositories/barber-users-repository'
import { WithdrawalRequestRepository } from '@/repositories/withdrawal-request-repository'
import { validateWithdrawal } from '@/utils/withdrawal'

interface CreateWithdrawalRequestRequest {
  userId: string
  amount: number
}

export class CreateWithdrawalRequestService {
  constructor(
    private repository: WithdrawalRequestRepository,
    private userRepository: BarberUsersRepository,
  ) {}


  async execute({ userId, amount }: CreateWithdrawalRequestRequest) {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new Error('User not found')

    validateWithdrawal(
      amount,
      user.profile?.totalBalance ?? 0,
      user.unit?.totalBalance ?? 0,
      user.unit?.allowsLoan ?? false,
    )

    const request = await this.repository.create({
      applicant: { connect: { id: userId } },
      unit: { connect: { id: user.unitId } },
      amount,
    })

    return { request }
  }
}
