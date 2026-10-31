import { randomBytes } from 'node:crypto'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  await requireRole(event, config.jwtSecret, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  const body = await readBody<{ status?: string }>(event)
  if (!id || !['ACTIVE', 'COMPLETED', 'CANCELLED'].includes(String(body.status))) {
    throw createError({ statusCode: 400, statusMessage: 'Statut d’inscription invalide.' })
  }
  const enrollment = await prisma.enrollment.findUnique({ where: { id }, include: { user: true, course: true } })
  if (!enrollment) throw createError({ statusCode: 404, statusMessage: 'Inscription introuvable.' })
  const status = body.status as 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.enrollment.update({ where: { id }, data: { status } })
    let certificate = await tx.certificate.findUnique({ where: { enrollmentId: id } })
    if (status === 'COMPLETED') {
      certificate = await tx.certificate.upsert({
        where: { enrollmentId: id },
        create: { enrollmentId: id, userId: enrollment.userId, code: `AST-${randomBytes(16).toString('hex').toUpperCase()}` },
        update: { revokedAt: null }
      })
    } else if (certificate && !certificate.revokedAt) {
      certificate = await tx.certificate.update({ where: { enrollmentId: id }, data: { revokedAt: new Date() } })
    }
    return { updated, certificate }
  })
  return result
})
