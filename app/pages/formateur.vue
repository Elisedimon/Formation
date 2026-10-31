<script setup lang="ts">
interface InstructorData {
  stats: { courses: number; published: number; learners: number }
  courses: Array<{ id: string; title: string; slug: string; category: string; duration: string | null; level: string | null; price: number; isPublished: boolean; _count: { enrollments: number } }>
}
useHead({ title: 'Espace formateur – AST-Academy' })
definePageMeta({ layout: 'default' })
const { user, fetchMe } = useAuth()
const { data, pending, error, refresh } = await useFetch<InstructorData>('/api/instructor/overview', { key: 'instructor-overview' })
const showForm = ref(false)
const saving = ref(false)
const formError = ref('')
const form = reactive({ title: '', slug: '', category: 'Développement', description: '', duration: '', level: 'Débutant', price: 0 })
onMounted(async () => {
  if (!user.value) await fetchMe()
  if (user.value?.role !== 'INSTRUCTOR') await navigateTo(user.value ? '/mon-espace' : '/auth/login?redirect=/formateur')
})
function makeSlug() { form.slug = form.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
async function createCourse() {
  saving.value = true; formError.value = ''
  try {
    await $fetch('/api/instructor/courses', { method: 'POST', body: form })
    showForm.value = false
    Object.assign(form, { title: '', slug: '', category: 'Développement', description: '', duration: '', level: 'Débutant', price: 0 })
    await refresh()
  } catch (e: any) { formError.value = e?.data?.statusMessage || 'La formation n’a pas pu être créée.' }
  finally { saving.value = false }
}
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 pb-20 pt-28 sm:px-6 lg:px-8"><div class="mx-auto max-w-7xl">
    <div class="mb-9 flex flex-wrap items-end justify-between gap-4"><div><span class="badge mb-3">ESPACE FORMATEUR</span><h1 class="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Bonjour{{ user?.firstName ? `, ${user.firstName}` : '' }}</h1><p class="mt-2 text-slate-600">Préparez vos formations et suivez les apprenants inscrits.</p></div><button type="button" class="btn-primary" @click="showForm = !showForm">{{ showForm ? 'Fermer' : '+ Créer une formation' }}</button></div>
    <div v-if="showForm" class="card mb-7 p-5 sm:p-7"><h2 class="text-xl font-bold">Nouvelle formation</h2><p class="mt-1 text-sm text-slate-500">Elle restera en brouillon jusqu’à sa publication par l’équipe pédagogique.</p><form class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="createCourse"><label class="form-label">Titre<input v-model="form.title" required minlength="3" class="form-input" @input="makeSlug"></label><label class="form-label">Slug<input v-model="form.slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" class="form-input"></label><label class="form-label">Catégorie<input v-model="form.category" required class="form-input"></label><label class="form-label">Prix en FCFA<input v-model.number="form.price" type="number" min="0" step="1" required class="form-input"></label><label class="form-label">Durée<input v-model="form.duration" class="form-input" placeholder="Ex. 8 semaines"></label><label class="form-label">Niveau<select v-model="form.level" class="form-input"><option>Débutant</option><option>Intermédiaire</option><option>Avancé</option></select></label><label class="form-label sm:col-span-2">Description<textarea v-model="form.description" rows="4" class="form-input"></textarea></label><p v-if="formError" class="sm:col-span-2 text-sm text-red-700" role="alert">{{ formError }}</p><div class="sm:col-span-2"><button class="btn-primary" :disabled="saving">{{ saving ? 'Enregistrement…' : 'Enregistrer le brouillon' }}</button></div></form></div>
    <div v-if="pending" class="card p-10 text-center text-slate-500" role="status">Chargement de votre espace…</div><div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">Impossible de charger vos cours. Vérifiez votre connexion formateur.</div><template v-else-if="data"><section class="mb-7 grid gap-4 sm:grid-cols-3"><article v-for="metric in [{label:'Mes formations',value:data.stats.courses},{label:'Publiées',value:data.stats.published},{label:'Apprenants inscrits',value:data.stats.learners}]" :key="metric.label" class="card p-5"><p class="text-sm text-slate-500">{{ metric.label }}</p><p class="mt-2 text-2xl font-extrabold">{{ metric.value }}</p></article></section><section class="card overflow-hidden"><div class="border-b border-slate-100 p-5"><h2 class="text-xl font-bold">Mes formations</h2></div><div v-if="data.courses.length" class="divide-y divide-slate-100"><article v-for="course in data.courses" :key="course.id" class="flex flex-wrap items-center justify-between gap-4 p-5"><div><h3 class="font-bold">{{ course.title }}</h3><p class="mt-1 text-sm text-slate-500">{{ course.category }} · {{ course._count.enrollments }} apprenant(s)</p></div><div class="flex items-center gap-3"><span class="rounded-full px-3 py-1 text-xs font-bold" :class="course.isPublished ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'">{{ course.isPublished ? 'En ligne' : 'En attente de publication' }}</span><NuxtLink v-if="course.isPublished" :to="`/formations/${course.slug}`" class="font-semibold text-emerald-700">Voir →</NuxtLink><NuxtLink :to="`/formateur/cours/${course.id}`" class="font-semibold text-slate-600 hover:text-emerald-700 ml-3">Éditer le contenu</NuxtLink></div></article></div><div v-else class="p-10 text-center"><h3 class="font-bold">Votre première formation commence ici</h3><p class="mt-2 text-slate-500">Créez un brouillon. L’administrateur pourra ensuite le publier.</p><button class="btn-primary mt-5" @click="showForm = true">Créer une formation</button></div></section></template>
  </div></main>
</template>
