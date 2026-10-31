import { getRouterParam } from 'h3'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID de cours manquant' })
  }

  const reviews = await prisma.review.findMany({
    where: { courseId: id },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { id: true, firstName: true, lastName: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const averageRating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  return { reviews, averageRating, count: reviews.length }
})
