<template>
  <FloatingActionsBar>
      <button
        class="flex items-center gap-2 text-gray-900 transition-opacity hover:opacity-70 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isSending"
        @click="$emit('send')"
      >
        <span v-if="isSending" class="flex items-center gap-2 whitespace-nowrap">
          <TouSpinner class="h-4 w-4 shrink-0" />
          <span class="hidden sm:inline">{{ t('common.sending') }}</span>
        </span>
        <span v-else class="flex items-center gap-2 whitespace-nowrap">
          <svg
            class="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          <span class="hidden sm:inline">{{ t('nav.sendMenu') }}</span>
        </span>
      </button>
      <div class="h-4 w-px bg-gray-300/50 shrink-0" />
      <button
        class="flex items-center gap-2 text-gray-900 transition-opacity hover:opacity-70 active:scale-95 whitespace-nowrap"
        @click="$emit('open-dishes')"
      >
        <Icon name="heroicons:pencil-square" class="w-5 h-5 shrink-0" />
        <span class="hidden sm:inline">{{ t('nav.dishes') }}</span>
      </button>
      <div class="h-4 w-px bg-gray-300/50 shrink-0" />
      <button
        class="flex items-center gap-2 text-gray-900 transition-opacity hover:opacity-70 active:scale-95 whitespace-nowrap"
        @click="$emit('open-shopping')"
      >
        <Icon name="heroicons:shopping-cart" class="w-5 h-5 shrink-0" />
        <span class="hidden sm:inline">{{ t('nav.shopping') }}</span>
      </button>
      <div class="h-4 w-px bg-gray-300/50 shrink-0" />
      <button
        class="flex items-center gap-2 text-gray-900 transition-opacity hover:opacity-70 active:scale-95 whitespace-nowrap"
        @click="$emit('open-profile')"
      >
        <Icon name="heroicons:user-circle" class="w-5 h-5 shrink-0" />
        <span class="hidden sm:inline">{{ t('nav.settings') }}</span>
      </button>
  </FloatingActionsBar>
</template>

<script setup lang="ts">
import { FloatingActionsBar } from '@/widgets/floating-actions-bar'
import { TouSpinner } from '@/shared/ui'

interface Props {
  isSending: boolean
}

defineProps<Props>()

defineEmits<{
  send: []
  'open-dishes': []
  'open-shopping': []
  'open-profile': []
}>()

const { t } = useI18n()
</script>
