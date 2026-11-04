<template>
  <div class="flex gap-2.5 px-4 pt-3 pb-4 sm:px-5 sm:pb-5">
    <button
      type="button"
      class="btn flex-1 h-[50px]! text-[17px]!"
      @click="$emit('cancel')"
    >
      {{ cancelLabel }}
    </button>
    <button
      type="button"
      class="btn btn--primary flex-1 h-[50px]! text-[17px]!"
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
