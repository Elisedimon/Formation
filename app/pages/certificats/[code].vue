<script setup lang="ts">
import { pickCourseIcon, ICONS } from '~/utils/courseIcon'

const route = useRoute()
const code = computed(() => String(route.params.code || '').toUpperCase())
const { data, pending, error } = await useFetch(() => `/api/certificates/${encodeURIComponent(code.value)}`)

const certificate = computed(() => data.value?.certificate as any)
const valid = computed(() => data.value?.valid === true)

const fullName = computed(() => {
  const u = certificate.value?.user
  return [u?.firstName, u?.lastName].filter(Boolean).join(' ') || 'Apprenant AST-Academy'
})
const courseTitle = computed(() => certificate.value?.enrollment?.course?.title || '')
const courseDuration = computed(() => certificate.value?.enrollment?.course?.duration || '')
const courseIcon = computed(() => certificate.value?.enrollment?.course?.icon || null)
const iconName = computed(() => pickCourseIcon(courseTitle.value, courseIcon.value))
const iconSvg = computed(() => ICONS[iconName.value])

const issuedDate = computed(() => {
  if (!certificate.value?.issuedAt) return ''
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'Africa/Porto-Novo' }).format(new Date(certificate.value.issuedAt))
})

const config = useRuntimeConfig()
const siteUrl = computed(() => String(config.public.appUrl || 'http://localhost:3000').replace(/\/$/, ''))
const qrUrl = computed(() => `${siteUrl.value}/api/certificates/${encodeURIComponent(code.value)}/qr`)

const scale = ref(1)
function updateScale() {
  if (typeof window === 'undefined') return
  const sheetWidthPx = 297 / 25.4 * 96
  const sheetHeightPx = 210 / 25.4 * 96
  const availableW = window.innerWidth - 32
  const availableH = window.innerHeight - 120
  scale.value = Math.min(1, availableW / sheetWidthPx, availableH / sheetHeightPx)
}
onMounted(() => { updateScale(); window.addEventListener('resize', updateScale) })
onBeforeUnmount(() => { if (typeof window !== 'undefined') window.removeEventListener('resize', updateScale) })

useHead(() => ({ title: certificate.value ? `Certificat de ${fullName.value} – AST-Academy` : 'Vérification du certificat – AST-Academy' }))
</script>

