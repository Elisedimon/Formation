<script setup lang="ts">
const route = useRoute()
const isScrolled = ref(false)
const isMobileOpen = ref(false)
const { user, isLoggedIn, fetchMe, logout } = useAuth()
const dashboardPath = computed(() => user.value?.role === 'ADMIN' ? '/admin' : user.value?.role === 'INSTRUCTOR' ? '/formateur' : '/mon-espace')
const dashboardLabel = computed(() => user.value?.role === 'ADMIN' ? 'Administration' : user.value?.role === 'INSTRUCTOR' ? 'Espace formateur' : 'Mes formations')

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/formations', label: 'Formations' },
  { to: '/parcours', label: 'Parcours' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/contact', label: 'Contact' }
]

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
      ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm'
      : 'bg-white/80 backdrop-blur-md border-b border-transparent'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 md:h-[72px]">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-800
                   flex items-center justify-center font-bold text-white text-lg
                   shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300"
          >
            A
          </div>
          <div class="leading-tight">
            <span class="font-bold text-slate-900 text-lg tracking-tight">AST-Academy</span>
            <span class="hidden sm:block text-[10px] text-emerald-600 font-medium tracking-wider uppercase">
              Apprendre · Pratiquer · Innover
            </span>
          </div>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            :class="route.path === link.to
              ? 'text-emerald-700 bg-emerald-50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- CTA Desktop -->
        <div class="hidden md:flex items-center gap-2.5">
          <template v-if="isLoggedIn">
            <span class="max-w-36 truncate text-sm font-medium text-slate-600">{{ user?.firstName || user?.email }}</span>
            <NuxtLink :to="dashboardPath" class="btn-ghost">{{ dashboardLabel }}</NuxtLink>
            <button type="button" class="btn-ghost" @click="logout">Se déconnecter</button>
          </template>
          <template v-else>
          <NuxtLink to="/auth/login" class="btn-ghost !text-slate-600">
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
          class="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition"
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
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isMobileOpen" class="md:hidden bg-white border-t border-slate-100 shadow-lg">
        <div class="px-4 py-4 space-y-1">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="block px-4 py-3 rounded-xl text-base font-medium transition"
            :class="route.path === link.to
              ? 'text-emerald-700 bg-emerald-50'
              : 'text-slate-600 hover:bg-slate-50'"
            @click="isMobileOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
          <div v-if="isLoggedIn" class="px-4 py-3 text-sm text-slate-500">
            Connecté·e : <span class="font-semibold text-slate-800">{{ user?.firstName || user?.email }}</span>
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
