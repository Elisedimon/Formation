<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'instructor'] })
useHead({ title: 'Mes cours - Formateur' })

interface Course { id: string; title: string; slug: string; category: string; isPublished: boolean; _count: { enrollments: number } }
interface InstructorData { courses: Course[] }

const { data, pending, error, refresh } = await useFetch<InstructorData>('/api/instructor/overview', { key: 'instructor-courses' })
const courses = computed(() => data.value?.courses || [])

const deleting = ref<string | null>(null)
async function deleteCourse(id: string) {
  if (!confirm('Supprimer ce cours ?')) return
  deleting.value = id
  try {
    await $fetch(`/api/course-management/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Erreur lors de la suppression.')
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 pb-10 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-full">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Mes cours</h1>
          <p class="text-slate-600">Gérer le contenu de vos formations</p>
        </div>
        <NuxtLink to="/formateur" class="btn-secondary">← Tableau de bord</NuxtLink>
      </div>

      <div v-if="pending" class="card p-10 text-center text-slate-500">Chargement…</div>
      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">Impossible de charger vos cours.</div>
      <div v-else class="card overflow-hidden">
        <div v-if="courses.length" class="divide-y divide-slate-100">
          <div v-for="course in courses" :key="course.id" class="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <h3 class="font-bold text-slate-900">{{ course.title }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ course.category }} · {{ course._count.enrollments }} apprenant(s)</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="rounded-full px-3 py-1 text-xs font-bold" :class="course.isPublished ? 'bg-brand-50 text-brand-800' : 'bg-slate-100 text-slate-700'">{{ course.isPublished ? 'En ligne' : 'Brouillon' }}</span>
              <NuxtLink :to="`/formateur/cours/${course.id}`" class="text-slate-500 hover:text-brand-700" title="Modifier">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </NuxtLink>
              <button type="button" class="text-slate-500 hover:text-red-600" title="Supprimer" :disabled="deleting === course.id" @click="deleteCourse(course.id)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="p-10 text-center text-slate-500">Aucun cours pour le moment.</div>
      </div>
    </div>
  </div>
</template>
