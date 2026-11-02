import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireAuth(event, config.jwtSecret)

  const certificates = await prisma.certificate.findMany({
    where: { userId: user.userId },
    orderBy: { issuedAt: 'desc' },
    include: {
      enrollment: { include: { course: { select: { title: true, slug: true } } } }
    }
  })

  return { certificates }
})