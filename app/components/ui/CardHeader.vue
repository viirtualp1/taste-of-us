<template>
  <div :class="cn('flex flex-col space-y-1.5 p-6 pb-4', props.class)">
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
