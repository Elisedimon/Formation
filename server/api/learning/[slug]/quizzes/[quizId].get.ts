import { getRouterParam } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireAuth(event, config.jwtSecret)

  const slug = getRouterParam(event, 'slug')
  const quizId = getRouterParam(event, 'quizId')

  if (!slug || !quizId) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètres manquants' })
  }

  const course = await prisma.course.findUnique({
    where: { slug },
    select: { id: true, title: true, slug: true, category: true }
  })
  if (!course) {
    throw createError({ statusCode: 404, statusMessage: 'Formation introuvable' })
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.userId,
      courseId: course.id,
      status: { in: ['ACTIVE', 'COMPLETED'] }
    },
    select: { id: true, status: true }
  })
  if (!enrollment) {
    throw createError({ statusCode: 403, statusMessage: 'Vous n’êtes pas inscrit à cette formation' })
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      title: true,
      passingScore: true,
      moduleId: true,
      module: { select: { courseId: true } },
      questions: {
        select: {
          id: true,
          prompt: true,
          options: true,
          position: true
        },
        orderBy: { position: 'asc' }
      }
    }
  })

  if (!quiz) {
    throw createError({ statusCode: 404, statusMessage: 'Quiz introuvable' })
  }

  if (quiz.module.courseId !== course.id) {
    throw createError({ statusCode: 403, statusMessage: 'Ce quiz n’appartient pas à cette formation' })
  }

  // Ne pas renvoyer la bonne réponse au client
  const safeQuestions = quiz.questions.map(q => ({
    id: q.id,
    prompt: q.prompt,
    options: q.options,
    position: q.position
  }))

  return {
    quiz: { ...quiz, questions: safeQuestions },
    course
  }
})
