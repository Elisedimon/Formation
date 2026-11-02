import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireAuth(event, config.jwtSecret)

  const where: any = {}
  if (user.role === 'INSTRUCTOR') where.instructorId = user.userId
  else if (user.role === 'STUDENT') where.studentId = user.userId

  const discussions = await prisma.discussion.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      instructor: { select: { id: true, firstName: true, lastName: true, email: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true, createdAt: true, senderId: true } }
    }
  })

  return { discussions }
})