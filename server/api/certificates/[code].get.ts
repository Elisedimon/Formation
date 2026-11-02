import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')?.trim().toUpperCase()
  if (!code) throw createError({ statusCode: 400, statusMessage: 'Code du certificat manquant.' })
  const certificate = await prisma.certificate.findUnique({
    where: { code },
    select: { code: true, issuedAt: true, revokedAt: true, user: { select: { firstName: true, lastName: true } }, enrollment: { select: { status: true, course: { select: { title: true, duration: true, icon: true } } } } }
  })
  if (!certificate) throw createError({ statusCode: 404, statusMessage: 'Certificat introuvable.' })
  return { certificate, valid: !certificate.revokedAt && certificate.enrollment.status === 'COMPLETED' }
})
