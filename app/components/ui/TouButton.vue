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

const baseClasses =
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]'

const variantClassesMap = {
  default:
    'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700',
  destructive:
    'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover:shadow-xl',
  outline:
    'glass border border-gray-200/50 text-gray-800 hover:border-green-300/60 hover:bg-green-50/40',
  secondary: 'glass border border-gray-200/50 text-gray-800 hover:border-green-300/60 hover:bg-green-50/40',
  ghost: 'text-gray-800 hover:bg-green-50/40',
  link: 'text-green-600 underline-offset-4 hover:underline',
}

const sizeClassesMap = {
  default: 'h-11 px-6 py-2 rounded-[22px]',
  sm: 'h-9 rounded-[18px] px-4 text-xs',
  lg: 'h-12 rounded-[24px] px-8 text-base',
  icon: 'h-11 w-11 rounded-[22px]',
}

const variantClasses = computed(() => variantClassesMap[props.variant])
const sizeClasses = computed(() => sizeClassesMap[props.size])

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
</script>
