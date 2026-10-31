import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  await requireRole(event, config.jwtSecret, ['ADMIN'])
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true, _count: { select: { enrollments: true, coursesTaught: true } } }
  })
  return { users }
})
