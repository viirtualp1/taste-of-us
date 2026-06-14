<template>
  <button
    type="button"
    class="min-h-[44px] w-full px-4 rounded-[12px] text-sm font-medium transition-all touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400/60 focus-visible:ring-offset-2"
    :class="
      selected
        ? 'bg-[var(--surface-selected)] border-2 border-green-400/60 text-foreground shadow-sm'
        : 'glass-nested border border-border text-muted-foreground hover:border-green-400/50 hover:bg-[var(--surface-hover)] active:scale-[0.98]'
    "
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
