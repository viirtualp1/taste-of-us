// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
  },

  typescript: {
    tsConfig: {
      include: ['../src/**/*'],
    },
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@posthog/nuxt',
    '@nuxtjs/i18n',
  ],

  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'ru', iso: 'ru-RU', name: 'Русский', file: 'ru.json' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix',
    lazy: true,
    restructureDir: 'i18n',
    langDir: 'locales',
    detectBrowserLanguage: false,
  },

  posthogConfig: {
    publicKey: process.env.NUXT_PUBLIC_POSTHOG_KEY || '',
    host: process.env.NUXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  },

  css: ['@/app/styles/main.css'],

  ssr: false,

  components: false,

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  fonts: {
    families: [
      {
        name: 'Manrope',
        provider: 'google',
        weights: [300, 400, 500, 600, 700, 800],
      },
    ],
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://taste-of-us.com',
    },
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    cronSecretToken: process.env.CRON_SECRET_TOKEN || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
})
