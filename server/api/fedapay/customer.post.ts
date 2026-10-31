import { FedaPay, Customer } from 'fedapay'

interface CreateCustomerBody {
  firstname?: string
  lastname?: string
  email?: string
  phone?: string
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

  const body = await readBody<CreateCustomerBody>(event)

  try {
    const customer = await Customer.create({
      firstname: body.firstname || 'Test',
      lastname: body.lastname || 'Client',
      email: body.email || 'test@example.com',
      ...(body.phone ? { phone_number: { number: body.phone, country: 'BJ' } } : {})
    })

    return {
      ok: true,
      customer: {
        id: customer.id,
        firstname: customer.firstname,
        lastname: customer.lastname,
        email: customer.email
      }
    }
  } catch (err: any) {
    const status = err?.response?.status ?? err?.status ?? err?.code
    const detail = err?.response?.data ?? err?.message ?? String(err)
    console.error('[FedaPay] customer create error:', { status, detail })
    throw createError({
      statusCode: 502,
      statusMessage: `Impossible de créer le client FedaPay${status ? ` (${status})` : ''}`
    })
  }
})
