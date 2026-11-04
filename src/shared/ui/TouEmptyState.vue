<template>
  <div :class="cn('text-center', props.class)">
    <Icon
      v-if="icon"
      :name="icon"
      class="w-11 h-11 text-gray-400 mx-auto mb-3"
    />
    <p class="text-[17px] font-semibold text-foreground">{{ title }}</p>
    <p v-if="description" class="text-sm text-muted-foreground mt-1 text-balance">
      {{ description }}
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
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
