import { makeListLogs } from '@/services/@factories/log/make-list-logs'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { UserToken } from '../authenticate-controller'

export async function ListLogsController(request: FastifyRequest, reply: FastifyReply) {
  const querySchema = z.object({
    userId: z.string().optional(),
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional(),
  })

  const { userId, start, end } = querySchema.parse(request.query)

  const user = request.user as UserToken
  if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
    return reply.status(403).send({ message: 'Unauthorized' })
  }

  const service = makeListLogs()
  const { logs } = await service.execute({ userId, start, end })
  return reply.status(200).send(logs)
}
