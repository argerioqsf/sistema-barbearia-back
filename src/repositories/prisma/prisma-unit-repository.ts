import { prisma } from '@/lib/prisma'
import { Prisma, Unit } from '@prisma/client'
import { UnitRepository } from '../unit-repository'

export class PrismaUnitRepository implements UnitRepository {
  async create(data: Prisma.UnitCreateInput): Promise<Unit> {
    return prisma.unit.create({ data })
  }

  async findById(id: string): Promise<Unit | null> {
    return prisma.unit.findUnique({ where: { id } })
  }

  async findManyByOrganization(organizationId: string): Promise<Unit[]> {
    return prisma.unit.findMany({ where: { organizationId } })
  }

  async findMany(where: Prisma.UnitWhereInput = {}): Promise<Unit[]> {
    return prisma.unit.findMany({ where })
  }

  async update(id: string, data: Prisma.UnitUpdateInput): Promise<Unit> {
    return prisma.unit.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.unit.delete({ where: { id } })
  }

  async incrementBalance(id: string, amount: number): Promise<void> {
    await prisma.unit.update({
      where: { id },
      data: { totalBalance: { increment: amount } },
    })
  }
}
