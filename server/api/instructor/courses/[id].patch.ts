import { Prisma } from '@prisma/client'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const instructor = await requireRole(event, config.jwtSecret, ['INSTRUCTOR'])
  const id = getRouterParam(event, 'id')
  const body = await readBody<Record<string, unknown>>(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID manquant.' })
  const course = await prisma.course.findFirst({ where: { id, instructorId: instructor.userId } })
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Formation introuvable dans votre espace.' })
  const data: Prisma.CourseUpdateInput = {}
  if (typeof body.title === 'string' && body.title.trim().length >= 3) data.title = body.title.trim()
  if (typeof body.description === 'string') data.description = body.description.trim()
  if (typeof body.duration === 'string') data.duration = body.duration.trim() || null
  if (typeof body.level === 'string') data.level = body.level.trim() || null
  if (typeof body.category === 'string' && body.category.trim()) data.category = body.category.trim()
  if (typeof body.price === 'number' && Number.isInteger(body.price) && body.price >= 0) data.price = body.price
  return { course: await prisma.course.update({ where: { id }, data }) }
})

