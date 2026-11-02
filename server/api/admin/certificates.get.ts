import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  await requireRole(event, config.jwtSecret, ['ADMIN'])

  const certificates = await prisma.certificate.findMany({
    orderBy: { issuedAt: 'desc' },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      enrollment: { include: { course: { select: { title: true } } } }
    }
  })

  return { certificates }
})