<template>
  <div
    class="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-2 py-2"
    style="bottom: max(0.5rem, env(safe-area-inset-bottom))"
  >
    <div
      class="glass border border-gray-300/60 rounded-full px-4 py-2.5 flex items-center gap-3 text-sm font-medium"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// Presentational shell for floating bottom action buttons
</script>

