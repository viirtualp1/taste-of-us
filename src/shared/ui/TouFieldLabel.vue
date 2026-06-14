<template>
  <label :class="cn('block text-sm font-medium text-gray-700 mb-2', props.class)">
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
