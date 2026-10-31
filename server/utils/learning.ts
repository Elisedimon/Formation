import { randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'
import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import { requireRole, type JwtPayload } from './auth'

export async function requireCourseEditor(event: H3Event, courseId: string, secret: string): Promise<JwtPayload> {
  const user = await requireRole(event, secret, ['ADMIN', 'INSTRUCTOR'])
  if (user.role === 'INSTRUCTOR') {
    const course = await prisma.course.findFirst({ where: { id: courseId, instructorId: user.userId }, select: { id: true } })
    if (!course) throw createError({ statusCode: 404, statusMessage: 'Formation introuvable dans votre espace.' })
  }
  return user
}

export async function completeEnrollmentIfReady(tx: Prisma.TransactionClient, enrollmentId: string) {
  const enrollment = await tx.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: { include: { modules: { include: { lessons: { select: { id: true } }, quizzes: { select: { id: true } } } } } } }
  })
  if (!enrollment || enrollment.status !== 'ACTIVE') return null
  const lessonIds = enrollment.course.modules.flatMap(module => module.lessons.map(lesson => lesson.id))
  if (lessonIds.length === 0) return null
  const completedLessons = await tx.lessonProgress.count({ where: { enrollmentId, lessonId: { in: lessonIds } } })
  if (completedLessons !== lessonIds.length) return null
  const quizIds = enrollment.course.modules.flatMap(module => module.quizzes.map(quiz => quiz.id))
  if (quizIds.length) {
    const passedQuizzes = await tx.quizAttempt.findMany({ where: { enrollmentId, quizId: { in: quizIds }, passed: true }, distinct: ['quizId'], select: { quizId: true } })
    if (passedQuizzes.length !== quizIds.length) return null
  }
  await tx.enrollment.update({ where: { id: enrollmentId }, data: { status: 'COMPLETED' } })
  const certificate = await tx.certificate.upsert({
    where: { enrollmentId },
    create: { enrollmentId, userId: enrollment.userId, code: `AST-${randomBytes(16).toString('hex').toUpperCase()}` },
    update: { revokedAt: null }
  })
  return certificate
}
