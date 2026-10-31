import { getQuery } from 'h3'
import { prisma } from '../../utils/prisma'
import { generatePasswordResetToken } from '../../utils/auth'

interface ForgotPasswordBody {
  email?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ForgotPasswordBody>(event)
  const email = body.email?.trim().toLowerCase()

  // Réponse générique quelle que soit l'issue (éviter l'énumération d'emails)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { message: 'Si cet email existe, un lien de réinitialisation vous a été envoyé.' }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { message: 'Si cet email existe, un lien de réinitialisation vous a été envoyé.' }
  }

  const token = await generatePasswordResetToken(user.id)

  // En dev, on affiche le token dans la console
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Auth] Token de réinitialisation pour ${email}: ${token}`)
    console.log(`[Auth] Lien de réinitialisation : http://localhost:3000/auth/reset-password?token=${token}`)
  }

  return { message: 'Si cet email existe, un lien de réinitialisation vous a été envoyé.' }
})
