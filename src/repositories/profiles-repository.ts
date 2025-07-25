import { Prisma, Profile, User } from '@prisma/client'

export interface ProfilesRepository {
  findById(
    id: string,
  ): Promise<(Profile & { user: Omit<User, 'password'> }) | null>
  create(
    data: Prisma.ProfileUncheckedCreateInput,
    permissionIds?: string[],
  ): Promise<Profile>
  findByUserId(userId: string): Promise<
    | (Profile & {
        user: Omit<User, 'password'>
        permissions: { id: string; name: string }[]
      })
    | null
  >
  update(id: string, data: Prisma.ProfileUncheckedUpdateInput): Promise<Profile>
  findMany(
    where?: Prisma.ProfileWhereInput,
    orderBy?: Prisma.ProfileOrderByWithRelationInput,
  ): Promise<(Profile & { user: Omit<User, 'password'> })[]>

  incrementBalance(
    userId: string,
    amount: number,
  ): Promise<Profile & { user: Omit<User, 'password'> }>
}
