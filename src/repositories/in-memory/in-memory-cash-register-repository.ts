import { Prisma, CashRegisterSession, Transaction } from '@prisma/client'
import {
  CashRegisterRepository,
  CompleteCashSession,
  DetailedCashSession,
} from '../cash-register-repository'
import { randomUUID } from 'crypto'

export class InMemoryCashRegisterRepository implements CashRegisterRepository {
  public sessions: (CompleteCashSession & { transactions: Transaction[] })[] =
    []

  async create(
    data: Prisma.CashRegisterSessionCreateInput,
  ): Promise<CashRegisterSession> {
    const session: CashRegisterSession = {
      id: randomUUID(),
      openedById: (data.user as { connect: { id: string } }).connect.id,
      unitId: (data.unit as { connect: { id: string } }).connect.id,
      openedAt: new Date(),
      closedAt: null,
      initialAmount: data.initialAmount as number,
      finalAmount: null,
    }
    this.sessions.push({
      ...session,
      user: {
        id: session.openedById,
        name: '',
        email: '',
        password: '',
        active: true,
        organizationId: 'org-1',
        unitId: session.unitId,
        versionToken: 1,
        versionTokenInvalidate: null,
        createdAt: new Date(),
      },
      unit: {
        id: session.unitId,
        name: '',
        slug: '',
        organizationId: 'org-1',
        totalBalance: 0,
        allowsLoan: false,
      },
      sales: [],
      transactions: [],
    } as CompleteCashSession & { unit: { organizationId: string } })
    return session
  }

  async close(
    id: string,
    data: Prisma.CashRegisterSessionUpdateInput,
  ): Promise<CashRegisterSession> {
    const index = this.sessions.findIndex((s) => s.id === id)
    if (index < 0) throw new Error('Session not found')
    const current = this.sessions[index]
    const updated = {
      ...current,
      closedAt: data.closedAt as Date,
      finalAmount: data.finalAmount as number,
    }
    this.sessions[index] = updated
    return updated
  }

  async findMany(
    where: Prisma.CashRegisterSessionWhereInput = {},
  ): Promise<DetailedCashSession[]> {
    return this.sessions.filter((s) => {
      if (where.unitId && s.unitId !== where.unitId) return false
      if (
        where.unit &&
        'organizationId' in (where.unit as { organizationId: string })
      ) {
        return (
          (s as unknown as { unit?: { organizationId: string } }).unit
            ?.organizationId ===
          (where.unit as { organizationId: string }).organizationId
        )
      }
      return true
    })
  }

  async findManyByUnit(unitId: string): Promise<DetailedCashSession[]> {
    return this.sessions.filter((s) => s.unitId === unitId)
  }

  async findOpenByUser(userId: string): Promise<CashRegisterSession | null> {
    const session = this.sessions.find(
      (s) => s.openedById === userId && s.closedAt === null,
    )
    return session ?? null
  }

  async findOpenByUnit(
    unitId: string,
  ): Promise<(CashRegisterSession & { transactions: Transaction[] }) | null> {
    const session = this.sessions.find(
      (s) => s.unitId === unitId && s.closedAt === null,
    )
    return session ? { ...session, transactions: session.transactions } : null
  }

  async findById(id: string): Promise<CompleteCashSession | null> {
    return this.sessions.find((s) => s.id === id) ?? null
  }
}
