import { getRouterParam } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID manquant' })
  }

  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      isPublished: true
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      category: true,
      duration: true,
      level: true,
      price: true,
      image: true,
      instructor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      modules: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          position: true,
          lessons: {
            orderBy: { position: 'asc' },
            select: {
              id: true,
              title: true,
              description: true,
              videoUrl: true,
              durationMinutes: true,
              position: true
            }
          },
          quizzes: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              title: true,
              passingScore: true
            }
          }
        }
      },
      _count: {
        select: {
          enrollments: true,
          reviews: true
        }
      },
      reviews: {
        select: {
          rating: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  if (!course) {
    throw createError({ statusCode: 404, statusMessage: 'Formation introuvable' })
  }

  const averageRating = course.reviews.length
    ? Math.round((course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length) * 10) / 10
    : 0

  return {
    course: {
      ...course,
      averageRating,
      reviewCount: course._count.reviews,
      enrollmentCount: course._count.enrollments
    }
  }
})
