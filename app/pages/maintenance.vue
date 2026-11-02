<script setup lang="ts">
useHead({ title: 'Maintenance' })
const { data } = await useFetch('/api/maintenance')
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
    <div class="card p-8 max-w-lg text-center space-y-4">
      <h1 class="text-2xl font-bold text-slate-900">Maintenance en cours</h1>
      <p class="text-slate-600">{{ data?.message }}</p>
      <p v-if="data?.endAt" class="text-sm text-slate-500">Fin prévue : {{ new Date(data.endAt).toLocaleString('fr-FR') }}</p>
      <NuxtLink to="/auth/login" class="btn-secondary">Connexion administrateur</NuxtLink>
    </div>
  </div>
</template>