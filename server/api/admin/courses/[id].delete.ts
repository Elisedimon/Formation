import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  await requireRole(event, config.jwtSecret, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID manquant.' })
  const course = await prisma.course.findUnique({ where: { id }, select: { id: true, _count: { select: { enrollments: true, payments: true } } } })
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Formation introuvable.' })
  if (course._count.enrollments || course._count.payments) {
    throw createError({ statusCode: 409, statusMessage: 'Cette formation possède déjà des inscriptions ou paiements. Dépubliez-la pour la retirer du catalogue.' })
  }
  await prisma.course.delete({ where: { id } })
  return { success: true }
})
