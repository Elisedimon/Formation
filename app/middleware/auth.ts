// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { isInitialized, isLoggedIn, fetchMe, isLoading } = useAuth()

  // Ne pas rediriger si on est déjà sur les pages d'authentification
  if (to.path === '/auth/login' || to.path === '/auth/register') return

  // Vérifier la session une seule fois (évite les rafraîchissements répétés)
  if (!isInitialized.value && !isLoading.value) {
    await fetchMe()
  }

  // Non connecté → rediriger vers login avec redirect (une seule fois)
  if (!isLoggedIn.value) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})