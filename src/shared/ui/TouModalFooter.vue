<template>
  <div class="flex gap-3 p-4 sm:p-6">
    <button
      type="button"
      class="flex-1 px-4 py-2.5 rounded-[12px] glass-nested border border-gray-200/50 text-gray-700 font-medium hover:border-green-300/60 hover:bg-green-50/40 transition-all"
      @click="$emit('cancel')"
    >
      {{ cancelLabel }}
    </button>
    <button
      type="button"
      class="flex-1 px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="loading || confirmDisabled"
      @click="$emit('confirm')"
    >
      <span v-if="loading" class="flex items-center justify-center gap-2">
        <TouSpinner />
        {{ loadingLabel || confirmLabel }}
      </span>
      <span v-else>{{ confirmLabel }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import TouSpinner from './TouSpinner.vue'

interface Props {
  cancelLabel: string
  confirmLabel: string
  loadingLabel?: string
  loading?: boolean
  confirmDisabled?: boolean
}

withDefaults(defineProps<Props>(), {
  loadingLabel: undefined,
  loading: false,
  confirmDisabled: false,
})

defineEmits<{
  cancel: []
  confirm: []
}>()
</script>
