import { getQuery, getRouterParam } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const payload = await requireAuth(event, config.jwtSecret)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID de paiement manquant' })
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      fedapayId: true,
      createdAt: true,
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      course: { select: { id: true, title: true, slug: true } }
    }
  })

  if (!payment) {
    throw createError({ statusCode: 404, statusMessage: 'Paiement introuvable' })
  }

  // Seul le propriétaire du paiement (ou un admin) peut télécharger le reçu
  if (payment.userId !== payload.userId) {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true }
    })
    if (!user || user.role !== 'ADMIN') {
      throw createError({ statusCode: 403, statusMessage: 'Accès non autorisé à ce reçu' })
    }
  }

  const receipt = await prisma.receipt.findUnique({
    where: { paymentId: id },
    select: { id: true, pdfUrl: true, createdAt: true }
  })

  if (!receipt) {
    throw createError({ statusCode: 404, statusMessage: 'Reçu introuvable pour ce paiement' })
  }

  // Générer le contenu HTML du reçu (imprimable en PDF par le navigateur)
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Reçu de paiement - AST-Academy</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; color: #1f2937; line-height: 1.6; padding: 2rem; }
        .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 1rem; margin-bottom: 2rem; }
        .logo { font-size: 1.5rem; font-weight: bold; color: #10b981; }
        .title { font-size: 1.25rem; margin-top: 0.5rem; color: #6b7280; }
        .receipt-details { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
        .detail-group { background: #f9fafb; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; }
        .detail-group h3 { margin: 0 0 0.5rem 0; font-size: 0.875rem; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; }
        .detail-group p { margin: 0; font-size: 1rem; color: #1f2937; }
        .amount { font-size: 1.5rem; font-weight: bold; color: #10b981; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
        .table th, .table td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; }
        .table th { background: #f3f4f6; font-weight: 600; color: #4b5563; }
        .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; font-size: 0.875rem; color: #6b7280; text-align: center; }
        @media print { body { padding: 0; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">AST-Academy</div>
        <div class="title">Reçu de paiement - Quittance</div>
      </div>

      <div class="receipt-details">
        <div class="detail-group">
          <h3>Reçu n°</h3>
          <p>${receipt.id}</p>
        </div>
        <div class="detail-group">
          <h3>Date</h3>
          <p>${new Date(receipt.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>
        <div class="detail-group">
          <h3>Client</h3>
          <p>${payment.user.firstName || ''} ${payment.user.lastName || ''} (${payment.user.email})</p>
        </div>
        <div class="detail-group">
          <h3>Référence FedaPay</h3>
          <p>${payment.fedapayId || 'N/A'}</p>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Formation</th>
            <th>Montant</th>
            <th>Devise</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${payment.course?.title || 'N/A'}</td>
            <td class="amount">${new Intl.NumberFormat('fr-FR').format(payment.amount)}</td>
            <td>${payment.currency}</td>
            <td><span style="text-transform:uppercase">${payment.status}</span></td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p>AST-Academy - All Solution Technologie</p>
        <p>Ce document constitue une quittance de paiement.</p>
      </div>
    </body>
    </html>
  `

  event.node.res.setHeader('Content-Type', 'text/html; charset=utf-8')
  event.node.res.setHeader('Content-Disposition', `inline; filename="receipt-${payment.id}.html"`)
  return html
})
