<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'instructor'], layout: 'default' })

useHead({ title: 'Mon profil – AST-Academy' })

const { user, fetchMe, logout } = useAuth()
onMounted(async () => { if (!user.value) await fetchMe() })

const saving = ref(false)
const message = ref('')
const error = ref('')
const form = reactive({
  firstName: user.value?.firstName || '',
  lastName: user.value?.lastName || '',
  email: user.value?.email || ''
})

async function saveProfile() {
  saving.value = true
  message.value = ''
  error.value = ''
  try {
    await $fetch('/api/instructor/profile', { method: 'PUT', body: form })
    message.value = 'Profil mis à jour avec succès.'
    await fetchMe(true)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Erreur lors de la mise à jour.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-3xl">
      <div class="mb-8">
        <span class="badge mb-2">MON PROFIL</span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-950">Mon profil</h1>
        <p class="text-slate-600">Gérez vos informations personnelles et votre compte formateur.</p>
      </div>

      <!-- États -->
      <div v-if="message" class="rounded-xl bg-green-50 border border-green-100 p-4 mb-6">
        <p class="text-sm text-green-700">{{ message }}</p>
      </div>
      <div v-if="error" class="rounded-xl bg-red-50 border border-red-100 p-4 mb-6">
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>

      <div v-if="pending" class="card p-16 text-center text-slate-500">Chargement de votre profil…</div>

      <div v-else class="card overflow-hidden">
        <!-- Photo de profil -->
        <div class="border-b border-slate-100 p-6 sm:p-8">
          <div class="flex flex-col md:flex-row md:items-center gap-6">
            <div class="flex-shrink-0">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-brand-700 to-brand-800 flex items-center justify-center text-xl font-bold text-white mx-auto md:mx-0 shadow-lg shadow-brand/30">
                {{ (user?.firstName?.[0] || user?.email?.[0] || '?').toUpperCase() }}
              </div>
            </div>
            <div class="flex-1">
              <h2 class="text-xl font-bold text-slate-900">{{ user?.firstName }} {{ user?.lastName }}</h2>
              <p class="text-slate-500">{{ user?.email }}</p>
              <span class="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                <span class="w-2 h-2 rounded-full bg-brand-500"></span>
                {{ user?.role === 'ADMIN' ? 'Administrateur' : user?.role === 'INSTRUCTOR' ? 'Formateur' : 'Apprenant' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Formulaire -->
        <div class="p-6 sm:p-8">
          <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Informations personnelles</h3>
          <form @submit.prevent="saveProfile" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Prénom</label>
                <input v-model="form.firstName" type="text" required class="form-input" />
              </div>
              <div>
                <label class="form-label">Nom</label>
                <input v-model="form.lastName" type="text" required class="form-input" />
              </div>
            </div>
            <div>
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" required class="form-input" />
            </div>
            <div class="flex items-center gap-3 pt-2">
              <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? 'Enregistrement…' : 'Enregistrer les modifications' }}</button>
            </div>
          </form>

          <!-- Déconnexion -->
          <div class="mt-8 pt-8 border-t border-slate-100">
            <button type="button" class="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium transition" @click="logout">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
