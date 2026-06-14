<template>
  <input
    :class="cn(baseClasses, sizeClasses, props.class)"
    :value="model"
    v-bind="$attrs"
    @input="model = ($event.target as HTMLInputElement).value"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/shared/lib/utils'

interface Props {
  size?: 'md' | 'sm'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  class: undefined,
})

const model = defineModel<string>({ default: '' })

const baseClasses =
  'border glass-nested rounded-[12px] text-foreground placeholder:text-gray-400 transition-all focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 disabled:opacity-50 disabled:cursor-not-allowed'

const sizeClassesMap = {
  md: 'px-4 py-2.5',
  sm: 'px-3 py-2 text-sm rounded-[10px]',
}

const sizeClasses = computed(() => sizeClassesMap[props.size])
</script>
