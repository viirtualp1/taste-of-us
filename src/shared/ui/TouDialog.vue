<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('update:modelValue', false)"
      >
        <div class="fixed inset-0 bg-black/50" />
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="modelValue"
            class="relative z-50 glass border border-gray-300/60 rounded-[20px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            style="border-radius: 20px"
          >
            <div
              class="flex items-center justify-between px-4 py-3 border-b border-white/20"
            >
              <h2 class="text-xl font-bold text-gray-900">
                <slot name="title">Select a dish</slot>
              </h2>
              <button
                class="w-10 h-10 shrink-0 flex items-center justify-center rounded-[12px] text-gray-600 hover:bg-white/20 transition-colors"
                aria-label="Close"
                @click="$emit('update:modelValue', false)"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-6">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
