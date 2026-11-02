import { prisma } from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireAuth(event, config.jwtSecret)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Identifiant manquant.' })

  const body = await readBody<{ content?: string }>(event)
  const content = body?.content?.trim()
  if (!content) throw createError({ statusCode: 400, statusMessage: 'Message vide.' })

  const discussion = await prisma.discussion.findUnique({ where: { id }, select: { id: true, studentId: true, instructorId: true } })
  if (!discussion) throw createError({ statusCode: 404, statusMessage: 'Discussion introuvable.' })
  if (user.role !== 'ADMIN' && discussion.studentId !== user.userId && discussion.instructorId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Accès refusé.' })
  }

  const message = await prisma.message.create({
    data: { discussionId: id, senderId: user.userId, content },
    include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } }
  })

  await prisma.discussion.update({ where: { id }, data: { updatedAt: new Date() } })

  return { message }
})