import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const instructor = await requireRole(event, config.jwtSecret, ['INSTRUCTOR'])

  const discussions = await prisma.discussion.findMany({
    where: { instructorId: instructor.userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      course: { select: { id: true, title: true } },
      student: { select: { id: true, firstName: true, lastName: true, email: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, createdAt: true, senderId: true }
      }
    }
  })

  // Compter les messages non lus par discussion
  const discussionIds = discussions.map(d => d.id)
  const unreadCounts = await prisma.message.groupBy({
    by: ['discussionId'],
    where: { discussionId: { in: discussionIds }, read: false },
    _count: true
  })
  const unreadMap: Record<string, number> = {}
  for (const u of unreadCounts) {
    unreadMap[u.discussionId] = u._count
  }

  return {
    discussions: discussions.map((d: any) => ({
      id: d.id,
      subject: d.subject,
      course: d.course.title,
      otherName: `${d.student.firstName || ''} ${d.student.lastName || ''}`.trim() || d.student.email,
      lastMessage: d.messages[0]?.content || '',
      lastMessageAt: d.messages[0]?.createdAt ? new Date(d.messages[0].createdAt).toLocaleDateString('fr-FR') : '',
      unreadCount: unreadMap[d.id] || 0,
      isOnline: true
    }))
  }
})
