import { getQuery } from 'h3'
import { prisma } from '../../utils/prisma'
import { verifyEmailToken, signToken, setAuthCookie } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = (query.token as string) || ''

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token d’activation manquant' })
  }

  const user = await verifyEmailToken(token)

  // Connecter automatiquement l'utilisateur après activation
  const config = useRuntimeConfig()
  const sessionToken = signToken(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret
  )
  setAuthCookie(event, sessionToken)

  return {
    user,
    message: 'Compte activé avec succès. Vous êtes connecté.'
  }
})
