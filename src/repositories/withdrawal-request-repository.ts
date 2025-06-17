import { Prisma, WithdrawalRequest, User, Unit, Transaction, Profile } from '@prisma/client'

export type DetailedWithdrawalRequest = WithdrawalRequest & {
  applicant: User & { profile: Profile | null }
  unit: Unit
  transaction: Transaction | null
  userWhoActed: User | null
}

export interface WithdrawalRequestRepository {
  create(data: Prisma.WithdrawalRequestCreateInput): Promise<DetailedWithdrawalRequest>
  findMany(where?: Prisma.WithdrawalRequestWhereInput): Promise<DetailedWithdrawalRequest[]>
  findById(id: string): Promise<DetailedWithdrawalRequest | null>
  update(id: string, data: Prisma.WithdrawalRequestUpdateInput): Promise<DetailedWithdrawalRequest>
}
