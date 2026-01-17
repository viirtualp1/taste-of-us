<template>
  <div :class="cn('p-6', props.class)">
    <slot />
  </div>
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
