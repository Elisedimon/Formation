<script setup lang="ts">
useHead({ title: 'Formations – AST-Academy' })

const { data, pending, error, refresh } = await useFetch<{ courses: any[] }>('/api/courses', {
  key: 'courses-list'
})

const search = ref('')
const selectedCategory = ref('Toutes')

const allCourses = computed(() => data.value?.courses || [])
const categories = computed(() => ['Toutes', ...new Set(allCourses.value.map(course => course.category))])
const courses = computed(() => allCourses.value.filter((course) => {
  const matchesSearch = `${course.title} ${course.category} ${course.description || ''}`.toLowerCase().includes(search.value.trim().toLowerCase())
  const matchesCategory = selectedCategory.value === 'Toutes' || course.category === selectedCategory.value
  return matchesSearch && matchesCategory
}))
</script>

<template>
  <div class="pb-20 bg-slate-50 min-h-screen">
    <div class="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-14">
        <h1 class="section-title mb-4">
          Nos <span class="text-brand-600">formations</span>
        </h1>
        <p class="section-subtitle mx-auto">
          Choisissez le parcours qui correspond à vos objectifs et progressez à votre rythme.
        </p>
      </div>

      <div v-if="!pending && !error && allCourses.length" class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label class="relative block w-full sm:max-w-sm">
          <span class="sr-only">Rechercher une formation</span>
          <svg class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path stroke-linecap="round" d="m16 16 4 4"/></svg>
          <input v-model="search" type="search" class="form-input !pl-12" placeholder="Rechercher une formation…">
        </label>
        <div class="flex flex-wrap gap-2" aria-label="Filtrer par domaine">
          <button v-for="category in categories" :key="category" type="button" class="rounded-full border px-4 py-2 text-sm font-medium transition" :class="selectedCategory === category ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'" @click="selectedCategory = category">{{ category }}</button>
        </div>
      </div>

      <div v-if="pending" class="text-center text-slate-400 py-16">
        <div class="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p>Chargement des formations...</p>
      </div>

      <div v-else-if="error" class="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-12 text-center">
        <h2 class="text-xl font-bold text-slate-900">Les formations ne sont pas disponibles pour le moment</h2>
        <p class="mx-auto mt-2 max-w-lg text-slate-600">Vérifiez votre connexion puis réessayez. Si le problème persiste, contactez notre équipe.</p>
        <button type="button" class="btn-secondary mt-6" @click="refresh()">Réessayer</button>
      </div>

      <div v-else-if="courses.length" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <CourseCard
          v-for="course in courses"
          :key="course.id"
          :course="course"
        />
      </div>
      <div v-else class="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
        <h2 class="text-xl font-bold text-slate-900">Aucune formation ne correspond à votre recherche</h2>
        <p class="mt-2 text-slate-500">Essayez un autre terme ou choisissez un autre domaine.</p>
        <button type="button" class="mt-5 font-semibold text-brand-700 hover:underline" @click="search = ''; selectedCategory = 'Toutes'">Effacer les filtres</button>
      </div>
    </div>
  </div>
</template>
