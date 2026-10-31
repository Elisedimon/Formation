import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  await requireRole(event, config.jwtSecret, ['ADMIN'])
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, amount: true, currency: true, status: true, fedapayId: true, fedapayStatus: true, createdAt: true, updatedAt: true, user: { select: { email: true, firstName: true, lastName: true } }, course: { select: { title: true } } }
  })
  return { payments }
})
