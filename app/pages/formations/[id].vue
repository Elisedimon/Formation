<script setup lang="ts">
const route = useRoute()
const { isLoggedIn, fetchMe, user } = useAuth()

const courseId = computed(() => route.params.id as string)

const { data, error, pending, refresh } = await useFetch<{ course: any }>(
  () => `/api/courses/${courseId.value}`,
  { key: `course-detail-${courseId.value}` }
)

const course = computed(() => data.value?.course)
const reviews = computed(() => data.value?.course?.reviews || [])
const averageRating = computed(() => data.value?.course?.averageRating || 0)
const reviewCount = computed(() => data.value?.course?.reviewCount || 0)

const courseImage = computed(() => {
  if (course.value?.image) return course.value.image
  const category = String(course.value?.category || '').toLowerCase()
  if (category.includes('data')) return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
  if (category.includes('cloud')) return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
  if (category.includes('design')) return 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80'
  if (category.includes('sécur') || category.includes('secur')) return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80'
  if (category.includes('mobile')) return 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9?auto=format&fit=crop&w=1200&q=80'
  return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'
})

useHead({
  title: computed(() =>
    course.value ? `${course.value.title} – AST-Academy` : 'Formation – AST-Academy'
  )
})

const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'

const stars = (rating: number) => Array.from({ length: 5 }, (_, i) => i < Math.round(rating))

const paying = ref(false)
const payError = ref('')
const enrolled = ref(false)
const checkingEnrollment = ref(true)

async function checkEnrollment() {
  if (!isLoggedIn.value || !course.value) {
    checkingEnrollment.value = false
    return
  }
  try {
    const res = await $fetch<{ enrolled: boolean }>(`/api/enrollments/${course.value.id}`)
    enrolled.value = res.enrolled
  } catch {
    enrolled.value = false
  } finally {
    checkingEnrollment.value = false
  }
}

async function startPayment() {
  if (!isLoggedIn.value) await fetchMe()
  if (!isLoggedIn.value) {
    return navigateTo({
      path: '/auth/login',
      query: { redirect: `/formations/${course.value.slug}` }
    })
  }
  if (enrolled.value) {
    return navigateTo(`/apprentissage/${course.value.slug}`)
  }

  paying.value = true
  payError.value = ''

  try {
    const res = await $fetch<{ paymentUrl: string }>('/api/payments/create', {
      method: 'POST',
      body: { courseId: course.value.id }
    })
    window.location.href = res.paymentUrl
  } catch (e: any) {
    payError.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      'Impossible de démarrer le paiement'
    paying.value = false
  }
}

onMounted(() => {
  if (!isLoggedIn.value) void fetchMe()
})

watch([isLoggedIn, course], () => {
  checkEnrollment()
}, { immediate: true })

// Cours associés (même catégorie, excluant le cours actuel)
const relatedCourses = computed(() => {
  // On utilise les données du catalogue pour les cours associés
  return [] // Sera rempli par une requête séparée si nécessaire
})
</script>

