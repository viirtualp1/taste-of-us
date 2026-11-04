<template>
  <h3
    :class="
      cn(
        'text-[22px] font-bold leading-tight tracking-tight text-foreground',
        props.class,
      )
    "
  >
    <slot />
  </h3>
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
