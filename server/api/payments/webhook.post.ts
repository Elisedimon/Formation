import { prisma } from '../../utils/prisma'
import { retrieveFedaPayTransaction } from '../../utils/fedapay'

/**
 * FedaPay webhook endpoint.
 * Configure in FedaPay dashboard: POST https://your-domain/api/payments/webhook
 * Events: transaction.approved, transaction.declined, transaction.canceled, ...
 *
 * Body shape (approximate):
 * {
 *   name: "transaction.approved",
 *   entity: { id, status, amount, merchant_reference, ... }
 * }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)

  const eventName: string =
    body?.name || body?.event || body?.type || ''
  const rawEntity = body?.entity || body?.data?.object || body?.data || body?.transaction || body
  let entity = rawEntity
  if (typeof rawEntity === 'string') {
    try {
      entity = JSON.parse(rawEntity)
    } catch {
      throw createError({ statusCode: 400, statusMessage: 'Contenu webhook invalide' })
    }
  }

  const fedapayId = entity?.id != null ? String(entity.id) : null
  const merchantRef = entity?.merchant_reference
    ? String(entity.merchant_reference)
    : null
  const eventStatus = String(entity?.status || '').toLowerCase()

  console.log('[FedaPay webhook]', eventName, { fedapayId, merchantRef })

  // Find payment by merchant_reference (our payment.id) or fedapayId
  let payment = null

  if (merchantRef) {
    payment = await prisma.payment.findUnique({ where: { id: merchantRef } })
  }
  if (!payment && fedapayId) {
    payment = await prisma.payment.findFirst({ where: { fedapayId } })
  }

  if (!payment) {
    // Acknowledge anyway to avoid retries for unknown payments
    return { received: true, matched: false }
  }

  // Treat webhook payloads as untrusted. Confirm the transaction directly with
  // FedaPay before changing payment state or granting course access.
  if (!fedapayId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de transaction manquant' })
  }

  let verifiedTransaction: any
  try {
    verifiedTransaction = await retrieveFedaPayTransaction(fedapayId)
  } catch (error) {
    console.error('[FedaPay webhook] transaction verification failed', error)
    throw createError({ statusCode: 502, statusMessage: 'Vérification de transaction impossible' })
  }

  const verifiedId = verifiedTransaction?.id == null ? '' : String(verifiedTransaction.id)
  const verifiedReference = verifiedTransaction?.merchant_reference == null
    ? ''
    : String(verifiedTransaction.merchant_reference)
  const verifiedAmount = Number(verifiedTransaction?.amount)
  if (
    verifiedId !== fedapayId ||
    (verifiedReference && verifiedReference !== payment.id) ||
    (!verifiedReference && payment.fedapayId !== fedapayId) ||
    !Number.isFinite(verifiedAmount) ||
    verifiedAmount !== payment.amount
  ) {
    console.error('[FedaPay webhook] transaction mismatch', { paymentId: payment.id, fedapayId })
    throw createError({ statusCode: 400, statusMessage: 'Transaction non concordante' })
  }

  const txStatus = String(verifiedTransaction?.status || '').toLowerCase()
  if (eventStatus && txStatus && eventStatus !== txStatus) {
    console.warn('[FedaPay webhook] event status differs from verified status', { eventStatus, txStatus })
  }

  let newStatus = payment.status

  if (
    txStatus === 'approved' ||
    txStatus === 'transferred'
  ) {
    newStatus = 'APPROVED'
  } else if (txStatus === 'declined') {
    newStatus = 'DECLINED'
  } else if (
    txStatus === 'canceled' ||
    txStatus === 'cancelled'
  ) {
    newStatus = 'CANCELLED'
  }

  payment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: newStatus,
      fedapayId: fedapayId || payment.fedapayId,
      fedapayStatus: txStatus || eventName || payment.fedapayStatus
    }
  })

  if (newStatus === 'APPROVED' && payment.courseId) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: payment.userId,
          courseId: payment.courseId
        }
      },
      create: {
        userId: payment.userId,
        courseId: payment.courseId,
        status: 'ACTIVE'
      },
      update: {
        status: 'ACTIVE'
      }
    })
  }

  return { received: true, matched: true, paymentId: payment.id, status: newStatus }
})
