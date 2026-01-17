<template>
  <div class="glass rounded-xl p-4 relative">
    <div class="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
      <tou-button
        class="w-full sm:w-auto sm:min-w-[160px]"
        variant="outline"
        @click="$emit('reset')"
      >
        Reset
      </tou-button>
      <tou-button
        class="w-full sm:w-auto sm:min-w-[180px]"
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
          Sending...
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
          Send Menu
        </span>
      </tou-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import TouButton from '@/components/ui/TouButton.vue'

interface Props {
  isSending: boolean
}

defineProps<Props>()

defineEmits<{
  reset: []
  send: []
}>()
</script>
