import { getRouterParam, readBody } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

interface ReviewBody {
  rating?: number
  comment?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireAuth(event, config.jwtSecret)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID de cours manquant' })
  }

  const body = await readBody<ReviewBody>(event)
  const rating = body.rating
  const comment = body.comment?.trim() || null

  if (!rating || rating < 1 || rating > 5) {
    throw createError({ statusCode: 400, statusMessage: 'La note doit être comprise entre 1 et 5' })
  }

  // Vérifier que le cours existe et est publié
  const course = await prisma.course.findUnique({
    where: { id },
    select: { id: true, isPublished: true }
  })
  if (!course) {
    throw createError({ statusCode: 404, statusMessage: 'Formation introuvable' })
  }

  // Vérifier que l'utilisateur est inscrit (ACTIVE ou COMPLETED)
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.userId,
      courseId: id,
      status: { in: ['ACTIVE', 'COMPLETED'] }
    },
    select: { id: true }
  })
  if (!enrollment) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Vous devez être inscrit à cette formation pour laisser un avis'
    })
  }

  // Vérifier qu'il n'existe pas déjà un avis (1 par user/cours)
  const existing = await prisma.review.findUnique({
    where: { userId_courseId: { userId: user.userId, courseId: id } },
    select: { id: true }
  })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Vous avez déjà laissé un avis pour cette formation' })
  }

  const review = await prisma.review.create({
    data: {
      userId: user.userId,
      courseId: id,
      rating,
      comment
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { id: true, firstName: true, lastName: true } }
    }
  })

  return { review }
})

