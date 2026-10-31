import { prisma } from '../../utils/prisma'
import { verifyPassword, signToken, setAuthCookie } from '../../utils/auth'

interface LoginBody {
  email?: string
  password?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginBody>(event)

  const email = body.email?.trim().toLowerCase()
  const password = body.password

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email et mot de passe sont requis'
    })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // Constant-time style: always run verify even if user not found
  const valid = user
    ? await verifyPassword(password, user.passwordHash)
    : false

  if (!user || !valid || !user.isActive) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Email ou mot de passe incorrect'
    })
  }

  const config = useRuntimeConfig()
  const token = signToken(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret
  )

  setAuthCookie(event, token)

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt
    }
  }
})
