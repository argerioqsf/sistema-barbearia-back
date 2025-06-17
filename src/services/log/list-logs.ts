import { LogsRepository } from '@/repositories/logs-repository'
import { Prisma, Log } from '@prisma/client'

export interface ListLogsFilters {
  userId?: string
  start?: Date
  end?: Date
}

interface ListLogsResponse {
  logs: Log[]
}

export class ListLogsService {
  constructor(private repository: LogsRepository) {}

  async execute(filters: ListLogsFilters): Promise<ListLogsResponse> {
    const where: Prisma.LogWhereInput = {}
    if (filters.userId) where.userId = filters.userId
    if (filters.start || filters.end) {
      where.createdAt = {}
      if (filters.start) (where.createdAt as any).gte = filters.start
      if (filters.end) (where.createdAt as any).lte = filters.end
    }

    const logs = await this.repository.findMany(where)
    return { logs }
  }
}
