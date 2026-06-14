<template>
  <div :class="cn('rounded-[12px] border p-4', containerClass, props.class)">
    <div v-if="icon" class="flex items-start gap-3">
      <Icon :name="icon" :class="cn('w-5 h-5 flex-shrink-0 mt-0.5', iconClass)" />
      <div class="flex-1 min-w-0">
        <h3 v-if="title" :class="cn('text-sm font-semibold mb-2', titleClass)">
          {{ title }}
        </h3>
        <div :class="cn('text-xs', bodyClass)">
          <slot />
        </div>
      </div>
    </div>
    <template v-else>
      <h3 v-if="title" :class="cn('text-sm font-semibold mb-1', titleClass)">
        {{ title }}
      </h3>
      <div :class="cn('text-sm', bodyClass)">
        <slot />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/shared/lib/utils'

type AlertVariant = 'error' | 'info' | 'warning' | 'success'

interface Props {
  variant?: AlertVariant
  title?: string
  icon?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'error',
  title: undefined,
  icon: undefined,
  class: undefined,
})

const variantStyles: Record<
  AlertVariant,
  { container: string; title: string; body: string; icon: string }
> = {
  error: {
    container: 'bg-red-50 border-red-200',
    title: 'text-red-900',
    body: 'text-red-800',
    icon: 'text-red-600',
  },
  info: {
    container: 'bg-blue-50/80 border-blue-200',
    title: 'text-blue-900',
    body: 'text-blue-800',
    icon: 'text-blue-600',
  },
  warning: {
    container: 'bg-yellow-50/80 border-yellow-200',
    title: 'text-yellow-900',
    body: 'text-yellow-800',
    icon: 'text-yellow-600',
  },
  success: {
    container: 'bg-green-50/80 border-green-200',
    title: 'text-green-900',
    body: 'text-green-800',
    icon: 'text-green-600',
  },
}

const containerClass = computed(() => variantStyles[props.variant].container)
const titleClass = computed(() => variantStyles[props.variant].title)
const bodyClass = computed(() => variantStyles[props.variant].body)
const iconClass = computed(() => variantStyles[props.variant].icon)
</script>
