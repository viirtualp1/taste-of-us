<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="message"
        :class="[
          'fixed z-[100]',
          'bottom-16 left-4 right-4',
          'sm:left-auto sm:right-4 sm:bottom-6 sm:max-w-[500px] sm:w-max',
          'glass rounded-[16px] px-4 py-3 font-medium shadow-lg',
          type === 'success'
            ? 'text-green-700 bg-green-50/80 border border-green-200/50'
            : 'text-red-700 bg-red-50/80 border border-red-200/50',
        ]"
      >
        <div class="flex justify-center sm:justify-start gap-2 break-words">
          <span class="leading-1">
            {{ message }}
          </span>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  message: string
  type: 'success' | 'error'
}

defineProps<Props>()
</script>
