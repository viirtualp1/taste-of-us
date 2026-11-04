<template>
  <BottomSheet
    :is-open="isOpen"
    :title="t('locale.chooseTitle')"
    content-class="px-4 pt-1 pb-6 sm:px-5 space-y-4"
    desktop-max-width="max-w-md"
    @close="selectLocale('en')"
  >
    <p class="text-[15px] text-muted-foreground text-center text-balance">
      {{ t('locale.chooseDescription') }}
    </p>

    <div class="list">
      <button
        v-for="option in localeOptions"
        :key="option.code"
        type="button"
        class="list-row justify-between"
        @click="selectLocale(option.code)"
      >
        <span class="flex items-center gap-3">
          <span class="text-2xl" aria-hidden="true">{{ option.flag }}</span>
          <span class="text-[17px]">{{ option.label }}</span>
        </span>
        <Icon
          v-if="locale === option.code"
          name="heroicons:check-20-solid"
          class="w-5 h-5 text-green-700"
        />
      </button>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
import { BottomSheet } from '@/shared/ui'
import type { AppLocale } from '@/shared/i18n'
import { useLocalePreference } from '../model/useLocalePreference'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const { t, locale } = useI18n()
const { switchLocale } = useLocalePreference()

const localeOptions: { code: AppLocale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
]

function selectLocale(code: AppLocale) {
  switchLocale(code)
}
</script>
