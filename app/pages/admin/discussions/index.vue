<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })
useHead({ title: 'Discussions - Administration' })
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 pb-10 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-full">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">Discussions</h1>
        <NuxtLink to="/admin" class="btn-secondary">← Tableau de bord</NuxtLink>
      </div>
      <div class="card p-8 text-center text-slate-500">Aucune discussion pour le moment.</div>
    </div>
  </div>
</template>
