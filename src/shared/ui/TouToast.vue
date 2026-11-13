<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-3 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-3 scale-95"
    >
      <div
        v-if="message"
        class="toast glass glass-strong fixed z-100 inset-x-0 mx-auto w-max rounded-2xl pl-2.5 pr-5 py-2.5 text-ios font-medium text-foreground"
        role="status"
      >
        <div class="flex items-center gap-2.5 wrap-break-word">
          <span
            class="toast-icon grid place-items-center w-6 h-6 rounded-full shrink-0 text-white"
            :class="type === 'success' ? 'bg-green-500' : 'bg-red-500'"
          >
            <TouIcon
              :name="
                type === 'success'
                  ? 'heroicons:check-20-solid'
                  : 'heroicons:exclamation-triangle-20-solid'
              "
              class="w-4 h-4"
            />
          </span>
          <span class="leading-snug">{{ message }}</span>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import TouIcon from './TouIcon.vue'
interface Props {
  message: string
  type: 'success' | 'error'
}

defineProps<Props>()
</script>

<style scoped>
.toast {
  bottom: calc(var(--dock-h) + var(--safe-b) + 24px);
  max-width: min(calc(100% - 32px), 460px);
}
</style>
