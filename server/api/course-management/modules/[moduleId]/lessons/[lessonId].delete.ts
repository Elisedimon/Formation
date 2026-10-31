import { getRouterParam } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { requireRole } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireRole(event, config.jwtSecret, ['ADMIN', 'INSTRUCTOR'])
  const moduleId = getRouterParam(event, 'moduleId')
  const lessonId = getRouterParam(event, 'lessonId')
  if (!moduleId || !lessonId) throw createError({ statusCode: 400, statusMessage: 'Paramètres manquants.' })

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, module: { select: { id: true, course: { select: { instructorId: true } } } } }
  })
  if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Leçon introuvable.' })
  if (lesson.module.id !== moduleId) throw createError({ statusCode: 400, statusMessage: 'La leçon n’appartient pas à ce chapitre.' })

  if (user.role === 'INSTRUCTOR' && lesson.module.course.instructorId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Vous ne pouvez supprimer que vos propres leçons.' })
  }

  await prisma.lesson.delete({ where: { id: lessonId } })
  return { success: true }
})
