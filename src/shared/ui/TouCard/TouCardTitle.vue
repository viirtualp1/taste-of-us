<template>
  <h3
    :class="
      cn(
        'text-2xl font-semibold leading-none tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent',
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
