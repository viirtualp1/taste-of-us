<template>
  <button
    :class="cn(baseClasses, variantClasses, sizeClasses, props.class)"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/shared/lib/utils'

interface Props {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  disabled: false,
  class: undefined,
})

// Apple HIG: controls are capsules — filled for the primary action, tinted or gray otherwise.
const baseClasses =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[transform,opacity,background-color] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40'

const variantClassesMap = {
  default: 'bg-primary text-primary-foreground',
  destructive: 'bg-red-500/12 text-red-500',
  outline: 'bg-green-500/15 text-green-700',
  secondary: 'bg-gray-500/12 text-foreground',
  ghost: 'text-green-700 hover:bg-gray-500/10',
  link: 'text-green-700 underline-offset-4 hover:underline',
}

const sizeClassesMap = {
  default: 'h-11 px-5 text-[15px]',
  sm: 'h-[34px] px-3.5 text-sm',
  lg: 'h-[50px] px-6 text-[17px]',
  icon: 'h-11 w-11',
}

const variantClasses = computed(() => variantClassesMap[props.variant])
const sizeClasses = computed(() => sizeClassesMap[props.size])
</script>
