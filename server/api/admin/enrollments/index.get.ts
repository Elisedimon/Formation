import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  await requireRole(event, config.jwtSecret, ['ADMIN'])
  const enrollments = await prisma.enrollment.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, status: true, createdAt: true,
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      course: { select: { id: true, title: true, slug: true } },
      certificate: { select: { id: true, code: true, issuedAt: true, revokedAt: true } }
    }
  })
  return { enrollments }
})
