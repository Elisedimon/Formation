import { prisma } from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const payload = await requireAuth(event, config.jwtSecret)

  const receipts = await prisma.receipt.findMany({
    where: { userId: payload.userId },
    select: {
      id: true,
      pdfUrl: true,
      amount: true,
      currency: true,
      createdAt: true,
      payment: {
        select: {
          id: true,
          status: true,
          fedapayId: true,
          course: { select: { id: true, title: true, slug: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return { receipts }
})
