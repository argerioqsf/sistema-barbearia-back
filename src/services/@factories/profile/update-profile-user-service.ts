import { PrismaProfilesRepository } from '@/repositories/prisma/prisma-profile-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { UpdateProfileUserService } from '@/services/profile/update-profile-user-service'

export function MakeUpdateProfileUserService() {
  return new UpdateProfileUserService(
    new PrismaUsersRepository(),
    new PrismaProfilesRepository(),
  )
}
