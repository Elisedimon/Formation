<script setup lang="ts">
useHead({ title: 'Parcours – AST-Academy' })

const paths = [
  {
    number: '01',
    title: 'Développement web',
    summary: 'Passez des bases du web à la création d’applications complètes et modernes.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
    tags: ['HTML & CSS', 'JavaScript', 'Applications web']
  },
  {
    number: '02',
    title: 'Data & intelligence artificielle',
    summary: 'Apprenez à explorer les données et à construire des solutions utiles avec Python.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
    tags: ['Python', 'Analyse', 'Machine learning']
  },
  {
    number: '03',
    title: 'Cloud & DevOps',
    summary: 'Comprenez les outils et les pratiques qui permettent de livrer des services fiables.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
    tags: ['Cloud', 'Automatisation', 'Déploiement']
  }
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-20 pt-28">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mb-12 max-w-2xl">
        <span class="badge mb-5">APPRENDRE AVEC UN CAP</span>
        <h1 class="section-title mb-4">Choisissez votre <span class="text-emerald-600">parcours</span></h1>
        <p class="section-subtitle">Explorez les métiers du numérique et trouvez une formation qui correspond à votre prochaine étape.</p>
      </div>
      <div class="grid gap-6 lg:grid-cols-3">
        <article v-for="path in paths" :key="path.number" class="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <div class="relative h-52 overflow-hidden bg-slate-200">
            <img :src="path.image" :alt="`Illustration du parcours ${path.title}`" class="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
            <span class="absolute bottom-4 left-5 rounded-full border border-white/25 bg-slate-950/75 px-3 py-1.5 text-xs font-bold tracking-widest text-white shadow-lg backdrop-blur">PARCOURS {{ path.number }}</span>
          </div>
          <div class="p-6">
            <h2 class="mb-2 text-xl font-bold">{{ path.title }}</h2>
            <p class="min-h-[72px] leading-relaxed text-slate-600">{{ path.summary }}</p>
            <div class="my-5 flex flex-wrap gap-2">
              <span v-for="tag in path.tags" :key="tag" class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">{{ tag }}</span>
            </div>
            <NuxtLink to="/formations" class="inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-900">Explorer les formations <span aria-hidden="true">→</span></NuxtLink>
          </div>
        </article>
      </div>
      <div class="mt-10 rounded-2xl border border-emerald-100 bg-white p-6 sm:flex sm:items-center sm:justify-between sm:p-8">
        <div><h2 class="text-lg font-bold">Vous hésitez sur la direction à prendre ?</h2><p class="mt-1 text-slate-600">Parlons de vos objectifs et trouvons ensemble votre point de départ.</p></div>
        <NuxtLink to="/contact" class="btn-primary mt-5 !rounded-full sm:mt-0">Nous contacter</NuxtLink>
      </div>
    </div>
  </div>
</template>
