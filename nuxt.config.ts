// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image'
  ],

  css: ['~/assets/css/main.css'],

  ssr: false,

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  components: true,

  fonts: {
    families: [
      { name: 'Manrope', provider: 'google', weights: [300, 400, 500, 600, 700, 800] }
    ]
  },

  runtimeConfig: {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
    }
  }
})