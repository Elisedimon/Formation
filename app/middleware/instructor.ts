// middleware/instructor.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { isInitialized, isLoggedIn, user, fetchMe } = useAuth()

  // 1) Vérifier la session une seule fois (SSR + client)
  if (!isInitialized.value) {
    await fetchMe()
  }

  // 2) Non connecté → login avec redirect
  if (!isLoggedIn.value) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // 3) Connecté mais pas instructeur → espace utilisateur
  if (user.value?.role !== 'INSTRUCTOR') {
    return navigateTo('/mon-espace')
  }

  // 4) Instructeur (ou admin, voir note ci-dessous) → on laisse passer
})