import { makeExportUsers } from '@/services/@factories/config/make-export-users'
import { FastifyReply, FastifyRequest } from 'fastify'

export const ExportUsersController = async (
  _: FastifyRequest,
  reply: FastifyReply,
) => {
  const service = makeExportUsers()
  const { users } = await service.execute()
  return reply.status(200).send(users)
}
