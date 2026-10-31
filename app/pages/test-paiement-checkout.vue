<script setup lang="ts">
const config = useRuntimeConfig()
const publicKey = config.public.fedapayPublicKey as string
const appUrl = config.public.appUrl as string

const paying = ref(false)
const result = ref<string | null>(null)
const error = ref('')

const amount = 1000
const description = 'Test paiement AST-Academy'

async function initCheckout() {
  if (!publicKey || !publicKey.startsWith('pk_')) {
    error.value = 'Clé publique FedaPay manquante (FEDAPAY_PUBLIC_KEY)'
    return
  }
  paying.value = true
  error.value = ''
  result.value = null

  try {
    await new Promise<void>((resolve, reject) => {
      if ((window as any).FedaPay) return resolve()
      const script = document.createElement('script')
      script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7'
      script.onload = () => resolve()
      script.onerror = reject
      document.head.appendChild(script)
    })

    ;(window as any).FedaPay.init('#pay-btn', {
      public_key: publicKey,
      transaction: {
        amount,
        description,
        currency: { iso: 'XOF' },
        callback_url: `${appUrl}/api/payments/callback`
      },
      customer: {
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'Client'
      }
    })

    result.value = 'Checkout initialisé. Complétez le paiement dans la lightbox.'
  } catch (e: any) {
    error.value = e?.message || 'Erreur initialisation checkout'
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <div class="pt-20 pb-20 bg-slate-50 min-h-screen">
    <div class="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
      <div class="card overflow-hidden shadow-soft">
        <div class="p-6 sm:p-8 text-center">
          <h1 class="text-2xl font-bold text-slate-900 mb-2">Test paiement FedaPay</h1>
          <p class="text-slate-600 text-sm mb-6">Environnement : {{ config.fedapayEnv }}</p>

          <button
            id="pay-btn"
            :disabled="paying || !publicKey?.startsWith('pk_')"
            class="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ paying ? 'Initialisation…' : 'Payer 1 000 FCFA' }}
          </button>

          <div v-if="error" class="mt-4 p-3 rounded-md bg-red-50 text-red-700 text-sm border border-red-100">
            {{ error }}
          </div>

          <div v-if="result" class="mt-4 p-3 rounded-md bg-emerald-50 text-emerald-700 text-sm border border-emerald-100">
            {{ result }}
          </div>

          <p class="mt-6 text-xs text-slate-400">
            Numéros de test Mobile Money (sandbox) : succès 64000001 / 66000001, échec : tout autre numéro.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
