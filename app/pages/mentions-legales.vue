<script setup lang="ts">
useHead({ title: 'Mentions légales – AST-Academy' })
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 pb-20 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <header class="mb-8">
        <span class="badge mb-4">ÉDITEUR DU SITE</span>
        <h1 class="section-title">Mentions <span class="text-brand-700">légales</span></h1>
      </header>

      <div class="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <section>
          <h2 class="text-xl font-bold">Éditeur</h2>
          <p class="mt-2 leading-relaxed text-slate-600">AST-Academy est édité par All Solution Technologie (AST).</p>
          <p class="mt-2 leading-relaxed text-slate-600">Contact : <NuxtLink to="/contact" class="font-semibold text-brand-700 underline underline-offset-4">page Contact</NuxtLink>.</p>
        </section>
        <section class="rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <h2 class="font-bold text-slate-900">Informations à compléter</h2>
          <p class="mt-2 leading-relaxed text-slate-700">L’adresse officielle de l’éditeur, ses informations d’immatriculation et le nom de l’hébergeur ne sont pas encore renseignés dans le projet. Ils doivent être ajoutés avant la mise en ligne publique.</p>
        </section>
      </div>
    </div>
  </div>
</template>
