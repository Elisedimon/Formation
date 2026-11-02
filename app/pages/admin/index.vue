<script setup lang="ts">
useHead({ title: 'Administration – AST-Academy' })
definePageMeta({ middleware: ['auth', 'admin'], layout: 'default' })

const { user, fetchMe } = useAuth()

interface Overview {
  stats: { users: number; courses: number; enrollments: number; revenue: number; approvedPayments: number }
  latestUsers: any[]
  latestPayments: any[]
  courses: any[]
  instructors: any[]
}

const overview = ref<Overview | null>(null)
const payments = ref<any[]>([])
const pending = ref(true)
const error = ref('')

onMounted(async () => {
  if (!user.value) await fetchMe()
  try {
    const [ov, pay] = await Promise.all([
      $fetch<Overview>('/api/admin/overview'),
      $fetch<{ payments: any[] }>('/api/admin/payments')
    ])
    overview.value = ov
    payments.value = pay.payments || []
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Erreur de chargement.'
  } finally {
    pending.value = false
  }
})

const stats = computed(() => overview.value?.stats || { users: 0, courses: 0, enrollments: 0, revenue: 0, approvedPayments: 0 })

// Revenue by month
const revenueByMonth = computed(() => {
  const map: Record<string, number> = {}
  for (const p of payments.value) {
    if (p.status !== 'APPROVED') continue
    const d = new Date(p.createdAt)
    const key = d.toLocaleDateString('fr-FR', { month: 'short' })
    map[key] = (map[key] || 0) + p.amount
  }
  return Object.entries(map).slice(-8)
})
const maxRevenue = computed(() => Math.max(1, ...revenueByMonth.value.map(([, v]) => v)))

// Payment status
const paymentStatusCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const p of payments.value) counts[p.status] = (counts[p.status] || 0) + 1
  return counts
})
const paymentStatusTotal = computed(() => Math.max(1, payments.value.length))

// Top courses by enrollments
const topCourses = computed(() => {
  const list = [...(overview.value?.courses || [])]
    .sort((a, b) => (b._count?.enrollments || 0) - (a._count?.enrollments || 0))
    .slice(0, 6)
  return list
})
const maxCourseEnrollments = computed(() => Math.max(1, ...topCourses.value.map(c => c._count?.enrollments || 0)))

// Users by role
const usersByRole = computed(() => {
  const counts: Record<string, number> = { STUDENT: 0, INSTRUCTOR: 0, ADMIN: 0 }
  for (const u of overview.value?.latestUsers || []) counts[u.role] = (counts[u.role] || 0) + 1
  return counts
})
</script>

<template>
  <div class="bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-full">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p class="text-slate-600">Vue analytique de la plateforme</p>
      </div>

      <div v-if="pending" class="card p-10 text-center text-slate-500">Chargement…</div>
      <div v-else-if="error" class="card p-6 text-red-700">{{ error }}</div>
      <div v-else class="space-y-6">
        <!-- KPI row -->
        <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div class="card p-4"><p class="text-xs text-slate-500">Utilisateurs</p><p class="text-2xl font-bold text-slate-900">{{ stats.users }}</p></div>
          <div class="card p-4"><p class="text-xs text-slate-500">Cours</p><p class="text-2xl font-bold text-slate-900">{{ stats.courses }}</p></div>
          <div class="card p-4"><p class="text-xs text-slate-500">Inscriptions</p><p class="text-2xl font-bold text-slate-900">{{ stats.enrollments }}</p></div>
          <div class="card p-4"><p class="text-xs text-slate-500">Paiements approuvés</p><p class="text-2xl font-bold text-slate-900">{{ stats.approvedPayments }}</p></div>
          <div class="card p-4"><p class="text-xs text-slate-500">Revenus</p><p class="text-2xl font-bold text-slate-900">{{ new Intl.NumberFormat('fr-FR').format(stats.revenue) }} XOF</p></div>
        </div>

        <!-- Revenue chart -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">Revenus par mois (approuvés)</h2>
          <div class="flex items-end gap-2 h-48">
            <div v-for="[m, v] in revenueByMonth" :key="m" class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full bg-brand-500 rounded-t" :style="{ height: (v / maxRevenue * 100) + '%' }"></div>
              <span class="text-xs text-slate-500">{{ m }}</span>
            </div>
          </div>
        </div>

        <!-- Payment status + top courses -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-slate-900 mb-4">Statut des paiements</h2>
            <div class="space-y-2">
              <div v-for="(count, status) in paymentStatusCounts" :key="status">
                <div class="flex justify-between text-sm"><span>{{ status }}</span><span>{{ count }}</span></div>
                <div class="h-2 rounded-full bg-slate-100"><div class="h-2 rounded-full bg-brand-500" :style="{ width: (count / paymentStatusTotal * 100) + '%' }"></div></div>
              </div>
            </div>
          </div>

          <div class="card p-6">
            <h2 class="text-lg font-semibold text-slate-900 mb-4">Top cours par inscriptions</h2>
            <div class="space-y-2">
              <div v-for="c in topCourses" :key="c.id">
                <div class="flex justify-between text-sm"><span class="truncate">{{ c.title }}</span><span>{{ c._count?.enrollments || 0 }}</span></div>
                <div class="h-2 rounded-full bg-slate-100">                <div class="h-2 rounded-full bg-brand-500" :style="{ width: ((c._count?.enrollments || 0) / maxCourseEnrollments * 100) + '%' }"></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users by role -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-slate-900 mb-4">Utilisateurs récents par rôle</h2>
          <div class="flex gap-6">
            <div v-for="(count, role) in usersByRole" :key="role" class="flex-1 text-center">
              <div class="mx-auto mb-2 h-24 w-24 rounded-full border-8 border-brand-500 flex items-center justify-center text-xl font-bold text-slate-900" :style="{ borderColor: role === 'ADMIN' ? '#10192c' : role === 'INSTRUCTOR' ? '#e45530' : '#94a3b8' }">{{ count }}</div>
              <p class="text-sm text-slate-600">{{ role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>