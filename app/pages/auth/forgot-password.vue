<script setup lang="ts">
useHead({ title: 'Mot de passe oublié – AST-Academy' })
definePageMeta({ layout: 'default' })

const email = ref('')
const loading = ref(false)
const error = ref('')
const sent = ref(false)

async function onSubmit() {
  error.value = ''
  sent.value = false
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = 'Veuillez saisir une adresse email valide.'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })
    sent.value = true
  } catch (e: any) {
    error.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      'Impossible d’envoyer le lien de réinitialisation'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="pb-20 min-h-[75vh] flex items-center bg-slate-50">
    <div class="max-w-md w-full mx-auto px-4">
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center font-bold text-white text-xl mx-auto mb-4 shadow-md shadow-amber-600/30">
          !
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Mot de passe oublié</h1>
        <p class="text-slate-500">Aucun souci, réinitialisons votre mot de passe.</p>
      </div>

      <form class="card p-6 sm:p-8 space-y-5 shadow-soft" @submit.prevent="onSubmit">
        <div v-if="!sent">
          <div>
            <label class="form-label" for="email">Adresse email</label>
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
            {{ loading ? 'Envoi…' : 'Envoyer le lien de réinitialisation' }}
          </button>
        </div>

        <div v-else class="text-center">
          <div class="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-600 text-xl mx-auto mb-4">
            ✓
          </div>
          <h2 class="text-xl font-bold text-slate-900 mb-2">Email envoyé</h2>
          <p class="text-slate-600 mb-6">
            Si cette adresse existe dans notre base, vous recevrez un lien de réinitialisation par email.
          </p>
          <button type="button" class="btn-secondary w-full" @click="sent = false; email = ''">
            Envoyer un autre email
          </button>
        </div>

        <p class="text-center text-sm text-slate-500 mt-6">
          Vous vous souvenez de votre mot de passe ?
          <NuxtLink to="/auth/login" class="text-brand-600 font-semibold hover:underline">
            Se connecter
          </NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>
