<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const { isLoggedIn, fetchMe, user } = useAuth()

const slug = computed(() => route.params.slug as string)
const quizId = computed(() => route.params.quizId as string)

interface QuizQuestion {
  id: string
  prompt: string
  options: any[]
  position: number
}
interface Quiz {
  id: string
  title: string
  passingScore: number
  questions: QuizQuestion[]
}
interface Course {
  id: string
  title: string
  slug: string
}

const { data, error, pending, refresh } = await useFetch<{ quiz: Quiz; course: Course }>(
  () => `/api/learning/${slug.value}/quizzes/${quizId.value}`,
  { key: `quiz-${quizId.value}` }
)

const quiz = computed(() => data.value?.quiz)
const course = computed(() => data.value?.course)

const answers = ref<Record<string, number>>({})
const submitting = ref(false)
const submitted = ref(false)
const attemptResult = ref<any>(null)
const quizError = ref('')

async function submitQuiz() {
  const questions = quiz.value?.questions || []
  const unanswered = questions.filter(q => answers.value[q.id] === undefined)
  if (unanswered.length > 0) {
    quizError.value = `Veuillez répondre à ${unanswered.length} question${unanswered.length > 1 ? 's' : ''} restante${unanswered.length > 1 ? 's' : ''}.`
    return
  }

  submitting.value = true
  quizError.value = ''
  try {
    const res = await $fetch(`/api/learning/${slug.value}/quizzes/${quizId.value}/attempt`, {
      method: 'POST',
      body: { answers: answers.value }
    })
    attemptResult.value = res
    submitted.value = true
  } catch (e: any) {
    quizError.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      'Échec de la soumission du quiz'
  } finally {
    submitting.value = false
  }
}

function selectOption(questionId: string, optionIndex: number) {
  answers.value[questionId] = optionIndex
  quizError.value = ''
}

const percentage = computed(() => {
  if (!attemptResult.value) return 0
  return Math.round((attemptResult.value.correctCount / attemptResult.value.totalQuestions) * 100)
})

const stars = (rating: number) => Array.from({ length: 5 }, (_, i) => i < rating)
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div v-if="pending" class="flex items-center justify-center h-[60vh]">
      <div class="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else-if="error || !quiz" class="flex items-center justify-center h-[60vh] text-center px-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 mb-2">Quiz introuvable</h1>
        <NuxtLink :to="`/apprentissage/${slug}`" class="btn-primary">Retour au cours</NuxtLink>
      </div>
    </div>

    <div v-else-if="submitted && attemptResult" class="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
      <div class="card p-8 sm:p-12 text-center shadow-soft">
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          :class="
            attemptResult.passed
              ? 'bg-brand-100 text-brand-600 border border-brand-200'
              : 'bg-amber-100 text-amber-600 border border-amber-200'
          "
        >
          <span>{{ attemptResult.passed ? '✓' : '!' }}</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900 mb-2">
          {{ attemptResult.passed ? 'Quiz réussi !' : 'Quiz non réussi' }}
        </h1>
        <div class="text-4xl font-bold mb-2"
          :class="attemptResult.passed ? 'text-brand-600' : 'text-amber-600'">
          {{ attemptResult.score }}%
        </div>
        <p class="text-slate-600 mb-6">
          Seuil de réussite : {{ attemptResult.passingScore }}%<br>
          {{ attemptResult.correctCount }} / {{ attemptResult.totalQuestions }} bonnes réponses
        </p>

        <div v-if="attemptResult.passed" class="mb-6 p-4 rounded-xl bg-brand-50 border border-brand-100">
          <p class="text-sm text-brand-800">
            Vous avez validé ce quiz. Vous pouvez continuer la formation.
          </p>
        </div>

        <div v-else-if="!attemptResult.passed" class="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
          <p class="text-sm text-amber-800">
            Vous n'avez pas atteint le seuil de réussite. Vous pouvez réessayer.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <NuxtLink :to="`/apprentissage/${slug}`" class="btn-primary w-full sm:w-auto">
            Retour au cours
          </NuxtLink>
          <button
            v-if="!attemptResult.passed"
            type="button"
            class="btn-secondary w-full sm:w-auto"
            @click="submitted = false; attemptResult = null; refresh()"
          >
            Recommencer le quiz
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="!submitted && quiz" class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="card p-6 sm:p-8 shadow-soft">
        <div class="flex items-center justify-between mb-6">
          <div>
            <span class="badge mb-2">{{ course?.category || '' }}</span>
            <h1 class="text-2xl font-bold text-slate-900 mb-1">{{ quiz.title }}</h1>
            <p class="text-sm text-slate-500">
              Seuil de réussite : {{ quiz.passingScore }}% · {{ quiz.questions.length }} question{{ quiz.questions.length > 1 ? 's' : '' }}
            </p>
          </div>
          <span
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
            :class="
              submitted ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
            "
          >
            {{ submitted ? 'Terminé' : 'À faire' }}
          </span>
        </div>

        <form @submit.prevent="submitQuiz" class="space-y-6">
          <div v-for="(question, qIdx) in quiz.questions" :key="question.id" class="space-y-3">
            <div class="flex items-start gap-3">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                {{ qIdx + 1 }}
              </span>
              <div>
                <h3 class="font-bold text-slate-800 mb-2">{{ question.prompt }}</h3>
                <div class="space-y-2">
                  <label
                    v-for="(option, oIdx) in question.options"
                    :key="oIdx"
                    class="block cursor-pointer"
                  >
                    <button
                      type="button"
                      :class="
                        answers.value[question.id] === oIdx
                          ? 'w-full text-left px-4 py-3 rounded-lg border border-brand-500 bg-brand-50 text-brand-800 font-medium'
                          : 'w-full text-left px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition'
                      "
                      @click="selectOption(question.id, oIdx)"
                    >
                      <span class="flex items-center gap-2">
                        <span
                          class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                          :class="
                            answers.value[question.id] === oIdx
                           ? 'bg-brand-500 text-white'
                           : 'bg-slate-200 text-slate-400'
                          "
                        >
                          {{ oIdx + 1 }}
                        </span>
                        <span class="text-sm">{{ option }}</span>
                      </span>
                    </button>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <p v-if="quizError" class="text-sm text-red-600 text-center">{{ quizError }}</p>

          <div class="mt-8 flex justify-end">
            <button
              type="submit"
              class="btn-primary px-8 py-3"
              :disabled="submitting"
            >
              {{ submitting ? 'Soumission…' : 'Soumettre le quiz' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
