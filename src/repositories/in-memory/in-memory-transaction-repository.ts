import { Prisma, Transaction, TransactionType } from '@prisma/client'
import { TransactionRepository } from '../transaction-repository'
import { randomUUID } from 'crypto'
import { TransactionFull } from '../prisma/prisma-transaction-repository'

export class InMemoryTransactionRepository implements TransactionRepository {
  public transactions: TransactionFull[] = []

  async create(data: Prisma.TransactionCreateInput): Promise<Transaction> {
    const tr: Transaction = {
      id: randomUUID(),
      userId: (data.user as { connect: { id: string } }).connect.id,
      affectedUserId:
        (data.affectedUser as { connect: { id: string } } | undefined)?.connect
          .id ?? null,
      unitId: (data.unit as { connect: { id: string } }).connect.id,
      cashRegisterSessionId: (data.session as { connect: { id: string } })
        .connect.id,
      type: data.type as TransactionType,
      description: data.description as string,
      amount: data.amount as number,
      isLoan: (data.isLoan as boolean | undefined) ?? false,
      receiptUrl: (data.receiptUrl as string | null | undefined) ?? null,
      createdAt: new Date(),
      saleId: null,
    }
    this.transactions.push({
      ...(tr as TransactionFull),
      unit: {
        id: tr.unitId,
        name: '',
        slug: '',
        organizationId: 'org-1',
        totalBalance: 0,
        allowsLoan: false,
      },
    } as TransactionFull & { unit: { organizationId: string } })
    return tr
  }

  async findManyByUser(userId: string): Promise<TransactionFull[]> {
    return this.transactions.filter((t) => t.userId === userId)
  }

  async findMany(
    where: Prisma.TransactionWhereInput = {},
  ): Promise<TransactionFull[]> {
    return this.transactions.filter((t) => {
      if (where.unitId && t.unitId !== where.unitId) return false
      if (where.isLoan !== undefined && t.isLoan !== where.isLoan) return false
      if (
        where.unit &&
        'organizationId' in (where.unit as { organizationId: string })
      ) {
        const orgId = (where.unit as { organizationId: string }).organizationId
        const unitOrg =
          (t as { unit?: { organizationId?: string }; organizationId?: string })
            .unit?.organizationId ??
          (t as { organizationId?: string }).organizationId
        return unitOrg === orgId
      }
      return true
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findManyByUnit(_unitId: string): Promise<Transaction[]> {
    throw new Error('not implemented')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findManyBySession(_sessionId: string): Promise<Transaction[]> {
    throw new Error('not implemented')
  }

  async delete(id: string): Promise<void> {
    this.transactions = this.transactions.filter((t) => t.id !== id)
  }
}
