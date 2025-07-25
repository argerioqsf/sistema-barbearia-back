import { UserToken } from '@/http/controllers/authenticate-controller'
import { CashRegisterRepository } from '@/repositories/cash-register-repository'
import { TransactionRepository } from '@/repositories/transaction-repository'
import { UserNotFoundError } from '@/services/@errors/user/user-not-found-error'
import { CashRegisterAlreadyOpenError } from '@/services/@errors/cash-register/cash-register-already-open-error'
import { CashRegisterSession, TransactionType } from '@prisma/client'

interface OpenSessionRequest {
  user: UserToken
  initialAmount: number
}

interface OpenSessionResponse {
  session: CashRegisterSession
}

export class OpenSessionService {
  constructor(
    private repository: CashRegisterRepository,
    private transactionRepository: TransactionRepository,
  ) {}

  async execute({
    user,
    initialAmount,
  }: OpenSessionRequest): Promise<OpenSessionResponse> {
    if (!user) throw new UserNotFoundError()
    const existing = await this.repository.findOpenByUnit(user.unitId)
    if (existing) throw new CashRegisterAlreadyOpenError()

    const session = await this.repository.create({
      user: { connect: { id: user.sub } },
      unit: { connect: { id: user.unitId } },
      initialAmount,
    })

    if (initialAmount > 0) {
      await this.transactionRepository.create({
        user: { connect: { id: user.sub } },
        unit: { connect: { id: user.unitId } },
        session: { connect: { id: session.id } },
        type: TransactionType.ADDITION,
        description: 'Initial amount',
        amount: initialAmount,
      })
    }

    return { session }
  }
}
