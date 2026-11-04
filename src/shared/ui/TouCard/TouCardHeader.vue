<template>
  <div :class="cn('flex flex-col space-y-1 p-4 pb-3 sm:p-5 sm:pb-3', props.class)">
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
