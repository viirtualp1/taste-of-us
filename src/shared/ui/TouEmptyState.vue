<template>
  <div :class="cn('text-center text-muted-foreground', props.class)">
    <TouIcon
      v-if="icon"
      :name="icon"
      class="mx-auto mb-2 size-10 text-accent-foreground"
      aria-hidden="true"
    />
    <p class="text-ios-title font-bold text-foreground">{{ title }}</p>
    <p v-if="description" class="mx-auto mt-1 max-w-xs text-ios text-balance">
      {{ description }}
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import TouIcon from './TouIcon.vue'
import { cn } from '@/shared/lib/utils'

interface Props {
  title: string
  description?: string
  icon?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  icon: undefined,
  class: 'py-12',
})
</script>
