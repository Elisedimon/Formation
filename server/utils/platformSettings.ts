export interface PlatformSettingDefault {
  key: string
  value: string
  type: 'string' | 'boolean' | 'number' | 'date'
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettingDefault[] = [
  { key: 'maintenance.enabled', value: 'false', type: 'boolean' },
  { key: 'maintenance.message', value: 'La plateforme est actuellement en maintenance. Veuillez réessayer plus tard.', type: 'string' },
  { key: 'maintenance.startAt', value: '', type: 'date' },
  { key: 'maintenance.endAt', value: '', type: 'date' },
  { key: 'platform.name', value: 'AST-Academy', type: 'string' },
  { key: 'platform.supportEmail', value: 'support@ast-academy.bj', type: 'string' },
  { key: 'platform.appUrl', value: 'http://localhost:3000', type: 'string' },
  { key: 'features.enrollments', value: 'true', type: 'boolean' },
  { key: 'features.payments', value: 'true', type: 'boolean' },
  { key: 'features.quizzes', value: 'true', type: 'boolean' }
]

export const PLATFORM_SETTING_KEYS = DEFAULT_PLATFORM_SETTINGS.map((s) => s.key)

import { prisma } from './prisma'

export async function ensurePlatformSettings() {
  for (const s of DEFAULT_PLATFORM_SETTINGS) {
    await prisma.platformSetting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value, type: s.type }
    })
  }
}

export async function getAllSettings(): Promise<Record<string, { value: string; type: string; updatedAt: Date; updatedBy: string | null }>> {
  await ensurePlatformSettings()
  const rows = await prisma.platformSetting.findMany()
  const map: Record<string, { value: string; type: string; updatedAt: Date; updatedBy: string | null }> = {}
  for (const r of rows) {
    map[r.key] = { value: r.value, type: r.type, updatedAt: r.updatedAt, updatedBy: r.updatedBy }
  }
  return map
}

export function parseBool(v: string): boolean {
  return v === 'true' || v === '1' || v === 'yes'
}

export function isMaintenanceActive(settings: Record<string, { value: string; type: string }>): boolean {
  const enabled = parseBool(settings['maintenance.enabled']?.value ?? 'false')
  if (!enabled) return false
  const now = Date.now()
  const start = settings['maintenance.startAt']?.value
  const end = settings['maintenance.endAt']?.value
  if (start) {
    const t = Date.parse(start)
    if (!isNaN(t) && now < t) return false
  }
  if (end) {
    const t = Date.parse(end)
    if (!isNaN(t) && now > t) return false
  }
  return true
}

export async function getSettingValue(key: string): Promise<string | null> {
  const row = await prisma.platformSetting.findUnique({ where: { key } })
  return row?.value ?? null
}
