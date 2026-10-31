import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'
import { getCookie, getHeader, setCookie, deleteCookie } from 'h3'
import { prisma } from './prisma'

const SALT_ROUNDS = 12
const TOKEN_COOKIE = 'ast_token'
const TOKEN_EXPIRES_IN = '7d'

function requireJwtSecret(secret: string): string {
  if (!secret || secret.length < 32) {
    throw createError({
      statusCode: 500,
      statusMessage: 'JWT_SECRET doit être configuré avec au moins 32 caractères'
    })
  }
  return secret
}

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: JwtPayload, secret: string): string {
  return jwt.sign(payload, requireJwtSecret(secret), { expiresIn: TOKEN_EXPIRES_IN })
}

export function verifyToken(token: string, secret: string): JwtPayload | null {
  try {
    return jwt.verify(token, requireJwtSecret(secret)) as JwtPayload
  } catch {
    return null
  }
}

export function setAuthCookie(event: H3Event, token: string) {
  setCookie(event, TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
}

export function clearAuthCookie(event: H3Event) {
  deleteCookie(event, TOKEN_COOKIE, { path: '/' })
}

export function getTokenFromEvent(event: H3Event): string | null {
  // Prefer Authorization header, fallback to cookie
  const authHeader = getHeader(event, 'authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return getCookie(event, TOKEN_COOKIE) || null
}

export async function requireAuth(event: H3Event, secret: string): Promise<JwtPayload> {
  const token = getTokenFromEvent(event)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié' })
  }
  const payload = verifyToken(token, secret)
  if (!payload) {
    throw createError({ statusCode: 401, statusMessage: 'Token invalide ou expiré' })
  }
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { isActive: true, email: true, role: true } })
  if (!user?.isActive) {
    clearAuthCookie(event)
    throw createError({ statusCode: 401, statusMessage: 'Compte désactivé ou introuvable' })
  }
  return { ...payload, email: user.email, role: user.role }
}

export async function requireRole(event: H3Event, secret: string, roles: JwtPayload['role'][]): Promise<JwtPayload> {
  const user = await requireAuth(event, secret)
  if (!roles.includes(user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Accès réservé à un autre rôle' })
  }
  return user
}

const TOKEN_EXPIRES_IN_HOURS = 24

export async function generateEmailVerificationToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + TOKEN_EXPIRES_IN_HOURS * 60 * 60 * 1000)
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: token,
      emailVerificationTokenExpires: expires
    }
  })
  return token
}

export async function verifyEmailToken(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationTokenExpires: { gt: new Date() }
    }
  })
  if (!user) {
    throw createError({ statusCode: 400, statusMessage: 'Token d’activation invalide ou expiré' })
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isActive: true,
      emailVerificationToken: null,
      emailVerificationTokenExpires: null
    }
  })
  return { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName }
}

export async function generatePasswordResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + TOKEN_EXPIRES_IN_HOURS * 60 * 60 * 1000)
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: token,
      passwordResetTokenExpires: expires
    }
  })
  return token
}

export async function verifyPasswordResetToken(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetTokenExpires: { gt: new Date() }
    }
  })
  if (!user) {
    throw createError({ statusCode: 400, statusMessage: 'Token de réinitialisation invalide ou expiré' })
  }
  return { id: user.id, email: user.email, role: user.role }
}

export async function resetPassword(userId: string, newPassword: string) {
  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetTokenExpires: null
    }
  })
}
