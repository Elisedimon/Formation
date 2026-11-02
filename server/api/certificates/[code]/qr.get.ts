import QRCode from 'qrcode'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')?.trim().toUpperCase()
  if (!code) throw createError({ statusCode: 400, statusMessage: 'Code manquant.' })

  const cert = await prisma.certificate.findUnique({ where: { code }, select: { code: true } })
  if (!cert) throw createError({ statusCode: 404, statusMessage: 'Certificat introuvable.' })

  const config = useRuntimeConfig()
  const siteUrl = String(config.public.appUrl || 'http://localhost:3000').replace(/\/$/, '')
  const url = `${siteUrl}/certificats/${encodeURIComponent(code)}`

  const svg = await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'M', margin: 1, width: 200 })
  setHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  return svg
})