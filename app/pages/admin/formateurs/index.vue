<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })
useHead({ title: 'Formateurs - Administration' })

const { data, pending } = await useFetch('/api/admin/users')
const instructors = computed(() => (data.value?.users || []).filter((u: any) => u.role === 'INSTRUCTOR'))
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 pb-10 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-full">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">Formateurs</h1>
        <NuxtLink to="/admin" class="btn-secondary">← Tableau de bord</NuxtLink>
      </div>
      <div v-if="pending" class="card p-10 text-center text-slate-500">Chargement…</div>
      <div v-else class="card overflow-hidden">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50"><tr>
            <th class="px-6 py-3 text-left">Formateur</th>
            <th class="px-6 py-3 text-left">Email</th>
            <th class="px-6 py-3 text-left">Statut</th>
            <th class="px-6 py-3 text-left">Formations</th>
          </tr></thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="u in instructors" :key="u.id">
              <td class="px-6 py-4">{{ u.firstName }} {{ u.lastName }}</td>
              <td class="px-6 py-4">{{ u.email }}</td>
              <td class="px-6 py-4">{{ u.isActive ? 'Actif' : 'Inactif' }}</td>
              <td class="px-6 py-4">{{ u._count?.coursesTaught || 0 }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!instructors.length" class="p-8 text-center text-slate-500">Aucun formateur.</div>
      </div>
    </div>
  </div>
</template>
