<script setup lang="ts">
useHead({ title: 'Confidentialité – AST-Academy' })

const sections = [
  {
    title: 'Les informations utilisées',
    text: 'Lors de la création du compte, AST-Academy reçoit votre prénom, votre nom et votre adresse e-mail. Le mot de passe est haché avec bcrypt et n’est pas conservé en clair. La plateforme conserve aussi les inscriptions aux formations et les références, montants et statuts de paiement nécessaires au suivi des commandes.'
  },
  {
    title: 'Paiements',
    text: 'Le paiement est effectué sur la page sécurisée de FedaPay. AST-Academy lui transmet les informations nécessaires à la transaction, notamment votre nom, votre e-mail et le montant. Les données de carte ou de Mobile Money saisies sur la page de paiement sont traitées par FedaPay.'
  },
  {
    title: 'Cookies de connexion',
    text: 'Un cookie technique nommé ast_token maintient votre session. Il est protégé contre l’accès JavaScript, limité au site et expire après sept jours. Il est nécessaire à la connexion et à l’accès aux fonctions réservées aux membres.'
  },
  {
    title: 'Utilisation et conservation',
    text: 'Les données servent à créer et sécuriser votre compte, gérer vos inscriptions, traiter les paiements et répondre à vos demandes. Elles sont conservées pendant la durée nécessaire à ces services ainsi qu’au suivi des transactions et aux obligations applicables.'
  },
  {
    title: 'Vos demandes',
    text: 'Pour demander l’accès à vos informations, leur correction ou leur suppression, contactez l’équipe AST-Academy depuis la page Contact. Certaines données liées aux transactions peuvent devoir être conservées pour leur suivi.'
  }
]
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <header class="mb-8">
        <span class="badge mb-4">VOS DONNÉES, EN TOUTE CLARTÉ</span>
        <h1 class="section-title">Politique de <span class="text-emerald-700">confidentialité</span></h1>
        <p class="mt-3 max-w-2xl leading-relaxed text-slate-600">Cette page explique quelles informations sont utilisées lorsque vous créez un compte, vous inscrivez à une formation ou effectuez un paiement sur AST-Academy.</p>
      </header>

      <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <section v-for="section in sections" :key="section.title" class="border-b border-slate-100 p-6 last:border-0 sm:p-8">
          <h2 class="text-xl font-bold text-slate-900">{{ section.title }}</h2>
          <p class="mt-3 leading-7 text-slate-600">{{ section.text }}</p>
        </section>
      </div>

      <p class="mt-5 text-sm text-slate-500">Responsable du service : All Solution Technologie (AST-Academy). Pour toute question, <NuxtLink to="/contact" class="font-semibold text-emerald-700 underline underline-offset-4">contactez-nous</NuxtLink>.</p>
    </div>
  </main>
</template>
