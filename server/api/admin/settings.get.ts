import { prisma } from '../../utils/prisma'
import { requireRole } from '../../utils/auth'
import { ensurePlatformSettings, getAllSettings } from '../../utils/platformSettings'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  await requireRole(event, config.jwtSecret, ['ADMIN'])
  await ensurePlatformSettings()
  const settings = await getAllSettings()
  return { settings }
})