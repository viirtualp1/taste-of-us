<template>
  <button
    type="button"
    :class="cn(baseClasses, variantClasses, sizeClasses, props.class)"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <Icon v-if="icon" :name="icon" :class="iconSizeClasses" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/shared/lib/utils'

interface Props {
  icon?: string
  variant?: 'ghost' | 'close' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: undefined,
  variant: 'ghost',
  size: 'md',
  disabled: false,
  class: undefined,
})

const baseClasses =
  'shrink-0 inline-flex items-center justify-center rounded-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400/60 disabled:opacity-50 disabled:cursor-not-allowed'

const variantClassesMap = {
  ghost: 'text-gray-600 hover:bg-[var(--surface-hover)] hover:text-foreground',
  close:
    'text-muted-foreground hover:bg-[var(--surface-hover)] hover:text-foreground',
  danger: 'text-red-500 hover:bg-red-50/50',
}

const sizeClassesMap = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-11 h-11',
}

const iconSizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
}

const variantClasses = computed(() => variantClassesMap[props.variant])
const sizeClasses = computed(() => sizeClassesMap[props.size])
const iconSizeClasses = computed(() => iconSizeMap[props.size])
</script>
