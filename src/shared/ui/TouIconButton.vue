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

// Circular buttons, as in iOS toolbars and sheet headers.
const baseClasses =
  'shrink-0 inline-flex items-center justify-center rounded-full transition-[transform,background-color] duration-150 active:scale-[0.92] disabled:opacity-40 disabled:cursor-not-allowed'

const variantClassesMap = {
  ghost: 'text-green-700 hover:bg-gray-500/10',
  close: 'bg-gray-500/[0.14] text-gray-500 hover:bg-gray-500/20',
  danger: 'text-red-500 hover:bg-red-500/10',
}

const sizeClassesMap = {
  sm: 'w-[30px] h-[30px]',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
}

const iconSizeMap = {
  sm: 'w-4 h-4',
  md: 'w-[18px] h-[18px]',
  lg: 'w-5 h-5',
}

const variantClasses = computed(() => variantClassesMap[props.variant])
const sizeClasses = computed(() => sizeClassesMap[props.size])
const iconSizeClasses = computed(() => iconSizeMap[props.size])
</script>
