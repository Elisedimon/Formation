import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const admin = await requireRole(event, config.jwtSecret, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Identifiant manquant.' })
  if (id === admin.userId) {
    throw createError({ statusCode: 409, statusMessage: 'Vous ne pouvez pas supprimer votre propre compte.' })
  }
  try {
    await prisma.user.delete({ where: { id } })
  } catch {
    throw createError({ statusCode: 409, statusMessage: 'Impossible de supprimer cet utilisateur (données liées). Désactivez-le plutôt.' })
  }
  return { ok: true }
})