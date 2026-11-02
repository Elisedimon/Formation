<script setup lang="ts">
const route = useRoute()
const isScrolled = ref(false)
const isMobileOpen = ref(false)
const { user, isLoggedIn, fetchMe, logout } = useAuth()

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/formations', label: 'Formations' },
  { to: '/parcours', label: 'Parcours' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/contact', label: 'Contact' }
]

const dashboardPath = computed(() => user.value?.role === 'ADMIN' ? '/admin' : user.value?.role === 'INSTRUCTOR' ? '/formateur' : '/mon-espace')
const dashboardLabel = computed(() => user.value?.role === 'ADMIN' ? 'Administration' : user.value?.role === 'INSTRUCTOR' ? 'Espace formateur' : 'Mes formations')

const roleLinks = computed(() => {
  const role = user.value?.role
  if (role === 'ADMIN') return [
    { to: '/admin', label: 'Tableau de bord' },
    { to: '/admin/users', label: 'Utilisateurs' },
    { to: '/admin/courses', label: 'Cours' }
  ]
  if (role === 'INSTRUCTOR') return [
    { to: '/formateur', label: 'Tableau de bord' },
    { to: '/formateur/cours', label: 'Mes cours' }
  ]
  if (isLoggedIn.value) return [
    { to: '/mon-espace', label: 'Mes formations' },
    { to: '/certificats', label: 'Certificats' }
  ]
  return links
})

const onScroll = () => {
  isScrolled.value = window.scrollY > 12
}

onMounted(() => {
  if (!user.value) void fetchMe()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header
    class="fixed top-0 inset-x-0 z-50 transition-all duration-300"
    :class="isScrolled
      ? 'bg-white/95 backdrop-blur-xl border-b border-ink-200/80 shadow-sm'
      : 'bg-white/80 backdrop-blur-md border-b border-transparent'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 md:h-[72px]">
        <!-- Logo -->
        <div class="flex items-center gap-2.5 group">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-700 to-brand-800
                   flex items-center justify-center font-bold text-white text-lg
                   shadow-md shadow-brand-500/25"
          >
            A
          </div>
          <div class="leading-tight">
            <span class="font-bold text-ink-900 text-lg tracking-tight">AST-Academy</span>
            <span class="hidden sm:block text-[10px] text-brand-600 font-medium tracking-wider uppercase">
              Apprendre · Pratiquer · Innover
            </span>
          </div>
        </div>

        <!-- Desktop Nav (visible uniquement quand non connecté) -->
        <nav v-if="!isLoggedIn" class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            :class="route.path === link.to
              ? 'text-brand-700 bg-brand-50'
              : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- CTA Desktop -->
        <div class="hidden md:flex items-center gap-2.5">
          <template v-if="isLoggedIn">
            <span class="max-w-36 truncate text-sm font-medium text-ink-600">{{ user?.firstName || user?.email }}</span>
            <NuxtLink :to="dashboardPath" class="btn-ghost">{{ dashboardLabel }}</NuxtLink>
            <button type="button" class="btn-ghost" @click="logout">Se déconnecter</button>
          </template>
          <template v-else>
            <NuxtLink to="/auth/login" class="btn-ghost !text-ink-600">
              Se connecter
            </NuxtLink>
            <NuxtLink to="/auth/register" class="btn-primary !px-5 !py-2.5 !text-sm">
              Inscription
            </NuxtLink>
          </template>
        </div>

        <!-- Mobile toggle -->
        <button
          type="button"
          class="md:hidden p-2.5 rounded-xl text-ink-600 hover:bg-ink-100 transition"
          aria-label="Menu"
          :aria-expanded="isMobileOpen"
          @click="isMobileOpen = !isMobileOpen"
        >
          <svg v-if="!isMobileOpen" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition duration-250 ease-out"
enter-from-class="opacity-0 -translate-y-2"
enter-to-class="opacity-100 translate-y-0"
leave-from-class="opacity-100 translate-y-0"
leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMobileOpen"
        key="mobile-menu"
        class="md:hidden bg-white border-t border-ink-100 shadow-lg"
      >
        <div class="px-4 py-4 space-y-1">
        <div v-if="!isLoggedIn">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="block px-4 py-3 rounded-xl text-base font-medium transition"
            :class="route.path === link.to
              ? 'text-brand-700 bg-brand-50'
              : 'text-ink-600 hover:bg-ink-50'"
            @click="isMobileOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
        <div v-else class="space-y-1">
          <NuxtLink
            v-for="link in roleLinks"
            :key="link.to"
            :to="link.to"
            class="block px-4 py-3 rounded-xl text-base font-medium transition"
            :class="route.path === link.to
              ? 'text-brand-700 bg-brand-50'
              : 'text-ink-600 hover:bg-ink-50'"
            @click="isMobileOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
        <div v-if="isLoggedIn" class="px-4 py-3 text-sm text-ink-500">
          Connecté·e : <span class="font-semibold text-ink-800">{{ user?.firstName || user?.email }}</span>
        </div>
        <div class="pt-3 flex flex-col gap-2">
          <NuxtLink v-if="isLoggedIn" :to="dashboardPath" class="btn-primary justify-center" @click="isMobileOpen = false">{{ dashboardLabel }}</NuxtLink>
          <button v-if="isLoggedIn" type="button" class="btn-secondary justify-center" @click="isMobileOpen = false; logout()">
            Se déconnecter
          </button>
          <NuxtLink v-else to="/auth/login" class="btn-secondary justify-center" @click="isMobileOpen = false">
            Se connecter
          </NuxtLink>
          <NuxtLink v-if="!isLoggedIn" to="/auth/register" class="btn-primary justify-center" @click="isMobileOpen = false">
            Inscription
          </NuxtLink>
        </div>
        </div>
      </div>
    </Transition>
  </header>
</template>
