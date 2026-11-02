<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })
useHead({ title: 'Paiements - Administration' })

const search = ref('')
const { data, pending } = await useFetch('/api/admin/payments')
const payments = computed(() => data.value?.payments || [])
const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return payments.value
  return payments.value.filter((p: any) =>
    (p.user?.firstName || '').toLowerCase().includes(q) ||
    (p.user?.lastName || '').toLowerCase().includes(q) ||
    (p.user?.email || '').toLowerCase().includes(q) ||
    (p.course?.title || '').toLowerCase().includes(q) ||
    (p.id || '').toLowerCase().includes(q)
  )
})
const exportPdf = () => window.print()
</script>

<template>
  <div class="bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-full">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-2xl font-bold text-slate-900">Paiements</h1>
        <div class="flex gap-2">
          <input v-model="search" type="text" placeholder="Rechercher…" class="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <button @click="exportPdf" class="btn-secondary">Exporter PDF</button>
          <NuxtLink to="/admin" class="btn-secondary">← Tableau de bord</NuxtLink>
        </div>
      </div>
      <div v-if="pending" class="card p-10 text-center text-slate-500">Chargement…</div>
      <div v-else class="card overflow-hidden">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50"><tr>
            <th class="px-6 py-3 text-left">Client</th>
            <th class="px-6 py-3 text-left">Formation</th>
            <th class="px-6 py-3 text-left">Montant</th>
            <th class="px-6 py-3 text-left">Statut</th>
            <th class="px-6 py-3 text-left">Date</th>
          </tr></thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="p in filtered" :key="p.id">
              <td class="px-6 py-4">{{ p.user?.firstName }} {{ p.user?.lastName }}<br><span class="text-xs text-slate-500">{{ p.user?.email }}</span></td>
              <td class="px-6 py-4">{{ p.course?.title }}</td>
              <td class="px-6 py-4">{{ p.amount }} {{ p.currency }}</td>
              <td class="px-6 py-4">{{ p.status }}</td>
              <td class="px-6 py-4">{{ new Date(p.createdAt).toLocaleDateString('fr-FR') }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!filtered.length" class="p-8 text-center text-slate-500">Aucun paiement.</div>
      </div>
    </div>
  </div>
</template>