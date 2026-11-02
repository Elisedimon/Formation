<script setup lang="ts">
import { computed } from 'vue'
interface InstructorData {
  stats: { courses: number; published: number; learners: number; revenue: number }
  courses: Array<{ id: string; title: string; slug: string; category: string; duration: string | null; level: string | null; price: number; isPublished: boolean; _count: { enrollments: number } }>
}
useHead({ title: 'Espace formateur – AST-Academy' })
definePageMeta({ middleware: ['auth', 'instructor'], layout: 'default' })
const { user, fetchMe } = useAuth()
const { data, pending, error, refresh } = await useFetch<InstructorData>('/api/instructor/overview', { key: 'instructor-overview' })
const money = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' XOF'
const saving = ref(false)
const formError = ref('')
const showForm = ref(false)
const imagePreview = ref<string | null>(null)
const imageFile = ref<File | null>(null)
const categorySearch = ref('')
const categoryOptionsOpen = ref(false)
const form = reactive({
  title: '',
  slug: '',
  category: 'Développement',
  description: '',
  duration: '',
  level: 'Débutant',
  price: 0,
  icon: 'code',
  image: ''
})

const ALL_CATEGORIES = [
  'Développement', 'Data & IA', 'Cloud & DevOps', 'Cybersécurité', 'Design',
  'Marketing', 'Business', 'Langues', 'Santé', 'Musique', 'Finance',
  'Bureautique', 'Photographie', 'Vidéo', 'Management', 'Ressources Humaines',
  'Droit', 'Immobilier', 'Art & Culture', 'Sport & Bien-être'
]

const filteredCategories = computed(() => {
  const q = categorySearch.value.toLowerCase().trim()
  if (!q) return ALL_CATEGORIES
  return ALL_CATEGORIES.filter(c => c.toLowerCase().includes(q))
})

