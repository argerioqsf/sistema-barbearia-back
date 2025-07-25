import { UsersRepository } from '@/repositories/users-repository'
import { InvalidCredentialsError } from './@errors/auth/invalid-credentials-error'
import { compare } from 'bcryptjs'
import { Permission, Profile, Role, User } from '@prisma/client'
import { UserInactiveError } from './@errors/user/user-inactive-error'

interface AuthenticateServiceRequest {
  email: string
  password: string
}

interface AuthenticateServiceResponse {
  user: User & {
    profile: (Profile & { role: Role; permissions: Permission[] }) | null
  }
}

export class AuthenticateService {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateServiceRequest): Promise<AuthenticateServiceResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    if (!user.active) {
      throw new UserInactiveError()
    }

    const doesPasswordMatches = await compare(password, user.password)

    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError()
    }
    return {
      user,
    }
  }
}
