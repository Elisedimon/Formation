import { getRouterParam, readBody } from 'h3'
import { prisma } from '../../../../../utils/prisma'
import { requireRole } from '../../../../../utils/auth'

interface QuizPatchBody {
  title?: string
  passingScore?: number
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireRole(event, config.jwtSecret, ['ADMIN', 'INSTRUCTOR'])
  const moduleId = getRouterParam(event, 'moduleId')
  const quizId = getRouterParam(event, 'quizId')
  const body = await readBody<QuizPatchBody>(event)
  if (!moduleId || !quizId) throw createError({ statusCode: 400, statusMessage: 'Paramètres manquants.' })

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { id: true, module: { select: { id: true, course: { select: { instructorId: true } } } } }
  })
  if (!quiz) throw createError({ statusCode: 404, statusMessage: 'Quiz introuvable.' })
  if (quiz.module.id !== moduleId) throw createError({ statusCode: 400, statusMessage: 'Le quiz n’appartient pas à ce chapitre.' })

  if (user.role === 'INSTRUCTOR' && quiz.module.course.instructorId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Vous ne pouvez modifier que vos propres quiz.' })
  }

  const data: Record<string, unknown> = {}
  if (typeof body.title === 'string' && body.title.trim().length >= 3) data.title = body.title.trim()
  if (typeof body.passingScore === 'number' && Number.isInteger(body.passingScore) && body.passingScore >= 1 && body.passingScore <= 100) data.passingScore = body.passingScore

  if (!Object.keys(data).length) throw createError({ statusCode: 400, statusMessage: 'Aucune modification valide.' })

  const updated = await prisma.quiz.update({ where: { id: quizId }, data })
  return { quiz: updated }
})
