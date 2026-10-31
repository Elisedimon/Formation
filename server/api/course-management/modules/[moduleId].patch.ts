import { getRouterParam, readBody } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireRole(event, config.jwtSecret, ['ADMIN', 'INSTRUCTOR'])
  const moduleId = getRouterParam(event, 'moduleId')
  const body = await readBody<Record<string, unknown>>(event)
  if (!moduleId) throw createError({ statusCode: 400, statusMessage: 'ID de chapitre manquant.' })

  const module = await prisma.courseModule.findUnique({
    where: { id: moduleId },
    select: { id: true, courseId: true, course: { select: { instructorId: true } } }
  })
  if (!module) throw createError({ statusCode: 404, statusMessage: 'Chapitre introuvable.' })

  if (user.role === 'INSTRUCTOR' && module.course.instructorId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Vous ne pouvez modifier que vos propres chapitres.' })
  }

  const data: Record<string, unknown> = {}
  if (typeof body.title === 'string' && body.title.trim().length >= 3) data.title = body.title.trim()
  if (typeof body.description === 'string') data.description = body.description.trim()
  if (typeof body.position === 'number' && Number.isInteger(body.position) && body.position >= 0) data.position = body.position

  if (!Object.keys(data).length) throw createError({ statusCode: 400, statusMessage: 'Aucune modification valide.' })

  const updated = await prisma.courseModule.update({ where: { id: moduleId }, data })
  return { module: updated }
})