<template>
  <div class="cert-page min-h-screen bg-slate-200 px-4 py-8 print:min-h-0 print:bg-white print:p-0">
    <div v-if="pending" class="mx-auto max-w-4xl py-16 text-center text-slate-500">Vérification du certificat…</div>
    <div v-else-if="error || !certificate" class="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-sm">
      <h1 class="text-2xl font-bold">Certificat introuvable</h1>
      <p class="mt-3 text-slate-600">Vérifiez le code ou le lien de validation.</p>
    </div>
    <div v-else class="mx-auto">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <NuxtLink to="/mon-espace" class="font-semibold text-slate-600 hover:text-slate-950">← Mon espace</NuxtLink>
        <button type="button" class="btn-primary" @click="printCertificate">Imprimer / Enregistrer en PDF</button>
      </div>

      <div class="sheet-wrapper mx-auto w-full max-w-[297mm] overflow-hidden" :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }">
        <div class="sheet relative mx-auto overflow-hidden" aria-label="Certificat de réussite">
        <!-- watermark -->
        <div class="watermark" aria-hidden="true">
          <svg viewBox="0 0 200 200" class="h-full w-full" fill="none" stroke="#C44224" stroke-width="2">
            <circle cx="100" cy="100" r="90" />
            <circle cx="100" cy="100" r="70" />
            <text x="100" y="135" text-anchor="middle" font-family="Georgia, serif" font-size="120" font-weight="700" fill="#C44224" stroke="none">A</text>
          </svg>
        </div>

        <!-- frame -->
        <div class="frame-outer"></div>
        <div class="frame-inner"></div>
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>

        <div class="content relative z-10 flex h-full flex-col items-center justify-center text-center px-[12mm]">
          <div class="logo mb-2 flex h-[13mm] w-[13mm] items-center justify-center rounded-[3mm] bg-gradient-to-br from-[#BF4024] to-[#AC3721] text-2xl font-bold text-white">A</div>
          <p class="text-[10pt] font-bold tracking-[0.3em] text-[#1C263B]">AST-ACADEMY</p>
          <p class="text-[7pt] font-bold tracking-[0.28em] text-[#C44224]">ALL SOLUTION TECHNOLOGIE</p>
          <p class="mt-1 text-[8pt] font-bold tracking-[0.34em] text-[#756B61]">CERTIFICAT DE RÉUSSITE</p>
          <h1 class="mt-3 font-serif text-[34pt] font-medium text-[#1C263B]">Attestation de fin de formation</h1>
          <div class="ornament my-3 flex items-center gap-2">
            <span class="h-px w-[18mm] bg-[#C44224]"></span>
            <span class="h-2 w-2 rotate-45 bg-[#C44224]"></span>
            <span class="h-px w-[18mm] bg-[#C44224]"></span>
          </div>
          <p class="text-[11pt] text-[#756B61]">Nous attestons que</p>
          <p class="mt-2 font-serif text-[34pt] font-bold italic text-[#1C263B] underline decoration-[#E2DDD5] underline-offset-8">{{ fullName }}</p>
          <p class="mt-3 text-[11pt] text-[#756B61]">a terminé avec succès la formation</p>

          <div class="medallion mt-4 flex h-[12mm] w-[12mm] items-center justify-center rounded-full border-[0.5mm] border-[#F3CFC3] bg-white text-[#C44224]">
            <svg viewBox="0 0 24 24" class="h-[6.5mm] w-[6.5mm]" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" v-html="iconSvg" role="img" :aria-label="iconName"></svg>
          </div>
          <h2 class="mt-2 text-[20pt] font-bold text-[#C44224]">{{ courseTitle }}</h2>
          <p v-if="courseDuration" class="mt-1 text-[11pt] text-[#756B61]">Durée : {{ courseDuration }}</p>

          <div class="mt-6 w-full border-t border-[#E2DDD5] pt-4">
            <div class="flex items-center justify-between gap-6">
              <div class="flex items-center gap-3">
                <img :src="qrUrl" alt="QR code" class="h-[21mm] w-[21mm] rounded-[2.5mm] border border-[#E2DDD5] bg-white p-1" />
                <div class="text-left">
                  <p class="text-[6.5pt] font-bold tracking-[0.2em] text-[#756B61]">RÉFÉRENCE UNIQUE</p>
                  <p class="font-mono text-[12pt] font-bold text-[#1C263B]">{{ certificate.code }}</p>
                  <p class="text-[7pt] text-[#756B61]">Scannez le QR code ou saisissez la référence sur la page de vérification d'AST-Academy.</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-[6.5pt] font-bold tracking-[0.2em] text-[#756B61]">DÉLIVRÉ LE</p>
                <p class="text-[13pt] font-bold text-[#1C263B]">{{ issuedDate }}</p>
              </div>
            </div>
          </div>

          <p v-if="!valid" class="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">Ce certificat a été révoqué ou la formation n'est pas terminée.</p>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@page { size: A4 landscape; margin: 0; }
.cert-page { }
.sheet {
  width: 297mm;
  height: 210mm;
  background: #FAF8F5;
}
.watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.08;
  pointer-events: none;
  z-index: 0;
}
.watermark svg { width: 118mm; height: 118mm; }
.frame-outer {
  position: absolute;
  inset: 0;
  border: 2mm solid #1C263B;
  pointer-events: none;
  z-index: 2;
}
.frame-inner {
  position: absolute;
  inset: 4mm;
  border: 0.3mm solid #F3CFC3;
  pointer-events: none;
  z-index: 2;
}
.corner {
  position: absolute;
  width: 8mm;
  height: 8mm;
  border: 0.7mm solid #C44224;
  z-index: 3;
  pointer-events: none;
}
.corner-tl { top: 4mm; left: 4mm; border-right: none; border-bottom: none; }
.corner-tr { top: 4mm; right: 4mm; border-left: none; border-bottom: none; }
.corner-bl { bottom: 4mm; left: 4mm; border-right: none; border-top: none; }
.corner-br { bottom: 4mm; right: 4mm; border-left: none; border-top: none; }

* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
@media print {
  .print\:hidden { display: none !important; }
  .sheet { box-shadow: none; }
}
@media (max-width: 1024px) {
  .sheet-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 160px);
  overflow: hidden;
}
}
</style>