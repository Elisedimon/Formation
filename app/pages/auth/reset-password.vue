<script setup lang="ts">
useHead({ title: 'Réinitialiser le mot de passe – AST-Academy' })
definePageMeta({ layout: 'default' })

const route = useRoute()
const token = computed(() => (route.query.token as string) || '')

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function onSubmit() {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Les deux mots de passe ne correspondent pas.'
    return
  }
  if (!password.value || password.value.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères.'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      query: { token: token.value },
      body: { password: password.value }
    })
    success.value = true
  } catch (e: any) {
    error.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      'Échec de la réinitialisation du mot de passe'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="pb-20 min-h-[75vh] flex items-center bg-slate-50">
    <div class="max-w-md w-full mx-auto px-4">
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center font-bold text-white text-xl mx-auto mb-4 shadow-md shadow-brand/25">
          !
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Nouveau mot de passe</h1>
        <p class="text-slate-500">Choisissez un nouveau mot de passe pour votre compte.</p>
      </div>

      <form v-if="!success" class="card p-6 sm:p-8 space-y-5 shadow-soft" @submit.prevent="onSubmit">
        <div>
          <label class="form-label" for="password">Nouveau mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            class="form-input"
            placeholder="Au moins 8 caractères"
          />
        </div>

        <div>
          <label class="form-label" for="confirmPassword">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            class="form-input"
            placeholder="Saisissez-le à nouveau"
          />
        </div>

        <p v-if="error" class="form-error">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ error }}
        </p>

        <button
          type="submit"
          class="btn-primary w-full"
          :disabled="loading"
        >
          {{ loading ? 'Réinitialisation…' : 'Réinitialiser le mot de passe' }}
        </button>
      </form>

      <div v-else class="card p-6 sm:p-8 text-center">
        <div class="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-600 text-xl mx-auto mb-4">
          ✓
        </div>
        <h2 class="text-xl font-bold text-slate-900 mb-2">Mot de passe réinitialisé</h2>
        <p class="text-slate-600 mb-6">
          Votre mot de passe a été modifié et vous êtes connecté.
        </p>
        <NuxtLink to="/mon-espace" class="btn-primary w-full">
          Aller à mon espace
        </NuxtLink>
      </div>

      <p v-if="!token" class="text-center text-sm text-slate-500 mt-6">
        Token de réinitialisation manquant.
          <NuxtLink to="/auth/forgot-password" class="text-brand-600 font-semibold hover:underline">
          Demander un nouveau lien
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
