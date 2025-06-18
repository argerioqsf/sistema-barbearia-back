import { prisma } from '@/lib/prisma'
import { Prisma, Loan } from '@prisma/client'
import { LoanRepository } from '../loan-repository'

export class PrismaLoanRepository implements LoanRepository {
  async create(data: Prisma.LoanCreateInput): Promise<Loan> {
    return prisma.loan.create({ data })
  }

  async findById(id: string): Promise<Loan | null> {
    return prisma.loan.findUnique({ where: { id } })
  }

  async update(id: string, data: Prisma.LoanUpdateInput): Promise<Loan> {
    return prisma.loan.update({ where: { id }, data })
  }

  async findMany(where: Prisma.LoanWhereInput = {}): Promise<Loan[]> {
    return prisma.loan.findMany({ where })
  }
}
