// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts'
  ],

  css: ['~/assets/css/main.css'],

  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700, 800],
      'Plus+Jakarta+Sans': [500, 600, 700, 800]
    },
    display: 'swap'
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'ast-academy-local-development-secret-change-before-deploy'),
    databaseUrl: process.env.DATABASE_URL,
    fedapaySecretKey: process.env.NUXT_FEDAPAY_SECRET_KEY || '',
    fedapayEnv: process.env.NUXT_FEDAPAY_ENV || 'sandbox',

    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: Number(process.env.SMTP_PORT) || 587,
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || 'AST-Academy <noreply@example.com>',

    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000'),
      fedapayPublicKey: process.env.NUXT_PUBLIC_FEDAPAY_PUBLIC_KEY || '',
      whatsappNumber: process.env.WHATSAPP_NUMBER || ''
    }
  },

  app: {
    head: {
      title: 'AST-Academy – Maîtrisez les technologies de demain',
      meta: [
        {
          name: 'description',
          content:
            'Formations pratiques en développement, data et innovation numérique. Apprenez avec des experts.'
        },
        { name: 'theme-color', content: '#10192c' }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  }
})
