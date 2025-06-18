import { Loan, Prisma } from '@prisma/client'

export interface LoanRepository {
  create(data: Prisma.LoanCreateInput): Promise<Loan>
  findById(id: string): Promise<Loan | null>
  update(id: string, data: Prisma.LoanUpdateInput): Promise<Loan>
  findMany(where?: Prisma.LoanWhereInput): Promise<Loan[]>
}
