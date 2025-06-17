import { Prisma, Log } from '@prisma/client'

export interface LogsRepository {
  create(data: Prisma.LogUncheckedCreateInput): Promise<Log>
  findMany(where?: Prisma.LogWhereInput): Promise<Log[]>
}
