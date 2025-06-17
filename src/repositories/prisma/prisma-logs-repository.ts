import { prisma } from '@/lib/prisma'
import { Prisma, Log } from '@prisma/client'
import { LogsRepository } from '../logs-repository'

export class PrismaLogsRepository implements LogsRepository {
  async create(data: Prisma.LogUncheckedCreateInput): Promise<Log> {
    return prisma.log.create({ data })
  }

  async findMany(where: Prisma.LogWhereInput = {}): Promise<Log[]> {
    return prisma.log.findMany({ where, orderBy: { createdAt: 'desc' } })
  }
}
