<script setup lang="ts">
const pillars = [
  { value: '100 % pratique', label: 'des projets concrets' },
  { value: 'À votre rythme', label: 'en ligne, partout' },
  { value: 'Un vrai mentor', label: 'à vos côtés' }
]

const backgroundPhotos = [
  'photo-1522202176988-66273c2fd55f',
  'photo-1521737711867-e3b97375f902',
  'photo-1523580494863-6f3031224c94',
  'photo-1498050108023-c5249f4df085',
  'photo-1516321318423-f06f85e504b3',
  'photo-1551288049-bebda4e38f71'
]
const firstPhotoLoop = [...backgroundPhotos, ...backgroundPhotos]
const secondPhotoSet = [...backgroundPhotos.slice(3), ...backgroundPhotos.slice(0, 3)]
const secondPhotoLoop = [...secondPhotoSet, ...secondPhotoSet]
</script>

<template>
  <section class="relative isolate overflow-hidden bg-slate-950 pt-24 text-white lg:pt-28">
    <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-40" aria-hidden="true">
      <div class="hero-photo-track hero-photo-track-left absolute -left-8 top-12 flex -rotate-3 gap-4">
        <img v-for="(photo, index) in firstPhotoLoop" :key="`top-${index}`" :src="`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=440&h=250&q=60`" alt="" class="h-28 w-48 shrink-0 rounded-2xl object-cover grayscale sm:h-36 sm:w-64" loading="lazy">
      </div>
      <div class="hero-photo-track hero-photo-track-right absolute -left-8 bottom-8 flex rotate-2 gap-4">
        <img v-for="(photo, index) in secondPhotoLoop" :key="`bottom-${index}`" :src="`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=440&h=250&q=60`" alt="" class="h-28 w-48 shrink-0 rounded-2xl object-cover grayscale sm:h-36 sm:w-64" loading="lazy">
      </div>
    </div>
    <div class="pointer-events-none absolute inset-0 z-[1] bg-slate-950/65" />
    <div class="pointer-events-none absolute -left-40 top-20 z-[2] h-[30rem] w-[30rem] rounded-full bg-emerald-500/25 blur-[100px] animate-orbit" />
    <div class="pointer-events-none absolute -right-32 top-12 z-[2] h-[28rem] w-[28rem] rounded-full bg-emerald-700/25 blur-[100px] animate-orbit" style="animation-delay:-4s" />
    <div class="pointer-events-none absolute inset-0 z-[2] opacity-[.08]" style="background-image:radial-gradient(rgba(255,255,255,.8) .7px,transparent .7px);background-size:22px 22px" />
    <div class="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_.98fr] lg:gap-16 lg:px-8 lg:py-20">
      <div class="max-w-2xl">
        <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.07] px-3.5 py-2 text-xs font-semibold text-emerald-200 shadow-sm backdrop-blur sm:text-sm animate-fade-up">
          <span class="h-2 w-2 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_12px_#ffa27d]" />
          Le numérique, avec un accompagnement humain
        </div>
        <h1 class="mb-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.65rem] animate-fade-up delay-100">
          Faites grandir vos compétences.<br>
          <span class="animate-gradient bg-gradient-to-r from-emerald-200 via-emerald-50 to-emerald-300 bg-clip-text text-transparent">Construisez la suite.</span>
        </h1>
        <p class="mb-8 max-w-xl text-lg leading-relaxed text-slate-300 animate-fade-up delay-200">
          Apprenez les métiers du numérique avec des formations guidées, des projets réels et des formateurs qui connaissent le terrain.
        </p>
        <div class="flex flex-col gap-3 sm:flex-row animate-fade-up delay-300">
          <NuxtLink to="/formations" class="btn-primary animate-glow animate-shimmer !px-7 !py-3.5">
            Explorer les formations
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H4" /></svg>
          </NuxtLink>
          <NuxtLink to="/parcours" class="!inline-flex !items-center !justify-center !rounded-full !border !border-white/20 !bg-white/[.06] !px-7 !py-3.5 !font-semibold !text-white !shadow-none transition hover:!border-white/40 hover:!bg-white/10">
            Trouver mon parcours
          </NuxtLink>
        </div>

        <div class="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-6 animate-fade-up delay-400">
          <div v-for="pillar in pillars" :key="pillar.value">
            <p class="font-bold text-white">{{ pillar.value }}</p>
            <p class="mt-0.5 text-sm text-slate-400">{{ pillar.label }}</p>
          </div>
        </div>
      </div>

      <div class="group relative mx-auto w-full max-w-xl lg:ml-auto animate-fade-up delay-200">
        <div class="absolute -inset-3 rotate-3 rounded-[2rem] bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 opacity-80 blur-[1px] transition-transform duration-700 group-hover:rotate-6" />
        <div class="group relative h-[390px] overflow-hidden rounded-[1.75rem] border border-white/20 bg-slate-800 shadow-2xl shadow-slate-950/40 sm:h-[470px]">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85" alt="Des apprenants travaillent ensemble sur un projet numérique" class="h-full w-full object-cover" fetchpriority="high">
          <div class="absolute inset-0 bg-gradient-to-tr from-emerald-900/30 via-transparent to-emerald-400/20 transition-opacity duration-500 group-hover:opacity-70" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/5 to-transparent" />
          <div class="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/30 bg-slate-950/75 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md animate-float-slow sm:left-7 sm:top-7">
            <span class="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_#ffa27d]" /> Projets réels · mentorat
          </div>
          <div class="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
            <span class="mb-3 inline-flex rounded-full border border-white/25 bg-slate-950/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur">APPRENDRE ENSEMBLE</span>
            <p class="max-w-sm text-2xl font-bold leading-snug text-white drop-shadow-lg sm:text-3xl">Des compétences qui ouvrent de nouvelles portes.</p>
            <p class="mt-3 text-sm text-white drop-shadow-md">Du premier cours au projet dont vous êtes fier.</p>
          </div>
        </div>
        <div class="absolute -bottom-5 -left-2 rounded-2xl border border-white/40 bg-white/95 p-4 shadow-xl shadow-slate-950/20 backdrop-blur sm:-left-8 animate-float">
          <p class="text-xs font-medium text-slate-500">Votre prochaine étape</p>
          <p class="mt-1 font-bold text-slate-900">Commence aujourd’hui <span class="text-emerald-700">↗</span></p>
        </div>
      </div>
    </div>
  </section>
</template>
