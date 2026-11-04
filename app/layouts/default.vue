<template>
  <div class="min-h-dvh">
    <LocalePickerModal :is-open="isPickerOpen" />
    <main
      class="relative mx-auto w-full max-w-[1120px] px-4 sm:px-6 overflow-x-hidden"
      style="
        padding-top: calc(var(--safe-t) + 20px);
        padding-bottom: calc(var(--tabbar) + var(--safe-b) + 40px);
      "
    >
      <slot />
    </main>
    <AppTabBar />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import {
  LocalePickerModal,
  useLocalePreference,
} from '@/features/i18n/locale-picker'
import { useTelegramTheme } from '@/shared/lib/theme'
import { AppTabBar } from '@/widgets/app-tab-bar'

const { isPickerOpen, openPickerIfNeeded } = useLocalePreference()
const { init: initTheme, cleanup: cleanupTheme } = useTelegramTheme()

onMounted(() => {
  initTheme()
  openPickerIfNeeded()
})

onUnmounted(() => {
  cleanupTheme()
})
</script>
