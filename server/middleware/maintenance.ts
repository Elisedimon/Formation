import { getTokenFromEvent, verifyToken } from '../utils/auth'
import { getAllSettings, isMaintenanceActive } from '../utils/platformSettings'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/')) return
  if (path.startsWith('/api/auth/')) return
  if (path === '/api/maintenance') return

  const settings = await getAllSettings()
  if (!isMaintenanceActive(settings)) return

  const config = useRuntimeConfig()
  const token = getTokenFromEvent(event)
  let isAdmin = false
  if (token) {
    const payload = verifyToken(token, config.jwtSecret)
    if (payload?.role === 'ADMIN') isAdmin = true
  }
  if (isAdmin) return

  throw createError({
    statusCode: 503,
    statusMessage: settings['maintenance.message']?.value || 'La plateforme est en maintenance.'
  })
})