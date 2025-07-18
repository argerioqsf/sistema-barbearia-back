import { TransactionRepository } from '@/repositories/transaction-repository'
import { UnitRepository } from '@/repositories/unit-repository'
import { Transaction, TransactionType, Unit } from '@prisma/client'
import { makeCreateTransaction } from '../@factories/transaction/make-create-transaction'

interface IncrementBalanceUnitResponse {
  unit: Unit | null
  transaction: Transaction
}

export class IncrementBalanceUnitService {
  constructor(
    private repository: UnitRepository,
    private transactionRepository: TransactionRepository,
  ) {}

  async execute(
    id: string,
    userId: string,
    amount: number,
    saleId?: string,
    isLoan?: boolean,
  ): Promise<IncrementBalanceUnitResponse> {
    const createTransactionService = makeCreateTransaction()
    try {
      await this.repository.incrementBalance(id, amount)
      const unit = await this.repository.findById(id)
      const transaction = await createTransactionService.execute({
        type:
          amount < 0 ? TransactionType.WITHDRAWAL : TransactionType.ADDITION,
        description: 'Increment Balance Unit',
        amount: isLoan ? amount : Math.abs(amount),
        userId,
        receiptUrl: undefined,
        saleId,
        isLoan: isLoan ?? false,
      })
      return { unit, transaction: transaction.transaction }
    } catch (error) {
      await this.repository.incrementBalance(id, -amount)
      throw error
    }
  }
}
