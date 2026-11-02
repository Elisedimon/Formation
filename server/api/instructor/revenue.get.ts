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

  const payments = await prisma.payment.findMany({
    where: { courseId: { in: courseIds } },
    select: { id: true, amount: true, status: true, createdAt: true, user: { select: { firstName: true, lastName: true } }, course: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  const [totalAgg, pendingAgg, paidAgg, monthly] = await Promise.all([
    prisma.payment.aggregate({
      where: { courseId: { in: courseIds }, status: 'APPROVED' },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: { courseId: { in: courseIds }, status: 'PENDING' },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: { courseId: { in: courseIds }, status: 'APPROVED' },
      _sum: { amount: true }
    }),
    prisma.payment.groupBy({
      by: ['createdAt'],
      where: { courseId: { in: courseIds }, status: 'APPROVED' },
      _sum: { amount: true }
    })
  ])

  const monthlyMap: Record<string, { revenue: number; count: number }> = {}
  for (const m of monthly) {
    const key = new Date(m.createdAt).toLocaleDateString('fr-FR', { month: 'short' })
    if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, count: 0 }
    monthlyMap[key].revenue += m._sum.amount || 0
    monthlyMap[key].count += 1
  }

  return {
    totalRevenue: totalAgg._sum.amount || 0,
    pendingRevenue: pendingAgg._sum.amount || 0,
    paidRevenue: paidAgg._sum.amount || 0,
    monthlyRevenue: Object.entries(monthlyMap).map(([month, v]) => ({ month, revenue: v.revenue, count: v.count })),
    recentPayments: payments.map((p: any) => ({
      id: p.id,
      learner: `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() || p.user.email,
      course: p.course?.title || '—',
      amount: p.amount,
      date: p.createdAt,
      status: p.status
    }))
  }
})
