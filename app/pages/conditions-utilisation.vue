<script setup lang="ts">
useHead({ title: 'Conditions d’utilisation – AST-Academy' })

const sections = [
  {
    title: 'Compte personnel',
    text: 'La création d’un compte permet d’utiliser les fonctions réservées aux apprenants. Les informations fournies doivent être exactes. Gardez vos moyens de connexion confidentiels et prévenez AST-Academy si vous pensez qu’une autre personne utilise votre compte.'
  },
  {
    title: 'Formations et inscriptions',
    text: 'Les informations et le prix affichés sur la fiche d’une formation décrivent l’offre au moment de la consultation. Une inscription payante est activée après confirmation de la transaction par le prestataire de paiement.'
  },
  {
    title: 'Paiements',
    text: 'Les paiements sont traités par FedaPay selon les moyens proposés sur sa page de paiement. Ne relancez pas un paiement déjà effectué tant que son statut est en cours de vérification. En cas de question sur une transaction, contactez AST-Academy avec sa référence.'
  },
  {
    title: 'Utilisation des contenus',
    text: 'Les cours, supports, visuels et autres contenus présents sur la plateforme sont destinés à votre apprentissage personnel. Ils ne peuvent pas être copiés, revendus ou redistribués sans autorisation de leurs ayants droit.'
  },
  {
    title: 'Utilisation responsable',
    text: 'N’utilisez pas la plateforme pour perturber son fonctionnement, accéder au compte d’une autre personne ou publier un contenu illégal. AST-Academy peut limiter l’accès en cas d’usage abusif ou de risque pour la sécurité du service.'
  },
  {
    title: 'Questions sur une commande',
    text: 'Pour toute question concernant une inscription, un paiement ou les conditions applicables à votre commande, contactez l’équipe avant de procéder au paiement.'
  }
]
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <header class="mb-8">
        <span class="badge mb-4">CADRE D’UTILISATION</span>
        <h1 class="section-title">Conditions <span class="text-emerald-700">d’utilisation</span></h1>
        <p class="mt-3 max-w-2xl leading-relaxed text-slate-600">Les règles essentielles pour utiliser AST-Academy, gérer votre compte et vous inscrire à une formation.</p>
      </header>

      <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <section v-for="section in sections" :key="section.title" class="border-b border-slate-100 p-6 last:border-0 sm:p-8">
          <h2 class="text-xl font-bold text-slate-900">{{ section.title }}</h2>
          <p class="mt-3 leading-7 text-slate-600">{{ section.text }}</p>
        </section>
      </div>

      <p class="mt-5 text-sm text-slate-500">Ces conditions ne remplacent pas les informations détaillées qui doivent accompagner chaque formation ou offre. <NuxtLink to="/contact" class="font-semibold text-emerald-700 underline underline-offset-4">Contacter AST-Academy</NuxtLink>.</p>
    </div>
  </main>
</template>
