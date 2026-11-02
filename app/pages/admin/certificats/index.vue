<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })
useHead({ title: 'Certificats - Administration' })

const { data, pending } = await useFetch('/api/admin/certificates')
const certificates = computed(() => data.value?.certificates || [])
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 pb-10 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-full">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-900">Certificats</h1>
        <NuxtLink to="/admin" class="btn-secondary">← Tableau de bord</NuxtLink>
      </div>
      <div v-if="pending" class="card p-10 text-center text-slate-500">Chargement…</div>
      <div v-else class="card overflow-hidden">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50">          <tr>
            <th class="px-6 py-3 text-left">Apprenant</th>
            <th class="px-6 py-3 text-left">Formation</th>
            <th class="px-6 py-3 text-left">Code</th>
            <th class="px-6 py-3 text-left">Délivré le</th>
            <th class="px-6 py-3 text-left">Actions</th>
          </tr></thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="c in certificates" :key="c.id">
              <td class="px-6 py-4">{{ c.user?.firstName }} {{ c.user?.lastName }}<br><span class="text-xs text-slate-500">{{ c.user?.email }}</span></td>
              <td class="px-6 py-4">{{ c.enrollment?.course?.title }}</td>
              <td class="px-6 py-4">{{ c.code }}</td>
              <td class="px-6 py-4">{{ new Date(c.issuedAt).toLocaleDateString('fr-FR') }}</td>
              <td class="px-6 py-4">
                <NuxtLink :to="`/certificats/${c.code}`" class="text-slate-500 hover:text-brand-700" title="Voir">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!certificates.length" class="p-8 text-center text-slate-500">Aucun certificat.</div>
      </div>
    </div>
  </div>
</template>
