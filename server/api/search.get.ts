import { prisma } from '../utils/prisma'
import { requireAuth } from '../utils/auth'

interface SearchResult {
  type: string
  id: string
  title: string
  subtitle: string
  url: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireAuth(event, config.jwtSecret)

  const q = String(getQuery(event).q || '').trim()
  if (q.length < 2) return { results: [] as SearchResult[] }

  const results: SearchResult[] = []

  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } }
      ]
    },
    take: 6,
    select: { id: true, title: true, slug: true, category: true }
  })

  for (const c of courses) {
    results.push({
      type: 'course',
      id: c.id,
      title: c.title,
      subtitle: c.category || 'Formation',
      url: user.role === 'ADMIN' ? '/admin/courses' : `/formations/${c.id}`
    })
  }

  if (user.role === 'ADMIN') {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 6,
      select: { id: true, firstName: true, lastName: true, email: true, role: true }
    })
    for (const u of users) {
      results.push({
        type: 'user',
        id: u.id,
        title: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        subtitle: `${u.role} · ${u.email}`,
        url: '/admin/users'
      })
    }
  }

  if (user.role === 'INSTRUCTOR') {
    const myCourses = await prisma.course.findMany({
      where: {
        instructorId: user.userId,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 6,
      select: { id: true, title: true, slug: true }
    })
    for (const c of myCourses) {
      if (results.some(r => r.id === c.id)) continue
      results.push({
        type: 'course',
        id: c.id,
        title: c.title,
        subtitle: 'Mon cours',
        url: `/formateur/cours/${c.id}`
      })
    }
  }

  return { results: results.slice(0, 12) }
})