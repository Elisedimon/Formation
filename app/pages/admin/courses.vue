<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })
useHead({ title: 'Cours - Administration' })

const { data, pending, refresh } = await useFetch('/api/admin/courses')
const courses = computed(() => data.value?.courses || [])
const search = ref('')
const statusFilter = ref('ALL')

const deleting = ref<string | null>(null)
async function deleteCourse(id: string) {
  if (!confirm('Supprimer ce cours ?')) return
  deleting.value = id
  try {
    await $fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Erreur lors de la suppression.')
  } finally {
    deleting.value = null
  }
}

const filtered = computed(() => {
  return courses.value.filter(c => {
    const matchSearch = !search.value || c.title.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = statusFilter.value === 'ALL' || 
      (statusFilter.value === 'PUBLISHED' && c.isPublished) ||
      (statusFilter.value === 'DRAFT' && !c.isPublished)
    return matchSearch && matchStatus
  })
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 pb-10 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-full">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Cours</h1>
          <p class="text-slate-600">Gérer les formations</p>
        </div>
        <NuxtLink to="/admin" class="btn-secondary">← Retour au tableau de bord</NuxtLink>
      </div>

      <div class="card mb-6 p-4 flex flex-wrap gap-4">
        <input v-model="search" type="search" placeholder="Rechercher un cours..." class="form-input max-w-sm flex-1" />
        <select v-model="statusFilter" class="form-input max-w-xs">
          <option value="ALL">Tous les statuts</option>
          <option value="PUBLISHED">Publié</option>
          <option value="DRAFT">Brouillon</option>
        </select>
      </div>

      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cours</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Formateur</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Inscriptions</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Prix</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr v-for="c in filtered" :key="c.id">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-slate-900">{{ c.title }}</div>
                  <div class="text-sm text-slate-500">{{ c.category }} · {{ c.level }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-900">
                  {{ c.instructor ? c.instructor.firstName + ' ' + c.instructor.lastName : '-' }}
                </td>
                <td class="px-6 py-4 text-sm text-slate-900">{{ c._count?.enrollments || 0 }}</td>
                <td class="px-6 py-4 text-sm text-slate-900">{{ c.price.toLocaleString() }} XOF</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs font-medium rounded-full" :class="c.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                    {{ c.isPublished ? 'Publié' : 'Brouillon' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <button type="button" class="text-slate-500 hover:text-red-600" title="Supprimer" :disabled="deleting === c.id" @click="deleteCourse(c.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

