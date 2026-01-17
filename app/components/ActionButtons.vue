<template>
  <div
    class="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-2 py-2"
    style="bottom: max(0.5rem, env(safe-area-inset-bottom));"
  >
    <div
      class="glass rounded-full px-4 py-2.5 flex items-center gap-3 text-sm font-medium"
    >
      <button
        class="flex items-center gap-2 text-gray-900 transition-opacity hover:opacity-70 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isSending"
        @click="$emit('send')"
      >
        <span v-if="isSending" class="flex items-center gap-2">
          <svg
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span class="hidden sm:inline">Sending...</span>
        </span>
        <span v-else class="flex items-center gap-2">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          <span class="hidden sm:inline">Send Menu</span>
        </span>
      </button>
      <div class="h-4 w-px bg-gray-300/50" />
      <button
        class="flex items-center gap-2 text-gray-900 transition-opacity hover:opacity-70 active:scale-95"
        @click="$emit('open-profile')"
      >
        <Icon name="heroicons:user-circle" class="w-5 h-5" />
        <span class="hidden sm:inline">Settings</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isSending: boolean
}

defineProps<Props>()

defineEmits<{
  send: []
  'open-profile': []
}>()
</script>
