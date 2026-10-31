<script setup lang="ts">
useHead({
  title: 'AST-Academy – Maîtrisez les technologies de demain'
})

const featuredCourses = [
  {
    id: 'developpement-full-stack-moderne',
    title: 'Développement Full-Stack Moderne',
    category: 'Développement',
    duration: '12 semaines',
    level: 'Intermédiaire',
    price: 149000,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'data-science-machine-learning',
    title: 'Data Science & Machine Learning',
    category: 'Data',
    duration: '10 semaines',
    level: 'Avancé',
    price: 179000,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'cloud-devops-essentials',
    title: 'Cloud & DevOps Essentials',
    category: 'Cloud',
    duration: '8 semaines',
    level: 'Débutant',
    price: 129000,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80'
  }
]

const whyUs = [
  {
    title: 'Apprentissage par la pratique',
    desc: 'Chaque module se termine par un projet réel que vous pouvez ajouter à votre portfolio.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
  },
  {
    title: 'Mentorat d’experts',
    desc: 'Bénéficiez d’un accompagnement personnalisé par des professionnels en activité.',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
  },
  {
    title: 'Paiement flexible',
    desc: 'Payez en toute sécurité via FedaPay (Mobile Money, carte bancaire…).',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
  }
]

const ctaPhotos = [
  'photo-1522202176988-66273c2fd55f',
  'photo-1521737711867-e3b97375f902',
  'photo-1498050108023-c5249f4df085',
  'photo-1551288049-bebda4e38f71',
  'photo-1523580494863-6f3031224c94',
  'photo-1516321318423-f06f85e504b3',
  'photo-1451187580459-43490279c0fa',
  'photo-1522071820081-009f0129c71c'
]
const ctaPhotoLoop = [...ctaPhotos, ...ctaPhotos]
</script>

<template>
  <div>
    <HeroSection />

    <!-- Featured courses -->
    <section class="bg-white py-20 lg:py-28">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14">
          <h2 class="section-title mb-4">
            Formations <span class="text-emerald-600">populaires</span>
          </h2>
          <p class="section-subtitle mx-auto">
            Des parcours concrets conçus par des experts pour vous rendre immédiatement opérationnel.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <CourseCard
            v-for="course in featuredCourses"
            :key="course.id"
            :course="course"
          />
        </div>

        <div class="text-center mt-12">
          <NuxtLink to="/formations" class="btn-secondary">
            Voir toutes les formations
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Why us -->
    <section class="border-t border-slate-100 bg-slate-50 py-20 lg:py-28">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 class="section-title mb-6">
              Pourquoi choisir <span class="text-emerald-600">AST-Academy</span> ?
            </h2>
            <ul class="space-y-5">
              <li
                v-for="(item, i) in whyUs"
                :key="item.title"
                class="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm"
              >
                <div class="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 mb-1">{{ item.title }}</h3>
                  <p class="text-slate-500 text-sm leading-relaxed">{{ item.desc }}</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="relative min-h-[420px] overflow-hidden rounded-[1.75rem] bg-slate-200 shadow-xl">
            <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85" alt="Une équipe échange autour d'un projet" class="absolute inset-0 h-full w-full object-cover" loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
            <div class="absolute bottom-0 p-7 text-white sm:p-9">
              <p class="text-sm font-semibold uppercase tracking-[.18em] text-emerald-200">On avance mieux ensemble</p>
              <p class="mt-3 max-w-md text-2xl font-bold leading-snug sm:text-3xl">Un cadre motivant pour apprendre, essayer et réussir.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white py-20 lg:py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span class="badge mb-4">UNE MÉTHODE QUI VOUS FAIT AVANCER</span>
            <h2 class="section-title">Apprendre, c’est <span class="text-emerald-600">prendre son élan.</span></h2>
          </div>
          <NuxtLink to="/a-propos" class="font-semibold text-emerald-700 hover:text-emerald-900">Découvrir AST-Academy <span aria-hidden="true">→</span></NuxtLink>
        </div>
        <div class="grid gap-5 md:grid-cols-3">
          <article v-for="item in [
            { icon: '01', title: 'Apprenez en faisant', text: 'Chaque parcours vous aide à transformer les notions en réalisations concrètes pour votre portfolio.' },
            { icon: '02', title: 'Progressez avec méthode', text: 'Un contenu organisé étape par étape vous permet de garder le cap et de mesurer vos progrès.' },
            { icon: '03', title: 'Préparez la suite', text: 'Développez des compétences recherchées et donnez une direction claire à votre projet professionnel.' }
          ]" :key="item.icon" class="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
            <div class="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-800">{{ item.icon }}</div>
            <h3 class="mb-2 text-lg font-bold">{{ item.title }}</h3>
            <p class="leading-relaxed text-slate-600">{{ item.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
      <div class="home-cta relative isolate mx-auto grid min-h-[350px] max-w-7xl items-center gap-8 overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 p-7 shadow-2xl sm:p-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-14 lg:p-16">
        <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-60" aria-hidden="true">
          <div class="cta-photo-track absolute -left-8 inset-y-0 flex gap-4">
            <img v-for="(photo, index) in ctaPhotoLoop" :key="index" :src="`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=500&h=700&q=60`" alt="" class="h-full min-h-[350px] w-56 shrink-0 object-cover grayscale sm:w-72" loading="lazy">
          </div>
        </div>
        <div class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/75" />
        <div class="pointer-events-none absolute -right-24 -top-36 z-[2] h-80 w-80 rounded-full bg-emerald-500/20 blur-[90px] animate-orbit" />

        <div class="relative z-10 animate-fade-up">
          <p class="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-emerald-200 sm:text-sm">
            <span class="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_#e45530]" /> Le prochain chapitre commence ici
          </p>
          <h2 class="home-cta__title max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Prêt·e à investir en vous-même&nbsp;?</h2>
        </div>

        <div class="relative z-10 max-w-lg animate-fade-up delay-200">
          <p class="text-base leading-relaxed text-white/80 sm:text-lg">Choisissez votre formation et avancez à votre rythme, avec un accompagnement à chaque étape.</p>
          <NuxtLink to="/formations" class="btn-primary animate-glow mt-7 !px-7 !py-3.5">
            Voir les formations
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H4" /></svg>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
