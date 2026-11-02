<script setup lang="ts">
const { user, isLoggedIn, fetchMe } = useAuth()
onMounted(() => { if (!user.value) void fetchMe() })

const { data, pending } = await useFetch(() => isLoggedIn.value ? '/api/me/certificates' : null, { immediate: isLoggedIn.value })

const code = ref('')
function goToCert() {
  const c = code.value.trim().toUpperCase()
  if (!c) return
  navigateTo(`/certificats/${encodeURIComponent(c)}`)
}
</script>

<template>
  <section class="min-h-[70vh] bg-slate-50 pb-10 py-6">
    <div class="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900">Mes certificats</h1>
        <p class="mt-1 text-slate-600">Consultez et téléchargez vos certificats.</p>
      </div>

      <div v-if="isLoggedIn">
        <div v-if="pending" class="py-12 text-center text-slate-500">Chargement...</div>
        <div v-else-if="!data?.certificates?.length" class="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p class="text-slate-600">Aucun certificat pour le moment.</p>
          <NuxtLink to="/mon-espace" class="btn-primary mt-4 inline-flex">Retour à mon espace</NuxtLink>
        </div>
        <div v-else class="grid gap-4">
          <NuxtLink
            v-for="cert in data.certificates"
            :key="cert.id"
            :to="`/certificats/${cert.code}`"
            class="card p-5 flex items-center justify-between hover:border-brand-300 transition"
          >
            <div>
              <p class="font-semibold text-slate-900">{{ cert.course?.title }}</p>
              <p class="text-sm text-slate-500">Code : {{ cert.code }} · Délivré le {{ new Date(cert.issuedAt).toLocaleDateString('fr-FR') }}</p>
            </div>
            <span class="text-brand-700 font-medium">Voir →</span>
          </NuxtLink>
        </div>
      </div>

      <div v-else class="card p-6">
        <h2 class="text-lg font-semibold text-slate-900">Vérifier un certificat</h2>
        <p class="mt-1 text-sm text-slate-600">Entrez le code du certificat pour le vérifier.</p>
        <form class="mt-4 flex gap-2" @submit.prevent="goToCert">
          <input v-model="code" type="text" placeholder="CERT-..." class="form-input flex-1" />
          <button type="submit" class="btn-primary">Vérifier</button>
        </form>
        <p class="mt-4 text-sm text-slate-500">Ou <NuxtLink to="/auth/login" class="text-brand-700 hover:underline">connectez-vous</NuxtLink> pour voir vos certificats.</p>
      </div>
    </div>
  </section>
</template>

