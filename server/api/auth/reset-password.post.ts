import { getQuery } from 'h3'
import { prisma } from '../../utils/prisma'
import { verifyPasswordResetToken, resetPassword, signToken, setAuthCookie } from '../../utils/auth'

interface ResetPasswordBody {
  password?: string
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = (query.token as string) || ''
  const body = await readBody<ResetPasswordBody>(event)
  const password = body.password

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token de réinitialisation manquant' })
  }

  if (!password || password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le mot de passe doit contenir au moins 8 caractères'
    })
  }

  const user = await verifyPasswordResetToken(token)
  await resetPassword(user.id, password)

  // Connecter automatiquement l'utilisateur après réinitialisation
  const config = useRuntimeConfig()
  const sessionToken = signToken(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret
  )
  setAuthCookie(event, sessionToken)

  return {
    user: { id: user.id, email: user.email, role: user.role },
    message: 'Mot de passe réinitialisé. Vous êtes connecté.'
  }
})
