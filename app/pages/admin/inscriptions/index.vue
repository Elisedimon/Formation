<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })
useHead({ title: 'Inscriptions - Administration' })

const { data, pending } = await useFetch('/api/admin/enrollments')
const enrollments = computed(() => data.value?.enrollments || [])
const search = ref('')
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return enrollments.value
  return enrollments.value.filter((e: any) =>
    `${e.user?.firstName || ''} ${e.user?.lastName || ''} ${e.user?.email || ''} ${e.course?.title || ''} ${e.status || ''}`.toLowerCase().includes(q)
  )
})
</script>

<template>
  <div class="bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-7xl">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Inscriptions</h1>
          <p class="text-slate-600">Gérer les inscriptions</p>
        </div>
        <NuxtLink to="/admin" class="btn-secondary">← Tableau de bord</NuxtLink>
      </div>

      <div v-if="pending" class="card p-10 text-center text-slate-500">Chargement…</div>
      <div v-else class="space-y-4">
        <div class="card p-4">
          <input v-model="search" type="search" placeholder="Rechercher…" class="form-input max-w-md" />
        </div>
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm" style="table-layout: fixed;">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-6 py-3 text-left w-[30%]">Apprenant</th>
                  <th class="px-6 py-3 text-left w-[40%]">Formation</th>
                  <th class="px-6 py-3 text-left w-[15%]">Statut</th>
                  <th class="px-6 py-3 text-left w-[15%]">Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="e in filtered" :key="e.id">
                  <td class="px-6 py-4">
                    <div class="font-medium text-slate-900">{{ e.user.firstName }} {{ e.user.lastName }}</div>
                    <div class="text-xs text-slate-500">{{ e.user.email }}</div>
                  </td>
                  <td class="px-6 py-4">{{ e.course.title }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-medium rounded-full" :class="e.status === 'ACTIVE' ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-slate-700'">{{ e.status }}</span>
                  </td>
                  <td class="px-6 py-4">{{ new Date(e.createdAt).toLocaleDateString('fr-FR') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="!filtered.length" class="p-8 text-center text-slate-500">Aucune inscription.</div>
        </div>
      </div>
    </div>
  </div>
</template>