<template>
  <label :class="cn('text-sm font-semibold leading-none text-gray-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-70', props.class)">
    <slot />
  </label>
</template>

<script setup lang="ts">
interface Props {
  class?: string
}

const props = withDefaults(defineProps<Props>(), {})

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
</script>
