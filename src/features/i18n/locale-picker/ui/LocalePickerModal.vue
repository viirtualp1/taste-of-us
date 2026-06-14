<template>
  <BottomSheet
    :is-open="isOpen"
    :title="t('locale.chooseTitle')"
    content-class="p-4 sm:p-6 space-y-4"
    desktop-max-width="max-w-md"
    @close="selectLocale('en')"
  >
    <p class="text-sm text-gray-600 text-center">
      {{ t('locale.chooseDescription') }}
    </p>

    <div class="grid grid-cols-1 gap-3">
      <button
        v-for="option in localeOptions"
        :key="option.code"
        type="button"
        class="flex items-center justify-between px-4 py-4 rounded-[16px] border text-left transition-all hover:border-green-400 hover:bg-green-50/50 active:scale-[0.99]"
        :class="
          locale === option.code
            ? 'border-green-500 bg-green-50 shadow-sm'
            : 'border-gray-200 bg-white'
        "
        @click="selectLocale(option.code)"
      >
        <span class="flex items-center gap-3">
          <span class="text-2xl" aria-hidden="true">{{ option.flag }}</span>
          <span class="font-semibold text-gray-900">{{ option.label }}</span>
        </span>
        <Icon
          v-if="locale === option.code"
          name="heroicons:check-circle"
          class="w-5 h-5 text-green-600"
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
