<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
import AppTopbar from '~/components/AppTopbar.vue'
import AppDashboardFooter from '~/components/AppDashboardFooter.vue'
import AppNavbar from '~/components/AppNavbar.vue'
import AppFooter from '~/components/AppFooter.vue'

const { isLoggedIn, isInitialized, fetchMe } = useAuth()

// Sécurité : si le plugin serveur n'a pas tourné (SPA, ou SSR désactivé),
// on vérifie la session une seule fois au montage.
onMounted(() => {
  if (!isInitialized.value) {
    fetchMe()
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- 1) En attente de vérification de session -->
    <template v-if="!isInitialized">
      <div class="flex min-h-screen w-full items-center justify-center">
        <span class="text-slate-500">Chargement…</span>
      </div>
    </template>

    <!-- 2) Connecté -->
    <div v-else-if="isLoggedIn" class="md:flex">
      <AppSidebar />
      <div class="flex min-h-screen flex-1 flex-col md:ml-64">
        <AppTopbar />
        <main class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <slot />
        </main>
        <AppDashboardFooter />
      </div>
    </div>

    <!-- 3) Non connecté -->
    <div v-else class="flex flex-col">
      <AppNavbar />
      <main class="flex-1 pt-16 md:pt-[72px]">
        <slot />
      </main>
      <AppFooter />
    </div>
  </div>
</template>