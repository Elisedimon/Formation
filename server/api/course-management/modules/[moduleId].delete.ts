import { getRouterParam } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireRole(event, config.jwtSecret, ['ADMIN', 'INSTRUCTOR'])
  const moduleId = getRouterParam(event, 'moduleId')
  if (!moduleId) throw createError({ statusCode: 400, statusMessage: 'ID de chapitre manquant.' })

  const module = await prisma.courseModule.findUnique({
    where: { id: moduleId },
    select: { id: true, course: { select: { instructorId: true } } }
  })
  if (!module) throw createError({ statusCode: 404, statusMessage: 'Chapitre introuvable.' })

  if (user.role === 'INSTRUCTOR' && module.course.instructorId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Vous ne pouvez supprimer que vos propres chapitres.' })
  }

  await prisma.courseModule.delete({ where: { id: moduleId } })
  return { success: true }
})
