<template>
  <div>
    <h1 class="sr-only">{{ t('nav.menu') }}</h1>

    <div v-if="!isAuthenticated" class="flex justify-center">
      <section
        class="surface rounded-lg p-6 sm:p-8 max-w-md w-full text-center"
      >
        <span
          class="mx-auto mb-4 grid place-items-center w-16 h-16 rounded-full bg-primary text-primary-foreground"
        >
          <TouIcon name="heroicons:heart-solid" class="w-8 h-8" />
        </span>
        <h2 class="text-ios-title font-bold mb-1.5">
          {{ t('home.welcomeTitle') }}
        </h2>
        <p class="text-muted-foreground text-ios text-balance">
          {{ t('home.welcomeDescription') }}
        </p>

        <div
          v-if="isLoading"
          class="flex items-center justify-center gap-2 pt-6 text-muted-foreground"
        >
          <TouSpinner />
          <span>{{ t('home.initializing') }}</span>
        </div>

        <TouAlert v-else-if="authError" class="mt-5 text-left">
          {{ authError }}
        </TouAlert>
      </section>
    </div>

    <MenuPlanner v-else />
  </div>
</template>

<script setup lang="ts">
import { useTelegram, useRequireAuth } from '@/entities/user'
import { TouIcon, TouAlert, TouSpinner } from '@/shared/ui'
import MenuPlanner from './MenuPlanner.vue'

const { t } = useI18n()
const { isAuthenticated, isLoading, hapticFeedback } = useTelegram()

const authError = ref('')

useRequireAuth({
  onFailure: (message) => {
    authError.value = message
  },
  onReady: ({ didAuthenticate }) => {
    if (didAuthenticate) {
      hapticFeedback.success()
    }
  },
})
</script>
