import { LoanRepository } from '@/repositories/loan-repository'
import { UnitRepository } from '@/repositories/unit-repository'
import { makeCreateTransaction } from '../@factories/transaction/make-create-transaction'
import { TransactionType, Loan } from '@prisma/client'

interface CreateLoanRequest {
  userId: string
  unitId: string
  amount: number
}

export class CreateLoanService {
  constructor(
    private loanRepository: LoanRepository,
    private unitRepository: UnitRepository,
  ) {}

  async execute({ userId, unitId, amount }: CreateLoanRequest): Promise<Loan> {
    const unit = await this.unitRepository.findById(unitId)
    if (!unit) throw new Error('Unit not found')
    if (unit.totalBalance < amount) throw new Error('Insufficient unit balance')

    await this.unitRepository.incrementBalance(unitId, -amount)

    const createTransaction = makeCreateTransaction()
    const { transaction } = await createTransaction.execute({
      userId,
      type: TransactionType.WITHDRAWAL,
      description: 'Loan withdrawal',
      amount,
    })

    const loan = await this.loanRepository.create({
      amount,
      user: { connect: { id: userId } },
      unit: { connect: { id: unitId } },
      transaction: { connect: { id: transaction.id } },
    })

    return loan
  }
}
