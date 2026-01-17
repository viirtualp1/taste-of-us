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
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-105 active:scale-95'

const variantClassesMap = {
  default:
    'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 glow',
  destructive:
    'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover:shadow-xl',
  outline:
    'glass border-2 border-white/30 text-gray-800 hover:bg-white/20 hover:border-white/50',
  secondary: 'glass text-gray-800 hover:bg-white/30',
  ghost: 'text-gray-800 hover:bg-white/20',
  link: 'text-purple-600 underline-offset-4 hover:underline',
}

const sizeClassesMap = {
  default: 'h-11 px-6 py-2',
  sm: 'h-9 rounded-lg px-4 text-xs',
  lg: 'h-12 rounded-xl px-8 text-base',
  icon: 'h-11 w-11',
}

const variantClasses = computed(() => variantClassesMap[props.variant])
const sizeClasses = computed(() => sizeClassesMap[props.size])

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
</script>
