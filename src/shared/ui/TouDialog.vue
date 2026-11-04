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
        <div class="fixed inset-0 bg-black/30 dark:bg-black/50" />
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
            v-glass="{ bezel: 22, refraction: 14, blur: 16 }"
            class="relative z-50 glass rounded-[28px] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div
              class="flex items-center justify-between px-5 pt-5 pb-2"
            >
              <h2 class="text-[17px] font-semibold text-foreground">
                <slot name="title">Select a dish</slot>
              </h2>
              <TouIconButton
                variant="close"
                icon="heroicons:x-mark-20-solid"
                aria-label="Close"
                @click="$emit('update:modelValue', false)"
              />
            </div>
            <div class="flex-1 overflow-y-auto px-5 pb-5 pt-2">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { vGlass } from '@/shared/lib/liquid-glass'
import TouIconButton from './TouIconButton.vue'

interface Props {
  modelValue: boolean
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
