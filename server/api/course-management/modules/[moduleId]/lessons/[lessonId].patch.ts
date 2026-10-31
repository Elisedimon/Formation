import { getRouterParam, readBody } from 'h3'
import { prisma } from '../../../../../utils/prisma'
import { requireRole } from '../../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireRole(event, config.jwtSecret, ['ADMIN', 'INSTRUCTOR'])
  const moduleId = getRouterParam(event, 'moduleId')
  const lessonId = getRouterParam(event, 'lessonId')
  const body = await readBody<Record<string, unknown>>(event)
  if (!moduleId || !lessonId) throw createError({ statusCode: 400, statusMessage: 'Paramètres manquants.' })

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, module: { select: { id: true, course: { select: { instructorId: true } } } } }
  })
  if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Leçon introuvable.' })
  if (lesson.module.id !== moduleId) throw createError({ statusCode: 400, statusMessage: 'La leçon n’appartient pas à ce chapitre.' })

  if (user.role === 'INSTRUCTOR' && lesson.module.course.instructorId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Vous ne pouvez modifier que vos propres leçons.' })
  }

  const data: Record<string, unknown> = {}
  if (typeof body.title === 'string' && body.title.trim().length >= 3) data.title = body.title.trim()
  if (typeof body.content === 'string') data.content = body.content.trim() || null
  if (typeof body.videoUrl === 'string') data.videoUrl = body.videoUrl.trim() || null
  if (typeof body.durationMinutes === 'number' && Number.isInteger(body.durationMinutes) && body.durationMinutes >= 0) data.durationMinutes = body.durationMinutes
  if (typeof body.position === 'number' && Number.isInteger(body.position) && body.position >= 0) data.position = body.position

  if (!Object.keys(data).length) throw createError({ statusCode: 400, statusMessage: 'Aucune modification valide.' })

  const updated = await prisma.lesson.update({ where: { id: lessonId }, data })
  return { lesson: updated }
})
