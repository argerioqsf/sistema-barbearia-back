import { makeCreateWithdrawalRequest } from '@/services/@factories/withdrawal-request/make-create-withdrawal-request'
import { FastifyRequest, FastifyReply } from 'fastify'

export async function CreateWithdrawalRequestController(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.sub
  const service = makeCreateWithdrawalRequest()
  const { request: withdraw } = await service.execute({ userId })
  return reply.status(201).send(withdraw)
}
