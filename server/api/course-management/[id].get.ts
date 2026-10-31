import { prisma } from '../../utils/prisma'
import { requireCourseEditor } from '../../utils/learning'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID formation manquant.' })
  const config = useRuntimeConfig()
  await requireCourseEditor(event, id, config.jwtSecret)
  const course = await prisma.course.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, modules: { orderBy: { position: 'asc' }, select: { id: true, title: true, description: true, position: true, lessons: { orderBy: { position: 'asc' }, select: { id: true, title: true, content: true, videoUrl: true, durationMinutes: true, position: true } }, quizzes: { orderBy: { createdAt: 'asc' }, select: { id: true, title: true, passingScore: true, _count: { select: { questions: true } } } } } } }
  })
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Formation introuvable.' })
  return { course }
})
