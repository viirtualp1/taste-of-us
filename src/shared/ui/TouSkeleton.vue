<template>
  <div
    :class="cn('animate-pulse rounded-[10px] bg-gray-500/12', props.class)"
    :style="props.style"
  />
</template>

<script setup lang="ts">
import { cn } from '@/shared/lib/utils'

interface Props {
  class?: string
  style?: string | Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined,
  style: undefined,
})
</script>
