import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const number = getRouterParam(event, 'number')?.trim().toUpperCase()
  if (!number) throw createError({ statusCode: 400, statusMessage: 'Référence manquante.' })
  const certificate = await prisma.certificate.findUnique({
    where: { code: number },
    select: { code: true, issuedAt: true, revokedAt: true, user: { select: { firstName: true, lastName: true } }, enrollment: { select: { status: true, course: { select: { title: true, duration: true, icon: true } } } } }
  })
  if (!certificate) throw createError({ statusCode: 404, statusMessage: 'Certificat introuvable.' })
  return { certificate, valid: !certificate.revokedAt && certificate.enrollment.status === 'COMPLETED' }
})