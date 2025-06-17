import { UserToken } from '@/http/controllers/authenticate-controller'
import { WithdrawalRequestRepository, DetailedWithdrawalRequest } from '@/repositories/withdrawal-request-repository'

interface ListWithdrawalRequestsResponse {
  requests: DetailedWithdrawalRequest[]
}

export class ListWithdrawalRequestsService {
  constructor(private repository: WithdrawalRequestRepository) {}

  async execute(user: UserToken): Promise<ListWithdrawalRequestsResponse> {
    if (!user.sub) throw new Error('User not found')

    let where: any = {}
    if (user.role === 'BARBER') {
      where = { applicantId: user.sub }
    } else if (user.role === 'MANAGER') {
      where = { unitId: user.unitId }
    } else if (user.role === 'OWNER') {
      where = { unit: { organizationId: user.organizationId } }
    }

    const requests = await this.repository.findMany(where)
    return { requests }
  }
}
