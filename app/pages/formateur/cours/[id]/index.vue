<script setup lang="ts">
const route = useRoute()
const { user, fetchMe } = useAuth()
const courseId = computed(() => route.params.id as string)

interface Lesson {
  id: string
  title: string
  content: string | null
  videoUrl: string | null
  durationMinutes: number | null
  position: number
}
interface Quiz {
  id: string
  title: string
  passingScore: number
  questions: Array<{ id: string; prompt: string; options: string[]; position: number }>
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
  description: string | null
  category: string
  duration: string | null
  level: string | null
  price: number
  image: string | null
  isPublished: boolean
  modules: CourseModule[]
}

const { data, pending, error, refresh } = await useFetch<{ course: Course }>(
  () => `/api/course-management/${courseId.value}`,
  { key: `course-editor-${courseId.value}` }
)

const course = computed(() => data.value?.course)

const showModuleForm = ref(false)
const newModule = reactive({ title: '', description: '' })
const moduleError = ref('')
const editingModuleId = ref<string | null>(null)
const editModule = reactive({ title: '', description: '' })

const editingLessonId = ref<string | null>(null)
const editLessonData = reactive({ title: '', content: '', videoUrl: '', durationMinutes: '' })

const lessonError = ref('')
const quizError = ref('')
const showQuizForm = ref<string | null>(null) // moduleId
const newQuiz = reactive({ title: '', passingScore: 70, questions: [] as Array<{ prompt: string; options: string[]; correctAnswer: number }> })

const newLessonTitle = reactive<Record<string, string>>({})
const newLessonContent = reactive<Record<string, string>>({})
const newLessonVideo = reactive<Record<string, string>>({})
const newLessonDuration = reactive<Record<string, string>>({})

const money = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' FCFA'

async function createModule() {
  moduleError.value = ''
  if (!newModule.title.trim()) { moduleError.value = 'Le titre est requis.'; return }
  try {
    await $fetch(`/api/course-management/${courseId.value}`, {
      method: 'POST',
      body: { title: newModule.title.trim(), description: newModule.description.trim() || undefined }
    })
    showModuleForm.value = false
    Object.assign(newModule, { title: '', description: '' })
    await refresh()
  } catch (e: any) { moduleError.value = e?.data?.statusMessage || 'Échec de la création du chapitre.' }
}

