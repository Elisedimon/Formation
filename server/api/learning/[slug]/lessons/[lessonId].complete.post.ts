import { getRouterParam } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'
import { completeEnrollmentIfReady } from '../../../utils/learning'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireAuth(event, config.jwtSecret)

  const slug = getRouterParam(event, 'slug')
  const lessonId = getRouterParam(event, 'lessonId')

  if (!slug || !lessonId) {
    throw createError({ statusCode: 400, statusMessage: 'Paramètres manquants' })
  }

  // Récupérer le cours par slug
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { id: true }
  })
  if (!course) {
    throw createError({ statusCode: 404, statusMessage: 'Formation introuvable' })
  }

  // Vérifier que l'utilisateur a une enrollment ACTIVE ou COMPLETED pour ce cours
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

  // Vérifier que la leçon existe et appartient à ce cours (via module)
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      module: { courseId: course.id }
    },
    select: { id: true }
  })
  if (!lesson) {
    throw createError({ statusCode: 404, statusMessage: 'Leçon introuvable' })
  }

  // Créer ou mettre à jour la progression de la leçon
  await prisma.lessonProgress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: enrollment.id,
        lessonId: lesson.id
      }
    },
    update: { completedAt: new Date() },
    create: {
      enrollmentId: enrollment.id,
      lessonId: lesson.id
    }
  })

  // Recalculer la progression et compléter l'inscription si prêt
  await prisma.$transaction(async (tx) => {
    await completeEnrollmentIfReady(tx, enrollment.id)
  })

  return {
    success: true,
    message: 'Leçon marquée comme terminée',
    enrollmentId: enrollment.id,
    enrollmentStatus: enrollment.status
  }
})
