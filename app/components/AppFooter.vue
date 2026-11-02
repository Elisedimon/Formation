<script setup lang="ts">
const config = useRuntimeConfig()
const year = new Date().getFullYear()
const whatsappNumber = computed(() => String(config.public.whatsappNumber || '').replace(/\D/g, ''))
const wa = computed(() => `https://wa.me/${whatsappNumber.value}`)
</script>

<template>
  <footer class="bg-white border-t border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
        <!-- Brand -->
        <div class="md:col-span-1">
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-700 to-brand-800 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-brand/25">
              A
            </div>
            <span class="font-bold text-slate-900 text-lg">AST-Academy</span>
          </div>
          <p class="text-slate-500 text-sm leading-relaxed mb-5">
            L'academy des bâtisseurs technologiques. Formations pratiques pour maîtriser les technologies de demain.
          </p>
          <a
            v-if="whatsappNumber"
            :href="wa"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 text-brand-700 hover:text-brand-900 text-sm font-semibold transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Nous contacter
          </a>
        </div>

        <div>
          <h4 class="font-semibold text-slate-900 mb-4">Formations</h4>
          <ul class="space-y-2.5 text-sm text-slate-500">
            <li><NuxtLink to="/formations" class="hover:text-brand-700 transition">Développement Web</NuxtLink></li>
            <li><NuxtLink to="/formations" class="hover:text-brand-700 transition">Data & IA</NuxtLink></li>
            <li><NuxtLink to="/formations" class="hover:text-brand-700 transition">Cloud & DevOps</NuxtLink></li>
            <li><NuxtLink to="/formations" class="hover:text-brand-700 transition">Cybersécurité</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold text-slate-900 mb-4">Entreprise</h4>
          <ul class="space-y-2.5 text-sm text-slate-500">
            <li><NuxtLink to="/a-propos" class="hover:text-brand-700 transition">À propos</NuxtLink></li>
            <li><NuxtLink to="/contact" class="hover:text-brand-700 transition">Contact</NuxtLink></li>
            <li><NuxtLink to="/parcours" class="hover:text-brand-700 transition">Parcours</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold text-slate-900 mb-4">Informations légales</h4>
          <ul class="space-y-2.5 text-sm text-slate-500">
            <li><NuxtLink to="/confidentialite" class="hover:text-brand-700 transition">Politique de confidentialité</NuxtLink></li>
            <li><NuxtLink to="/conditions-utilisation" class="hover:text-brand-700 transition">Conditions d’utilisation</NuxtLink></li>
            <li><NuxtLink to="/mentions-legales" class="hover:text-brand-700 transition">Mentions légales</NuxtLink></li>
          </ul>
        </div>
      </div>

      <div class="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        <p>© {{ year }} AST-Academy – All Solution Technologie. Tous droits réservés.</p>
        <p class="text-xs flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Paiements sécurisés via FedaPay
        </p>
      </div>
    </div>
  </footer>
</template>
