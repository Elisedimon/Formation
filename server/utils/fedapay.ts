import { FedaPay, Transaction } from 'fedapay'

/**
 * Configure the FedaPay SDK with runtime secrets.
 */
export function initFedaPay() {
  const config = useRuntimeConfig()
  const secretKey = config.fedapaySecretKey as string
  const env = (config.fedapayEnv as string) || 'sandbox'

  if (!secretKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'FEDAPAY_SECRET_KEY non configurée'
    })
  }

  if (!secretKey.startsWith('sk_')) {
    throw createError({
      statusCode: 500,
      statusMessage: 'FEDAPAY_SECRET_KEY invalide (doit commencer par sk_)'
    })
  }

  FedaPay.setApiKey(secretKey)
  FedaPay.setEnvironment(env === 'live' ? 'live' : 'sandbox')
}

function getApiBase(): string {
  const env = ((useRuntimeConfig().fedapayEnv as string) || 'sandbox')
  return env === 'live'
    ? 'https://api.fedapay.com/v1'
    : 'https://sandbox-api.fedapay.com/v1'
}

export interface CreateTransactionParams {
  amount: number
  description: string
  callbackUrl: string
  customer: {
    email: string
    firstname?: string | null
    lastname?: string | null
  }
  /** Our internal payment id for reconciliation */
  merchantReference?: string
}

/**
 * Create a FedaPay transaction and return the hosted payment page URL.
 */
export async function createFedaPayTransaction(params: CreateTransactionParams) {
  initFedaPay()

  const config = useRuntimeConfig()
  const secretKey = config.fedapaySecretKey as string

  let transaction: any
  try {
    transaction = await Transaction.create({
      description: params.description,
      amount: params.amount,
      currency: { iso: 'XOF' },
      callback_url: params.callbackUrl,
      customer: {
        email: params.customer.email,
        firstname: params.customer.firstname || undefined,
        lastname: params.customer.lastname || undefined
      },
      ...(params.merchantReference
        ? { merchant_reference: params.merchantReference }
        : {})
    })
  } catch (err: any) {
    const status = err?.response?.status ?? err?.status ?? err?.code ?? extractStatusFromMessage(err?.message)
    const body = err?.response?.data ?? err?.response?.message ?? err?.message ?? String(err)
    const detail = typeof body === 'object' ? JSON.stringify(body) : body
    console.error('[FedaPay] create error:', { status, detail, keys: err ? Object.keys(err) : [] })
    throw createError({
      statusCode: 502,
      statusMessage:
        status === 401
          ? 'Clé API FedaPay invalide (401 Non autorisé) : vérifiez FEDAPAY_SECRET_KEY'
          : `Échec de création de la transaction FedaPay${status ? ` (${status})` : ''}${detail ? ` - ${String(detail).slice(0, 300)}` : ''}`
    })
  }

  const fedapayId = String(transaction.id)

  // Prefer SDK generateToken if available
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

  // REST fallback: POST /v1/transactions/{id}/token
  if (!paymentUrl) {
    const res = await fetch(`${getApiBase()}/transactions/${fedapayId}/token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[FedaPay] token error:', res.status, text)
      throw createError({
        statusCode: 502,
        statusMessage: `Impossible de générer le lien de paiement FedaPay (${res.status})`
      })
    }

    const data = (await res.json()) as { token?: string; url?: string }
    paymentUrl = data.url
  }

  if (!paymentUrl) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Lien de paiement FedaPay manquant dans la réponse'
    })
  }

  return {
    fedapayId,
    reference: (transaction as any).reference as string | undefined,
    status: (transaction as any).status as string | undefined,
    paymentUrl
  }
}

/**
 * Retrieve a transaction by FedaPay ID (for callback verification).
 */
export async function retrieveFedaPayTransaction(fedapayId: string) {
  initFedaPay()
  return Transaction.retrieve(fedapayId)
}

export { Transaction, FedaPay }

function extractStatusFromMessage(message?: string): number | undefined {
  if (!message) return undefined
  const match = String(message).match(/status code\s*(\d{3})/i)
  return match ? Number(match[1]) : undefined
}
