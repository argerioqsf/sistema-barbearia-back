import { BarberUsersRepository } from '@/repositories/barber-users-repository'
import { WithdrawalRequestRepository } from '@/repositories/withdrawal-request-repository'

interface CreateWithdrawalRequestRequest {
  userId: string
}

export class CreateWithdrawalRequestService {
  constructor(
    private repository: WithdrawalRequestRepository,
    private userRepository: BarberUsersRepository,
  ) {}

  async execute({ userId }: CreateWithdrawalRequestRequest) {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new Error('User not found')

    const request = await this.repository.create({
      applicant: { connect: { id: userId } },
      unit: { connect: { id: user.unitId } },
    })

    return { request }
  }
}
