// middleware/maintenance.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // 1) Routes toujours accessibles
  if (to.path === '/maintenance' || to.path.startsWith('/admin')) return

  // 2) Vérifier l'état de maintenance (SSR + client)
  let maintenance: { enabled: boolean } | null = null
  try {
    maintenance = await $fetch('/api/maintenance')
  } catch {
    // API indisponible → on ne bloque pas l'app
    return
  }
  if (!maintenance?.enabled) return

  // 3) Vérifier si l'utilisateur est admin (les admins passent toujours)
  const { isInitialized, user, fetchMe } = useAuth()
  if (!isInitialized.value) await fetchMe()

  if (user.value?.role === 'ADMIN') return

  // 4) Rediriger vers la page maintenance
  return navigateTo('/maintenance')
})