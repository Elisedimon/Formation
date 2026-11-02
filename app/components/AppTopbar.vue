<script setup lang="ts">
const { user } = useAuth()
const { notifications, unreadCount, markAllRead, notifOpen } = useNotifications()
const router = useRouter()

const now = ref(new Date())
const timer = setInterval(() => { now.value = new Date() }, 1000)
onBeforeUnmount(() => clearInterval(timer))

const dateStr = computed(() => now.value.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
const timeStr = computed(() => now.value.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))

const dashboardPath = computed(() =>
  user.value?.role === 'ADMIN' ? '/admin'
  : user.value?.role === 'INSTRUCTOR' ? '/formateur'
  : '/mon-espace'
)

const query = ref('')
const results = ref<any[]>([])
const open = ref(false)
const loading = ref(false)
let debounce: any = null

function doSearch(q: string) {
  if (debounce) clearTimeout(debounce)
  debounce = setTimeout(async () => {
    if (q.trim().length < 2) {
      results.value = []
      open.value = false
      return
    }
    loading.value = true
    try {
      const data = await $fetch<{ results: any[] }>('/api/search', { query: { q: q.trim() } })
      results.value = data.results || []
      open.value = true
    } catch {
      results.value = []
    } finally {
      loading.value = false
    }
  }, 300)
}

watch(query, (v) => doSearch(v))

function select(r: any) {
  open.value = false
  query.value = ''
  navigateTo(r.url)
}

function close() {
  setTimeout(() => { open.value = false }, 150)
}

const inputRef = ref<HTMLInputElement | null>(null)
</script>

<template>
  <header class="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
    <div class="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <div class="min-w-0">
        <p class="text-xs text-slate-500 capitalize truncate">{{ dateStr }}</p>
        <p class="text-sm font-bold text-slate-900 tabular-nums">{{ timeStr }}</p>
      </div>

      <div class="flex items-center gap-2">
        <div class="relative">
          <button type="button" class="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition" aria-label="Notifications" @click="notifOpen = !notifOpen">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span v-if="unreadCount" class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {{ unreadCount }}
            </span>
          </button>
            <NotificationsDropdown v-model:open="notifOpen" :items="notifications" @mark-all="markAllRead" />
        </div>

        <NuxtLink :to="dashboardPath" class="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
            {{ (user?.firstName?.[0] || user?.email?.[0] || '?').toUpperCase() }}
          </span>
          <span class="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">{{ user?.firstName || user?.email }}</span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>