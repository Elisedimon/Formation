import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const instructor = await requireRole(event, config.jwtSecret, ['INSTRUCTOR'])

  const enrollments = await prisma.enrollment.findMany({
    where: {
      course: { instructorId: instructor.userId }
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      createdAt: true,
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      course: { select: { id: true, title: true, slug: true } },
      _count: { select: { lessonProgress: true } }
    }
  })

  // Récupérer le total de leçons par cours pour calculer la progression
  const courseIds = [...new Set(enrollments.map(e => e.course.id))]
  const lessonsByCourse = await prisma.courseModule.findMany({
    where: { courseId: { in: courseIds } },
    include: { lessons: { select: { id: true } } }
  })
  const totalLessonsByCourse: Record<string, number> = {}
  for (const m of lessonsByCourse) {
    totalLessonsByCourse[m.courseId] = (totalLessonsByCourse[m.courseId] || 0) + m.lessons.length
  }

  const learners = enrollments.map((e: any) => {
    const total = totalLessonsByCourse[e.course.id] || 1
    const progress = Math.round((e._count.lessonProgress / total) * 100)
    return {
      id: e.id,
      firstName: e.user.firstName,
      lastName: e.user.lastName,
      email: e.user.email,
      status: e.status,
      course: e.course,
      progress: Math.min(progress, 100)
    }
  })

  return { learners }
})
