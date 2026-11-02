<script setup lang="ts">
useHead({ title: 'Paiement réussi – AST-Academy' })
const route = useRoute()
const paymentId = computed(() => route.query.paymentId as string | undefined)
const courseSlug = computed(() => typeof route.query.course === 'string' ? route.query.course : '')
const { user, fetchMe } = useAuth()
const openingCourse = ref(false)
onMounted(async () => {
  if (!courseSlug.value) return
  if (!user.value) await fetchMe()
  if (user.value) {
    openingCourse.value = true
    await navigateTo(`/apprendre/${encodeURIComponent(courseSlug.value)}`)
  }
})
</script>

<template>
  <div class="pb-20 min-h-[75vh] flex items-center bg-slate-50">
    <div class="max-w-md mx-auto px-4 text-center">
      <div class="w-16 h-16 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-slate-900 mb-3">Paiement confirmé !</h1>
      <p class="text-slate-500 mb-8">
        Votre paiement est confirmé et votre formation est disponible dans votre espace d’apprentissage.
      </p>
      <p v-if="openingCourse" class="mb-6 text-sm font-semibold text-brand-800" role="status">Ouverture de votre formation…</p>
      <p v-if="paymentId" class="text-xs text-slate-400 mb-6">Réf. : {{ paymentId }}</p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <NuxtLink :to="courseSlug ? `/apprendre/${encodeURIComponent(courseSlug)}` : '/mon-espace'" class="btn-primary justify-center">Commencer la formation</NuxtLink>
        <NuxtLink to="/" class="btn-secondary justify-center">Accueil</NuxtLink>
      </div>
    </div>
  </div>
</template>
