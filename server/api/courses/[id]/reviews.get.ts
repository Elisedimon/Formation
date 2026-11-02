import { getRouterParam } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID de cours manquant' })
  }

  let userId: string | null = null
  try {
    const config = useRuntimeConfig()
    const payload = await requireAuth(event, config.jwtSecret)
    userId = payload.userId
  } catch {
    userId = null
  }

  const reviews = await prisma.review.findMany({
    where: { courseId: id },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      _count: { select: { likes: true } },
      likes: userId ? { where: { userId }, select: { id: true } } : false
    },
    orderBy: { createdAt: 'desc' }
  })

  const mapped = reviews.map((r: any) => ({
    ...r,
    likeCount: r._count?.likes ?? 0,
    likedByMe: Array.isArray(r.likes) && r.likes.length > 0
  }))

  const averageRating = mapped.length
    ? Math.round((mapped.reduce((sum: number, r: any) => sum + r.rating, 0) / mapped.length) * 10) / 10
    : 0

  return { reviews: mapped, averageRating, count: mapped.length }
})