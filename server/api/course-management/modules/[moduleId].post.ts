import { prisma } from '../../../utils/prisma'
import { requireCourseEditor } from '../../../utils/learning'

export default defineEventHandler(async (event) => {
  const moduleId = getRouterParam(event, 'moduleId')
  const body = await readBody<{ kind?: string; title?: string; content?: string; videoUrl?: string; durationMinutes?: number }>(event)
  if (!moduleId || !body.title?.trim()) throw createError({ statusCode: 400, statusMessage: 'Titre manquant.' })
  const courseModule = await prisma.courseModule.findUnique({ where: { id: moduleId }, select: { id: true, courseId: true } })
  if (!courseModule) throw createError({ statusCode: 404, statusMessage: 'Chapitre introuvable.' })
  const config = useRuntimeConfig()
  await requireCourseEditor(event, courseModule.courseId, config.jwtSecret)
  if (body.kind === 'quiz') {
    throw createError({ statusCode: 400, statusMessage: 'Utilisez la route dédiée pour créer un quiz.' })
  }
  if (body.videoUrl && !/^https:\/\//i.test(body.videoUrl.trim())) throw createError({ statusCode: 400, statusMessage: 'Le lien vidéo doit commencer par https://.' })
  const position = await prisma.lesson.count({ where: { moduleId } })
  const lesson = await prisma.lesson.create({ data: { moduleId, title: body.title.trim(), content: body.content?.trim() || null, videoUrl: body.videoUrl?.trim() || null, durationMinutes: Number.isInteger(body.durationMinutes) && Number(body.durationMinutes) > 0 ? Number(body.durationMinutes) : null, position } })
  return { lesson }
})
