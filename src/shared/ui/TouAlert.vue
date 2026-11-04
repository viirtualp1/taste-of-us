<template>
  <div :class="cn('rounded-[14px] p-3.5', containerClass, props.class)">
    <div v-if="icon" class="flex items-start gap-3">
      <Icon :name="icon" :class="cn('w-5 h-5 shrink-0 mt-0.5', iconClass)" />
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
    container: 'bg-red-500/10',
    title: 'text-foreground',
    body: 'text-red-700',
    icon: 'text-red-500',
  },
  info: {
    container: 'bg-blue-500/10',
    title: 'text-foreground',
    body: 'text-muted-foreground',
    icon: 'text-blue-500',
  },
  warning: {
    container: 'bg-orange-500/10',
    title: 'text-foreground',
    body: 'text-muted-foreground',
    icon: 'text-orange-500',
  },
  success: {
    container: 'bg-green-500/10',
    title: 'text-foreground',
    body: 'text-muted-foreground',
    icon: 'text-green-600',
  },
}

const containerClass = computed(() => variantStyles[props.variant].container)
const titleClass = computed(() => variantStyles[props.variant].title)
const bodyClass = computed(() => variantStyles[props.variant].body)
const iconClass = computed(() => variantStyles[props.variant].icon)
</script>
