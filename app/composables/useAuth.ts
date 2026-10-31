interface AuthUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  createdAt: string
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)

  const isLoggedIn = computed(() => !!user.value)

  async function login(email: string, password: string) {
    const data = await $fetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    user.value = data.user
    return data
  }

  async function register(payload: {
    email: string
    password: string
    firstName?: string
    lastName?: string
  }) {
    const data = await $fetch<{ user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: payload
    })
    user.value = data.user
    return data
  }

  async function fetchMe() {
    try {
      const data = await $fetch<{ user: AuthUser }>('/api/auth/me')
      user.value = data.user
      return data.user
    } catch {
      user.value = null
      return null
    }
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    user.value = null
    await navigateTo('/')
  }

  return {
    user,
    isLoggedIn,
    login,
    register,
    fetchMe,
    logout
  }
}
