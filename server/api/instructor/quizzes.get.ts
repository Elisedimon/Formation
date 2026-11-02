import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const instructor = await requireRole(event, config.jwtSecret, ['INSTRUCTOR'])

  const courses = await prisma.course.findMany({
    where: { instructorId: instructor.userId },
    select: { id: true }
  })
  const courseIds = courses.map(c => c.id)

  const modules = await prisma.courseModule.findMany({
    where: { courseId: { in: courseIds } },
    select: { id: true }
  })
  const moduleIds = modules.map(m => m.id)

  const quizzes = await prisma.quiz.findMany({
    where: { moduleId: { in: moduleIds } },
    include: {
      _count: { select: { questions: true, attempts: true } },
      module: { select: { course: { select: { id: true, title: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const attemptsByQuiz = await prisma.quizAttempt.groupBy({
    by: ['quizId'],
    _avg: { score: true }
  })
  const avgMap: Record<string, number> = {}
  for (const a of attemptsByQuiz) {
    avgMap[a.quizId] = Math.round(a._avg.score || 0)
  }

  return {
    quizzes: quizzes.map((q: any) => ({
      id: q.id,
      title: q.title,
      passingScore: q.passingScore,
      course: q.module.course,
      questions: q._count.questions,
      attempts: q._count.attempts,
      averageScore: avgMap[q.id] || 0
    }))
  }
})
