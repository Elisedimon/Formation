<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const { isLoggedIn, fetchMe, user } = useAuth()

const slug = computed(() => route.params.slug as string)

interface LessonProgress { completedAt: string | null }
interface Lesson {
  id: string
  title: string
  content: string | null
  videoUrl: string | null
  durationMinutes: number | null
  position: number
  progress: LessonProgress[]
}
interface QuizAttempt { score: number; passed: boolean; attemptedAt: string | null }
interface QuizQuestion { id: string; prompt: string; options: any[]; position: number }
interface Quiz {
  id: string
  title: string
  passingScore: number
  questions: QuizQuestion[]
  lastAttempt: QuizAttempt | null
}
interface CourseModule {
  id: string
  title: string
  description: string | null
  position: number
  lessons: Lesson[]
  quizzes: Quiz[]
}
interface Course {
  id: string
  title: string
  slug: string
  description: string
  duration: string | null
  modules: CourseModule[]
}
interface EnrollmentData {
  id: string
  status: string
  certificate: { code: string; issuedAt: string; revokedAt: string | null } | null
}
interface LearningData {
  enrollment: EnrollmentData
  course: Course
  progress: { completed: number; total: number; percent: number }
}

const { data, error, pending, refresh } = await useFetch<LearningData>(
  () => `/api/learning/${slug.value}`,
  { key: `learning-player-${slug.value}` }
)

const course = computed(() => data.value?.course)
const enrollment = computed(() => data.value?.enrollment)
const progressData = computed(() => data.value?.progress)

const currentLessonIndex = ref(0)
const currentModuleIndex = ref(0)
const markingComplete = ref(false)

// Trouver la leçon actuelle dans les modules
const currentLesson = computed(() => {
  const modules = course.value?.modules || []
  const mod = modules[currentModuleIndex.value]
  if (!mod) return null
  return mod.lessons[currentLessonIndex.value] || null
})

const currentModule = computed(() => course.value?.modules[currentModuleIndex.value] || null)

// Position globale de la leçon actuelle parmi toutes les leçons
const allLessons = computed(() =>
  (course.value?.modules || []).flatMap(m => m.lessons.map(l => ({ ...l, moduleId: m.id })))
)

const currentGlobalPosition = computed(() => {
  const lessons = allLessons.value
  const idx = lessons.findIndex(l => l.id === currentLesson.value?.id)
  return idx >= 0 ? idx + 1 : 0
})

const totalLessons = computed(() => allLessons.value.length)

const lessonPercent = computed(() =>
  totalLessons.value ? Math.round((currentGlobalPosition.value / totalLessons.value) * 100) : 0
)

const percent = computed(() => progressData.value?.percent || 0)
const completedCount = computed(() => progressData.value?.completed || 0)
const lessonCount = computed(() => progressData.value?.total || 0)

const isCompleted = computed(() => enrollment.value?.status === 'COMPLETED')
const isLessonCompleted = computed(() =>
  currentLesson.value?.progress?.[0]?.completedAt != null
)

const nextLesson = computed(() => {
  const lessons = allLessons.value
  const idx = lessons.findIndex(l => l.id === currentLesson.value?.id)
  return idx >= 0 && idx + 1 < lessons.length ? lessons[idx + 1] : null
})

const prevLesson = computed(() => {
  const lessons = allLessons.value
  const idx = lessons.findIndex(l => l.id === currentLesson.value?.id)
  return idx > 0 ? lessons[idx - 1] : null
})

async function markLessonComplete() {
  if (!currentLesson.value || markingComplete.value) return
  markingComplete.value = true

  try {
    await $fetch(`/api/learning/${slug.value}/lessons/${currentLesson.value.id}/complete`, {
      method: 'POST'
    })
    await refresh()
  } catch (e: any) {
    console.error('Erreur marquage leçon terminée:', e)
  } finally {
    markingComplete.value = false
  }
}

async function goToLesson(lesson: any) {
  // Trouver le module et l'index de la leçon
  const modules = course.value?.modules || []
  for (let m = 0; m < modules.length; m++) {
    const lIdx = modules[m].lessons.findIndex(l => l.id === lesson.id)
    if (lIdx >= 0) {
      currentModuleIndex.value = m
      currentLessonIndex.value = lIdx
      return
    }
  }
}

async function next() {
  const nl = nextLesson
  if (nl) await goToLesson(nl)
}

async function prev() {
  const pl = prevLesson
  if (pl) await goToLesson(pl)
}

