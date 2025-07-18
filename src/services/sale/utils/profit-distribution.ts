import { DistributeProfitsDeps } from '../types'

import { DetailedSale } from '@/repositories/sale-repository'
import { BarberNotFoundError } from '@/services/@errors/barber/barber-not-found-error'
import { SessionNotFoundError } from '@/services/@errors/cash-register/session-not-found-error'
import { OrganizationNotFoundError } from '@/services/@errors/organization/organization-not-found-error'
import { BarberProfileNotFoundError } from '@/services/@errors/profile/barber-profile-not-found-error'
import { IncrementBalanceProfileService } from '@/services/profile/increment-balance'
import { IncrementBalanceUnitService } from '@/services/unit/increment-balance'
import { Transaction } from '@prisma/client'

export async function distributeProfits(
  sale: DetailedSale,
  organizationId: string,
  userId: string,
  {
    organizationRepository,
    profileRepository,
    unitRepository,
    transactionRepository,
  }: DistributeProfitsDeps & {
    transactionRepository: import('@/repositories/transaction-repository').TransactionRepository
  },
): Promise<{ transactions: Transaction[] }> {
  const org = await organizationRepository.findById(organizationId)
  if (!org) throw new OrganizationNotFoundError()

  if (!sale.sessionId) throw new SessionNotFoundError()

  const transactions: Transaction[] = []

  const incrementUnit = new IncrementBalanceUnitService(
    unitRepository,
    transactionRepository,
  )
  const incrementProfile = new IncrementBalanceProfileService(
    profileRepository,
    transactionRepository,
  )

  const barberTotals: Record<string, number> = {}
  let ownerShare = 0

  for (const item of sale.items) {
    const value = item.price ?? 0
    if (item.product && !item.barberId) {
      ownerShare += value
    } else if (item.barberId) {
      const perc = item.porcentagemBarbeiro ?? 0
      const valueBarber = (value * perc) / 100
      barberTotals[item.barberId] =
        (barberTotals[item.barberId] || 0) + valueBarber
      ownerShare += value - valueBarber
    } else {
      ownerShare += value
    }
  }

  for (const [barberId, amount] of Object.entries(barberTotals)) {
    const userBarber = sale.items.find(
      (item) => item.barber?.id === barberId,
    )?.barber
    if (!userBarber) throw new BarberNotFoundError()
    if (!userBarber.profile) throw new BarberProfileNotFoundError()

    if (userBarber.profile.totalBalance < 0) {
      const balanceBarber = userBarber.profile.totalBalance
      const valueCalculated = balanceBarber + amount
      const amountToPay = valueCalculated <= 0 ? amount : -balanceBarber
      const transactionUnit = await incrementUnit.execute(
        sale.unitId,
        barberId,
        amountToPay,
        sale.id,
        true,
      )
      transactions.push(transactionUnit.transaction)
    }
    const transactionProfile = await incrementProfile.execute(
      barberId,
      amount,
      sale.id,
      userBarber.profile.totalBalance < 0,
    )
    transactions.push(transactionProfile.transaction)
  }

  const transactionUnit = await incrementUnit.execute(
    sale.unitId,
    userId,
    ownerShare,
    sale.id,
    false,
  )
  transactions.push(transactionUnit.transaction)

  return { transactions }
}
