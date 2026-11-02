import { getRouterParam } from 'h3'
import { prisma } from '../../../../../utils/prisma'
import { requireAuth } from '../../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireAuth(event, config.jwtSecret)
  const reviewId = getRouterParam(event, 'reviewId')
  if (!reviewId) {
    throw createError({ statusCode: 400, statusMessage: 'ID avis manquant' })
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review) {
    throw createError({ statusCode: 404, statusMessage: 'Avis introuvable' })
  }

  const existing = await prisma.reviewLike.findUnique({
    where: { userId_reviewId: { userId: user.userId, reviewId } }
  })

  if (existing) {
    await prisma.reviewLike.delete({ where: { id: existing.id } })
  } else {
    await prisma.reviewLike.create({ data: { userId: user.userId, reviewId } })
  }

  const likeCount = await prisma.reviewLike.count({ where: { reviewId } })

  return { liked: !existing, likeCount }
})