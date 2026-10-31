import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const instructor = await requireRole(event, config.jwtSecret, ['INSTRUCTOR'])
  const courses = await prisma.course.findMany({
    where: { instructorId: instructor.userId }, orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, slug: true, category: true, duration: true, level: true, price: true, isPublished: true, _count: { select: { enrollments: true } } }
  })
  return { courses, stats: { courses: courses.length, published: courses.filter(course => course.isPublished).length, learners: courses.reduce((total, course) => total + course._count.enrollments, 0) } }
})

