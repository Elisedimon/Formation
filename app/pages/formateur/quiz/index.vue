<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'instructor'], layout: 'default' })

useHead({ title: 'Mes quiz – AST-Academy' })

const { user, fetchMe } = useAuth()
onMounted(async () => { if (!user.value) await fetchMe() })

const { data, pending, error, refresh } = await useFetch<{ quizzes: any[] }>('/api/instructor/quizzes', { key: 'instructor-quizzes' })
const quizzes = computed(() => data.value?.quizzes || [])
const search = ref('')

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  return quizzes.value.filter((qz: any) =>
    !q || qz.title.toLowerCase().includes(q) || qz.course?.title?.toLowerCase().includes(q)
  )
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-full">
      <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span class="badge mb-2">QUIZ</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-950">Mes quiz</h1>
          <p class="text-slate-600">Gérez les quiz de vos formations et consultez les résultats.</p>
        </div>
        <NuxtLink to="/formateur" class="btn-secondary">← Tableau de bord</NuxtLink>
      </div>

      <!-- Recherche -->
      <div class="mb-6 card p-4">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input v-model="search" type="search" placeholder="Rechercher un quiz…" class="form-input pl-9 w-full" />
        </div>
      </div>

      <!-- États -->
      <div v-if="pending" class="card p-16 text-center text-slate-500">Chargement des quiz…</div>
      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">{{ error }}</div>

      <!-- Liste -->
      <div v-else class="card overflow-hidden">
        <div v-if="filtered.length === 0" class="p-12 text-center">
          <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <h3 class="text-lg font-bold text-slate-900">Aucun quiz</h3>
          <p class="text-slate-500 mt-1">Créez un quiz depuis l'éditeur de contenu d'une formation.</p>
          <NuxtLink to="/formateur/cours" class="btn-primary mt-4">Aller à mes cours</NuxtLink>
        </div>

        <div v-else class="divide-y divide-slate-100">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quiz</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Formation</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Seuil</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Questions</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tentatives</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Moyenne</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr v-for="qz in filtered" :key="qz.id" class="hover:bg-slate-50 transition">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">
                      Q
                    </div>
                    <p class="font-medium text-slate-900">{{ qz.title }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 text-slate-600">{{ qz.course?.title || '—' }}</td>
                <td class="px-6 py-4">
                  <span class="font-medium text-slate-800">{{ qz.passingScore }}%</span>
                </td>
                <td class="px-6 py-4 text-slate-600">{{ qz.questions?.length || 0 }}</td>
                <td class="px-6 py-4 text-slate-600">{{ qz.attempts?.length || 0 }}</td>
                <td class="px-6 py-4">
                  <span class="font-medium text-slate-900">{{ qz.averageScore?.toFixed(0) || '-' }}%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
