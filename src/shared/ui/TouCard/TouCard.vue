<template>
  <div :class="cn('surface rounded-lg', props.class)">
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
