<template>
  <div
    :class="cn('glass border border-border rounded-[20px]', props.class)"
    style="border-radius: 20px"
  >
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
