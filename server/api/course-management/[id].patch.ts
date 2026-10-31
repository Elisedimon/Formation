import { Prisma } from '@prisma/client'
import { getRouterParam, readBody } from 'h3'
import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireRole(event, config.jwtSecret, ['ADMIN', 'INSTRUCTOR'])
  const id = getRouterParam(event, 'id')
  const body = await readBody<Record<string, unknown>>(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID manquant.' })

  const current = await prisma.course.findUnique({ where: { id } })
  if (!current) throw createError({ statusCode: 404, statusMessage: 'Formation introuvable.' })

  // Un instructeur ne peut modifier que ses propres cours
  if (user.role === 'INSTRUCTOR' && current.instructorId !== user.userId) {
    throw createError({ statusCode: 403, statusMessage: 'Vous ne pouvez modifier que vos propres formations.' })
  }

  const data: Prisma.CourseUpdateInput = {}
  if (typeof body.title === 'string' && body.title.trim().length >= 3) data.title = body.title.trim()
  if (typeof body.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug.trim())) data.slug = body.slug.trim()
  if (typeof body.category === 'string' && body.category.trim()) data.category = body.category.trim()
  if (typeof body.description === 'string') data.description = body.description.trim()
  if (typeof body.duration === 'string') data.duration = body.duration.trim() || null
  if (typeof body.level === 'string') data.level = body.level.trim() || null
  if (typeof body.price === 'number' && Number.isInteger(body.price) && body.price >= 0) data.price = body.price
  if (typeof body.image === 'string') data.image = body.image.trim() || null
  if (typeof body.isPublished === 'boolean') data.isPublished = body.isPublished

  if (!Object.keys(data).length) throw createError({ statusCode: 400, statusMessage: 'Aucune modification valide.' })

  try {
    const course = await prisma.course.update({ where: { id }, data })
    return { course }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'Ce slug est déjà utilisé.' })
    }
    throw error
  }
})
