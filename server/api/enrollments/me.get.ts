import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const payload = await requireAuth(event, config.jwtSecret)

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: payload.userId, status: { in: ['ACTIVE', 'COMPLETED'] } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      createdAt: true,
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          duration: true,
          level: true,
          price: true,
          description: true
        }
      },
      certificate: { select: { code: true, issuedAt: true, revokedAt: true } }
    }
  })

  return { enrollments }
})
