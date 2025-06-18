import { FastifyInstance } from 'fastify'
import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { CreateLoanController } from './create-loan-controller'
import { PayLoanController } from './pay-loan-controller'

export async function loanRoute(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)
  app.post('/loans', CreateLoanController)
  app.post('/loans/pay', PayLoanController)
}
