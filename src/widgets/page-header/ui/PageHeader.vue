<template>
  <header class="flex items-end justify-between gap-3 pb-4">
    <div class="min-w-0">
      <h1 class="large-title truncate">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-[15px] text-muted-foreground truncate">
        {{ subtitle }}
      </p>
    </div>
    <div class="flex items-center gap-2 shrink-0 pb-1">
      <slot name="actions" />
      <LanguageSwitcher />
    </div>
  </header>
</template>

<script setup lang="ts">
import { LanguageSwitcher } from '@/features/i18n/locale-picker'

defineProps<{
  title: string
  subtitle?: string
}>()
</script>
