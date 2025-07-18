import { Permission, Prisma, Profile, Role, Unit, User } from '@prisma/client'

export interface BarberUsersRepository {
  create(
    data: Prisma.UserCreateInput,
    profile: Omit<Prisma.ProfileUncheckedCreateInput, 'userId'>,
    permissionIds?: string[],
  ): Promise<{ user: User; profile: Profile }>
  update(
    id: string,
    userData: Prisma.UserUpdateInput,
    profileData: Prisma.ProfileUncheckedUpdateInput,
    permissionIds?: string[],
  ): Promise<{
    user: User
    profile: (Profile & { role: Role; permissions: Permission[] }) | null
  }>
  findMany(
    where?: Prisma.UserWhereInput,
  ): Promise<(Omit<User, 'password'> & { profile: Profile | null })[]>
  findById(id: string): Promise<
    | (User & {
        profile: (Profile & { role: Role; permissions: Permission[] }) | null
        unit: Unit | null
      })
    | null
  >
  findByEmail(email: string): Promise<
    | (User & {
        profile: (Profile & { role: Role; permissions: Permission[] }) | null
      })
    | null
  >
  delete(id: string): Promise<void>
}
