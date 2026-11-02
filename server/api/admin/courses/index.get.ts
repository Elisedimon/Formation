import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  await requireRole(event, config.jwtSecret, ['ADMIN'])

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      instructor: { select: { firstName: true, lastName: true } },
      _count: { select: { enrollments: true } }
    }
  })

  return { courses }
})