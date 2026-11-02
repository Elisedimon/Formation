import { getQuery } from 'h3'
import { prisma } from '../../utils/prisma'
import { generatePasswordResetToken } from '../../utils/auth'
import { sendEmail, emailUrl } from '../../utils/email'

interface ForgotPasswordBody {
  email?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ForgotPasswordBody>(event)
  const email = body.email?.trim().toLowerCase()

  // Réponse générique quelle que soit l'issue (éviter l'énumération d'emails)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { message: 'Si cet email existe, un lien de réinitialisation vous a été envoyé.' }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { message: 'Si cet email existe, un lien de réinitialisation vous a été envoyé.' }
  }

  const token = await generatePasswordResetToken(user.id)

  // Envoyer l'email de réinitialisation
  try {
    await sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe – AST-Academy',
      html: `
        <h2>Bonjour ${user.firstName || ''} 👋</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
        <p><a href="${emailUrl('/auth/reset-password?token=' + token)}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Réinitialiser mon mot de passe</a></p>
        <p>Ce lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        <hr />
        <p style="font-size:12px;color:#666;">AST-Academy – Maîtrisez les technologies de demain</p>
      `
    })
    console.log('[Auth] Email de réinitialisation envoyé à', email)
  } catch (err: any) {
    console.error('[Auth] Erreur envoi email :', err?.message || err)
  }

  return { message: 'Si cet email existe, un lien de réinitialisation vous a été envoyé.' }
})
