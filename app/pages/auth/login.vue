<script setup lang="ts">
useHead({ title: 'Connexion – AST-Academy' })
definePageMeta({ layout: 'default' })

const { login } = useAuth()
const route = useRoute()
const redirectPath = computed(() => {
  const value = route.query.redirect
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/mon-espace'
})

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await login(email.value, password.value)
    await navigateTo(redirectPath.value)
  } catch (e: any) {
    error.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      'Email ou mot de passe incorrect'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="pt-28 pb-20 min-h-[75vh] flex items-center bg-slate-50">
    <div class="max-w-md w-full mx-auto px-4">
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-800 flex items-center justify-center font-bold text-white text-xl mx-auto mb-4 shadow-md shadow-emerald-700/30">
          A
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Bon retour !</h1>
        <p class="text-slate-500">Connectez-vous pour accéder à vos formations</p>
      </div>

      <form
        class="card p-6 sm:p-8 space-y-5 shadow-soft"
        @submit.prevent="onSubmit"
      >
        <div>
          <label class="form-label" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="form-input"
            placeholder="vous@email.com"
          />
        </div>

        <div>
          <label class="form-label" for="password">Mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            minlength="8"
            class="form-input"
            placeholder="••••••••"
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
          <svg v-if="loading" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>

        <p class="text-center text-sm text-slate-500">
          Pas encore de compte ?
          <NuxtLink :to="{ path: '/auth/register', query: route.query }" class="text-emerald-600 font-semibold hover:underline">
            Créer un compte
          </NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>
