import { getRouterParam, readBody } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { requireAuth } from '../../../../utils/auth'

interface QuizAttemptBody {
  answers: Record<string, number> // questionId -> selected option index
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireAuth(event, config.jwtSecret)

  const slug = getRouterParam(event, 'slug')
  const quizId = getRouterParam(event, 'quizId')

  if (!slug || !quizId) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètres manquants' })
  }

  const body = await readBody<QuizAttemptBody>(event)
  const answers = body.answers || {}

  // Récupérer le cours par slug
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { id: true }
  })
  if (!course) {
    throw createError({ statusCode: 404, statusMessage: 'Formation introuvable' })
  }

  // Vérifier l'inscription active
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

  // Récupérer le quiz avec ses questions
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      title: true,
      passingScore: true,
      moduleId: true,
      module: { select: { courseId: true } },
      questions: {
        select: { id: true, correctAnswer: true },
        orderBy: { position: 'asc' }
      }
    }
  })
  if (!quiz) {
    throw createError({ statusCode: 404, statusMessage: 'Quiz introuvable' })
  }

  // Vérifier que le quiz appartient à ce cours
  if (quiz.module.courseId !== course.id) {
    throw createError({ statusCode: 403, statusMessage: 'Ce quiz n’appartient pas à cette formation' })
  }

  // Calculer le score
  const totalQuestions = quiz.questions.length
  let correctCount = 0
  for (const question of quiz.questions) {
    const selected = answers[question.id]
    if (selected !== undefined && selected === question.correctAnswer) {
      correctCount++
    }
  }
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const passed = score >= quiz.passingScore

  // Vérifier le nombre de tentatives (max 3 par défaut)
  const maxAttempts = 3
  const existingAttempts = await prisma.quizAttempt.count({
    where: { enrollmentId: enrollment.id, quizId: quiz.id }
  })
  if (existingAttempts >= maxAttempts) {
    throw createError({
      statusCode: 403,
      statusMessage: `Nombre maximum de tentatives (${maxAttempts}) atteint pour ce quiz`
    })
  }

  // Enregistrer la tentative
  const attempt = await prisma.quizAttempt.create({
    data: {
      enrollmentId: enrollment.id,
      quizId: quiz.id,
      score,
      passed
    },
    select: { id: true, score: true, passed: true, attemptedAt: true }
  })

  return {
    attempt,
    score,
    passed,
    passingScore: quiz.passingScore,
    totalQuestions,
    correctCount,
    message: passed ? 'Quiz réussi !' : 'Quiz non réussi. Vous pouvez réessayer.'
  }
})
