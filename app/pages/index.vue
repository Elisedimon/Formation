<script setup lang="ts">
const { user, isLoggedIn, logout } = useAuth()

useHead({
  title: computed(() =>
    isLoggedIn.value ? 'Tableau de bord – AST-Academy' : 'AST-Academy – Maîtrisez les technologies de demain'
  )
})
const roleLabel = computed(() =>
  user.value?.role === 'ADMIN' ? 'Administration'
  : user.value?.role === 'INSTRUCTOR' ? 'Formateur'
  : 'Apprenant'
)

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

const sidebarLinks = computed(() => {
  const role = user.value?.role
  const common = [
    { to: '/', label: 'Accueil', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/formations', label: 'Formations', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { to: '/parcours', label: 'Parcours', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { to: '/a-propos', label: 'À propos', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { to: '/contact', label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
  ]
  if (role === 'ADMIN') return common.concat([
    { to: '/admin', label: 'Tableau de bord', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { to: '/admin/users', label: 'Utilisateurs', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { to: '/admin/courses', label: 'Cours', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { to: '/admin/paiements', label: 'Paiements', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { to: '/admin/certificats', label: 'Certificats', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    { to: '/admin/formateurs', label: 'Formateurs', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
    { to: '/admin/discussions', label: 'Discussions', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { to: '/admin/parametres', label: 'Paramètres', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ])
  if (role === 'INSTRUCTOR') return common.concat([
    { to: '/formateur', label: 'Tableau de bord', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { to: '/formateur/cours', label: 'Mes cours', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { to: '/formateur/apprenants', label: 'Apprenants', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { to: '/formateur/quiz', label: 'Quiz', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { to: '/formateur/revenus', label: 'Revenus', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { to: '/formateur/statistiques', label: 'Statistiques', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { to: '/formateur/discussions', label: 'Discussions', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' }
  ])
  return common.concat([
    { to: '/mon-espace', label: 'Mes formations', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222' },
    { to: '/formations', label: 'Catalogue', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { to: '/certificats', label: 'Certificats', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    { to: '/messages', label: 'Messages', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' }
  ])
})
</script>

<template>
  <!-- Page publique (non connecté) -->
  <div v-if="!isLoggedIn">
    <HeroSection />

    <!-- Featured courses -->
    <section class="bg-white py-20 lg:py-28">
      <div class="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-14">
          <h2 class="section-title mb-4">
            Formations <span class="text-brand-600">populaires</span>
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
    <section class="border-t border-ink-100 bg-ink-50 py-20 lg:py-28">
      <div class="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 class="section-title mb-6">
              Pourquoi choisir <span class="text-brand-600">AST-Academy</span> ?
            </h2>
            <ul class="space-y-5">
              <li
                v-for="(item, i) in whyUs"
                :key="item.title"
                class="flex gap-4 p-4 rounded-2xl bg-white border border-ink-100 shadow-sm"
              >
                <div class="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-ink-900 mb-1">{{ item.title }}</h3>
                  <p class="text-ink-500 text-sm leading-relaxed">{{ item.desc }}</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="relative min-h-[420px] overflow-hidden rounded-[1.75rem] bg-ink-200 shadow-xl">
            <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85" alt="Une équipe échange autour d'un projet" class="absolute inset-0 h-full w-full object-cover" loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent" />
            <div class="absolute bottom-0 p-7 text-white sm:p-9">
              <p class="text-sm font-semibold uppercase tracking-[.18em] text-brand-200">On avance mieux ensemble</p>
              <p class="mt-3 max-w-md text-2xl font-bold leading-snug sm:text-3xl">Un cadre motivant pour apprendre, essayer et réussir.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white py-20 lg:py-24">
      <div class="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8">
        <div class="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span class="badge mb-4">UNE MÉTHODE QUI VOUS FAIT AVANCER</span>
            <h2 class="section-title">Apprendre, c’est <span class="text-brand-600">prendre son élan.</span></h2>
          </div>
          <NuxtLink to="/a-propos" class="font-semibold text-brand-700 hover:text-brand-900">Découvrir AST-Academy <span aria-hidden="true">→</span></NuxtLink>
        </div>
        <div class="grid gap-5 md:grid-cols-3">
          <article v-for="item in [
            { icon: '01', title: 'Apprenez en faisant', text: 'Chaque parcours vous aide à transformer les notions en réalisations concrètes pour votre portfolio.' },
            { icon: '02', title: 'Progressez avec méthode', text: 'Un contenu organisé étape par étape vous permet de garder le cap et de mesurer vos progrès.' },
            { icon: '03', title: 'Préparez la suite', text: 'Développez des compétences recherchées et donnez une direction claire à votre projet professionnel.' }
          ]" :key="item.icon" class="rounded-2xl border border-ink-200 bg-ink-50 p-6 sm:p-7">
            <div class="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 font-bold text-brand-800">{{ item.icon }}</div>
            <h3 class="mb-2 text-lg font-bold">{{ item.title }}</h3>
            <p class="leading-relaxed text-ink-600">{{ item.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
      <div class="home-cta relative isolate mx-auto grid min-h-[350px] max-w-[1536px] items-center gap-8 overflow-hidden rounded-[2rem] border border-ink-800 bg-ink-950 p-7 shadow-2xl sm:p-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-14 lg:p-16">
        <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-60" aria-hidden="true">
          <div class="cta-photo-track absolute -left-8 inset-y-0 flex gap-4">
            <img v-for="(photo, index) in ctaPhotoLoop" :key="index" :src="`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=500&h=700&q=60`" alt="" class="h-full min-h-[350px] w-56 shrink-0 object-cover grayscale sm:w-72" loading="lazy">
          </div>
        </div>
        <div class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-ink-950/95 via-ink-950/85 to-ink-950/75" />
        <div class="pointer-events-none absolute -right-24 -top-36 z-[2] h-80 w-80 rounded-full bg-brand-500/20 blur-[90px] animate-orbit" />

        <div class="relative z-10 animate-fade-up">
          <p class="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-brand-200 sm:text-sm">
            <span class="h-2 w-2 rounded-full bg-brand-500 shadow-[0_0_12px_#e45530]" /> Le prochain chapitre commence ici
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

  <!-- Tableau de bord sidebar (connecté) -->
  <div v-else class="min-h-screen bg-ink-50">
    <div class="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span class="badge mb-2">TABLEAU DE BORD</span>
          <h1 class="section-title">
            Bonjour<span v-if="user?.firstName">, {{ user.firstName }}</span> 👋
          </h1>
          <p class="mt-2 text-ink-500">{{ roleLabel }} · Bienvenue sur votre espace.</p>
        </div>
        <button type="button" class="btn-ghost text-ink-600 hover:text-ink-900 transition" @click="logout">Se déconnecter</button>
      </div>

      <!-- Actions rapides -->
      <div class="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NuxtLink
          v-for="link in sidebarLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-2xl border border-ink-200 bg-white p-5 flex flex-col items-center gap-3 transition hover:border-brand-200 hover:shadow-lg"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-50 text-brand-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" /></svg>
          </div>
          <span class="text-sm font-semibold text-ink-900 text-center">{{ link.label }}</span>
        </NuxtLink>
      </div>

      <!-- Formations recommandées -->
      <div class="mb-10">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-ink-900">Formations recommandées</h2>
          <NuxtLink to="/formations" class="text-sm font-semibold text-brand-700 hover:text-brand-900">Voir le catalogue <span aria-hidden="true">→</span></NuxtLink>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <CourseCard v-for="course in featuredCourses" :key="course.id" :course="course" />
        </div>
      </div>

      <!-- Pourquoi AST-Academy -->
      <section class="border-t border-ink-200 bg-white pt-10">
        <div class="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8">
          <div class="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <h2 class="section-title mb-6">
                Pourquoi choisir <span class="text-brand-600">AST-Academy</span> ?
              </h2>
              <ul class="space-y-5">
                <li v-for="(item, i) in whyUs" :key="item.title" class="flex gap-4 p-4 rounded-2xl border border-ink-100 shadow-sm">
                  <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-ink-900 mb-1">{{ item.title }}</h3>
                    <p class="text-ink-500 text-sm leading-relaxed">{{ item.desc }}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div class="relative min-h-[300px] overflow-hidden rounded-[1.75rem] bg-ink-200 shadow-xl">
              <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=85" alt="Une équipe échange autour d'un projet" class="absolute inset-0 h-full w-full object-cover" loading="lazy">
              <div class="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/10 to-transparent" />
              <div class="absolute bottom-0 p-6 text-white sm:p-8">
                <p class="text-sm font-semibold uppercase tracking-[.18em] text-brand-200">On avance mieux ensemble</p>
                <p class="mt-3 max-w-md text-2xl font-bold leading-snug sm:text-3xl">Un cadre motivant pour apprendre, essayer et réussir.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
