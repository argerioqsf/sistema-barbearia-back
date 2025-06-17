import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { FastifyInstance } from 'fastify'
import { ListLogsController } from './list-logs-controller'

export async function logRoute(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/logs', ListLogsController)
}
