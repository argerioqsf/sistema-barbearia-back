import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import {
  DetailedWithdrawalRequest,
  WithdrawalRequestRepository,
} from '../withdrawal-request-repository'

export class PrismaWithdrawalRequestRepository
  implements WithdrawalRequestRepository
{
  async create(
    data: Prisma.WithdrawalRequestCreateInput,
  ): Promise<DetailedWithdrawalRequest> {
    return prisma.withdrawalRequest.create({
      data,
      include: {
        applicant: { include: { profile: true } },
        unit: true,
        transaction: true,
        userWhoActed: true,
      },
    })
  }

  async findMany(
    where: Prisma.WithdrawalRequestWhereInput = {},
  ): Promise<DetailedWithdrawalRequest[]> {
    return prisma.withdrawalRequest.findMany({
      where,
      include: {
        applicant: { include: { profile: true } },
        unit: true,
        transaction: true,
        userWhoActed: true,
      },
    })
  }

  async findById(id: string): Promise<DetailedWithdrawalRequest | null> {
    return prisma.withdrawalRequest.findUnique({
      where: { id },
      include: {
        applicant: { include: { profile: true } },
        unit: true,
        transaction: true,
        userWhoActed: true,
      },
    })
  }

  async update(
    id: string,
    data: Prisma.WithdrawalRequestUpdateInput,
  ): Promise<DetailedWithdrawalRequest> {
    return prisma.withdrawalRequest.update({
      where: { id },
      data,
      include: {
        applicant: { include: { profile: true } },
        unit: true,
        transaction: true,
        userWhoActed: true,
      },
    })
  }
}
