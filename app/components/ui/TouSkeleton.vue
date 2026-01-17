<template>
  <div
    :class="cn('animate-pulse rounded-md bg-gray-200', props.class)"
    :style="props.style"
  />
</template>

<script setup lang="ts">
interface Props {
  class?: string
  style?: string | Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined,
  style: undefined,
})

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
</script>
