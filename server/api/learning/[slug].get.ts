import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireAuth(event, config.jwtSecret)
  const slug = getRouterParam(event, 'slug')
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: user.userId, status: { in: ['ACTIVE', 'COMPLETED'] }, course: { slug } },
    select: {
      id: true, status: true,
      course: { select: { id: true, title: true, slug: true, description: true, duration: true } },
      certificate: { select: { code: true, issuedAt: true, revokedAt: true } }
    }
  })
  if (!enrollment) throw createError({ statusCode: 403, statusMessage: "Cette formation n'est pas inscrite dans votre compte. Inscrivez-vous et reglez les frais pour y acceder." })

  const modules = await prisma.courseModule.findMany({
    where: { courseId: enrollment.course.id }, orderBy: { position: 'asc' },
    select: {
      id: true, title: true, description: true, position: true,
      lessons: { orderBy: { position: 'asc' }, select: { id: true, title: true, content: true, videoUrl: true, durationMinutes: true, position: true, progress: { where: { enrollmentId: enrollment.id }, select: { completedAt: true } } } },
      quizzes: { orderBy: { createdAt: 'asc' }, select: { id: true, title: true, passingScore: true, questions: { orderBy: { position: 'asc' }, select: { id: true, prompt: true, options: true, position: true } }, attempts: { where: { enrollmentId: enrollment.id }, orderBy: { attemptedAt: 'desc' }, take: 1, select: { score: true, passed: true, attemptedAt: true } } } }
    }
  })
  const safeModules = modules.map(module => ({
    ...module,
    lessons: module.lessons.map(({ progress, ...lesson }) => ({ ...lesson, completedAt: progress[0]?.completedAt || null })),
    quizzes: module.quizzes.map(({ attempts, ...quiz }) => ({ ...quiz, lastAttempt: attempts[0] || null }))
  }))
  const lessonCount = safeModules.reduce((total, module) => total + module.lessons.length, 0)
  const completedCount = safeModules.reduce((total, module) => total + module.lessons.filter(lesson => lesson.completedAt).length, 0)
  return { enrollment: { id: enrollment.id, status: enrollment.status, certificate: enrollment.certificate }, course: { ...enrollment.course, modules: safeModules }, progress: { completed: completedCount, total: lessonCount, percent: lessonCount ? Math.round(completedCount / lessonCount * 100) : 0 } }
})
