import { makeListWithdrawalRequests } from '@/services/@factories/withdrawal-request/make-list-withdrawal-requests'
import { FastifyRequest, FastifyReply } from 'fastify'
import { UserToken } from '../authenticate-controller'

export async function ListWithdrawalRequestsController(request: FastifyRequest, reply: FastifyReply) {
  const service = makeListWithdrawalRequests()
  const user = request.user as UserToken
  const { requests } = await service.execute(user)
  return reply.status(200).send(requests)
}
