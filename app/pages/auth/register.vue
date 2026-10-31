<script setup lang="ts">
useHead({ title: 'Créer un compte – AST-Academy' })
definePageMeta({ layout: 'default' })

const { register } = useAuth()
const route = useRoute()
const redirectPath = computed(() => {
  const value = route.query.redirect
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/mon-espace'
})

const steps = [
  { title: 'Profil', subtitle: 'Comment vous appeler ?' },
  { title: 'Coordonnées', subtitle: 'Où vous joindre ?' },
  { title: 'Sécurité', subtitle: 'Protégez votre compte' }
]

const step = ref(1)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const formElement = ref<HTMLFormElement | null>(null)

function nextStep() {
  error.value = ''
  if (!formElement.value?.reportValidity()) return
  if (step.value === 1 && (!firstName.value.trim() || !lastName.value.trim())) {
    error.value = 'Renseignez votre prénom et votre nom pour continuer.'
    return
  }
  step.value = Math.min(step.value + 1, steps.length)
}

function previousStep() {
  error.value = ''
  step.value = Math.max(step.value - 1, 1)
}

async function onSubmit() {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Les deux mots de passe ne correspondent pas.'
    return
  }

  loading.value = true
  try {
    await register({
      email: email.value,
      password: password.value,
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim()
    })
    await navigateTo(redirectPath.value)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.statusMessage || 'Impossible de créer le compte'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[75vh] bg-slate-50 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
    <div class="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
      <div>
        <div class="mb-8">
          <span class="badge mb-4">VOTRE PROCHAINE ÉTAPE COMMENCE ICI</span>
          <h1 class="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Créer votre compte</h1>
          <p class="mt-3 text-slate-600">Quelques étapes simples pour rejoindre AST-Academy.</p>
        </div>

        <div class="mb-8 px-1" aria-label="Progression de l’inscription">
          <div class="relative grid grid-cols-3">
            <div class="absolute left-[16.7%] right-[16.7%] top-4 h-0.5 bg-slate-200" />
            <div class="absolute left-[16.7%] top-4 h-0.5 bg-emerald-600 transition-all duration-300" :style="{ width: `${(step - 1) * 33.3}%` }" />
            <div v-for="(item, index) in steps" :key="item.title" class="relative flex flex-col items-center text-center" :aria-current="step === index + 1 ? 'step' : undefined">
              <div class="z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors" :class="step >= index + 1 ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300 bg-white text-slate-500'">
                <svg v-if="step > index + 1" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6" /></svg>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span class="mt-2 text-xs font-semibold sm:text-sm" :class="step >= index + 1 ? 'text-emerald-800' : 'text-slate-500'">{{ item.title }}</span>
            </div>
          </div>
        </div>

        <form ref="formElement" class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" @submit.prevent="onSubmit">
          <div class="mb-6">
            <p class="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Étape {{ step }} sur {{ steps.length }}</p>
            <h2 class="mt-1 text-2xl font-bold text-slate-950">{{ steps[step - 1]?.subtitle }}</h2>
          </div>

          <div v-if="step === 1" class="space-y-5">
            <div>
              <label class="form-label" for="firstName">Prénom</label>
              <input id="firstName" v-model="firstName" type="text" required maxlength="80" autocomplete="given-name" class="form-input" placeholder="Ex. Aïcha">
            </div>
            <div>
              <label class="form-label" for="lastName">Nom</label>
              <input id="lastName" v-model="lastName" type="text" required maxlength="80" autocomplete="family-name" class="form-input" placeholder="Ex. Mensah">
            </div>
          </div>

          <div v-else-if="step === 2" class="space-y-5">
            <div>
              <label class="form-label" for="email">Adresse e-mail</label>
              <input id="email" v-model="email" type="email" required maxlength="254" autocomplete="email" class="form-input" placeholder="vous@email.com">
              <p class="mt-2 text-xs text-slate-500">Utilisez une adresse à laquelle vous avez accès.</p>
            </div>
          </div>

          <div v-else class="space-y-5">
            <div>
              <label class="form-label" for="password">Mot de passe</label>
              <input id="password" v-model="password" type="password" required minlength="8" maxlength="128" autocomplete="new-password" class="form-input" placeholder="Au moins 8 caractères">
            </div>
            <div>
              <label class="form-label" for="confirmPassword">Confirmer le mot de passe</label>
              <input id="confirmPassword" v-model="confirmPassword" type="password" required minlength="8" maxlength="128" autocomplete="new-password" class="form-input" placeholder="Saisissez-le à nouveau">
            </div>
          </div>

          <p v-if="error" class="form-error mt-5" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {{ error }}
          </p>

          <div class="mt-8 flex items-center justify-between gap-3">
            <button v-if="step > 1" type="button" class="btn-secondary !px-5" :disabled="loading" @click="previousStep">Retour</button>
            <NuxtLink v-else :to="{ path: '/auth/login', query: route.query }" class="text-sm font-semibold text-slate-600 hover:text-emerald-700">Déjà un compte ?</NuxtLink>

            <button v-if="step < steps.length" type="button" class="btn-primary ml-auto !rounded-full !px-6" @click="nextStep">
              Continuer <span aria-hidden="true">→</span>
            </button>
            <button v-else type="submit" class="btn-primary ml-auto !rounded-full !px-6" :disabled="loading">
              {{ loading ? 'Création du compte…' : 'Créer mon compte' }}
            </button>
          </div>
          <p class="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">Vos informations sont utilisées pour créer et sécuriser votre compte.</p>
        </form>
      </div>

      <aside class="relative hidden min-h-[570px] overflow-hidden rounded-[2rem] bg-slate-800 lg:block">
        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85" alt="Des étudiants travaillent ensemble" class="absolute inset-0 h-full w-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/10" />
        <div class="absolute bottom-0 p-9 text-white">
          <p class="text-sm font-bold uppercase tracking-[.18em] text-emerald-300">Apprendre · Pratiquer · Innover</p>
          <h2 class="mt-3 max-w-sm text-3xl font-bold leading-tight text-white drop-shadow-lg">Un compte. Un nouveau chemin à explorer.</h2>
          <p class="mt-4 max-w-sm leading-relaxed text-white/80">Rejoignez une communauté qui apprend en construisant des projets concrets.</p>
        </div>
      </aside>
    </div>
  </div>
</template>
