import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeCreateLoanService } from '@/services/@factories/loan/make-create-loan'

export async function CreateLoanController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    userId: z.string(),
    unitId: z.string(),
    amount: z.number().positive(),
  })
  const data = bodySchema.parse(request.body)
  const service = makeCreateLoanService()
  const loan = await service.execute(data)
  return reply.status(201).send({ loan })
}
