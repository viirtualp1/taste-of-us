<template>
  <nuxt-layout>
    <nuxt-page />
  </nuxt-layout>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const config = useRuntimeConfig()

useHead({
  htmlAttrs: {
    lang: locale,
  },
})

useHead({
  title: () => t('app.title'),
  meta: [
    {
      name: 'description',
      content: () => t('app.description'),
    },
    {
      name: 'keywords',
      content:
        'menu planner, meal planning, weekly menu, food planning, meal schedule',
    },
    { name: 'author', content: 'Taste of Us' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#22c55e' },

    { property: 'og:title', content: () => t('app.title') },
    {
      property: 'og:description',
      content: () => t('app.description'),
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/favicon.png' },
    { property: 'og:url', content: 'https://taste-of-us.com' },
    { property: 'og:site_name', content: 'Taste of Us' },

    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: () => t('app.title') },
    {
      name: 'twitter:description',
      content: () => t('app.description'),
    },
    { name: 'twitter:image', content: '/favicon.png' },
  ],
  link: [
    { rel: 'icon', type: 'image/jpg', href: '/favicon.png' },
    { rel: 'canonical', href: 'https://taste-of-us.com' },
  ],
  script: config.public.mswEnabled
    ? []
    : [
      {
        src: 'https://telegram.org/js/telegram-web-app.js',
        defer: true,
      },
    ],
})

useSeoMeta({
  title: () => t('app.title'),
  description: () => t('app.description'),
  ogTitle: () => t('app.title'),
  ogDescription: () => t('app.description'),
  ogImage: '/favicon.png',
  ogUrl: 'https://taste-of-us.com',
  twitterCard: 'summary',
  twitterTitle: () => t('app.title'),
  twitterDescription: () => t('app.description'),
  twitterImage: '/favicon.png',
})
</script>
