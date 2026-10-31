import { Prisma } from '@prisma/client'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  await requireRole(event, config.jwtSecret, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  const body = await readBody<Record<string, unknown>>(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID manquant.' })
  const current = await prisma.course.findUnique({ where: { id } })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Formation introuvable.' })
  const data: Prisma.CourseUpdateInput = {}
  if (typeof body.isPublished === 'boolean') data.isPublished = body.isPublished
  if (typeof body.title === 'string' && body.title.trim().length >= 3) data.title = body.title.trim()
  if (typeof body.price === 'number' && Number.isInteger(body.price) && body.price >= 0) data.price = body.price
  if (typeof body.category === 'string' && body.category.trim()) data.category = body.category.trim()
  if (typeof body.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug.trim())) data.slug = body.slug.trim()
  if (typeof body.description === 'string') data.description = body.description.trim()
  if (typeof body.duration === 'string') data.duration = body.duration.trim() || null
  if (typeof body.level === 'string') data.level = body.level.trim() || null
  if (typeof body.instructorId === 'string') {
    const instructor = await prisma.user.findFirst({ where: { id: body.instructorId, role: 'INSTRUCTOR', isActive: true }, select: { id: true } })
    if (!instructor) throw createError({ statusCode: 400, statusMessage: 'Formateur invalide ou désactivé.' })
    data.instructor = { connect: { id: instructor.id } }
  }
  if (body.instructorId === null) data.instructor = { disconnect: true }
  return { course: await prisma.course.update({ where: { id }, data }) }
})

