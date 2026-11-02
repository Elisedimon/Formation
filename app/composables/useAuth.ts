// composables/useAuth.ts
interface AuthUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  createdAt: string
}

export function useAuth() {
  // État global partagé (SSR-safe avec useState)
  const user = useState<AuthUser | null>('auth-user', () => null)
  const isInitialized = useState<boolean>('auth-initialized', () => false)
  const isLoading = useState<boolean>('auth-loading', () => false)

  // Computed réactifs
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const fullName = computed(() => {
    if (!user.value) return ''
    const parts = [user.value.firstName, user.value.lastName].filter(Boolean)
    return parts.length ? parts.join(' ') : user.value.email
  })

  // --- LOGIN ---
  async function login(email: string, password: string) {
    isLoading.value = true
    try {
      const data = await $fetch<{ user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      user.value = data.user
      isInitialized.value = true
      return data
    } finally {
      isLoading.value = false
    }
  }

  // --- REGISTER ---
  async function register(payload: {
    email: string
    password: string
    firstName?: string
    lastName?: string
  }) {
    isLoading.value = true
    try {
      const data = await $fetch<{ user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        body: payload
      })
      user.value = data.user
      isInitialized.value = true
      return data
    } finally {
      isLoading.value = false
    }
  }

  // --- FETCH ME (restauration de session) ---
  // `force` permet de re-vérifier même si déjà initialisé
  async function fetchMe(force = false) {
    if (isInitialized.value && !force) return user.value

    isLoading.value = true
    try {
      const data = await $fetch<{ user: AuthUser }>('/api/auth/me')
      user.value = data.user
      return data.user
    } catch {
      user.value = null
      return null
    } finally {
      isInitialized.value = true
      isLoading.value = false
    }
  }

  // --- LOGOUT ---
  async function logout(redirectTo = '/') {
    isLoading.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // On ignore l'erreur réseau : on nettoie quand même l'état local
    } finally {
      user.value = null
      isInitialized.value = true
      isLoading.value = false
    }
    await navigateTo(redirectTo)
  }

  return {
    // état
    user,
    isInitialized,
    isLoading,
    // computed
    isLoggedIn,
    isAdmin,
    fullName,
    // actions
    login,
    register,
    fetchMe,
    logout
  }
}