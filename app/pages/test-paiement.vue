<script setup lang="ts">
interface TestPaymentResult {
  ok: boolean
  env: string
  transactionId: string
  status: string
  paymentUrl: string
  amount: number
  currency: string
}

const creating = ref(false)
const result = ref<TestPaymentResult | null>(null)
const error = ref('')

const form = reactive({
  amount: 10000,
  description: 'Test paiement AST-Academy',
  customerEmail: 'test@example.com',
  customerFirstname: 'Test',
  customerLastname: 'Client'
})

async function createPayment() {
  creating.value = true
  error.value = ''
  result.value = null

  try {
    const res = await $fetch<TestPaymentResult>('/api/fedapay/test-payment', {
      method: 'POST',
      body: {
        amount: Number(form.amount),
        description: form.description,
        customerEmail: form.customerEmail,
        customerFirstname: form.customerFirstname,
        customerLastname: form.customerLastname
      }
    })
    result.value = res
  } catch (e: any) {
    error.value =
      e?.data?.statusMessage ||
      e?.statusMessage ||
      'Impossible de créer le paiement FedaPay'
  } finally {
    creating.value = false
  }
}

const config = useRuntimeConfig()
</script>

<template>
  <div class="pt-20 pb-20 bg-slate-50 min-h-screen">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="card overflow-hidden shadow-soft">
        <div class="p-6 sm:p-8">
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                  :class="config.fedapayEnv === 'live' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'">
              {{ config.fedapayEnv === 'live' ? 'LIVE' : 'SANDBOX' }}
            </span>
            <span v-if="!config.fedapaySecretKey" class="text-xs text-red-600 font-medium">Clé API manquante</span>
            <span v-else class="text-xs text-slate-400">Clé API configurée</span>
          </div>

          <h1 class="text-2xl font-bold text-slate-900 mb-2">Test de paiement FedaPay</h1>
          <p class="text-slate-600 text-sm mb-6">
            Crée une transaction de paiement FedaPay pour vérifier l’intégration avant la mise en production.
          </p>

          <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
            <p class="text-xs text-slate-500 mb-3 font-medium">Informations de paiement</p>
            <form @submit.prevent="createPayment" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="col-span-full sm:col-span-1">
                <label class="block text-sm font-medium text-slate-700 mb-1">Montant (XOF)</label>
                <input
                  v-model.number="form.amount"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="10000"
                />
              </div>
              <div class="col-span-full sm:col-span-1">
                <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  v-model="form.description"
                  type="text"
                  class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="Test paiement AST-Academy"
                />
              </div>
              <div class="col-span-full sm:col-span-1">
                <label class="block text-sm font-medium text-slate-700 mb-1">Email client</label>
                <input
                  v-model="form.customerEmail"
                  type="email"
                  class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="test@example.com"
                />
              </div>
              <div class="col-span-full sm:col-span-1">
                <label class="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                <input
                  v-model="form.customerFirstname"
                  type="text"
                  class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="Test"
                />
              </div>
              <div class="col-span-full sm:col-span-1">
                <label class="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                <input
                  v-model="form.customerLastname"
                  type="text"
                  class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="Client"
                />
              </div>
              <div class="col-span-full">
                <button
                  type="submit"
                  :disabled="creating"
                  class="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ creating ? 'Création…' : 'Créer le paiement FedaPay' }}
                </button>
              </div>
            </form>
          </div>

          <div v-if="error" class="mt-4 p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-100">
            {{ error }}
          </div>

          <div v-if="result" class="mt-6 p-4 rounded-lg bg-emerald-50 border border-emerald-100">
            <div class="flex items-center gap-2 mb-3">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                Succès
              </span>
              <span class="text-xs text-emerald-600 font-medium">ID: {{ result.transactionId }}</span>
              <span class="text-xs text-emerald-600 font-medium">Statut: {{ result.status }}</span>
            </div>
            <ul class="text-sm text-emerald-700 space-y-1 mb-4">
              <li><span class="font-medium">Montant :</span> {{ result.amount }} {{ result.currency }}</li>
              <li><span class="font-medium">Env :</span> {{ result.env }}</li>
              <li><span class="font-medium">Lien de paiement :</span></li>
            </ul>
            <a
              :href="result.paymentUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-primary inline-flex items-center justify-center gap-2 py-3"
            >
              Ouvrir la page de paiement FedaPay
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6m4 6h4m-4 6h4m-6-4v4" />
              </svg>
            </a>
            <p class="mt-2 text-xs text-emerald-600">
              En sandbox, utilisez une carte de test FedaPay pour finaliser le paiement.
            </p>
          </div>

          <div class="mt-8 pt-6 border-t border-slate-200">
            <h3 class="text-sm font-semibold text-slate-700 mb-3">Comment ça marche</h3>
            <ol class="text-sm text-slate-600 space-y-2 list-decimal list-inside">
              <li>La requête est envoyée à <code>/api/fedapay/test-payment</code> côté serveur.</li>
              <li>Le serveur crée la transaction FedaPay avec votre clé secrète (jamais exposée au navigateur).</li>
              <li>Un lien de paiement est généré et affiché ci-dessus.</li>
              <li>Cliquez sur le lien pour payer en mode sandbox.</li>
              <li>Après le paiement, FedaPay redirige vers <code>/api/payments/callback</code>.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
