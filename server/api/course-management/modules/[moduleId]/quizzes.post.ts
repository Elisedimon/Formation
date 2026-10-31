import { prisma } from '../../../../utils/prisma'
import { requireCourseEditor } from '../../../../utils/learning'

interface QuestionInput { prompt?: string; options?: unknown; correctAnswer?: number; explanation?: string }

export default defineEventHandler(async (event) => {
  const moduleId = getRouterParam(event, 'moduleId')
  const body = await readBody<{ title?: string; passingScore?: number; questions?: QuestionInput[] }>(event)
  const title = body.title?.trim()
  const questions = Array.isArray(body.questions) ? body.questions : []
  const passingScore = Number(body.passingScore ?? 70)
  if (!moduleId || !title || questions.length < 1 || questions.length > 50 || !Number.isInteger(passingScore) || passingScore < 1 || passingScore > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Le quiz doit avoir un titre, un seuil valide et au moins une question.' })
  }
  for (const question of questions) {
    if (!question.prompt?.trim() || !Array.isArray(question.options) || question.options.length < 2 || question.options.length > 8 || question.options.some(option => typeof option !== 'string' || !option.trim()) || !Number.isInteger(question.correctAnswer) || Number(question.correctAnswer) < 0 || Number(question.correctAnswer) >= question.options.length) {
      throw createError({ statusCode: 400, statusMessage: 'Une question ou ses choix de réponse sont invalides.' })
    }
  }
  const courseModule = await prisma.courseModule.findUnique({ where: { id: moduleId }, select: { id: true, courseId: true } })
  if (!courseModule) throw createError({ statusCode: 404, statusMessage: 'Chapitre introuvable.' })
  const config = useRuntimeConfig()
  await requireCourseEditor(event, courseModule.courseId, config.jwtSecret)
  const quiz = await prisma.quiz.create({ data: {
    moduleId, title, passingScore,
    questions: { create: questions.map((question, position) => ({ prompt: question.prompt!.trim(), options: question.options as string[], correctAnswer: Number(question.correctAnswer), explanation: question.explanation?.trim() || null, position })) }
  }, select: { id: true, title: true, passingScore: true, _count: { select: { questions: true } } } })
  return { quiz }
})
