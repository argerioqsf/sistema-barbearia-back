import { ResourceNotFoundError } from '@/services/@errors/common/resource-not-found-error'
import { getProfileFromUserIdService } from '@/services/@factories/profile/get-profile-from-userId-service'
import { MakeUpdateProfileUserService } from '@/services/@factories/profile/update-profile-user-service'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

const bodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  active: z.boolean(),
  phone: z.string(),
  cpf: z.string(),
  genre: z.string(),
  birthday: z.string(),
  pix: z.string(),
})

export const Update = async (request: FastifyRequest, reply: FastifyReply) => {
  const { active, birthday, cpf, email, genre, name, phone, pix } =
    bodySchema.parse(request.body)

  const updateProfileUserService = MakeUpdateProfileUserService()
  const getProfileFromUserId = getProfileFromUserIdService()

  const id = request.user.sub

  const { profile } = await getProfileFromUserId.execute({
    id,
  })

  if (!profile) {
    throw new ResourceNotFoundError()
  }

  const { profile: profileUpdate } = await updateProfileUserService.execute({
    active,
    birthday,
    cpf,
    email,
    genre,
    id,
    name,
    phone,
    pix,
    roleId: profile.roleId,
  })
  return reply.status(201).send({ profile: profileUpdate })
}
