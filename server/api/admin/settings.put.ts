import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'
import { DEFAULT_PLATFORM_SETTINGS, PLATFORM_SETTING_KEYS, parseBool } from '../../utils/platformSettings'

const VALID_KEYS = new Set(PLATFORM_SETTING_KEYS)

function validate(key: string, value: string, type: string): string | null {
  if (!VALID_KEYS.has(key)) return `Clé inconnue: ${key}`
  if (type === 'boolean') {
    if (value !== 'true' && value !== 'false') return `Valeur booléenne invalide pour ${key}`
  }
  if (type === 'number') {
    if (isNaN(Number(value))) return `Valeur numérique invalide pour ${key}`
  }
  if (type === 'date' && value) {
    const t = Date.parse(value)
    if (isNaN(t)) return `Date invalide pour ${key}`
  }
  if (key === 'platform.supportEmail' && value) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email support invalide'
  }
  if (key === 'platform.appUrl' && value) {
    try { new URL(value) } catch { return 'URL invalide' }
  }
  return null
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const user = await requireRole(event, config.jwtSecret, ['ADMIN'])

  const body = await readBody<any>(event)
  let updates: { key: string; value: string }[] = []

  if (Array.isArray(body)) {
    updates = body
  } else if (body?.updates && Array.isArray(body.updates)) {
    updates = body.updates
  } else if (body?.settings && typeof body.settings === 'object') {
    updates = Object.entries(body.settings).map(([key, value]) => ({ key, value: String(value) }))
  } else if (body && typeof body === 'object') {
    updates = Object.entries(body).map(([key, value]) => ({ key, value: String(value) }))
  }

  if (!updates.length) {
    throw createError({ statusCode: 400, statusMessage: 'Aucune mise à jour fournie' })
  }

  const typeByKey = new Map(DEFAULT_PLATFORM_SETTINGS.map((s) => [s.key, s.type]))

  for (const u of updates) {
    const type = typeByKey.get(u.key) || 'string'
    const err = validate(u.key, u.value, type)
    if (err) throw createError({ statusCode: 400, statusMessage: err })
  }

  await prisma.$transaction(
    updates.map((u) =>
      prisma.platformSetting.upsert({
        where: { key: u.key },
        update: { value: u.value, updatedBy: user.userId, type: typeByKey.get(u.key) || 'string' },
        create: { key: u.key, value: u.value, type: typeByKey.get(u.key) || 'string', updatedBy: user.userId }
      })
    )
  )

  return { ok: true }
})