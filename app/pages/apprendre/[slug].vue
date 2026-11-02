<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
await navigateTo(`/apprentissage/${slug}`, { replace: true })
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <div class="text-center">
      <div class="inline-block w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p class="text-slate-600">Redirection vers la formation…</p>
    </div>
  </div>
</template>
