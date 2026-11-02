import { ensurePlatformSettings, getAllSettings, isMaintenanceActive } from '../utils/platformSettings'

export default defineEventHandler(async () => {
  await ensurePlatformSettings()
  const settings = await getAllSettings()
  const active = isMaintenanceActive(settings)
  return {
    enabled: active,
    message: settings['maintenance.message']?.value || '',
    startAt: settings['maintenance.startAt']?.value || null,
    endAt: settings['maintenance.endAt']?.value || null
  }
})