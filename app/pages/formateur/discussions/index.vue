<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'instructor'], layout: 'default' })

useHead({ title: 'Mes discussions – AST-Academy' })

const { user, fetchMe } = useAuth()
onMounted(async () => { if (!user.value) await fetchMe() })

const { data, pending, error, refresh } = await useFetch<{ discussions: any[] }>('/api/instructor/discussions', { key: 'instructor-discussions' })
const discussions = computed(() => data.value?.discussions || [])
const search = ref('')

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  return discussions.value.filter((d: any) =>
    !q || d.subject.toLowerCase().includes(q) || d.otherName.toLowerCase().includes(q)
  )
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-full">
      <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span class="badge mb-2">DISCUSSIONS</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-950">Mes discussions</h1>
          <p class="text-slate-600">Échangez avec vos apprenants et répondez à leurs questions.</p>
        </div>
        <NuxtLink to="/formateur" class="btn-secondary">← Tableau de bord</NuxtLink>
      </div>

      <!-- Recherche -->
      <div class="mb-6 card p-4">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input v-model="search" type="search" placeholder="Rechercher une discussion…" class="form-input pl-9 w-full" />
        </div>
      </div>

      <!-- États -->
      <div v-if="pending" class="card p-16 text-center text-slate-500">Chargement des discussions…</div>
      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">{{ error }}</div>

      <!-- Liste -->
      <div v-else class="card overflow-hidden">
        <div v-if="filtered.length === 0" class="p-12 text-center">
          <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <h3 class="text-lg font-bold text-slate-900">Aucune discussion</h3>
          <p class="text-slate-500 mt-1">Aucune discussion pour le moment. Les apprenants pourront vous contacter depuis leurs cours.</p>
        </div>

        <div v-else class="divide-y divide-slate-100">
          <div v-for="d in filtered" :key="d.id" class="px-6 py-4 hover:bg-slate-50 transition cursor-pointer" @click="$to(`/messages`)">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-brand-700 to-brand-800 flex items-center justify-center text-xs font-bold text-white">
                {{ (d.otherName?.[0] || 'U').toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-slate-900">{{ d.subject }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="w-1.5 h-1.5 rounded-full" :class="d.isOnline ? 'bg-brand-500' : 'bg-gray-400'"></span>
                  <p class="text-xs text-slate-500">{{ d.otherName }}</p>
                  <span class="ml-auto text-xs text-slate-400">{{ d.lastMessageAt }}</span>
                </div>
              </div>
              <span v-if="d.unreadCount" class="flex items-center justify-center w-5 h-5 min-w-5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
                {{ d.unreadCount }}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">{{ d.lastMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
