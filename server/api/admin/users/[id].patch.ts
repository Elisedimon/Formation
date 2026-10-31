import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const admin = await requireRole(event, config.jwtSecret, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  const body = await readBody<Record<string, unknown>>(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Identifiant manquant.' })
  if (id === admin.userId && (body.isActive === false || (typeof body.role === 'string' && body.role !== 'ADMIN'))) {
    throw createError({ statusCode: 409, statusMessage: 'Vous ne pouvez pas désactiver ou rétrograder votre propre compte.' })
  }
  const data: { role?: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'; isActive?: boolean; firstName?: string | null; lastName?: string | null } = {}
  if (['ADMIN', 'INSTRUCTOR', 'STUDENT'].includes(String(body.role))) data.role = body.role as typeof data.role
  if (typeof body.isActive === 'boolean') data.isActive = body.isActive
  if (typeof body.firstName === 'string') data.firstName = body.firstName.trim() || null
  if (typeof body.lastName === 'string') data.lastName = body.lastName.trim() || null
  if (!Object.keys(data).length) throw createError({ statusCode: 400, statusMessage: 'Aucune modification valide.' })
  const result = await prisma.user.update({ where: { id }, data, select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true } })
  return { user: result }
})
