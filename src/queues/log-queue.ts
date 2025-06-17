import { PrismaLogsRepository } from '@/repositories/prisma/prisma-logs-repository'
import { Prisma } from '@prisma/client'

class LogQueue {
  private queue: Prisma.LogUncheckedCreateInput[] = []
  private processing = false
  private repo = new PrismaLogsRepository()

  enqueue(data: Prisma.LogUncheckedCreateInput) {
    this.queue.push(data)
    this.process()
  }

  private async process() {
    if (this.processing) return
    this.processing = true
    while (this.queue.length) {
      const job = this.queue.shift()!
      try {
        await this.repo.create(job)
      } catch (err) {
        console.error('Log job failed', err)
      }
    }
    this.processing = false
  }
}

export const logQueue = new LogQueue()
