import { prisma } from '../utils/prisma'
import { sendEmail } from '../utils/email'

interface ContactBody {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ContactBody>(event)

  const name = body.name?.trim()
  const email = body.email?.trim().toLowerCase()
  const subject = body.subject?.trim()
  const message = body.message?.trim()

  // Validation
  if (!name || !email || !subject || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tous les champs sont requis'
    })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Format d’email invalide'
    })
  }

  if (message.length < 10) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le message doit contenir au moins 10 caractères'
    })
  }

  // Enregistrer le message de contact en base
  const contact = await prisma.contactMessage.create({
    data: {
      name,
      email,
      subject,
      message,
      status: 'PENDING'
    }
  })

  // Notification email à l'équipe AST-Academy
  await sendEmail({
    to: 'pernaudeadda06@gmail.com',
    subject: `Nouveau message de contact : ${subject}`,
    html: `
      <h2>Nouveau message de contact 📧</h2>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Sujet :</strong> ${subject}</p>
      <p><strong>Message :</strong><br/>${message}</p>
      <hr />
      <p style="font-size:12px;color:#666;">AST-Academy – Formulaire de contact</p>
    `
  })

  return {
    message: 'Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.',
    id: contact.id
  }
})
