import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireAuth(event, config.jwtSecret)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Identifiant manquant.' })

  const discussion = await prisma.discussion.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      instructor: { select: { id: true, firstName: true, lastName: true, email: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } }
      }
    }
  })
  if (!discussion) throw createError({ statusCode: 404, statusMessage: 'Discussion introuvable.' })
  if (user.role !== 'ADMIN' && discussion.studentId !== user.userId && discussion.instructorId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé.' })
  }

  return { discussion }
})