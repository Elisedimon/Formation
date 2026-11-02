<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'instructor'], layout: 'default' })

useHead({ title: 'Mes revenus – AST-Academy' })

const { user, fetchMe } = useAuth()
onMounted(async () => { if (!user.value) await fetchMe() })

const { data, pending, error } = await useFetch<{
  totalRevenue: number
  pendingRevenue: number
  paidRevenue: number
  monthlyRevenue: Array<{ month: string; revenue: number; count: number }>
  recentPayments: Array<{ id: string; learner: string; course: string; amount: number; date: string; status: string }>
}>('/api/instructor/revenue', { key: 'instructor-revenue' })

const money = (v: number) => new Intl.NumberFormat('fr-FR').format(v) + ' FCFA'
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-full">
      <div class="mb-8">
        <span class="badge mb-2">REVENUS</span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-950">Mes revenus</h1>
        <p class="text-slate-600">Suivez vos gains générés par vos formations.</p>
      </div>

      <!-- États -->
      <div v-if="pending" class="card p-16 text-center text-slate-500">Chargement de vos revenus…</div>
      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">{{ error }}</div>

      <div v-else class="space-y-8">
        <!-- KPIs -->
        <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article class="card p-5">
            <p class="text-sm text-slate-500">Total généré</p>
            <p class="mt-2 text-2xl font-extrabold text-slate-900">{{ money(data.totalRevenue) }}</p>
          </article>
          <article class="card p-5">
            <p class="text-sm text-slate-500">En attente</p>
            <p class="mt-2 text-2xl font-extrabold text-amber-800">{{ money(data.pendingRevenue) }}</p>
          </article>
          <article class="card p-5">
            <p class="text-sm text-slate-500">Payé</p>
            <p class="mt-2 text-2xl font-extrabold text-brand-800">{{ money(data.paidRevenue) }}</p>
          </article>
          <article class="card p-5">
            <p class="text-sm text-slate-500">Formations payantes</p>
            <p class="mt-2 text-2xl font-extrabold text-slate-900">{{ data.monthlyRevenue.length }}</p>
          </article>
        </section>

        <!-- Graphique mensuel -->
        <section class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-slate-900">Revenus par mois</h2>
          </div>
          <div class="flex items-end gap-2 h-64">
            <div v-for="(m, idx) in data.monthlyRevenue" :key="idx" class="flex-1 flex flex-col items-center gap-1">
              <div class="h-32 bg-slate-200 rounded-t-lg overflow-hidden flex flex-col justify-end" :style="{ height: (m.revenue / Math.max(...data.monthlyRevenue.map(r => r.revenue)) * 100) + '%' }">
                <div class="h-full bg-brand-600" :style="{ height: '100%' }"></div>
              </div>
              <span class="text-[10px] text-slate-500">{{ m.month }}</span>
              <span class="text-xs font-bold text-slate-900">{{ money(m.revenue) }}</span>
            </div>
          </div>
        </section>

        <!-- Paiements récents -->
        <section class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-slate-900">Paiements récents</h2>
          </div>
          <div v-if="data.recentPayments.length" class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Apprenant</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Formation</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Montant</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                <tr v-for="p in data.recentPayments" :key="p.id" class="hover:bg-slate-50 transition">
                  <td class="px-6 py-4 font-medium text-slate-900">{{ p.learner }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ p.course }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ money(p.amount) }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ new Date(p.date).toLocaleDateString('fr-FR') }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs font-medium rounded-full" :class="p.status === 'APPROVED' ? 'bg-brand-100 text-brand-800' : p.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'">
                      {{ p.status === 'APPROVED' ? 'Approuvé' : p.status === 'PENDING' ? 'En attente' : 'Rejeté' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="p-12 text-center">
            <p class="text-slate-500">Aucun paiement pour le moment.</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
