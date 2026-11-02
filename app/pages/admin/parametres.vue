<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })
useHead({ title: 'Paramètres - Administration' })

const { data, pending, refresh } = await useFetch('/api/admin/settings')
const settings = computed(() => data.value?.settings || {})

const get = (key: string) => settings.value?.[key]?.value ?? ''

const maintenance = reactive({
  enabled: false,
  message: '',
  startAt: '',
  endAt: ''
})

const platform = reactive({
  name: '',
  supportEmail: '',
  appUrl: ''
})

const features = reactive({
  enrollments: true,
  payments: true,
  quizzes: true
})

watch(settings, (s) => {
  maintenance.enabled = s['maintenance.enabled']?.value === 'true'
  maintenance.message = s['maintenance.message']?.value ?? ''
  maintenance.startAt = toLocal(s['maintenance.startAt']?.value)
  maintenance.endAt = toLocal(s['maintenance.endAt']?.value)
  platform.name = s['platform.name']?.value ?? ''
  platform.supportEmail = s['platform.supportEmail']?.value ?? ''
  platform.appUrl = s['platform.appUrl']?.value ?? ''
  features.enrollments = s['features.enrollments']?.value === 'true'
  features.payments = s['features.payments']?.value === 'true'
  features.quizzes = s['features.quizzes']?.value === 'true'
}, { immediate: true })

function toLocal(v?: string) {
  if (!v) return ''
  const d = new Date(v)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocal(v: string) {
  if (!v) return ''
  return new Date(v).toISOString()
}

const saving = ref(false)
const message = ref('')
const error = ref('')

async function save() {
  saving.value = true
  message.value = ''
  error.value = ''
  try {
    await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: {
        settings: {
          'maintenance.enabled': String(maintenance.enabled),
          'maintenance.message': maintenance.message,
          'maintenance.startAt': fromLocal(maintenance.startAt),
          'maintenance.endAt': fromLocal(maintenance.endAt),
          'platform.name': platform.name,
          'platform.supportEmail': platform.supportEmail,
          'platform.appUrl': platform.appUrl,
          'features.enrollments': String(features.enrollments),
          'features.payments': String(features.payments),
          'features.quizzes': String(features.quizzes)
        }
      }
    })
    message.value = 'Réglages enregistrés.'
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'Erreur lors de l’enregistrement.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 pb-10 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-full">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Paramètres</h1>
          <p class="text-slate-600">Configuration de la plateforme</p>
        </div>
        <NuxtLink to="/admin" class="btn-secondary">← Tableau de bord</NuxtLink>
      </div>

      <div v-if="pending" class="card p-10 text-center text-slate-500">Chargement…</div>
      <form v-else @submit.prevent="save" class="space-y-6">
        <section class="card p-6 space-y-4">
          <h2 class="text-lg font-semibold text-slate-900">Maintenance</h2>
          <label class="flex items-center gap-3">
            <input v-model="maintenance.enabled" type="checkbox" class="h-4 w-4" />
            <span>Activer la maintenance</span>
          </label>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Message</label>
            <textarea v-model="maintenance.message" rows="3" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Début</label>
              <input v-model="maintenance.startAt" type="datetime-local" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Fin</label>
              <input v-model="maintenance.endAt" type="datetime-local" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        <section class="card p-6 space-y-4">
          <h2 class="text-lg font-semibold text-slate-900">Plateforme</h2>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nom</label>
            <input v-model="platform.name" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email support</label>
            <input v-model="platform.supportEmail" type="email" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">URL application</label>
            <input v-model="platform.appUrl" type="url" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </section>

        <section class="card p-6 space-y-4">
          <h2 class="text-lg font-semibold text-slate-900">Fonctionnalités</h2>
          <label class="flex items-center gap-3">
            <input v-model="features.enrollments" type="checkbox" class="h-4 w-4" />
            <span>Inscriptions</span>
          </label>
          <label class="flex items-center gap-3">
            <input v-model="features.payments" type="checkbox" class="h-4 w-4" />
            <span>Paiements</span>
          </label>
          <label class="flex items-center gap-3">
            <input v-model="features.quizzes" type="checkbox" class="h-4 w-4" />
            <span>Quiz</span>
          </label>
        </section>

        <div class="flex items-center gap-4">
          <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
          <span v-if="message" class="text-sm text-green-600">{{ message }}</span>
          <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
        </div>
      </form>
    </div>
  </div>
</template>
