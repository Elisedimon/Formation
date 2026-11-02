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
  <div class="pb-20 bg-slate-50 min-h-screen">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="card overflow-hidden shadow-soft">
        <div class="p-6 sm:p-8">
          <div class="flex items-center gap-2 mb-1">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
              :class="config.fedapayEnv === 'live' ? 'bg-red-100 text-red-700' : 'bg-brand-50 text-brand-700'"
            >
              {{ config.fedapayEnv === 'live' ? 'LIVE' : 'SANDBOX' }}
            </span>
            <span v-if="!config.public.fedapayPublicKey" class="text-xs text-red-600 font-medium">
              Clé publique manquante
            </span>
            <span v-else class="text-xs text-slate-400">Clé publique configurée</span>
          </div>

          <h1 class="text-2xl font-bold text-slate-900 mb-2">Test de paiement FedaPay</h1>
          <p class="text-slate-600 text-sm mb-6">
            Crée une transaction côté serveur et retourne un lien de paiement FedaPay.
          </p>

          <form @submit.prevent="createPayment" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="col-span-full sm:col-span-1">
              <label class="block text-sm font-medium text-slate-700 mb-1">Montant (XOF)</label>
              <input
                v-model.number="form.amount"
                type="number"
                min="1"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-600 outline-none"
              />
            </div>
            <div class="col-span-full sm:col-span-1">
              <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input
                v-model="form.description"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-600 outline-none"
              />
            </div>
            <div class="col-span-full sm:col-span-1">
              <label class="block text-sm font-medium text-slate-700 mb-1">Email client</label>
              <input
                v-model="form.customerEmail"
                type="email"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-600 outline-none"
              />
            </div>
            <div class="col-span-full sm:col-span-1">
              <label class="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
              <input
                v-model="form.customerFirstname"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-600 outline-none"
              />
            </div>
            <div class="col-span-full sm:col-span-1">
              <label class="block text-sm font-medium text-slate-700 mb-1">Nom</label>
              <input
                v-model="form.customerLastname"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-600 outline-none"
              />
            </div>
            <div class="col-span-full">
              <button
                type="submit"
                :disabled="creating"
                class="btn-primary w-full py-3 disabled:opacity-50"
              >
                {{ creating ? 'Création…' : 'Créer le paiement FedaPay' }}
              </button>
            </div>
          </form>

          <div v-if="error" class="mt-4 p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-100">
            {{ error }}
          </div>

          <div v-if="result" class="mt-6 p-4 rounded-lg bg-brand-50 border border-brand-100">
            <p class="text-sm text-brand-700 mb-2">
              <strong>ID :</strong> {{ result.transactionId }} —
              <strong>Statut :</strong> {{ result.status }} —
              <strong>Montant :</strong> {{ result.amount }} {{ result.currency }}
            </p>
            <a
              :href="result.paymentUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-primary inline-flex items-center justify-center gap-2 py-3 px-4"
            >
              Ouvrir la page de paiement FedaPay
            </a>
            <p class="mt-2 text-xs text-brand-600">
              Sandbox : succès avec 64000001 / 66000001, échec avec un autre numéro.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>