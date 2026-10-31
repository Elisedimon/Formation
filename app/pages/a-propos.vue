<script setup lang="ts">
useHead({ title: 'À propos – AST-Academy' })
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-20 pt-28">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <span class="badge mb-5">ALL SOLUTION TECHNOLOGIE</span>
          <h1 class="section-title mb-6">Le numérique s’apprend en <span class="text-emerald-600">construisant.</span></h1>
          <div class="space-y-5 text-lg leading-relaxed text-slate-600">
            <p><strong class="text-slate-900">AST-Academy</strong> est une plateforme de formation dédiée aux technologies numériques en Afrique de l’Ouest.</p>
            <p>Notre mission est de rendre l’apprentissage des compétences tech accessible, pratique et orienté vers des projets professionnels.</p>
            <p>Nous croyons que la meilleure façon d’apprendre est de comprendre, de pratiquer et de construire.</p>
          </div>
          <NuxtLink to="/formations" class="btn-primary mt-8 !rounded-full">Découvrir nos formations <span aria-hidden="true">→</span></NuxtLink>
        </div>
        <div class="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-slate-200 shadow-xl sm:min-h-[470px]">
          <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=85" alt="Des apprenants se retrouvent pour étudier ensemble" class="absolute inset-0 h-full w-full object-cover" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/65 to-transparent" />
          <p class="absolute bottom-7 left-7 max-w-sm text-2xl font-bold text-white drop-shadow-lg sm:bottom-9 sm:left-9 sm:text-3xl">Des compétences pour créer les solutions de demain.</p>
        </div>
      </div>
      <div class="mt-16 grid gap-5 md:grid-cols-3">
        <article v-for="value in [
          { title: 'Pratique', text: 'Les notions prennent vie à travers des exercices et des projets applicables.' },
          { title: 'Progression', text: 'Des parcours lisibles pour apprendre pas à pas et savoir quoi travailler ensuite.' },
          { title: 'Proximité', text: 'Un accompagnement accessible pour poser ses questions et garder le cap.' }
        ]" :key="value.title" class="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 class="mb-2 text-lg font-bold text-slate-900">{{ value.title }}</h2>
          <p class="leading-relaxed text-slate-600">{{ value.text }}</p>
        </article>
      </div>
    </div>
  </div>
</template>