const icons = [
  { label: 'Code', value: 'code' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Data', value: 'data' },
  { label: 'Design', value: 'design' },
  { label: 'Business', value: 'business' },
  { label: 'Santé', value: 'sante' },
  { label: 'Langues', value: 'langues' },
  { label: 'Musique', value: 'musique' }
]

const iconLabel = (value: string) => icons.find(i => i.value === value)?.label || value

onMounted(async () => {
  if (!user.value) await fetchMe()
  if (user.value?.role !== 'INSTRUCTOR') await navigateTo(user.value ? '/mon-espace' : '/auth/login?redirect=/formateur')
})

function makeSlug() {
  form.slug = form.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function onImageChange(e: any) {
  const file = e.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    formError.value = 'Veuillez sélectionner une image valide.'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    formError.value = 'L’image ne doit pas dépasser 5 Mo.'
    return
  }
  imageFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => {
    imagePreview.value = ev.target?.result as string
    form.image = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function createCourse() {
  saving.value = true
  formError.value = ''
  try {
    await $fetch('/api/instructor/courses', { method: 'POST', body: { ...form, image: form.image } })
    showForm.value = false
    imagePreview.value = null
    imageFile.value = null
    Object.assign(form, { title: '', slug: '', category: 'Développement', description: '', duration: '', level: 'Débutant', price: 0, icon: 'code', image: '' })
    await refresh()
  } catch (e: any) { formError.value = e?.data?.statusMessage || 'La formation n’a pas pu être créée.' }
  finally { saving.value = false }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"><div class="mx-auto w-full max-w-full">
    <div class="mb-9 flex flex-wrap items-end justify-between gap-4"><div><span class="badge mb-3">ESPACE FORMATEUR</span><h1 class="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Bonjour{{ user?.firstName ? `, ${user.firstName}` : '' }}</h1><p class="mt-2 text-slate-600">Préparez vos formations et suivez les apprenants inscrits.</p></div><button type="button" class="btn-primary" @click="showForm = !showForm">{{ showForm ? 'Fermer' : '+ Créer une formation' }}</button></div>

    <div v-if="showForm" class="card mb-7 p-5 sm:p-7">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold">Nouvelle formation</h2>
          <p class="mt-1 text-sm text-slate-500">Elle restera en brouillon jusqu’à sa publication par l’équipe pédagogique.</p>
        </div>
        <button type="button" class="text-sm text-brand-600 hover:text-brand-800 font-medium" @click="showForm = false">Annuler</button>
      </div>

      <form class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" @submit.prevent="createCourse">
        <!-- Image -->
        <div class="sm:col-span-2 lg:col-span-3">
          <label class="form-label block mb-2">Image de couverture</label>
          <div class="flex items-center gap-3">
            <div class="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative group cursor-pointer" @click="document.getElementById('course-image').click()">
              <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" />
              <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
                <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span class="text-xs font-medium">Changer l’image</span>
              </div>
              <input id="course-image" type="file" accept="image/*" class="hidden" @change="onImageChange" />
            </div>
            <p v-if="imagePreview" class="text-xs text-slate-500 mt-2">Image sélectionnée (max 5 Mo)</p>
          </div>
        </div>

        <!-- Titre -->
        <div class="sm:col-span-2 lg:col-span-3">
          <label class="form-label">Titre de la formation <span class="text-red-500">*</span></label>
          <input v-model="form.title" required minlength="3" class="form-input" @input="makeSlug" placeholder="Ex. Maîtriser Nuxt 4 et TypeScript" />
        </div>

        <!-- Slug -->
        <div class="sm:col-span-2 lg:col-span-2">
          <label class="form-label">Slug <span class="text-red-500">*</span></label>
          <input v-model="form.slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" class="form-input" placeholder="maitriser-nuxt-4" />
        </div>

        <!-- Icône -->
        <div class="sm:col-span-2 lg:col-span-2">
          <label class="form-label">Icône de la formation</label>
          <select v-model="form.icon" class="form-input">
            <option v-for="ic in icons" :key="ic.value" :value="ic.value">{{ iconLabel(ic.value) }}</option>
          </select>
        </div>

        <!-- Catégorie -->
        <div class="sm:col-span-2 lg:col-span-2 relative">
          <label class="form-label">Catégorie <span class="text-red-500">*</span></label>
          <div class="relative w-full">
            <input
              :value="form.category"
              type="text"
              class="form-input w-full pl-3 pr-10"
              placeholder="Choisir une catégorie…"
              @input="form.category = $event.target.value; categorySearch = $event.target.value; categoryOptionsOpen = true"
              @focus="categoryOptionsOpen = true"
              @blur="setTimeout(() => categoryOptionsOpen = false, 150)"
            />
            <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
            <div v-if="categoryOptionsOpen" class="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              <div
                v-for="cat in filteredCategories"
                :key="cat"
                class="px-3 py-2 cursor-pointer hover:bg-brand-50 text-sm text-slate-700 transition"
                @click="form.category = cat; categorySearch = cat; categoryOptionsOpen = false"
              >
                {{ cat }}
              </div>
              <div v-if="filteredCategories.length === 0 && categorySearch.value" class="px-3 py-2 text-sm text-slate-400 italic">
                Aucune correspondance
              </div>
            </div>
          </div>
        </div>

        <!-- Prix -->
        <div class="sm:col-span-2 lg:col-span-2">
          <label class="form-label">Prix en FCFA <span class="text-red-500">*</span></label>
          <input v-model.number="form.price" type="number" min="0" step="1" required class="form-input" placeholder="0" />
        </div>

        <!-- Durée -->
        <div class="sm:col-span-2 lg:col-span-2">
          <label class="form-label">Durée</label>
          <input v-model="form.duration" class="form-input" placeholder="Ex. 8 semaines" />
        </div>

        <!-- Niveau -->
        <div class="sm:col-span-2 lg:col-span-2">
          <label class="form-label">Niveau</label>
          <select v-model="form.level" class="form-input">
            <option>Débutant</option>
            <option>Intermédiaire</option>
            <option>Avancé</option>
          </select>
        </div>

        <!-- Description -->
        <div class="sm:col-span-3 lg:col-span-3">
          <label class="form-label">Description</label>
          <textarea v-model="form.description" rows="4" class="form-input" placeholder="Décrivez les objectifs et le contenu de la formation…"></textarea>
        </div>

        <!-- Erreur -->
        <p v-if="formError" class="sm:col-span-3 lg:col-span-3 text-sm text-red-700" role="alert">{{ formError }}</p>

        <!-- Bouton -->
        <div class="sm:col-span-3 lg:col-span-3">
          <button type="submit" class="btn-primary w-full" :disabled="saving">{{ saving ? 'Enregistrement…' : 'Enregistrer le brouillon' }}</button>
        </div>
      </form>
    </div>

    <div v-if="pending" class="card p-10 text-center text-slate-500" role="status">Chargement de votre espace…</div>
    <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">Impossible de charger vos cours. Vérifiez votre connexion formateur.</div>
    <template v-else-if="data">
      <section class="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article v-for="metric in [{label:'Mes formations',value:data.stats.courses},{label:'Publiées',value:data.stats.published},{label:'Apprenants inscrits',value:data.stats.learners},{label:'Revenus générés',value:money(data.stats.revenue)}]" :key="metric.label" class="card p-5">
          <p class="text-sm text-slate-500">{{ metric.label }}</p>
          <p class="mt-2 text-2xl font-extrabold">{{ metric.value }}</p>
        </article>
      </section>
      <section class="card overflow-hidden">
        <div class="border-b border-slate-100 p-5"><h2 class="text-xl font-bold">Mes formations</h2></div>
        <div v-if="data.courses.length" class="divide-y divide-slate-100">
          <article v-for="course in data.courses" :key="course.id" class="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <h3 class="font-bold">{{ course.title }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ course.category }} · {{ course._count.enrollments }} apprenant(s)</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="rounded-full px-3 py-1 text-xs font-bold" :class="course.isPublished ? 'bg-brand-50 text-brand-800' : 'bg-slate-100 text-slate-700'">{{ course.isPublished ? 'En ligne' : 'En attente de publication' }}</span>
              <NuxtLink v-if="course.isPublished" :to="`/formations/${course.slug}`" class="font-semibold text-brand-700">Voir →</NuxtLink>
              <NuxtLink :to="`/formateur/cours/${course.id}`" class="font-semibold text-slate-600 hover:text-brand-700 ml-3">Éditer le contenu</NuxtLink>
            </div>
          </article>
        </div>
        <div v-else class="p-10 text-center">
          <h3 class="font-bold">Votre première formation commence ici</h3>
          <p class="mt-2 text-slate-500">Créez un brouillon. L’administrateur le publiera après validation.</p>
        </div>
      </section>
    </template>
  </div></div>
</template>
