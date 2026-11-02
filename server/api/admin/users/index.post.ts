import { prisma } from '../../../utils/prisma'
import { requireRole, hashPassword } from '../../../utils/auth'

interface CreateUserBody {
  email: string
  password: string
  firstName?: string
  lastName?: string
  role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  await requireRole(event, config.jwtSecret, ['ADMIN'])

  const body = await readBody<CreateUserBody>(event)
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password || ''
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Email invalide.' })
  }
  if (password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Mot de passe trop court (6 min).' })
  }
  const role = body?.role && ['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(body.role) ? body.role : 'STUDENT'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Cet email est déjà utilisé.' })
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: body?.firstName?.trim() || null,
      lastName: body?.lastName?.trim() || null,
      role,
      isActive: true
    },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true }
  })
  return { user }
})