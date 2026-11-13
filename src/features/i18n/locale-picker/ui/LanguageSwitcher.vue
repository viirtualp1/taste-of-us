<template>
  <div
    class="segmented max-w-xs"
    role="group"
    :aria-label="t('locale.language')"
  >
    <TouButton
      v-for="option in localeOptions"
      :key="option.code"
      type="button"
      variant="ghost"
      :aria-pressed="locale === option.code"
      @click="switchLocale(option.code)"
    >
      {{ option.label }}
    </TouButton>
  </div>
</template>

<script setup lang="ts">
import { TouButton } from '@/shared/ui'
import { useLocalePreference } from '@/features/i18n/locale-picker/model/useLocalePreference'
import type { AppLocale } from '@/shared/i18n'

const localeOptions: { code: AppLocale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
]

const { t, locale } = useI18n()
const { switchLocale } = useLocalePreference()
</script>
