import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      category: true,
      duration: true,
      level: true,
      price: true
    }
  })

  return { courses }
})

