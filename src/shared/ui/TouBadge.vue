<template>
  <span
    :class="
      cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantClasses,
        props.class,
      )
    "
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/shared/lib/utils'

interface Props {
  variant?: 'default' | 'neutral'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  class: undefined,
})

const variantClassesMap = {
  default: 'glass-nested',
  neutral: 'border border-gray-300 bg-gray-50 text-gray-700',
}

const variantClasses = computed(() => variantClassesMap[props.variant])
</script>
