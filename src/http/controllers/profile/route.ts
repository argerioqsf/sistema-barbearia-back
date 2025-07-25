import { verifyJWT } from '@/http/middlewares/verify-jwt'
import { FastifyInstance } from 'fastify'
import { Create } from './create'
import { GetProfile } from './get-profile'
import { Update } from './update'
import { UpdateWithId } from './updateWithId'

export async function profileRoute(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/profile', GetProfile)

  app.post('/create/profile', Create)

  app.put('/profile/:id', UpdateWithId)

  app.put('/profile', Update)
}
