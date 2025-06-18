import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makePayLoanService } from '@/services/@factories/loan/make-pay-loan'

export async function PayLoanController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    loanId: z.string(),
    userId: z.string(),
  })
  const data = bodySchema.parse(request.body)
  const service = makePayLoanService()
  const loan = await service.execute(data)
  return reply.status(200).send({ loan })
}
