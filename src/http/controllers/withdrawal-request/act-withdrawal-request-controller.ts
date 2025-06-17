import { makeActWithdrawalRequest } from '@/services/@factories/withdrawal-request/make-act-withdrawal-request'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { UserToken } from '../authenticate-controller'

export async function ActWithdrawalRequestController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ id: z.string() })
  const bodySchema = z.object({
    status: z.enum(['ACCEPTED', 'REJECTED', 'CANCELLED']),
  })
  const { id } = paramsSchema.parse(request.params)
  const { status } = bodySchema.parse(request.body)
  const user = request.user as UserToken
  const service = makeActWithdrawalRequest()
  const { request: withdraw } = await service.execute(id, status, user)
  return reply.status(200).send(withdraw)
}
