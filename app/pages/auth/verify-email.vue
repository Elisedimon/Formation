<script setup lang="ts">
useHead({ title: 'Activation de compte – AST-Academy' })
definePageMeta({ layout: 'default' })

const route = useRoute()
const token = computed(() => (route.query.token as string) || '')

const verifying = ref(false)
const verified = ref(false)
const error = ref('')

const { login } = useAuth()

async function activate() {
  if (!token.value) {
    error.value = 'Token d’activation manquant'
    return
  }
  verifying.value = true
  error.value = ''

  try {
    await $fetch('/api/auth/verify-email', {
      method: 'POST',
      query: { token: token.value }
    })
    verified.value = true
  } catch (e: any) {
    error.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      'Échec de l’activation du compte'
  } finally {
    verifying.value = false
  }
}

async function goToLogin() {
  await navigateTo('/auth/login')
}

onMounted(() => {
  if (token.value) {
    void activate()
  }
})
</script>

<template>
  <div class="pt-28 pb-20 min-h-[75vh] flex items-center bg-slate-50">
    <div class="max-w-md w-full mx-auto px-4">
      <div class="text-center mb-8">
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl mx-auto mb-4"
          :class="verified ? 'bg-emerald-600' : 'bg-amber-600'"
        >
          <span>{{ verified ? '✓' : '!' }}</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
          {{ verified ? 'Compte activé !' : 'Activation de compte' }}
        </h1>
        <p class="text-slate-500">
          {{ verified ? 'Votre compte est maintenant actif.' : 'Vérification du lien d’activation…' }}
        </p>
      </div>

      <div v-if="verifying" class="card p-6 sm:p-8 text-center">
        <div class="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p class="text-slate-600">Activation en cours…</p>
      </div>

      <div v-else-if="verified" class="card p-6 sm:p-8 text-center">
        <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-xl mx-auto mb-4">
          ✓
        </div>
        <h2 class="text-xl font-bold text-slate-900 mb-2">Compte activé avec succès</h2>
        <p class="text-slate-600 mb-6">
          Vous pouvez maintenant vous connecter et accéder à vos formations.
        </p>
        <button type="button" class="btn-primary w-full" @click="goToLogin">
          Se connecter
        </button>
        <p class="mt-4 text-sm text-slate-500">
          Déjà un compte ?
          <NuxtLink to="/auth/login" class="text-emerald-600 font-semibold hover:underline">
            Connexion
          </NuxtLink>
        </p>
      </div>

      <div v-else-if="error" class="card p-6 sm:p-8 text-center">
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600 text-xl mx-auto mb-4">
          !
        </div>
        <h2 class="text-xl font-bold text-slate-900 mb-2">Erreur d’activation</h2>
        <p class="text-slate-600 mb-6">{{ error }}</p>
        <button type="button" class="btn-primary w-full" @click="goToLogin">
          Aller à la connexion
        </button>
      </div>

      <div v-else class="card p-6 sm:p-8 text-center">
        <p class="text-slate-500">Vérification du token d’activation…</p>
      </div>
    </div>
  </div>
</template>
