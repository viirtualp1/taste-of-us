<template>
  <label :class="cn('block px-1 mb-1.5 text-[13px] uppercase tracking-[0.02em] text-muted-foreground', props.class)">
    <slot />
  </label>
</template>

<script setup lang="ts">
import { cn } from '@/shared/lib/utils'

interface Props {
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined,
})
</script>
