import { UnitRepository } from '@/repositories/unit-repository'
import { Unit } from '@prisma/client'

interface UpdateUnitRequest {
  id: string
  name?: string
  slug?: string
  allowsLoan?: boolean
}

interface UpdateUnitResponse {
  unit: Unit
}

export class UpdateUnitService {
  constructor(private repository: UnitRepository) {}

  async execute(data: UpdateUnitRequest): Promise<UpdateUnitResponse> {
    const { id, name, slug, allowsLoan } = data
    const unit = await this.repository.update(id, {
      name,
      ...(slug ? { slug } : {}),
      ...(allowsLoan !== undefined ? { allowsLoan } : {}),
    })
    return { unit }
  }
}
