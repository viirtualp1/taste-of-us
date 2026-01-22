<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50"
    >
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          class="fixed inset-0 bg-black/50"
          @click="handleClose"
        />
      </Transition>

      <Transition
        v-if="isMobile"
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-y-full"
        enter-to-class="translate-y-0"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-from-class="translate-y-0"
        leave-to-class="translate-y-full"
      >
        <div
          v-if="isOpen"
          class="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none"
        >
            <div
              v-if="customLayout"
              class="flex flex-col glass border-t border-gray-300/60 rounded-t-[20px] shadow-2xl overflow-hidden transition-all duration-300 pointer-events-auto"
              :class="isExpanded ? 'h-full' : 'h-[65vh]'"
              @click.stop
            >
              <slot name="custom" :is-mobile="true" :is-expanded="isExpanded" :expand="() => { isExpanded = true }" />
            </div>

            <div
              v-else
              class="flex flex-col glass border-t border-gray-300/60 rounded-t-[20px] shadow-2xl overflow-hidden transition-all duration-300 pointer-events-auto"
              :class="isExpanded ? 'h-full' : 'h-[65vh]'"
              @click.stop
            >
              <div
                v-if="title"
                class="flex items-center justify-between px-4 py-3 border-b border-white/20 shrink-0 cursor-pointer"
                @click="handleHeaderClick"
              >
                <h2 class="text-xl font-bold text-gray-900">{{ title }}</h2>
                <button
                  v-if="showCloseButton"
                  class="flex items-center rounded-[12px] p-2 hover:bg-white/20 transition-colors"
                  @click.stop="handleClose"
                >
                  <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div
                class="flex-1 overflow-y-auto overscroll-contain"
                :class="contentClass"
                @click="handleBodyClick"
                @scroll="handleBodyScroll"
              >
                <slot />
              </div>

              <div
                v-if="$slots.footer"
                class="shrink-0 border-t border-white/20"
                @click="handleBodyClick"
              >
                <slot name="footer" />
              </div>
            </div>
          </div>
        </Transition>

        <Transition
          v-else
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            @click="handleClose"
          >
            <div
              v-if="customLayout"
              class="relative z-50 glass border border-gray-300/60 rounded-[20px] shadow-2xl w-full overflow-hidden flex flex-col pointer-events-auto"
              :class="desktopMaxWidth"
              :style="{ height: desktopHeight }"
              @click.stop
            >
              <slot name="custom" :is-mobile="false" :is-expanded="false" />
            </div>

            <div
              v-else
              class="relative z-50 glass border border-gray-300/60 rounded-[20px] shadow-2xl w-full overflow-hidden max-h-[90vh] flex flex-col pointer-events-auto"
              :class="desktopMaxWidth"
              @click.stop
            >
              <div
                v-if="title"
                class="flex items-center justify-between px-4 py-3 border-b border-white/20 shrink-0"
              >
                <h2 class="text-xl font-bold text-gray-900">{{ title }}</h2>
                <button
                  v-if="showCloseButton"
                  class="flex items-center rounded-[12px] p-2 hover:bg-white/20 transition-colors"
                  @click="handleClose"
                >
                  <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div
                class="flex-1 overflow-y-auto"
                :class="contentClass"
              >
                <slot />
              </div>

              <div v-if="$slots.footer" class="shrink-0 border-t border-white/20">
                <slot name="footer" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

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
const isExpanded = ref(false)
const isClosing = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 640
}

const handleClose = () => {
  isClosing.value = true
  emit('close')
}

const handleHeaderClick = (e: MouseEvent) => {
  if (isClosing.value) return
  const target = e.target as HTMLElement
  if (target.closest('button')) return
  if (isMobile.value && !isExpanded.value) {
    isExpanded.value = true
  }
}

const handleBodyClick = (e: MouseEvent) => {
  e.stopPropagation()
}

const handleBodyScroll = () => {
  if (isExpanded.value) return
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    handleClose()
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    isExpanded.value = false
    isClosing.value = false
    document.body.style.overflow = 'hidden'
    checkMobile()
    document.addEventListener('keydown', handleEscape)
  } else {
    isExpanded.value = false
    isClosing.value = false
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleEscape)
  }
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  if (props.isOpen) {
    document.body.style.overflow = 'hidden'
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>
