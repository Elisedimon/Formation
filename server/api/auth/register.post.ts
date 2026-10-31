import { prisma } from '../../utils/prisma'
import { hashPassword, generateEmailVerificationToken } from '../../utils/auth'

interface RegisterBody {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterBody>(event)

  const email = body.email?.trim().toLowerCase()
  const password = body.password
  const firstName = body.firstName?.trim() || null
  const lastName = body.lastName?.trim() || null

  // Validation
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email et mot de passe sont requis'
    })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Format d’email invalide'
    })
  }

  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le mot de passe doit contenir au moins 8 caractères'
    })
  }

  // Check existing user
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Un compte existe déjà avec cet email'
    })
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role: 'STUDENT',
      isActive: false
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  })

  // Générer le token d'activation email
  const verifyToken = await generateEmailVerificationToken(user.id)

  // En dev, on affiche le token dans la console (pas de vrai envoi d'email pour l'instant)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Auth] Token d'activation pour ${email}: ${verifyToken}`)
    console.log(`[Auth] Lien d'activation : http://localhost:3000/auth/verify-email?token=${verifyToken}`)
  }

  return {
    user,
    message: 'Compte créé. Un email d’activation vous a été envoyé. Vérifiez votre boîte mail avant de vous connecter.'
  })
})
