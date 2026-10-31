import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  await requireRole(event, config.jwtSecret, ['ADMIN'])

  const [users, courses, enrollments, payments, latestUsers, latestPayments, allCourses, instructors] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count({ where: { status: { in: ['ACTIVE', 'COMPLETED'] } } }),
    prisma.payment.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true }, _count: true }),
    prisma.user.findMany({ take: 8, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true } }),
    prisma.payment.findMany({ take: 8, orderBy: { createdAt: 'desc' }, select: { id: true, amount: true, status: true, createdAt: true, user: { select: { email: true } }, course: { select: { title: true } } } }),
    prisma.course.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, title: true, slug: true, description: true, category: true, duration: true, level: true, price: true, isPublished: true, instructorId: true, instructor: { select: { email: true, firstName: true, lastName: true } }, _count: { select: { enrollments: true } } } }),
    prisma.user.findMany({ where: { role: 'INSTRUCTOR', isActive: true }, orderBy: { firstName: 'asc' }, select: { id: true, email: true, firstName: true, lastName: true } })
  ])

  return { stats: { users, courses, enrollments, revenue: payments._sum.amount || 0, approvedPayments: payments._count }, latestUsers, latestPayments, courses: allCourses, instructors }
})

