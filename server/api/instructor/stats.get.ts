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

  const [enrollmentsAgg, paymentsAgg, reviewsAgg, monthlyRevenue] = await Promise.all([
    prisma.enrollment.aggregate({
      where: { courseId: { in: courseIds } },
      _count: true
    }),
    prisma.payment.aggregate({
      where: { courseId: { in: courseIds }, status: 'APPROVED' },
      _sum: { amount: true }
    }),
    prisma.review.aggregate({
      where: { courseId: { in: courseIds } },
      _avg: { rating: true }
    }),
    prisma.payment.groupBy({
      by: ['createdAt'],
      where: { courseId: { in: courseIds }, status: 'APPROVED' },
      _sum: { amount: true }
    })
  ])

  // Regrouper les revenus par mois
  const monthlyMap: Record<string, number> = {}
  for (const m of monthlyRevenue) {
    const key = new Date(m.createdAt).toLocaleDateString('fr-FR', { month: 'short' })
    monthlyMap[key] = (monthlyMap[key] || 0) + (m._sum.amount || 0)
  }

  const courseStats = await Promise.all(courses.map(async (c: any) => {
    const enrollments = await prisma.enrollment.count({ where: { courseId: c.id } })
    const revenue = await prisma.payment.aggregate({
      where: { courseId: c.id, status: 'APPROVED' },
      _sum: { amount: true }
    })
    const completions = await prisma.enrollment.count({
      where: { courseId: c.id, status: 'COMPLETED' }
    })
    return {
      title: c.title,
      enrollments,
      revenue: revenue._sum.amount || 0,
      completionRate: enrollments > 0 ? Math.round((completions / enrollments) * 100) : 0
    }
  }))

  return {
    stats: {
      totalCourses: courses.length,
      totalLearners: enrollmentsAgg._count || 0,
      totalRevenue: paymentsAgg._sum.amount || 0,
      avgRating: Math.round((reviewsAgg._avg.rating || 0) * 10) / 10
    },
    monthlyRevenue: Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue })),
    courseStats
  }
})
