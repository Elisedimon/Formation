import { prisma } from '../../utils/prisma'
import { requireCourseEditor } from '../../utils/learning'

export default defineEventHandler(async (event) => {
  const courseId = getRouterParam(event, 'id')
  const body = await readBody<{ title?: string; description?: string }>(event)
  const title = body.title?.trim()
  if (!courseId || !title || title.length > 160) throw createError({ statusCode: 400, statusMessage: 'Titre de chapitre invalide.' })
  const config = useRuntimeConfig()
  await requireCourseEditor(event, courseId, config.jwtSecret)
  const position = await prisma.courseModule.count({ where: { courseId } })
  const module = await prisma.courseModule.create({ data: { courseId, title, description: body.description?.trim() || null, position } })
  return { module }
})
