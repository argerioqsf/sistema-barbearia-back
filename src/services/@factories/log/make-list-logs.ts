import { PrismaLogsRepository } from '@/repositories/prisma/prisma-logs-repository'
import { ListLogsService } from '@/services/log/list-logs'

export function makeListLogs() {
  return new ListLogsService(new PrismaLogsRepository())
}
