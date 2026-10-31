<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const code = computed(() => String(route.params.code || '').toUpperCase())
const { data, pending, error } = await useFetch(() => `/api/certificates/${encodeURIComponent(code.value)}`)
const certificate = computed(() => data.value?.certificate as {
  code: string; issuedAt: string; revokedAt: string | null
  user: { firstName: string | null; lastName: string | null }
  enrollment: { status: string; course: { title: string; duration: string | null } }
} | undefined)
const verifyUrl = computed(() => `${String(config.public.appUrl || 'http://localhost:3000').replace(/\/$/, '')}/certificats/${encodeURIComponent(code.value)}`)
const qrUrl = computed(() => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(verifyUrl.value)}`)
const fullName = computed(() => [certificate.value?.user.firstName, certificate.value?.user.lastName].filter(Boolean).join(' ') || 'Apprenant AST-Academy')
const issuedDate = computed(() => certificate.value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(certificate.value.issuedAt)) : '')
const valid = computed(() => data.value?.valid === true)
function printCertificate() { window.print() }
useHead(() => ({ title: certificate.value ? `Certificat de ${fullName.value} – AST-Academy` : 'Vérification du certificat – AST-Academy' }))
</script>

<template>
  <main class="min-h-screen bg-slate-100 px-4 pb-16 pt-28 sm:px-6 print:min-h-0 print:bg-white print:p-0">
    <div v-if="pending" class="mx-auto max-w-4xl py-16 text-center text-slate-500" role="status">Vérification du certificat…</div>
    <div v-else-if="error || !certificate" class="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-sm"><h1 class="text-2xl font-bold">Certificat introuvable</h1><p class="mt-3 text-slate-600">Vérifiez le code ou le lien de validation.</p></div>
    <div v-else class="mx-auto max-w-5xl">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden"><NuxtLink to="/mon-espace" class="font-semibold text-slate-600 hover:text-slate-950">← Mon espace</NuxtLink><button type="button" class="btn-primary" @click="printCertificate">Imprimer / Enregistrer en PDF</button></div>
      <article class="certificate relative overflow-hidden border-[10px] border-[#10192C] bg-[#FAF8F5] px-8 py-12 text-center shadow-xl sm:px-16 sm:py-16 print:border-[10px] print:shadow-none">
        <div class="pointer-events-none absolute inset-3 border border-[#E45530]/40" />
        <div class="relative">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10192C] text-2xl font-black text-white">A</div>
          <p class="mt-5 text-xs font-extrabold uppercase tracking-[.25em] text-[#E45530]">All Solution Technologie · AST-Academy</p>
          <p v-if="valid" class="mt-10 text-sm font-bold uppercase tracking-[.22em] text-slate-500">Certificat de réussite</p>
          <h1 class="mt-4 font-serif text-3xl font-bold text-[#10192C] sm:text-5xl">{{ valid ? 'Attestation de fin de formation' : 'Certificat non valide' }}</h1>
          <p v-if="valid" class="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-600">Nous attestons que</p>
          <p v-if="valid" class="mt-3 text-3xl font-extrabold text-[#10192C] sm:text-4xl">{{ fullName }}</p>
          <p v-if="valid" class="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">a terminé avec succès la formation</p>
          <h2 v-if="valid" class="mt-3 text-2xl font-bold text-[#E45530] sm:text-3xl">{{ certificate.enrollment.course.title }}</h2>
          <p v-if="valid && certificate.enrollment.course.duration" class="mt-2 text-slate-500">Durée : {{ certificate.enrollment.course.duration }}</p>
          <div v-if="valid" class="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-8 border-t border-slate-200 pt-8">
            <div><p class="text-xs font-bold uppercase tracking-wider text-slate-500">Délivré le</p><p class="mt-1 font-semibold text-slate-900">{{ issuedDate }}</p></div>
            <div class="text-left"><p class="text-xs font-bold uppercase tracking-wider text-slate-500">Référence unique</p><p class="mt-1 font-mono font-bold text-slate-900">{{ certificate.code }}</p></div>
          </div>
          <div v-if="valid" class="mt-8 flex flex-col items-center justify-center gap-2"><img :src="qrUrl" alt="QR code pour vérifier la validité de ce certificat" width="132" height="132" class="h-[132px] w-[132px] rounded-xl border border-slate-200 bg-white p-2"><p class="text-xs text-slate-500">Scannez pour vérifier ce certificat</p></div>
          <p v-else class="mt-6 rounded-xl bg-red-50 p-4 font-semibold text-red-800">Ce certificat a été révoqué ou la formation n’est pas marquée comme terminée.</p>
          <p class="mt-8 text-xs text-slate-500">La validité se vérifie sur ast-academy avec le code ci-dessus ou le QR code.</p>
        </div>
      </article>
    </div>
  </main>
</template>

<style>
@media print {
  @page { size: A4 landscape; margin: 10mm; }
  body { background: white !important; }
  header, footer { display: none !important; }
  .certificate { min-height: 180mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
</style>
