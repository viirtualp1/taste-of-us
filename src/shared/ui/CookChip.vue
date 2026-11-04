<template>
  <button
    type="button"
    class="min-h-[44px] w-full px-4 rounded-full text-[15px] font-semibold transition-[transform,background-color,color] duration-150 touch-manipulation active:scale-[0.97]"
    :class="
      selected
        ? 'bg-primary text-primary-foreground'
        : 'bg-gray-500/12 text-foreground'
    "
    :aria-pressed="selected"
    @click="$emit('select')"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  selected: boolean
}>()

defineEmits<{ select: [] }>()
</script>
