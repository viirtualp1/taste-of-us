<template>
  <div :class="cn('flex flex-col space-y-1.5 p-6 pb-4', props.class)">
    <slot />
  </div>
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
