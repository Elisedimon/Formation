import nodemailer from 'nodemailer'
import { useRuntimeConfig } from '#imports'

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter
  const config = useRuntimeConfig()
  transporter = nodemailer.createTransport({
    host: config.smtpHost || 'smtp.gmail.com',
    port: config.smtpPort || 587,
    secure: false,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    }
  })
  return transporter
}

export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string
  subject: string
  html?: string
  text?: string
}) {
  const config = useRuntimeConfig()
  const transporter = getTransporter()

  await transporter.sendMail({
    from: config.smtpFrom || 'AST-Academy <noreply@example.com>',
    to,
    subject,
    html,
    text
  })
}

export function emailUrl(path: string) {
  const config = useRuntimeConfig()
  return `${config.public.appUrl}${path}`
}
