import { BarberUsersRepository } from '@/repositories/barber-users-repository'
import { WithdrawalRequestRepository } from '@/repositories/withdrawal-request-repository'
import { ProfilesRepository } from '@/repositories/profiles-repository'
import { UnitRepository } from '@/repositories/unit-repository'
import { OrganizationRepository } from '@/repositories/organization-repository'
import { validateWithdrawal } from '@/utils/withdrawal'

interface CreateWithdrawalRequestRequest {
  userId: string
  amount: number
}

export class CreateWithdrawalRequestService {
  constructor(
    private repository: WithdrawalRequestRepository,
    private userRepository: BarberUsersRepository,
    private profileRepository: ProfilesRepository,
    private unitRepository: UnitRepository,
    private organizationRepository: OrganizationRepository,
  ) {}

  async execute({ userId, amount }: CreateWithdrawalRequestRequest) {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new Error('User not found')

    const remaining = validateWithdrawal(
      amount,
      user.profile?.totalBalance ?? 0,
      user.unit?.totalBalance ?? 0,
      user.unit?.allowsLoan ?? false,
    )

    const request = await this.repository.create({
      applicant: { connect: { id: userId } },
      unit: { connect: { id: user.unitId } },
      amount,
      loanValue: remaining < 0 ? -remaining : null,
    })

    await this.profileRepository.incrementBalance(userId, -amount)
    if (remaining < 0) {
      await this.unitRepository.incrementBalance(user.unitId, remaining)
      await this.organizationRepository.incrementBalance(
        user.organizationId,
        remaining,
      )
    }

    return { request }
  }
}
