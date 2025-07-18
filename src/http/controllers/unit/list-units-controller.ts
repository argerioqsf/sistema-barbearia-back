import { makeListUnitsService } from '@/services/@factories/unit/make-list-units'
import { FastifyReply, FastifyRequest } from 'fastify'
import { UserToken } from '../authenticate-controller'

export const ListUnitsController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const service = makeListUnitsService()
  const user = request.user as UserToken
  const { units } = await service.execute(user)
  return reply.status(200).send(units)
}
