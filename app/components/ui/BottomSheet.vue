<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center sm:p-4"
      >
        <div
          class="absolute inset-0 bg-black/50"
          aria-hidden="true"
          @click="handleClose"
        />
        <Transition
          enter-active-class="transition-transform ease-out duration-200"
          enter-from-class="translate-y-full sm:translate-y-0 sm:scale-95"
          enter-to-class="translate-y-0 sm:scale-100"
          leave-active-class="transition-transform ease-in duration-150"
          leave-from-class="translate-y-0 sm:scale-100"
          leave-to-class="translate-y-full sm:translate-y-0 sm:scale-95"
        >
          <div
            v-if="isOpen"
            class="relative z-10 w-full sm:rounded-[20px] rounded-t-[20px] flex flex-col bg-white shadow-2xl border border-gray-200/80 overflow-hidden"
            :class="[
              desktopMaxWidth && desktopMaxWidth !== 'max-w-md' ? desktopMaxWidth : (customLayout ? '' : 'sm:max-w-md'),
              customLayout && desktopHeight ? '' : 'max-h-[65vh] sm:max-h-[90vh]',
            ]"
            :style="customLayout && desktopHeight ? { maxHeight: desktopHeight } : {}"
            role="dialog"
            aria-modal="true"
            @click.stop
          >
            <template v-if="customLayout">
              <slot name="custom" :is-mobile="isMobile" :is-expanded="false" :expand="() => {}" />
            </template>
            <template v-else>
              <div
                v-if="title"
                class="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0"
              >
                <h2 class="text-xl font-bold text-gray-900">{{ title }}</h2>
                <button
                  v-if="showCloseButton"
                  class="w-10 h-10 shrink-0 flex items-center justify-center rounded-[12px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  aria-label="Close"
                  @click="handleClose"
                >
                  <Icon name="heroicons:x-mark" class="w-5 h-5" />
                </button>
              </div>
              <div
                class="flex-1 overflow-y-auto overscroll-contain min-h-0"
                :class="contentClass"
              >
                <slot />
              </div>
              <div
                v-if="$slots.footer"
                class="shrink-0 border-t border-gray-200"
              >
                <slot name="footer" />
              </div>
            </template>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  isOpen: boolean
  title?: string
  showCloseButton?: boolean
  contentClass?: string
  desktopMaxWidth?: string
  desktopHeight?: string
  customLayout?: boolean
  initialHeightRatio?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showCloseButton: true,
  contentClass: 'p-4 sm:p-6',
  desktopMaxWidth: 'max-w-md',
  desktopHeight: 'auto',
  customLayout: false,
  initialHeightRatio: 0.65,
})

const emit = defineEmits<{
  close: []
}>()

const isMobile = ref(false)

function checkMobile() {
  isMobile.value = typeof window !== 'undefined' && window.innerWidth < 640
}

function handleClose() {
  emit('close')
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen) handleClose()
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      document.body.style.overflow = 'hidden'
      checkMobile()
      document.addEventListener('keydown', handleEscape)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  },
)

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  if (props.isOpen) document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>
