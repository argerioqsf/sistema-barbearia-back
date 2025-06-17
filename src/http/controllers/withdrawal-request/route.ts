import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { FastifyInstance } from 'fastify'
import { CreateWithdrawalRequestController } from './create-withdrawal-request-controller'
import { ListWithdrawalRequestsController } from './list-withdrawal-requests-controller'
import { ActWithdrawalRequestController } from './act-withdrawal-request-controller'

export async function withdrawalRequestRoute(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/withdraw-requests', CreateWithdrawalRequestController)
  app.get('/withdraw-requests', ListWithdrawalRequestsController)
  app.patch('/withdraw-requests/:id', ActWithdrawalRequestController)
}
