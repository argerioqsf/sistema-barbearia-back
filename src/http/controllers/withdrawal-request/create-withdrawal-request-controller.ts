import { makeCreateWithdrawalRequest } from '@/services/@factories/withdrawal-request/make-create-withdrawal-request'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function CreateWithdrawalRequestController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({ amount: z.number().positive() })
  const { amount } = bodySchema.parse(request.body)
  const userId = request.user.sub
  const service = makeCreateWithdrawalRequest()
  const { request: withdraw } = await service.execute({ userId, amount })
  return reply.status(201).send(withdraw)
}