async function deleteModule(moduleId: string) {
  if (!window.confirm('Supprimer ce chapitre et tout son contenu ?')) return
  try {
    await $fetch(`/api/course-management/modules/${moduleId}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) { moduleError.value = e?.data?.statusMessage || 'Échec de la suppression.' }
}

async function updateModule(moduleId: string) {
  moduleError.value = ''
  try {
    await $fetch(`/api/course-management/modules/${moduleId}`, {
      method: 'PATCH',
      body: editModule
    })
    editingModuleId.value = null
    Object.assign(editModule, { title: '', description: '' })
    await refresh()
  } catch (e: any) { moduleError.value = e?.data?.statusMessage || 'Échec de la mise à jour.' }
}

async function createLesson(moduleId: string) {
  lessonError.value = ''
  const title = newLessonTitle[moduleId]?.trim()
  if (!title) { lessonError.value = 'Le titre est requis.'; return }
  try {
    await $fetch(`/api/course-management/modules/${moduleId}`, {
      method: 'POST',
      body: {
        title,
        content: newLessonContent[moduleId]?.trim() || undefined,
        videoUrl: newLessonVideo[moduleId]?.trim() || undefined,
        durationMinutes: newLessonDuration[moduleId] ? Number(newLessonDuration[moduleId]) : undefined
      }
    })
    newLessonTitle[moduleId] = ''
    newLessonContent[moduleId] = ''
    newLessonVideo[moduleId] = ''
    newLessonDuration[moduleId] = ''
    await refresh()
  } catch (e: any) { lessonError.value = e?.data?.statusMessage || 'Échec de la création de la leçon.' }
}

async function editLesson(moduleId: string, lesson: Lesson) {
  editingLessonId.value = lesson.id
  Object.assign(editLessonData, {
    title: lesson.title,
    content: lesson.content || '',
    videoUrl: lesson.videoUrl || '',
    durationMinutes: lesson.durationMinutes ? String(lesson.durationMinutes) : ''
  })
}

async function saveLesson(moduleId: string, lessonId: string) {
  lessonError.value = ''
  try {
    await $fetch(`/api/course-management/modules/${moduleId}/lessons/${lessonId}`, {
      method: 'PATCH',
      body: {
        title: editLessonData.title.trim(),
        content: editLessonData.content.trim() || undefined,
        videoUrl: editLessonData.videoUrl.trim() || undefined,
        durationMinutes: editLessonData.durationMinutes ? Number(editLessonData.durationMinutes) : undefined
      }
    })
    editingLessonId.value = null
    Object.assign(editLessonData, { title: '', content: '', videoUrl: '', durationMinutes: '' })
    await refresh()
  } catch (e: any) { lessonError.value = e?.data?.statusMessage || 'Échec de la mise à jour.' }
}

async function deleteLesson(moduleId: string, lessonId: string) {
  if (!window.confirm('Supprimer cette leçon ?')) return
  try {
    await $fetch(`/api/course-management/modules/${moduleId}/lessons/${lessonId}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) { lessonError.value = e?.data?.statusMessage || 'Échec de la suppression.' }
}

async function createQuiz(moduleId: string) {
  quizError.value = ''
  const q = newQuiz
  if (!q.title.trim() || q.questions.length < 1) { quizError.value = 'Titre et au moins une question requis.'; return }
  for (const qq of q.questions) {
    if (!qq.prompt.trim() || qq.options.length < 2 || qq.correctAnswer < 0 || qq.correctAnswer >= qq.options.length) { quizError.value = 'Question invalide.'; return }
  }
  try {
    await $fetch(`/api/course-management/modules/${moduleId}/quizzes`, {
      method: 'POST',
      body: { title: q.title.trim(), passingScore: q.passingScore, questions: q.questions }
    })
    showQuizForm.value = null
    Object.assign(newQuiz, { title: '', passingScore: 70, questions: [] })
    await refresh()
  } catch (e: any) { quizError.value = e?.data?.statusMessage || 'Échec de la création du quiz.' }
}

function addQuestion() {
  newQuiz.questions.push({ prompt: '', options: ['', ''], correctAnswer: 0 })
}

function removeQuestion(idx: number) {
  newQuiz.questions.splice(idx, 1)
}

function addOption(qIdx: number) {
  newQuiz.questions[qIdx].options.push('')
}

function removeOption(qIdx: number, oIdx: number) {
  if (newQuiz.questions[qIdx].options.length > 2) newQuiz.questions[qIdx].options.splice(oIdx, 1)
}

async function deleteQuiz(quizId: string, moduleId: string) {
  if (!window.confirm('Supprimer ce quiz ?')) return
  try {
    await $fetch(`/api/course-management/modules/${moduleId}/quizzes/${quizId}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) { quizError.value = e?.data?.statusMessage || 'Échec de la suppression.' }
}

async function togglePublish() {
  if (!course.value) return
  try {
    await $fetch(`/api/course-management/${courseId.value}`, {
      method: 'PATCH',
      body: { isPublished: !course.value.isPublished }
    })
    await refresh()
  } catch (e: any) { moduleError.value = e?.data?.statusMessage || 'Échec de la mise à jour de publication.' }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-20 pt-28">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span class="badge mb-2">ÉDITEUR DE CONTENU</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-950">{{ course?.title }}</h1>
          <p class="text-slate-600">{{ course?.slug }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" class="btn-secondary" @click="togglePublish">
            {{ course?.isPublished ? 'Dépublier' : 'Publier' }}
          </button>
          <NuxtLink :to="`/formations/${course?.slug}`" class="btn-primary" target="_blank">Voir le cours</NuxtLink>
        </div>
      </div>

      <div v-if="pending" class="py-20 text-center text-slate-500">Chargement…</div>
      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">{{ error }}</div>
      <div v-else-if="course" class="space-y-8">
        <!-- Infos du cours -->
        <div class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p class="text-xs text-slate-500 uppercase">Prix</p>
              <p class="text-lg font-bold">{{ money(course.price) }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 uppercase">Catégorie</p>
              <p class="text-lg font-bold">{{ course.category }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 uppercase">Niveau</p>
              <p class="text-lg font-bold">{{ course.level }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 uppercase">Durée</p>
              <p class="text-lg font-bold">{{ course.duration }}</p>
            </div>
          </div>
          <div>
            <p class="text-xs text-slate-500 uppercase mb-1">Description</p>
            <p class="text-slate-600">{{ course.description || 'Aucune description.' }}</p>
          </div>
        </div>

        <!-- Nouveau chapitre -->
        <div v-if="showModuleForm" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 mb-6">
          <h3 class="font-bold text-slate-900 mb-3">Nouveau chapitre</h3>
          <form class="grid grid-cols-1 md:grid-cols-2 gap-4" @submit.prevent="createModule">
            <label class="form-label">Titre<input v-model="newModule.title" required class="form-input"></label>
            <label class="form-label md:col-span-2">Description<textarea v-model="newModule.description" rows="2" class="form-input"></textarea></label>
            <p v-if="moduleError" class="md:col-span-2 text-sm text-red-700">{{ moduleError }}</p>
            <div class="md:col-span-2 flex gap-3">
              <button class="btn-primary">Créer le chapitre</button>
              <button type="button" class="btn-secondary" @click="showModuleForm = false">Annuler</button>
            </div>
          </form>
        </div>
        <button v-else type="button" class="btn-primary mb-6" @click="showModuleForm = true">+ Ajouter un chapitre</button>

        <!-- Chapitres -->
        <div v-for="(module, mIdx) in course.modules" :key="module.id" class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm mb-6 overflow-hidden">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{{ mIdx + 1 }}</span>
              <h3 class="font-bold text-slate-900">{{ module.title }}</h3>
            </div>
            <div class="flex items-center gap-2">
              <button v-if="editingModuleId.value === module.id" type="button" class="btn-primary !px-3 !py-2 text-xs" @click="updateModule(module.id)">Enregistrer</button>
              <button v-else type="button" class="text-slate-500 hover:text-emerald-600 text-sm" @click="editingModuleId.value = module.id; Object.assign(editModule, { title: module.title, description: module.description || '' })">Modifier</button>
              <button type="button" class="text-red-600 hover:text-red-800 text-sm" @click="deleteModule(module.id)">Supprimer</button>
            </div>
          </div>

          <div v-if="editingModuleId.value === module.id" class="mb-4">
            <input v-model="editModule.title" placeholder="Titre du chapitre" class="form-input mb-2 w-full">
            <textarea v-model="editModule.description" rows="2" placeholder="Description" class="form-input w-full"></textarea>
            <p v-if="moduleError" class="text-sm text-red-700">{{ moduleError }}</p>
          </div>

          <p v-if="module.description" class="text-sm text-slate-500 mb-4">{{ module.description }}</p>

          <!-- Leçons -->
          <div class="mb-6">
            <h4 class="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 19L9 12m0 0l-4-4m4 4l4-4m4 4V9m0 0l-4-4m4 4l4-4"/></svg>
              Leçons ({{ module.lessons.length }})
            </h4>
            <form :id="`lesson-form-${module.id}`" class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4" @submit.prevent="() => createLesson(module.id)">
              <input :id="`lesson-title-${module.id}`" v-model="newLessonTitle[module.id]" placeholder="Titre de la leçon" required class="form-input">
              <textarea :id="`lesson-content-${module.id}`" v-model="newLessonContent[module.id]" rows="1" placeholder="Contenu (optionnel)" class="form-input"></textarea>
              <input :id="`lesson-video-${module.id}`" v-model="newLessonVideo[module.id]" type="url" placeholder="Lien vidéo https://..." class="form-input">
              <input :id="`lesson-duration-${module.id}`" v-model="newLessonDuration[module.id]" type="number" min="0" placeholder="Min" class="form-input">
              <button type="submit" class="btn-primary">Ajouter</button>
            </form>
            <p v-if="lessonError" class="text-sm text-red-700 mb-4">{{ lessonError }}</p>

            <div v-for="(lesson, lIdx) in module.lessons" :key="lesson.id" class="p-3 rounded-lg border border-slate-100 bg-slate-50 mb-2">
              <div v-if="editingLessonId.value === lesson.id" class="flex flex-col gap-2">
                <input v-model="editLessonData.title" placeholder="Titre" class="form-input w-full">
                <textarea v-model="editLessonData.content" rows="2" placeholder="Contenu" class="form-input w-full"></textarea>
                <input v-model="editLessonData.videoUrl" type="url" placeholder="Lien vidéo" class="form-input w-full">
                <input v-model="editLessonData.durationMinutes" type="number" min="0" placeholder="Min" class="form-input w-full md:w-32">
                <div class="flex gap-2">
                  <button type="button" class="btn-primary !px-3 !py-2 text-xs" @click="saveLesson(module.id, lesson.id)">Enregistrer</button>
                  <button type="button" class="text-slate-500 hover:text-slate-700 text-xs" @click="editingLessonId.value = null">Annuler</button>
                </div>
              </div>
              <div v-else class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-bold text-slate-500">{{ lesson.position }}</span>
                  <div>
                    <p class="text-sm font-semibold text-slate-800">{{ lesson.title }}</p>
                    <p class="text-xs text-slate-500">{{ lesson.durationMinutes ? lesson.durationMinutes + ' min' : '' }} {{ lesson.videoUrl ? '· Vidéo' : lesson.content ? '· Texte' : '· Vide' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" class="text-slate-500 hover:text-emerald-600 text-sm" @click="editLesson(module.id, lesson)">Modifier</button>
                  <button type="button" class="text-red-600 hover:text-red-800 text-sm" @click="deleteLesson(module.id, lesson.id)">Supprimer</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quiz -->
          <div v-if="module.quizzes.length" class="mb-6">
            <h4 class="font-bold text-slate-800 mb-3">Quiz</h4>
            <div v-for="(quiz, qIdx) in module.quizzes" :key="quiz.id" class="p-3 rounded-lg border border-slate-100 bg-slate-50 mb-2">
              <div class="flex items-center justify-between mb-2">
                <p class="font-semibold text-slate-800">{{ quiz.title }}</p>
                <span class="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{{ quiz.passingScore }}% requis</span>
              </div>
              <ul class="text-sm text-slate-600 space-y-1 pl-4">
                <li v-for="(q, qi) in quiz.questions" :key="q.id">{{ qi + 1 }}. {{ q.prompt }}</li>
              </ul>
              <button type="button" class="text-red-600 hover:text-red-800 text-xs mt-2" @click="deleteQuiz(quiz.id, module.id)">Supprimer le quiz</button>
            </div>
          </div>

          <button v-if="!showQuizForm || showQuizForm.value !== module.id" type="button" class="text-emerald-600 font-semibold hover:text-emerald-800 text-sm mb-4" @click="showQuizForm.value = module.id">+ Ajouter un quiz à ce chapitre</button>

          <div v-if="showQuizForm.value === module.id" class="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <h5 class="font-bold text-slate-800 mb-3">Nouveau quiz</h5>
            <input v-model="newQuiz.title" placeholder="Titre du quiz" class="form-input mb-2 w-full">
            <input v-model.number="newQuiz.passingScore" type="number" min="1" max="100" placeholder="Seuil de réussite (%)" class="form-input mb-2 w-full">
            <p class="text-xs text-slate-500 mb-2">Questions</p>
            <div v-for="(q, qIdx) in newQuiz.questions" :key="qIdx" class="space-y-2 mb-3">
              <input v-model="q.prompt" placeholder="Question" class="form-input w-full">
              <div v-for="(opt, oIdx) in q.options" :key="oIdx" class="flex gap-2">
                <input v-model="q.options[oIdx]" placeholder="Option de réponse" class="form-input">
                <button v-if="q.options.length > 2" type="button" class="text-red-500 hover:text-red-700" @click="removeOption(qIdx, oIdx)">−</button>
              </div>
              <button type="button" class="text-xs text-emerald-600 hover:underline" @click="addOption(qIdx)">+ Option</button>
              <div class="flex items-center gap-2 mt-1">
                <label class="text-xs text-slate-600">Bonne réponse :</label>
                <select v-model="q.correctAnswer" class="form-input !w-auto !py-2 text-xs">
                  <option v-for="(opt, oIdx) in q.options" :key="oIdx" :value="oIdx">{{ oIdx + 1 }}</option>
                </select>
              </div>
              <button type="button" class="text-red-500 hover:text-red-700 text-xs mt-1" @click="removeQuestion(qIdx)">Supprimer la question</button>
            </div>
            <button type="button" class="text-xs text-emerald-600 hover:underline mb-2" @click="addQuestion">+ Question</button>
            <p v-if="quizError" class="text-sm text-amber-700 mt-2">{{ quizError }}</p>
            <div class="flex gap-3">
              <button type="button" class="btn-primary" @click="createQuiz(module.id)">Créer le quiz</button>
              <button type="button" class="btn-secondary" @click="showQuizForm.value = null">Annuler</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
