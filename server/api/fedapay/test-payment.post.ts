import { FedaPay, Transaction } from 'fedapay'
import { createError } from 'h3'

interface TestPaymentBody {
  amount: number
  description?: string
  customerEmail?: string
  customerFirstname?: string
  customerLastname?: string
  callbackUrl?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secretKey = config.fedapaySecretKey as string
  const env = (config.fedapayEnv as string) || 'sandbox'

  if (!secretKey || !secretKey.startsWith('sk_')) {
    throw createError({
      statusCode: 500,
      statusMessage: 'FEDAPAY_SECRET_KEY invalide ou manquante'
    })
  }

  FedaPay.setApiKey(secretKey)
  FedaPay.setEnvironment(env === 'live' ? 'live' : 'sandbox')

  const body = await readBody<TestPaymentBody>(event)

  const amount = Number(body.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Montant invalide'
    })
  }

  const appUrl = String(config.public.appUrl || 'http://localhost:3000').replace(/\/$/, '')
  const callbackUrl = body.callbackUrl || `${appUrl}/api/payments/callback`

  try {
    const transaction = await Transaction.create({
      description: body.description || `Test paiement AST-Academy – ${amount} XOF`,
      amount,
      currency: { iso: 'XOF' },
      callback_url: callbackUrl,
      customer: {
        email: body.customerEmail || 'test@example.com',
        firstname: body.customerFirstname || 'Test',
        lastname: body.customerLastname || 'Client'
      }
    })

    let paymentUrl: string | undefined
    try {
      if (typeof (transaction as any).generateToken === 'function') {
        const tokenResult = await (transaction as any).generateToken()
        paymentUrl =
          tokenResult?.url ||
          tokenResult?.token?.url ||
          (typeof tokenResult === 'string' ? tokenResult : undefined)
      }
    } catch {
      // fall through to REST
    }

    if (!paymentUrl) {
      const res = await fetch(
        `https://${env === 'live' ? 'api' : 'sandbox-api'}.fedapay.com/v1/transactions/${transaction.id}/token`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (!res.ok) {
        const text = await res.text()
        console.error('[FedaPay] token error:', res.status, text)
        throw createError({
          statusCode: 502,
          statusMessage: `Impossible de générer le lien de paiement (${res.status})`
        })
      }
      const data = (await res.json()) as { url?: string }
      paymentUrl = data.url
    }

    return {
      ok: true,
      env,
      transactionId: String(transaction.id),
      status: (transaction as any).status,
      paymentUrl,
      amount,
      currency: 'XOF'
    }
  } catch (err: any) {
    const status =
      err?.response?.status ??
      err?.status ??
      err?.code ??
      extractStatusFromMessage(err?.message)
    const detail =
      err?.response?.data ??
      err?.response?.message ??
      err?.message ??
      String(err)
    console.error('[FedaPay] test payment error:', { status, detail })
    throw createError({
      statusCode: 502,
      statusMessage: `Échec du paiement FedaPay${status ? ` (${status})` : ''}${
        detail ? ` - ${String(detail).slice(0, 300)}` : ''
      }`
    })
  }
})

function extractStatusFromMessage(message?: string): number | undefined {
  if (!message) return undefined
  const match = String(message).match(/status code\s*(\d{3})/i)
  return match ? Number(match[1]) : undefined
}
