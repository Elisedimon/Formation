import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const instructor = await requireRole(event, config.jwtSecret, ['INSTRUCTOR'])

  const body = await readBody(event)
  const { firstName, lastName, email } = body

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'L’email est requis' })
  }

  const user = await prisma.user.update({
    where: { id: instructor.userId },
    data: {
      firstName: firstName || null,
      lastName: lastName || null,
      email
    },
    select: { id: true, firstName: true, lastName: true, email: true, role: true }
  })

  return { user }
})