<template>
  <div class="pt-20 pb-20 bg-slate-50 min-h-screen">
    <div v-if="pending" class="flex items-center justify-center h-[60vh]">
      <div class="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else-if="error || !course" class="flex items-center justify-center h-[60vh] text-center px-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Formation introuvable</h1>
        <NuxtLink to="/formations" class="btn-primary">Retour au catalogue</NuxtLink>
      </div>
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header avec image -->
      <div class="relative aspect-[16/9] min-h-[400px] bg-slate-200 overflow-hidden rounded-3xl shadow-xl mb-8">
        <img :src="courseImage" :alt="`Illustration de ${course.title}`" class="absolute inset-0 h-full w-full object-cover" loading="lazy">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
        <div class="absolute bottom-6 left-6 right-6">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/30 bg-slate-950/75 px-3 py-1 text-xs font-bold tracking-widest text-white backdrop-blur">
            {{ course.category }}
          </span>
        </div>
        <div class="absolute top-6 right-6">
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-bold text-white shadow-lg">
            {{ formatPrice(course.price) }}
          </span>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Colonne gauche : Infos cours -->
        <div class="lg:col-span-2 space-y-8">
          <div class="flex flex-wrap items-center gap-3 mb-2">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ course.duration }}</span>
            <span class="w-1 h-1 rounded-full bg-slate-300" />
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ course.level }}</span>
          </div>

          <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-950 mb-4 leading-tight">{{ course.title }}</h1>

          <div class="flex items-center gap-4 mb-6">
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] text-emerald-600 font-bold">★</span>
              <span class="text-lg font-bold text-slate-900">{{ averageRating.toFixed(1) }}</span>
              <span class="text-sm text-slate-500">({{ reviewCount }} avis)</span>
            </div>
            <div class="h-4 w-px bg-slate-200" />
            <span class="text-sm text-slate-500">{{ course.enrollmentCount }} apprenants inscrits</span>
          </div>

          <div class="prose prose-slate max-w-none mb-6">
            {{ course.description || 'Formation pratique conçue par des experts pour vous rendre opérationnel rapidement.' }}
          </div>

          <!-- Infos formateur -->
          <div class="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div class="w-10 h-10 rounded-full bg-emerald-50 flex-shrink-0 flex items-center justify-center text-emerald-700 font-bold">
              {{ (course.instructor?.firstName?.[0] || course.instructor?.email?.[0] || 'F').toUpperCase() }}
            </div>
            <div>
              <h3 class="font-bold text-slate-900">{{ course.instructor ? [course.instructor.firstName, course.instructor.lastName].filter(Boolean).join(' ') || course.instructor.email : 'Formateur AST-Academy' }}</h3>
              <p class="text-sm text-slate-500">Formateur expert · {{ course.instructor?.email }}</p>
            </div>
          </div>

          <!-- Ce que vous allez apprendre -->
          <div class="space-y-4">
            <h3 class="font-bold text-slate-900 text-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Ce que vous allez apprendre
            </h3>
            <ul class="space-y-3 text-slate-600">
              <li class="flex items-start gap-3">
                <span class="text-emerald-600 mt-0.5">✓</span>
                <span>Maîtriser les fondamentaux de {{ course.title.toLowerCase() }}</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-emerald-600 mt-0.5">✓</span>
                <span>Réaliser des projets concrets pour votre portfolio</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-emerald-600 mt-0.5">✓</span>
                <span>Obtenir un certificat vérifiable AST-Academy</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-emerald-600 mt-0.5">✓</span>
                <span>Accéder à vie aux contenus de la formation</span>
              </li>
            </ul>
          </div>

          <!-- Prérequis -->
          <div class="space-y-4">
            <h3 class="font-bold text-slate-900 text-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Prérequis
            </h3>
            <ul class="space-y-3 text-slate-600">
              <li class="flex items-start gap-3">
                <span class="text-slate-400 mt-0.5">○</span>
                <span>Aucun prérequis technique particulier</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-slate-400 mt-0.5">○</span>
                <span>Un ordinateur avec connexion internet</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="text-slate-400 mt-0.5">○</span>
                <span>Motivation et régularité dans l'apprentissage</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Colonne droite : Achat + Programme -->
        <div class="lg:col-span-1 space-y-6">
          <div class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm sticky top-24">
            <div class="mb-6">
              <p class="text-sm text-slate-500 uppercase tracking-wider font-semibold">Prix</p>
              <div class="flex items-baseline gap-1 mt-1">
                <span class="text-3xl font-bold text-emerald-600">{{ formatPrice(course.price) }}</span>
                <span class="text-sm text-slate-500">/ formation</span>
              </div>
            </div>

            <div class="space-y-3">
              <button
                v-if="enrolled"
                type="button"
                class="btn-primary w-full"
                @click="navigateTo(`/apprentissage/${course.slug}`)"
              >
                Accéder à la formation
              </button>
              <button
                v-else-if="!isLoggedIn"
                type="button"
                class="btn-primary w-full"
                @click="navigateTo({ path: '/auth/login', query: { redirect: `/formations/${course.slug}` } })"
              >
                Se connecter pour acheter
              </button>
              <button
                v-else
                type="button"
                class="btn-primary w-full"
                :disabled="paying"
                @click="startPayment"
              >
                {{ paying ? 'Paiement en cours…' : "S'inscrire et payer" }}
              </button>
              <p v-if="!isLoggedIn && !enrolled" class="text-xs text-slate-400 text-center mt-3">
                Connexion requise pour s’inscrire
              </p>
              <p v-if="payError" class="text-sm text-red-600 text-center">{{ payError }}</p>
            </div>

            <div class="pt-4 border-t border-slate-100">
              <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Ce qui est inclus</p>
              <ul class="space-y-2 text-sm text-slate-600">
                <li class="flex items-start gap-2">
                  <span class="text-emerald-600 mt-0.5">✓</span>
                  <span>Accès illimité aux vidéos</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-emerald-600 mt-0.5">✓</span>
                  <span>Quiz et exercices pratiques</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-emerald-600 mt-0.5">✓</span>
                  <span>Certificat de completion</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-emerald-600 mt-0.5">✓</span>
                  <span>Paiement sécurisé via FedaPay</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Programme détaillé -->
          <div class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-bold text-slate-900 text-lg">Programme de la formation</h3>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {{ course.modules.length }} section{{ course.modules.length > 1 ? 's' : '' }}
              </span>
            </div>

            <div class="space-y-4">
              <div v-for="(module, mIdx) in course.modules" :key="module.id" class="space-y-2">
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                    {{ mIdx + 1 }}
                  </span>
                  <h4 class="font-bold text-slate-800">{{ module.title }}</h4>
                  <span class="ml-auto text-xs font-semibold text-emerald-600">
                    {{ module.lessons.length }} leçon{{ module.lessons.length > 1 ? 's' : '' }}{{ module.quizzes.length ? ' · ' + module.quizzes.length + ' quiz' : '' }}
                  </span>
                </div>
                <ul class="space-y-1 pl-8">
                  <li v-for="(lesson, lIdx) in module.lessons" :key="lesson.id" class="flex items-center gap-2 text-sm text-slate-600">
                    <span class="w-2 h-2 rounded-full bg-slate-300 mt-1.5" />
                    <span class="truncate">{{ lesson.title }}</span>
                    <span v-if="lesson.durationMinutes" class="text-xs text-slate-400">{{ lesson.durationMinutes }} min</span>
                  </li>
                  <li v-for="(quiz, qIdx) in module.quizzes" :key="quiz.id" class="flex items-center gap-2 text-sm text-slate-600">
                    <span class="w-2 h-2 rounded-full bg-amber-300 mt-1.5" />
                    <span class="truncate">{{ quiz.title }} <span class="font-semibold text-amber-600">(quiz, {{ quiz.passingScore }}% requis)</span></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Avis -->
          <div v-if="reviewCount > 0" class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-bold text-slate-900 text-lg">Avis des apprenants</h3>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">{{ reviewCount }}</span>
            </div>
            <div class="space-y-4">
              <div v-for="(review, idx) in reviews" :key="idx" class="pt-4 border-t border-slate-50/50 first:border-0">
                <div class="flex items-center gap-3 mb-1">
                  <span class="text-sm font-semibold text-slate-900 truncate">
                    {{ [review.user.firstName, review.user.lastName].filter(Boolean).join(' ') || review.user.email }}
                  </span>
                  <div class="flex gap-0.5">
                    <span v-for="s in stars(review.rating)" :key="s" class="text-[12px] text-amber-400">★</span>
                  </div>
                </div>
                <p v-if="review.comment" class="text-sm text-slate-600 leading-relaxed">{{ review.comment }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
