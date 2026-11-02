<script setup lang="ts">
useHead({ title: 'Paiement échoué – AST-Academy' })
const route = useRoute()
const status = computed(() => (route.query.status as string) || 'échoué')
const reason = computed(() => route.query.reason as string | undefined)
const verificationPending = computed(() => status.value === 'verification' || status.value === 'PENDING')
</script>

<template>
  <div class="pb-20 min-h-[75vh] flex items-center bg-slate-50">
    <div class="max-w-md mx-auto px-4 text-center">
      <div class="w-16 h-16 rounded-full border flex items-center justify-center mx-auto mb-6" :class="verificationPending ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'">
        <svg v-if="verificationPending" xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l2 2m6-2a8 8 0 11-16 0 8 8 0 0116 0z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-slate-900 mb-3">{{ verificationPending ? 'Paiement en cours de vérification' : 'Paiement non finalisé' }}</h1>
      <p v-if="verificationPending" class="mb-8 text-slate-600">Nous vérifions le statut de votre transaction. Évitez de relancer le paiement tout de suite ; consultez votre espace dans quelques instants ou contactez-nous si besoin.</p>
      <template v-else>
        <p class="text-slate-500 mb-2">Le paiement n’a pas pu être confirmé ({{ status }}).</p>
        <p v-if="reason" class="text-sm text-slate-400 mb-8">{{ reason }}</p>
        <p v-else class="mb-8 text-slate-400 text-sm">Vous pouvez réessayer ou nous contacter.</p>
      </template>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <NuxtLink v-if="verificationPending" to="/mon-espace" class="btn-primary justify-center">Mon espace</NuxtLink>
        <NuxtLink v-else to="/formations" class="btn-primary justify-center">Réessayer</NuxtLink>
        <NuxtLink to="/contact" class="btn-secondary justify-center">Contact</NuxtLink>
      </div>
    </div>
  </div>
</template>
