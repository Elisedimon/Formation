import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireAuth(event, config.jwtSecret)

  const body = await readBody<{ courseId?: string; subject?: string }>(event)
  const courseId = body?.courseId?.trim()
  const subject = body?.subject?.trim()
  if (!courseId || !subject) throw createError({ statusCode: 400, statusMessage: 'Cours et sujet requis.' })

  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true, instructorId: true } })
  if (!course?.instructorId) throw createError({ statusCode: 404, statusMessage: 'Formation ou formateur introuvable.' })

  const discussion = await prisma.discussion.create({
    data: {
      courseId,
      studentId: user.userId,
      instructorId: course.instructorId,
      subject
    },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      instructor: { select: { id: true, firstName: true, lastName: true, email: true } }
    }
  })

  return { discussion }
})