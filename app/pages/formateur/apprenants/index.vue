<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'instructor'], layout: 'default' })

useHead({ title: 'Mes apprenants – AST-Academy' })

const { user, fetchMe } = useAuth()
onMounted(async () => { if (!user.value) await fetchMe() })

const { data, pending, error, refresh } = await useFetch<{ learners: any[] }>('/api/instructor/learners', { key: 'instructor-learners' })
const learners = computed(() => data.value?.learners || [])
const search = ref('')
const statusFilter = ref('ALL')

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  return learners.value.filter((l: any) => {
    const matchSearch = !q || (l.firstName + ' ' + l.lastName + ' ' + l.email).toLowerCase().includes(q)
    const matchStatus = statusFilter.value === 'ALL' || l.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

const money = (v: number) => new Intl.NumberFormat('fr-FR').format(v) + ' FCFA'
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-full">
      <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span class="badge mb-2">APPRENANTS</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-950">Mes apprenants</h1>
          <p class="text-slate-600">Suivez les inscriptions et la progression de vos apprenants.</p>
        </div>
        <NuxtLink to="/formateur" class="btn-secondary">← Tableau de bord</NuxtLink>
      </div>

      <!-- Filtres -->
      <div class="mb-6 card p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input v-model="search" type="search" placeholder="Rechercher un apprenant…" class="form-input pl-9 w-full" />
          </div>
          <select v-model="statusFilter" class="form-input">
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actif</option>
            <option value="COMPLETED">Terminé</option>
          </select>
        </div>
      </div>

      <!-- États -->
      <div v-if="pending" class="card p-16 text-center text-slate-500">Chargement des apprenants…</div>
      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">{{ error }}</div>

      <!-- Liste -->
      <div v-else class="card overflow-hidden">
        <div v-if="filtered.length === 0" class="p-12 text-center">
          <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 3a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V5a2 2 0 00-2-2zm-5 14l-7-7m0 0l7-7m-7 7l7 7" /></svg>
          <h3 class="text-lg font-bold text-slate-900">Aucun apprenant</h3>
          <p class="text-slate-500 mt-1">Aucun apprenant n'est inscrit à vos formations pour le moment.</p>
        </div>

        <div v-else class="divide-y divide-slate-100">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Apprenant</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Formation</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Progression</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr v-for="l in filtered" :key="l.id" class="hover:bg-slate-50 transition">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-700 to-brand-800 flex items-center justify-center text-xs font-bold text-white">
                      {{ (l.firstName?.[0] || l.email?.[0] || '?').toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-medium text-slate-900">{{ l.firstName }} {{ l.lastName }}</p>
                      <p class="text-xs text-slate-500">{{ l.course?.title || 'Aucune formation' }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-slate-600">{{ l.email }}</td>
                <td class="px-6 py-4">
                  <span class="font-medium text-slate-800">{{ l.course?.title || '—' }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs font-medium rounded-full" :class="l.status === 'ACTIVE' ? 'bg-brand-100 text-brand-800' : l.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'">
                    {{ l.status === 'ACTIVE' ? 'Actif' : l.status === 'COMPLETED' ? 'Terminé' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div class="h-full bg-brand-600" :style="{ width: l.progress + '%' }"></div>
                    </div>
                    <span class="text-xs font-medium text-slate-900">{{ l.progress }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <NuxtLink :to="`/messages`" class="text-brand-600 hover:text-brand-800 text-sm font-medium">Message</NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
