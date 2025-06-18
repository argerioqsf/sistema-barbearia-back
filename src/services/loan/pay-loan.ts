import { LoanRepository } from '@/repositories/loan-repository'
import { ProfilesRepository } from '@/repositories/profiles-repository'
import { UnitRepository } from '@/repositories/unit-repository'
import { makeCreateTransaction } from '../@factories/transaction/make-create-transaction'
import { TransactionType, Loan } from '@prisma/client'

interface PayLoanRequest {
  loanId: string
  userId: string
}

export class PayLoanService {
  constructor(
    private loanRepository: LoanRepository,
    private profileRepository: ProfilesRepository,
    private unitRepository: UnitRepository,
  ) {}

  async execute({ loanId, userId }: PayLoanRequest): Promise<Loan> {
    const loan = await this.loanRepository.findById(loanId)
    if (!loan) throw new Error('Loan not found')
    if (loan.status === 'PAID') return loan

    const profile = await this.profileRepository.findByUserId(userId)
    if (!profile) throw new Error('Profile not found')

    if (profile.totalBalance < loan.amount) {
      throw new Error('Insufficient balance')
    }

    await this.profileRepository.incrementBalance(userId, -loan.amount)
    await this.unitRepository.incrementBalance(loan.unitId, loan.amount)

    const createTransaction = makeCreateTransaction()
    await createTransaction.execute({
      userId,
      type: TransactionType.WITHDRAWAL,
      description: 'Loan payment',
      amount: loan.amount,
    })

    await this.loanRepository.update(loan.id, { status: 'PAID' })

    return { ...loan, status: 'PAID' } as Loan
  }
}
