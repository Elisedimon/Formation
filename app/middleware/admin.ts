// middleware/admin.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { user, fetchMe, isInitialized, isLoggedIn } = useAuth()

  // 1) S'assurer que la session est vérifiée (SSR comme client)
  if (!isInitialized.value) {
    await fetchMe()
  }

  // 2) Non connecté → login avec redirect
  if (!isLoggedIn.value) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // 3) Connecté mais pas admin → espace utilisateur
  if (user.value?.role !== 'ADMIN') {
    return navigateTo('/mon-espace')
  }

  // 4) Admin → on laisse passer
})