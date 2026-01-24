<template>
  <nuxt-layout>
    <nuxt-page />
  </nuxt-layout>
</template>

<script setup lang="ts">
useHead({
  title: 'Taste of Us - Weekly Menu Planner',
  meta: [
    {
      name: 'description',
      content:
        'Plan your weekly meals together with Taste of Us. Create and share your meal plan with your partner.',
    },
    {
      name: 'keywords',
      content:
        'menu planner, meal planning, weekly menu, food planning, meal schedule',
    },
    { name: 'author', content: 'Taste of Us' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#22c55e' },

    { property: 'og:title', content: 'Taste of Us - Weekly Menu Planner' },
    {
      property: 'og:description',
      content:
        'Plan your weekly meals together with Taste of Us. Create and share your meal plan with your partner.',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/favicon.png' },
    { property: 'og:url', content: 'https://taste-of-us.com' },
    { property: 'og:site_name', content: 'Taste of Us' },

    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'Taste of Us - Weekly Menu Planner' },
    {
      name: 'twitter:description',
      content:
        'Plan your weekly meals together with Taste of Us. Create and share your meal plan with your partner.',
    },
    { name: 'twitter:image', content: '/favicon.png' },
  ],
  link: [
    { rel: 'icon', type: 'image/jpg', href: '/favicon.png' },
    { rel: 'canonical', href: 'https://taste-of-us.com' },
  ],
  script: [
    {
      src: 'https://telegram.org/js/telegram-web-app.js',
      defer: true,
    },
  ],
})

useSeoMeta({
  title: 'Taste of Us - Weekly Menu Planner',
  description:
    'Plan your weekly meals together with Taste of Us. Create and share your meal plan with your partner.',
  ogTitle: 'Taste of Us - Weekly Menu Planner',
  ogDescription:
    'Plan your weekly meals together with Taste of Us. Create and share your meal plan with your partner.',
  ogImage: '/favicon.png',
  ogUrl: 'https://taste-of-us.com',
  twitterCard: 'summary',
  twitterTitle: 'Taste of Us - Weekly Menu Planner',
  twitterDescription:
    'Plan your weekly meals together with Taste of Us. Create and share your meal plan with your partner.',
  twitterImage: '/favicon.png',
})
</script>
