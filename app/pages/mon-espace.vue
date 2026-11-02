<script setup lang="ts">
interface Enrollment {
  id: string
  status: 'ACTIVE' | 'COMPLETED'
  createdAt: string
  certificate: { code: string; issuedAt: string; revokedAt: string | null } | null
  course: {
    id: string
    slug: string
    title: string
    category: string
    duration: string | null
    level: string | null
    price: number
    description: string | null
  }
}

interface Receipt {
  id: string
  pdfUrl: string
  amount: number
  currency: string
  createdAt: string
  payment: {
    id: string
    status: string
    fedapayId: string | null
    course: { id: string; title: string; slug: string } | null
  }
}

useHead({ title: 'Mon espace – AST-Academy' })
definePageMeta({ layout: 'default' })

const { user, fetchMe } = useAuth()
const enrollments = ref<Enrollment[]>([])
const receipts = ref<Receipt[]>([])
const pending = ref(true)
const error = ref('')
const activeReceipt = ref<string | null>(null)
const money = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' FCFA'

onMounted(async () => {
  if (!user.value) await fetchMe()
  if (!user.value) {
    await navigateTo('/auth/login?redirect=/mon-espace')
    return
  }

  if (user.value.role === 'ADMIN') {
    await navigateTo('/admin', { replace: true })
    return
  }
  if (user.value.role === 'INSTRUCTOR') {
    await navigateTo('/formateur', { replace: true })
    return
  }

  try {
    const [enrResult, recResult] = await Promise.all([
      $fetch<{ enrollments: Enrollment[] }>('/api/enrollments/me'),
      $fetch<{ receipts: Receipt[] }>('/api/payments/receipts')
    ])
    enrollments.value = enrResult.enrollments
    receipts.value = recResult.receipts
  } catch {
    error.value = 'Impossible de charger votre espace. Réessayez dans un instant.'
  } finally {
    pending.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-10">
    <div class="mx-auto w-full max-w-full px-4 sm:px-6 lg:px-8">
      <div class="mb-10">
        <span class="badge mb-4">VOTRE ESPACE D’APPRENTISSAGE</span>
        <h1 class="section-title">Bonjour<span v-if="user?.firstName">, {{ user.firstName }}</span> 👋</h1>
        <p class="mt-3 text-slate-600">Retrouvez ici vos formations, vos inscriptions et vos reçus de paiement.</p>
      </div>

      <div v-if="pending" class="py-16 text-center text-slate-500" role="status">Chargement de votre espace…</div>
      <div v-else-if="error" class="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-slate-700">
        <p>{{ error }}</p>
      </div>

      <!-- Mes formations -->
      <div v-else-if="!enrollments.length && !receipts.length" class="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
        <h2 class="text-xl font-bold">Votre premier parcours vous attend</h2>
        <p class="mx-auto mt-2 max-w-lg text-slate-600">Explorez le catalogue et choisissez une formation pour commencer à développer vos compétences.</p>
        <NuxtLink to="/formations" class="btn-primary mt-6 !rounded-full">Explorer les formations</NuxtLink>
      </div>

      <div v-else>
        <!-- Indicateurs clés -->
        <section class="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article class="card p-5"><p class="text-sm text-slate-500">Formations en cours</p><p class="mt-2 text-2xl font-extrabold">{{ enrollments.filter(e => e.status === 'ACTIVE').length }}</p></article>
          <article class="card p-5"><p class="text-sm text-slate-500">Formations terminées</p><p class="mt-2 text-2xl font-extrabold">{{ enrollments.filter(e => e.status === 'COMPLETED').length }}</p></article>
          <article class="card p-5"><p class="text-sm text-slate-500">Certificats obtenus</p><p class="mt-2 text-2xl font-extrabold">{{ enrollments.filter(e => e.certificate && !e.certificate.revokedAt).length }}</p></article>
          <article class="card p-5"><p class="text-sm text-slate-500">Reçus de paiement</p><p class="mt-2 text-2xl font-extrabold">{{ receipts.length }}</p></article>
        </section>
        <div v-if="enrollments.length" class="mb-12">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-slate-900">Mes formations</h2>
            <NuxtLink to="/formations" class="text-sm font-semibold text-brand-700 hover:text-brand-900">Voir le catalogue <span aria-hidden="true">→</span></NuxtLink>
          </div>
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <article v-for="enrollment in enrollments" :key="enrollment.id" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div class="mb-4 flex items-center justify-between gap-3">
                <span class="badge">{{ enrollment.course.category }}</span>
                <span class="text-xs font-semibold" :class="enrollment.status === 'COMPLETED' ? 'text-brand-700' : 'text-slate-500'">{{ enrollment.status === 'COMPLETED' ? 'Terminée' : 'En cours' }}</span>
              </div>
              <h2 class="text-xl font-bold">{{ enrollment.course.title }}</h2>
              <p class="mt-2 line-clamp-3 leading-relaxed text-slate-600">{{ enrollment.course.description }}</p>
              <NuxtLink v-if="enrollment.certificate && !enrollment.certificate.revokedAt" :to="`/certificats/${enrollment.certificate.code}`" class="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-sm font-bold text-brand-800 hover:bg-brand-100">
                <span aria-hidden="true">✦</span> Télécharger mon certificat
              </NuxtLink>
              <NuxtLink :to="`/apprentissage/${enrollment.course.slug}`" class="mt-6 inline-flex items-center gap-2 font-semibold text-brand-700 hover:text-brand-900">Ouvrir la formation <span aria-hidden="true">→</span></NuxtLink>
            </article>
          </div>
        </div>

        <!-- Mes reçus -->
        <div v-if="receipts.length" class="mb-12">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-slate-900">Mes reçus de paiement</h2>
            <p class="text-sm text-slate-500">Téléchargez vos quittances à tout moment.</p>
          </div>
          <div class="divide-y divide-slate-100">
            <article v-for="receipt in receipts" :key="receipt.id" class="p-6">
              <div class="flex flex-wrap items-center justify-between gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0">
                  <p class="font-bold text-slate-900">{{ receipt.payment.course?.title || 'Paiement' }}</p>
                  <p class="text-sm text-slate-500">
                    Reçu n° {{ receipt.id }} · {{ new Date(receipt.createdAt).toLocaleDateString('fr-FR') }}
                    <span v-if="receipt.payment.fedapayId" class="text-xs text-slate-400 ml-2">· Réf. FedaPay {{ receipt.payment.fedapayId }}</span>
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-slate-900">{{ money(receipt.amount) }}</p>
                  <p class="text-xs text-slate-500 uppercase">{{ receipt.payment.status }}</p>
                </div>
                <button
                  type="button"
                  class="btn-secondary px-4 py-2.5 text-sm"
                  @click="activeReceipt = receipt.pdfUrl"
                >
                  Voir / Télécharger
                </button>
              </div>
            </article>
          </div>
        </div>

        <div v-else-if="enrollments.length" class="mb-12 rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p class="text-slate-500">Aucun reçu de paiement pour le moment.</p>
        </div>
      </div>
    </div>
  <!-- Modal de visualisation du reçu -->
  <div
    v-if="activeReceipt"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    @click.self="activeReceipt = null"
  >
    <div class="relative w-full max-w-4xl h-[85vh] rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
      <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h2 class="font-bold text-slate-900">Reçu de paiement</h2>
        <div class="flex gap-2">
          <a
            :href="activeReceipt + (activeReceipt.includes('?') ? '&' : '?') + 'download=1'"
            download
            class="btn-primary px-3 py-1.5 text-sm"
          >
            Télécharger
          </a>
          <button type="button" class="btn-secondary px-3 py-1.5 text-sm" @click="activeReceipt = null">
            Fermer
          </button>
        </div>
      </div>
      <iframe :src="activeReceipt" class="w-full flex-1" frameborder="0" />
    </div>
  </div>
  </div>
</template>

