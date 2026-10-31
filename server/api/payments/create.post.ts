import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'
import { createFedaPayTransaction } from '../../utils/fedapay'

interface CreatePaymentBody {
  courseId?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const payload = await requireAuth(event, config.jwtSecret)

  const body = await readBody<CreatePaymentBody>(event)
  const courseId = body.courseId?.trim()

  if (!courseId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'courseId est requis'
    })
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId, isPublished: true }
  })

  if (!course) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Formation introuvable ou non publiée'
    })
  }

  const appUrl = String(config.public.appUrl || '').replace(/\/$/, '')
  if (!appUrl || (process.env.NODE_ENV === 'production' && !appUrl.startsWith('https://'))) {
    throw createError({
      statusCode: 503,
      statusMessage: 'NUXT_PUBLIC_APP_URL doit être configurée avec l’URL HTTPS publique du site'
    })
  }

  // Already enrolled?
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: payload.userId,
        courseId: course.id
      }
    }
  })

  if (existingEnrollment && existingEnrollment.status === 'ACTIVE') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Vous êtes déjà inscrit à cette formation'
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, firstName: true, lastName: true }
  })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
  }

  // Create pending payment in DB first
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      courseId: course.id,
      amount: course.price,
      currency: 'XOF',
      status: 'PENDING'
    }
  })

  const callbackUrl = `${appUrl}/api/payments/callback?paymentId=${payment.id}`

  try {
    const fedapay = await createFedaPayTransaction({
      amount: course.price,
      description: `Inscription – ${course.title}`,
      callbackUrl,
      customer: {
        email: user.email,
        firstname: user.firstName,
        lastname: user.lastName
      },
      merchantReference: payment.id
    })

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        fedapayId: fedapay.fedapayId,
        fedapayStatus: fedapay.status || 'pending'
      }
    })

    // Créer le reçu (quittance) associé au paiement
    const receipt = await prisma.receipt.create({
      data: {
        userId: user.id,
        paymentId: payment.id,
        pdfUrl: `/api/payments/${payment.id}/receipt`,
        amount: course.price,
        currency: 'XOF'
      }
    })

    // Log des données du reçu en dev (envoi d'email à implémenter avec un service email)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Payment] Reçu créé pour le paiement ${payment.id}:`, {
        receiptId: receipt.id,
        amount: course.price,
        currency: 'XOF',
        customerEmail: user.email,
        pdfUrl: receipt.pdfUrl
      })
    }

    return {
      paymentId: payment.id,
      amount: course.price,
      currency: 'XOF',
      paymentUrl: fedapay.paymentUrl,
      course: {
        id: course.id,
        title: course.title
      }
    }
  } catch (err: any) {
    // Mark payment as cancelled if FedaPay fails
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'CANCELLED', fedapayStatus: 'error' }
    })

    console.error('[FedaPay] create transaction error:', err)

    throw createError({
      statusCode: 502,
      statusMessage:
        err?.statusMessage ||
        err?.message ||
        'Erreur lors de la création du paiement FedaPay'
    })
  }
})
