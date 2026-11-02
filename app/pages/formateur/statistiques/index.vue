<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'instructor'], layout: 'default' })

useHead({ title: 'Mes statistiques – AST-Academy' })

const { user, fetchMe } = useAuth()
onMounted(async () => { if (!user.value) await fetchMe() })

const { data, pending, error } = await useFetch<{
  stats: { totalCourses: number; totalLearners: number; totalRevenue: number; avgRating: number }
  monthlyRevenue: Array<{ month: string; revenue: number }>
  courseStats: Array<{ title: string; enrollments: number; revenue: number; completionRate: number }>
}>('/api/instructor/stats', { key: 'instructor-stats' })

const money = (v: number) => new Intl.NumberFormat('fr-FR').format(v) + ' FCFA'
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-full">
      <div class="mb-8">
        <span class="badge mb-2">STATISTIQUES</span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-950">Mes statistiques</h1>
        <p class="text-slate-600">Suivez la performance de vos formations et apprenants.</p>
      </div>

      <!-- États -->
      <div v-if="pending" class="card p-16 text-center text-slate-500">Chargement des statistiques…</div>
      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">{{ error }}</div>

      <div v-else class="space-y-8">
        <!-- KPIs -->
        <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article class="card p-5">
            <p class="text-sm text-slate-500">Formations</p>
            <p class="mt-2 text-2xl font-extrabold text-slate-900">{{ data.stats.totalCourses }}</p>
          </article>
          <article class="card p-5">
            <p class="text-sm text-slate-500">Apprenants</p>
            <p class="mt-2 text-2xl font-extrabold text-slate-900">{{ data.stats.totalLearners }}</p>
          </article>
          <article class="card p-5">
            <p class="text-sm text-slate-500">Revenus</p>
            <p class="mt-2 text-2xl font-extrabold text-slate-900">{{ money(data.stats.totalRevenue) }}</p>
          </article>
          <article class="card p-5">
            <p class="text-sm text-slate-500">Note moyenne</p>
            <p class="mt-2 text-2xl font-extrabold text-slate-900">{{ data.stats.avgRating.toFixed(1) }} / 5</p>
          </article>
        </section>

        <!-- Revenus mensuels -->
        <section class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-slate-900">Revenus mensuels</h2>
          </div>
          <div class="flex items-end gap-2 h-64">
            <div v-for="(m, idx) in data.monthlyRevenue" :key="idx" class="flex-1 flex flex-col items-center gap-1">
              <div class="h-24 bg-slate-200 rounded-t-lg overflow-hidden flex flex-col justify-end" :style="{ height: (m.revenue / Math.max(...data.monthlyRevenue.map(r => r.revenue)) * 100) + '%' }">
                <div class="h-full bg-brand-600" :style="{ height: '100%' }"></div>
              </div>
              <span class="text-[10px] text-slate-500">{{ m.month }}</span>
              <span class="text-xs font-bold text-slate-900">{{ money(m.revenue) }}</span>
            </div>
          </div>
        </section>

        <!-- Par cours -->
        <section class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-slate-900">Performance par formation</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Formation</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Inscriptions</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Revenus</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Taux de complétion</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                <tr v-for="c in data.courseStats" :key="c.title" class="hover:bg-slate-50 transition">
                  <td class="px-6 py-4 font-medium text-slate-900">{{ c.title }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ c.enrollments }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ money(c.revenue) }}</td>
                  <td class="px-6 py-4">
                    <div class="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div class="h-full bg-brand-600" :style="{ width: c.completionRate + '%' }"></div>
                    </div>
                    <span class="text-xs font-medium text-slate-900 ml-2">{{ c.completionRate }}%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
