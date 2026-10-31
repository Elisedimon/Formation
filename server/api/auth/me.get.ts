import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const payload = await requireAuth(event, config.jwtSecret)

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true
    }
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Utilisateur introuvable'
    })
  }

  return { user }
})
