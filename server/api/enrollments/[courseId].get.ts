import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireAuth(event, config.jwtSecret).catch(() => null)
  if (!user) {
    return { enrolled: false }
  }

  const courseId = getRouterParam(event, 'courseId') || getQuery(event).courseId as string
  const slug = getQuery(event).slug as string

  let course
  if (courseId) {
    course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
  } else if (slug) {
    course = await prisma.course.findUnique({ where: { slug }, select: { id: true } })
  }

  if (!course) {
    return { enrolled: false }
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.userId,
      courseId: course.id,
      status: { in: ['ACTIVE', 'COMPLETED'] }
    },
    select: { id: true, status: true }
  })

  return { enrolled: !!enrollment, enrollment }
})