onMounted(() => {
  if (!isLoggedIn.value) void fetchMe()
})

const videoReady = ref(false)
const videoEl = ref<HTMLVideoElement | null>(null)
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <!-- Barre de progression globale -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-40">
        <div
          class="h-1 bg-brand-600 transition-all duration-300"
          :style="{ width: lessonPercent.value + '%' }"
        ></div>
    </div>

    <div v-if="pending" class="flex items-center justify-center h-[60vh]">
      <div class="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else-if="error || !course" class="flex items-center justify-center h-[60vh] text-center px-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Formation inaccessible</h1>
        <p class="text-slate-600 mb-4">
          {{ error || 'Vous devez être inscrit à cette formation pour y accéder.' }}
        </p>
        <NuxtLink to="/formations" class="btn-primary">Retour au catalogue</NuxtLink>
      </div>
    </div>

    <div v-else class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <span class="badge mb-2">{{ course.category }}</span>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{{ course.title }}</h1>
          <p class="text-sm text-slate-500">{{ course.description || '' }}</p>
        </div>
        <div class="text-right">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Progression</div>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-sm font-bold text-slate-900">{{ percent.value }}%</span>
              <button
                type="button"
                class="text-xs text-brand-600 font-medium hover:underline"
                @click="refresh"
              >
              Actualiser
            </button>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div
                class="h-2 bg-brand-600 rounded-full transition-all duration-500"
                :style="{ width: percent.value + '%' }"
              ></div>
          </div>
        </div>
      </div>

      <!-- Contenu : vidéo + programme -->
      <div class="grid lg:grid-cols-12 gap-8">
        <!-- Lecteur vidéo (8/12) -->
        <div class="lg:col-span-8 space-y-6">
          <div class="rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden shadow-xl relative group">
            <div class="relative aspect-video bg-black">
              <div v-if="currentLesson?.videoUrl" class="absolute inset-0 flex items-center justify-center">
                <video
                  ref="videoEl"
                  class="w-full h-full"
                  controls
                  preload="metadata"
                  poster=""
                >
                  <source :src="currentLesson.videoUrl" type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              </div>
              <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <svg class="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{{ currentLesson?.title || 'Aucune vidéo disponible' }}</p>
              </div>
              <div v-if="isLessonCompleted" class="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/90 backdrop-blur text-brand-200 text-xs font-bold border border-brand-500/30">
                <span class="w-2 h-2 rounded-full bg-brand-400" />
                Terminé
              </div>
            </div>

            <div class="p-6 sm:p-8">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h2 class="text-xl font-bold text-slate-900 mb-1">{{ currentLesson?.title }}</h2>
                  <p class="text-sm text-slate-500">
                     Leçon {{ currentGlobalPosition.value }} / {{ totalLessons.value }}
                  </p>
                </div>
                <button
                  type="button"
                  :disabled="isLessonCompleted || markingComplete"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition"
                  :class="
                    isLessonCompleted
                       ? 'bg-brand-50 text-brand-700 border border-brand-100'
                       : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  "
                  @click="markLessonComplete"
                >
                    <svg v-if="isLessonCompleted" class="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span v-if="markingComplete">Enregistrement…</span>
                  <span v-else-if="isLessonCompleted">Terminé</span>
                  <span v-else>Marquer comme terminé</span>
                </button>
              </div>

              <div v-if="currentLesson?.content" class="prose prose-slate max-w-none text-slate-600">
                <div v-html="currentLesson.content"></div>
              </div>

              <div v-if="!currentLesson?.content && !currentLesson?.videoUrl" class="p-4 rounded-lg bg-slate-50 text-sm text-slate-500">
                Aucun contenu disponible pour cette leçon.
              </div>

              <!-- Navigation précédent / suivant -->
              <div class="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                <button
                  type="button"
                  :disabled="!prevLesson"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition"
                  :class="
                    !prevLesson
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  "
                  @click="prev"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  {{ prevLesson ? 'Précédent : ' + prevLesson.title : 'Précédent' }}
                </button>
                <button
                  type="button"
                  :disabled="!nextLesson || isCompleted"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition"
                  :class="
                    !nextLesson || isCompleted
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'btn-primary'
                  "
                  @click="next"
                >
                  {{ isCompleted ? 'Formation terminée' : nextLesson ? 'Suivant : ' + nextLesson.title : 'Suivant' }}
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Certificat si terminé -->
          <div v-if="isCompleted && enrollment.certificate" class="rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-brand-100 flex-shrink-0 flex items-center justify-center text-brand-700 font-bold">
                ✦
              </div>
              <div>
                <h3 class="font-bold text-slate-900">Félicitations !</h3>
                <p class="text-sm text-slate-600 mb-3">
                  Vous avez terminé cette formation. Votre certificat est disponible.
                </p>
                <NuxtLink :to="`/certificats/${enrollment.certificate.code}`" class="btn-primary">
                  Voir et télécharger mon certificat
                </NuxtLink>
              </div>
                 </div>
               </div>

        <!-- Barre latérale programme (4/12) -->
        <div class="lg:col-span-4 space-y-6">
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 class="font-bold text-slate-900 mb-6">Programme du cours</h3>
            <div class="space-y-4">
              <div v-for="(module, mIdx) in course.modules" :key="module.id" class="space-y-3">
                <div class="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    class="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition"
                    :class="
                       currentModuleIndex.value === mIdx
                         ? 'bg-brand-50 text-brand-700 border border-brand-100'
                         : 'bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100'
                    "
                    @click="currentModuleIndex.value = mIdx; currentLessonIndex.value = 0"
                  >
                    <span class="w-5 h-5 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-500">
                      {{ mIdx + 1 }}
                    </span>
                    <span class="font-semibold text-slate-800 truncate">{{ module.title }}</span>
                    <span class="ml-auto text-xs font-semibold" :class="currentModuleIndex.value === mIdx ? 'text-brand-600' : 'text-slate-400'">
                      {{ module.lessons.filter(l => l.progress?.[0]?.completedAt).length }} / {{ module.lessons.length }}
                    </span>
                  </button>
                </div>

                <div v-if="currentModuleIndex.value === mIdx" class="space-y-1 ml-4">
                  <div
                    v-for="(lesson, lIdx) in module.lessons"
                    :key="lesson.id"
                    type="button"
                    class="flex items-center gap-3 px-3 py-2 rounded-lg text-left transition cursor-pointer group"
                    :class="
                      currentLesson.value?.id === lesson.id
                         ? 'bg-brand-50 border border-brand-100'
                         : 'bg-transparent hover:bg-slate-50'
                    "
                    @click="goToLesson(lesson)"
                  >
                    <span
                      class="w-2.5 h-2.5 rounded-full transition-colors"
                      :class="
                        lesson.progress?.[0]?.completedAt
                          ? 'bg-brand-500'
                          : 'bg-slate-300'
                      "
                    />
                    <span class="text-sm text-slate-700 group-hover:text-brand-600 truncate">{{ lesson.title }}</span>
                    <span class="ml-auto text-[10px] font-bold" :class="
                      lesson.progress?.[0]?.completedAt
                     ? 'text-brand-600 bg-brand-50/50'
                     : 'text-slate-400 bg-slate-100'
                    " px-1 py-0.5 rounded>
                      {{ lesson.progress?.[0]?.completedAt ? '✓' : '○' }}
                    </span>
                  </div>
                </div>

                <div v-if="module.quizzes.length && currentModuleIndex.value === mIdx" class="mt-2">
                  <div v-for="(quiz, qIdx) in module.quizzes" :key="quiz.id" class="flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-100 bg-amber-50/50 text-left">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span class="text-sm text-amber-700 font-semibold truncate">{{ quiz.title }}</span>
                    <span class="ml-auto text-[10px] font-bold" :class="
                      quiz.lastAttempt?.passed
                         ? 'text-brand-600 bg-brand-50/50'
                        : quiz.lastAttempt
                        ? 'text-red-600 bg-red-50/50'
                        : 'text-slate-400 bg-slate-100'
                    " px-1 py-0.5 rounded>
                      {{ quiz.lastAttempt?.passed ? 'Validé' : quiz.lastAttempt ? 'Échec' : 'À passer' }}
                    </span>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Informations cours -->
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 class="font-bold text-slate-900 mb-3">Informations</h4>
            <ul class="space-y-3 text-sm text-slate-600">
              <li class="flex justify-between">
                <span>Durée</span>
                <span class="font-semibold text-slate-900">{{ course.duration }}</span>
              </li>
              <li class="flex justify-between">
                <span>Niveau</span>
                <span class="font-semibold text-slate-900">{{ course.level }}</span>
              </li>
              <li class="flex justify-between">
                <span>Statut</span>
                 <span class="font-semibold" :class="isCompleted ? 'text-brand-600' : 'text-slate-600'">
                  {{ isCompleted ? 'Terminée' : 'En cours' }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
