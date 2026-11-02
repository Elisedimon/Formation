import { prisma } from '../../utils/prisma'
import { hashPassword } from '../../utils/auth'
import { sendEmail } from '../../utils/email'

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
      isActive: true
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

  // Email de bienvenue
  await sendEmail({
    to: user.email,
    subject: 'Bienvenue sur AST-Academy',
    html: `
      <h2>Bonjour ${user.firstName || ''} 👋</h2>
      <p>Votre compte AST-Academy a été créé avec succès.</p>
      <p>Vous pouvez désormais vous connecter et accéder à toutes nos formations.</p>
      <hr />
      <p style="font-size:12px;color:#666;">AST-Academy – Maîtrisez les technologies de demain</p>
    `
  })

  return {
    user,
    message: 'Compte créé avec succès.'
  }
})

