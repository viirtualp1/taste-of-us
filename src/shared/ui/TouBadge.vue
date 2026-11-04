<template>
  <span
    :class="
      cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
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
  default: 'bg-gray-500/[0.14] text-gray-500',
  neutral: 'bg-gray-500/[0.14] text-gray-700',
}

const variantClasses = computed(() => variantClassesMap[props.variant])
</script>
