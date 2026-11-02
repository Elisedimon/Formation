import { prisma } from '../../utils/prisma'
import { retrieveFedaPayTransaction } from '../../utils/fedapay'
import { ensurePlatformSettings, getSettingValue } from '../../utils/platformSettings'

/**
 * User is redirected here after completing (or cancelling) payment on FedaPay.
 * Query params from FedaPay typically include: id (fedapay tx id), status
 * We also pass paymentId from our callback_url.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const paymentId = (query.paymentId as string) || undefined
  const fedapayId = (query.id as string) || undefined

  const config = useRuntimeConfig()
  const appUrl = (config.public.appUrl as string) || 'http://localhost:3000'

  if (!paymentId && !fedapayId) {
    return sendRedirect(event, `${appUrl}/payments/failed?reason=missing_params`)
  }

  let payment = paymentId
    ? await prisma.payment.findUnique({ where: { id: paymentId } })
    : await prisma.payment.findFirst({ where: { fedapayId: String(fedapayId) } })

  if (!payment) {
    return sendRedirect(event, `${appUrl}/payments/failed?reason=payment_not_found`)
  }

  // Never trust the status in the return URL: only FedaPay's transaction record
  // can confirm a payment or create an enrollment.
  const txId = payment.fedapayId
  if (!txId || (fedapayId && fedapayId !== txId)) {
    return sendRedirect(event, `${appUrl}/payments/failed?status=verification`)
  }

  let tx: any
  try {
    tx = await retrieveFedaPayTransaction(txId)
  } catch (err) {
    console.error('[FedaPay] callback retrieve error:', err)
    return sendRedirect(event, `${appUrl}/payments/failed?status=verification`)
  }

  const providerId = tx?.id == null ? '' : String(tx.id)
  const txMerchantReference = tx?.merchant_reference == null ? '' : String(tx.merchant_reference)
  const txAmount = Number(tx?.amount)
  if (
    providerId !== txId ||
    (txMerchantReference && txMerchantReference !== payment.id) ||
    !Number.isFinite(txAmount) ||
    txAmount !== payment.amount
  ) {
    console.error('[FedaPay] callback transaction mismatch', { paymentId: payment.id, providerId })
    return sendRedirect(event, `${appUrl}/payments/failed?status=verification`)
  }

  const fedapayStatus = String(tx?.status || '').toLowerCase()
  let finalStatus = payment.status
  if (fedapayStatus === 'approved' || fedapayStatus === 'transferred') {
    finalStatus = 'APPROVED'
  } else if (fedapayStatus === 'declined') {
    finalStatus = 'DECLINED'
  } else if (fedapayStatus === 'canceled' || fedapayStatus === 'cancelled') {
    finalStatus = 'CANCELLED'
  }

  // Update payment
  payment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: finalStatus,
      fedapayStatus: fedapayStatus || payment.fedapayStatus
    }
  })

  // Create enrollment on success
  if (finalStatus === 'APPROVED' && payment.courseId) {
    await ensurePlatformSettings()
    if ((await getSettingValue('features.enrollments')) !== 'true') {
      return sendRedirect(event, `${appUrl}/payments/failed?reason=feature_disabled`)
    }
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

    const course = await prisma.course.findUnique({ where: { id: payment.courseId }, select: { slug: true } })

    return sendRedirect(
      event,
      `${appUrl}/payments/success?paymentId=${payment.id}${course ? `&course=${encodeURIComponent(course.slug)}` : ''}`
    )
  }

  return sendRedirect(
    event,
    `${appUrl}/payments/failed?paymentId=${payment.id}&status=${finalStatus}`
  )
})
