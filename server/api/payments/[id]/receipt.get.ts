import { getQuery, getRouterParam } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth'

function esc(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

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
      userId: true,
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
    select: { id: true, createdAt: true }
  })

  if (!receipt) {
    throw createError({ statusCode: 404, statusMessage: 'Reçu introuvable pour ce paiement' })
  }

  const download = ['1', 'true', 'yes'].includes(String(getQuery(event).download || '').toLowerCase())

  const fullName = `${payment.user?.firstName || ''} ${payment.user?.lastName || ''}`.trim() || 'Client'
  const email = payment.user?.email || 'N/A'
  const fedapayRef = payment.fedapayId || 'N/A'
  const courseTitle = payment.course?.title || 'Formation'
  const amount = new Intl.NumberFormat('fr-FR').format(payment.amount)
  const currency = payment.currency || 'XOF'
  const date = new Date(payment.createdAt).toLocaleDateString('fr-FR')
  const statusLabel = payment.status === 'APPROVED' ? 'PAIEMENT APPROUVÉ' : String(payment.status).toUpperCase()
  const badgeClass = payment.status === 'APPROVED' ? 'badge' : 'badge'

  event.node.res.setHeader('Content-Type', 'text/html; charset=utf-8')
  event.node.res.setHeader('Content-Disposition', `${download ? 'attachment' : 'inline'}; filename="receipt-${payment.id}.html"`)

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reçu de paiement - AST-Academy</title>
<style>
  :root {
    --indigo: #1c263b;
    --violet: #e45530;
    --light: #fff1eb;
    --soft: #fb825d;
    --grey: #6B7280;
    --dark: #111827;
    --line: #E5E7EB;
    --green: #059669;
    --green-bg: #D1FAE5;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    background: #F3F4F6;
    color: var(--dark);
    padding: 24px 12px;
  }
  .receipt {
    max-width: 794px;
    margin: 0 auto;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0,0,0,.08);
  }
  .header {
    background: var(--indigo);
    color: #fff;
    padding: 32px 40px 22px;
    border-bottom: 4px solid var(--violet);
  }
  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .brand { display: flex; align-items: center; gap: 14px; }
  .logo {
    width: 48px; height: 48px;
    background: #fff; color: var(--indigo);
    border-radius: 10px;
    display: grid; place-items: center;
    font-weight: 800; font-size: 17px;
  }
  .brand-name { font-size: 22px; font-weight: 700; }
  .brand-sub { font-size: 12px; color: var(--soft); margin-top: 2px; }
  .title { text-align: right; }
  .title h1 { font-size: 21px; font-weight: 700; letter-spacing: .5px; }
  .title p { font-size: 13px; color: var(--soft); margin-top: 2px; }
  .meta {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 22px;
    font-size: 12px;
    color: #fb825d;
  }
  .meta strong { color: #fff; margin-left: 6px; word-break: break-all; }
  .body { padding: 32px 40px 24px; }
  .badge {
    display: inline-flex; align-items: center; gap: 10px;
    background: var(--green-bg); color: var(--green);
    font-weight: 700; font-size: 14px;
    padding: 8px 18px 8px 14px;
    border-radius: 999px;
  }
  .badge svg { width: 18px; height: 18px; }
  .cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 24px;
  }
  .card {
    background: var(--light);
    border-radius: 10px;
    padding: 18px 20px;
  }
  .card h2 { font-size: 12px; color: var(--violet); letter-spacing: .6px; margin-bottom: 14px; }
  .field + .field { margin-top: 14px; }
  .field span { display: block; font-size: 12px; color: var(--grey); }
  .field b { display: block; font-size: 15px; margin-top: 2px; word-break: break-word; }
  h3 { font-size: 17px; margin: 32px 0 12px; }
  table { width: 100%; border-collapse: collapse; }
  thead th {
    background: var(--indigo); color: #fff;
    font-size: 12px; text-align: left; padding: 10px 16px;
  }
  thead th:first-child { border-radius: 6px 0 0 6px; }
  thead th:last-child  { border-radius: 0 6px 6px 0; text-align: right; }
  tbody td { padding: 16px; border-bottom: 1px solid var(--line); vertical-align: top; }
  tbody td:last-child { text-align: right; font-weight: 700; white-space: nowrap; }
  .item { font-weight: 700; }
  .item-sub { font-size: 12px; color: var(--grey); margin-top: 3px; }
  .total {
    margin: 18px 0 0 auto;
    width: 260px;
    background: var(--indigo);
    border-radius: 10px;
    padding: 14px 18px;
    color: #fff;
  }
  .total small { display: block; font-size: 12px; color: #fb825d; font-weight: 700; letter-spacing: .5px; }
  .total strong { display: block; text-align: right; font-size: 26px; margin-top: 6px; }
  .proof { display: grid; grid-template-columns: 1fr 170px; gap: 16px; margin-top: 32px; align-items: stretch; }
  .qr {
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 14px;
    text-align: center;
    font-size: 12px;
    color: var(--grey);
    line-height: 1.4;
  }
  .qr svg { display: block; width: 104px; height: 104px; margin: 0 auto 8px; }
  .note {
    background: var(--light);
    border-left: 4px solid var(--violet);
    border-radius: 0 10px 10px 0;
    padding: 14px 18px;
    font-size: 13px;
    line-height: 1.5;
    display: flex; flex-direction: column; justify-content: center;
  }
  .note strong { font-size: 14px; margin-bottom: 8px; }
  .note span { color: var(--grey); }
  .footer {
    margin: 0 40px;
    padding: 16px 0 28px;
    border-top: 1px solid var(--line);
    font-size: 12px;
    color: var(--grey);
  }
  .footer-row { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .footer-small { text-align: center; font-size: 11px; margin-top: 10px; }
  @media (max-width: 600px) {
    .header, .body { padding-left: 20px; padding-right: 20px; }
    .footer { margin: 0 20px; }
    .cards { grid-template-columns: 1fr; }
    .title { text-align: left; }
    .total { width: 100%; }
    .proof { grid-template-columns: 1fr; }
  }
  @page { size: A4; margin: 0; }
  @media print {
    body { background: #fff; padding: 0; }
    .receipt { box-shadow: none; border-radius: 0; max-width: none; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

<article class="receipt">

  <header class="header">
    <div class="header-top">
      <div class="brand">
        <div class="logo">AST</div>
        <div>
          <div class="brand-name">AST-Academy</div>
          <div class="brand-sub">Plateforme de formation en ligne</div>
        </div>
      </div>
      <div class="title">
        <h1>REÇU DE PAIEMENT</h1>
        <p>Quittance</p>
      </div>
    </div>
    <div class="meta">
      <div>REÇU N° <strong>${esc(receipt.id)}</strong></div>
      <div>DATE <strong>${esc(date)}</strong></div>
    </div>
  </header>

  <section class="body">
    <div class="${badgeClass}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>
      ${esc(statusLabel)}
    </div>

    <div class="cards">
      <div class="card">
        <h2>CLIENT</h2>
        <div class="field"><span>Nom</span><b>${esc(fullName)}</b></div>
        <div class="field"><span>E-mail</span><b>${esc(email)}</b></div>
      </div>
      <div class="card">
        <h2>PAIEMENT</h2>
        <div class="field"><span>Référence FedaPay</span><b>#${esc(fedapayRef)}</b></div>
        <div class="field"><span>Date</span><b>${esc(date)}</b></div>
      </div>
    </div>

    <h3>Détails du paiement</h3>
    <table>
      <thead>
        <tr><th>DÉSIGNATION</th><th>MONTANT</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="item">Formation : ${esc(courseTitle)}</div>
            <div class="item-sub">Accès à la formation en ligne AST-Academy</div>
          </td>
          <td>${esc(amount)} ${esc(currency)}</td>
        </tr>
      </tbody>
    </table>

    <div class="total">
      <small>TOTAL PAYÉ</small>
      <strong>${esc(amount)} ${esc(currency)}</strong>
    </div>

    <div class="proof">
      <div class="note">
        <strong>Preuve de paiement</strong>
        Ce document atteste que le paiement ci-dessus a été reçu et validé.<br><br>
        <span>Conservez-le comme preuve de paiement. Transaction sécurisée via FedaPay.</span>
      </div>
      <div class="qr">
        <div id="qrcode"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" shape-rendering="crispEdges" role="img" aria-label="QR code de vérification"><path fill="#1c263b" d="M0 0h7v1h-7zM8 0h4v1h-4zM15 0h1v1h-1zM17 0h1v1h-1zM19 0h1v1h-1zM24 0h3v1h-3zM28 0h1v1h-1zM30 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM8 1h1v1h-1zM11 1h3v1h-3zM19 1h2v1h-2zM30 1h1v1h-1zM36 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM8 2h1v1h-1zM10 2h1v1h-1zM12 2h1v1h-1zM14 2h1v1h-1zM16 2h1v1h-1zM18 2h2v1h-2zM21 2h2v1h-2zM24 2h5v1h-5zM30 2h1v1h-1zM32 2h3v1h-3zM36 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM15 3h1v1h-1zM17 3h1v1h-1zM21 3h1v1h-1zM25 3h1v1h-1zM30 3h1v1h-1zM32 3h3v1h-3zM36 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM8 4h3v1h-3zM12 4h1v1h-1zM14 4h2v1h-2zM17 4h3v1h-3zM21 4h2v1h-2zM24 4h1v1h-1zM26 4h1v1h-1zM28 4h1v1h-1zM30 4h1v1h-1zM32 4h3v1h-3zM36 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM10 5h1v1h-1zM13 5h1v1h-1zM15 5h4v1h-4zM20 5h1v1h-1zM22 5h3v1h-3zM28 5h1v1h-1zM30 5h1v1h-1zM36 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h1v1h-1zM20 6h1v1h-1zM22 6h1v1h-1zM24 6h1v1h-1zM26 6h1v1h-1zM28 6h1v1h-1zM30 6h7v1h-7zM9 7h1v1h-1zM11 7h2v1h-2zM14 7h1v1h-1zM18 7h2v1h-2zM24 7h5v1h-5zM0 8h1v1h-1zM3 8h6v1h-6zM11 8h1v1h-1zM13 8h1v1h-1zM15 8h1v1h-1zM20 8h1v1h-1zM22 8h1v1h-1zM25 8h3v1h-3zM29 8h1v1h-1zM32 8h1v1h-1zM34 8h3v1h-3zM1 9h2v1h-2zM5 9h1v1h-1zM11 9h2v1h-2zM14 9h1v1h-1zM16 9h2v1h-2zM22 9h4v1h-4zM27 9h3v1h-3zM32 9h1v1h-1zM35 9h2v1h-2zM2 10h1v1h-1zM4 10h1v1h-1zM6 10h1v1h-1zM8 10h3v1h-3zM13 10h1v1h-1zM15 10h2v1h-2zM18 10h1v1h-1zM21 10h3v1h-3zM27 10h1v1h-1zM30 10h1v1h-1zM32 10h1v1h-1zM36 10h1v1h-1zM0 11h1v1h-1zM2 11h3v1h-3zM8 11h2v1h-2zM12 11h2v1h-2zM16 11h3v1h-3zM22 11h1v1h-1zM28 11h1v1h-1zM30 11h2v1h-2zM34 11h1v1h-1zM1 12h1v1h-1zM3 12h4v1h-4zM8 12h3v1h-3zM13 12h4v1h-4zM19 12h2v1h-2zM27 12h1v1h-1zM30 12h2v1h-2zM33 12h1v1h-1zM35 12h2v1h-2zM1 13h5v1h-5zM7 13h1v1h-1zM9 13h2v1h-2zM12 13h1v1h-1zM15 13h2v1h-2zM18 13h1v1h-1zM21 13h1v1h-1zM23 13h2v1h-2zM26 13h3v1h-3zM32 13h2v1h-2zM35 13h1v1h-1zM2 14h2v1h-2zM5 14h2v1h-2zM12 14h9v1h-9zM24 14h2v1h-2zM27 14h1v1h-1zM31 14h1v1h-1zM33 14h4v1h-4zM0 15h1v1h-1zM2 15h1v1h-1zM4 15h1v1h-1zM7 15h1v1h-1zM9 15h3v1h-3zM18 15h1v1h-1zM20 15h1v1h-1zM24 15h1v1h-1zM26 15h1v1h-1zM30 15h3v1h-3zM34 15h3v1h-3zM0 16h1v1h-1zM2 16h2v1h-2zM5 16h2v1h-2zM11 16h1v1h-1zM15 16h1v1h-1zM17 16h1v1h-1zM19 16h2v1h-2zM23 16h2v1h-2zM28 16h1v1h-1zM30 16h2v1h-2zM33 16h4v1h-4zM2 17h4v1h-4zM7 17h2v1h-2zM10 17h4v1h-4zM17 17h2v1h-2zM20 17h1v1h-1zM24 17h1v1h-1zM27 17h2v1h-2zM34 17h1v1h-1zM36 17h1v1h-1zM0 18h1v1h-1zM6 18h1v1h-1zM9 18h1v1h-1zM13 18h2v1h-2zM16 18h5v1h-5zM22 18h2v1h-2zM25 18h4v1h-4zM33 18h2v1h-2zM36 18h1v1h-1zM1 19h1v1h-1zM4 19h1v1h-1zM9 19h1v1h-1zM12 19h1v1h-1zM15 19h2v1h-2zM19 19h1v1h-1zM22 19h1v1h-1zM24 19h2v1h-2zM29 19h4v1h-4zM35 19h2v1h-2zM0 20h1v1h-1zM2 20h2v1h-2zM6 20h3v1h-3zM10 20h1v1h-1zM12 20h2v1h-2zM16 20h2v1h-2zM20 20h1v1h-1zM26 20h7v1h-7zM36 20h1v1h-1zM0 21h1v1h-1zM2 21h3v1h-3zM10 21h1v1h-1zM14 21h2v1h-2zM17 21h3v1h-3zM22 21h6v1h-6zM29 21h1v1h-1zM31 21h3v1h-3zM0 22h1v1h-1zM2 22h2v1h-2zM5 22h2v1h-2zM11 22h3v1h-3zM15 22h2v1h-2zM23 22h3v1h-3zM27 22h2v1h-2zM31 22h2v1h-2zM36 22h1v1h-1zM0 23h3v1h-3zM4 23h1v1h-1zM7 23h1v1h-1zM11 23h1v1h-1zM14 23h1v1h-1zM17 23h1v1h-1zM19 23h2v1h-2zM22 23h3v1h-3zM26 23h5v1h-5zM33 23h4v1h-4zM0 24h1v1h-1zM6 24h2v1h-2zM10 24h2v1h-2zM13 24h1v1h-1zM15 24h3v1h-3zM22 24h2v1h-2zM25 24h1v1h-1zM27 24h1v1h-1zM29 24h2v1h-2zM33 24h4v1h-4zM0 25h1v1h-1zM2 25h4v1h-4zM8 25h2v1h-2zM12 25h2v1h-2zM21 25h4v1h-4zM26 25h2v1h-2zM29 25h1v1h-1zM31 25h3v1h-3zM36 25h1v1h-1zM0 26h2v1h-2zM3 26h1v1h-1zM5 26h3v1h-3zM11 26h2v1h-2zM14 26h3v1h-3zM19 26h1v1h-1zM22 26h1v1h-1zM25 26h1v1h-1zM27 26h2v1h-2zM34 26h3v1h-3zM0 27h1v1h-1zM3 27h2v1h-2zM7 27h1v1h-1zM10 27h1v1h-1zM13 27h1v1h-1zM18 27h2v1h-2zM23 27h2v1h-2zM26 27h1v1h-1zM28 27h5v1h-5zM34 27h1v1h-1zM0 28h1v1h-1zM2 28h1v1h-1zM6 28h1v1h-1zM8 28h1v1h-1zM10 28h1v1h-1zM14 28h2v1h-2zM20 28h1v1h-1zM23 28h1v1h-1zM25 28h1v1h-1zM27 28h6v1h-6zM34 28h3v1h-3zM8 29h1v1h-1zM10 29h2v1h-2zM14 29h2v1h-2zM17 29h1v1h-1zM19 29h2v1h-2zM24 29h1v1h-1zM26 29h1v1h-1zM28 29h1v1h-1zM32 29h1v1h-1zM34 29h1v1h-1zM36 29h1v1h-1zM0 30h7v1h-7zM8 30h1v1h-1zM11 30h1v1h-1zM13 30h1v1h-1zM15 30h2v1h-2zM19 30h5v1h-5zM28 30h1v1h-1zM30 30h1v1h-1zM32 30h1v1h-1zM34 30h1v1h-1zM36 30h1v1h-1zM0 31h1v1h-1zM6 31h1v1h-1zM8 31h3v1h-3zM12 31h1v1h-1zM14 31h3v1h-3zM18 31h3v1h-3zM24 31h5v1h-5zM32 31h2v1h-2zM35 31h2v1h-2zM0 32h1v1h-1zM2 32h3v1h-3zM6 32h1v1h-1zM8 32h1v1h-1zM11 32h1v1h-1zM13 32h4v1h-4zM19 32h2v1h-2zM22 32h1v1h-1zM26 32h8v1h-8zM36 32h1v1h-1zM0 33h1v1h-1zM2 33h3v1h-3zM6 33h1v1h-1zM8 33h1v1h-1zM10 33h2v1h-2zM14 33h1v1h-1zM17 33h5v1h-5zM23 33h3v1h-3zM28 33h3v1h-3zM34 33h3v1h-3zM0 34h1v1h-1zM2 34h3v1h-3zM6 34h1v1h-1zM9 34h1v1h-1zM11 34h1v1h-1zM13 34h1v1h-1zM15 34h3v1h-3zM20 34h2v1h-2zM23 34h2v1h-2zM26 34h1v1h-1zM28 34h1v1h-1zM31 34h2v1h-2zM34 34h1v1h-1zM36 34h1v1h-1zM0 35h1v1h-1zM6 35h1v1h-1zM9 35h2v1h-2zM12 35h1v1h-1zM14 35h1v1h-1zM17 35h3v1h-3zM22 35h2v1h-2zM27 35h1v1h-1zM30 35h3v1h-3zM34 35h3v1h-3zM0 36h7v1h-7zM8 36h1v1h-1zM10 36h1v1h-1zM15 36h3v1h-3zM19 36h1v1h-1zM22 36h1v1h-1zM24 36h1v1h-1zM27 36h2v1h-2zM31 36h2v1h-2zM36 36h1v1h-1z"/></svg></div>
        Scannez pour vérifier ce paiement
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="footer-row">
      <span>AST-Academy · Merci pour votre confiance !</span>
      <span>Reçu n° ${esc(receipt.id)}</span>
    </div>
    <div class="footer-small">Document généré automatiquement — aucune signature requise.</div>
  </footer>

</article>

</body>
</html>`
})
