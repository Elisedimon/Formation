import { Prisma } from '@prisma/client'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  await requireRole(event, config.jwtSecret, ['ADMIN'])
  const body = await readBody<Record<string, unknown>>(event)
  const title = String(body.title || '').trim()
  const slug = String(body.slug || '').trim().toLowerCase()
  const category = String(body.category || '').trim()
  const price = Number(body.price)
  const instructorId = typeof body.instructorId === 'string' ? body.instructorId : ''
  if (title.length < 3 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !category || !Number.isInteger(price) || price < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Titre, slug, catégorie ou prix invalide.' })
  }
  if (instructorId) {
    const instructor = await prisma.user.findFirst({ where: { id: instructorId, role: 'INSTRUCTOR', isActive: true }, select: { id: true } })
    if (!instructor) throw createError({ statusCode: 400, statusMessage: 'Formateur invalide ou désactivé.' })
  }
  try {
    const course = await prisma.course.create({ data: {
      title, slug, category, price,
      description: String(body.description || '').trim(),
      duration: String(body.duration || '').trim() || null,
      level: String(body.level || '').trim() || null,
      isPublished: body.isPublished === true,
      ...(instructorId ? { instructor: { connect: { id: instructorId } } } : {})
    } satisfies Prisma.CourseCreateInput })
    return { course }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'Ce slug est déjà utilisé.' })
    }
    throw error
  }
})

