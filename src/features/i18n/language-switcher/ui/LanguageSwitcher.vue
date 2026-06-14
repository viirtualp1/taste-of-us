<template>
  <div
    class="fixed top-4 right-4 z-50"
    style="top: max(1rem, env(safe-area-inset-top))"
    role="navigation"
    :aria-label="t('locale.chooseTitle')"
  >
    <div
      class="glass border border-border rounded-full p-1 flex items-center gap-0.5 shadow-sm"
    >
      <button
        v-for="option in localeOptions"
        :key="option.code"
        type="button"
        class="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all"
        :class="
          locale === option.code
            ? 'bg-green-600 text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-[var(--surface-hover)]'
        "
        :aria-pressed="locale === option.code"
        @click="switchLocale(option.code)"
      >
        {{ option.short }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AppLocale } from '@/shared/i18n'
import { useLocalePreference } from '@/features/i18n/locale-picker'

const { t, locale } = useI18n()
const { switchLocale } = useLocalePreference()

const localeOptions: { code: AppLocale; short: string }[] = [
  { code: 'en', short: 'EN' },
  { code: 'ru', short: 'RU' },
]
</script>
