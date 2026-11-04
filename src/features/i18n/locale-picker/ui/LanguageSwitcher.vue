<template>
  <div
    v-glass="{ bezel: 12, refraction: 10 }"
    class="segmented glass p-[3px]!"
    role="group"
    :aria-label="t('locale.chooseTitle')"
  >
    <button
      v-for="option in localeOptions"
      :key="option.code"
      type="button"
      class="h-[30px]! px-2.5! text-xs! font-semibold! tracking-wide"
      :aria-pressed="locale === option.code"
      @click="switchLocale(option.code)"
    >
      {{ option.short }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { vGlass } from '@/shared/lib/liquid-glass'
import type { AppLocale } from '@/shared/i18n'
import { useLocalePreference } from '../model/useLocalePreference'

const { t, locale } = useI18n()
const { switchLocale } = useLocalePreference()

const localeOptions: { code: AppLocale; short: string }[] = [
  { code: 'en', short: 'EN' },
  { code: 'ru', short: 'RU' },
]
</script>
