<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50"
        @keydown.esc="handleClose"
      >
        <div
          class="fixed inset-0 bg-black/50 transition-opacity"
          :style="isMobile ? { opacity: backdropOpacity } : {}"
          @click="handleClose"
        />

        <div
          v-if="isMobile"
          class="fixed inset-x-0 bottom-0 z-50 flex flex-col touch-none select-none"
          :style="sheetStyle"
        >
          <div
            class="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            @touchstart.prevent="handleTouchStart"
            @touchmove.prevent="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <div class="w-10 h-1.5 rounded-full bg-white/80 shadow-sm" />
          </div>

          <div
            v-if="customLayout"
            class="flex-1 flex flex-col glass rounded-t-[20px] shadow-2xl overflow-hidden"
          >
            <slot name="custom" :is-mobile="true" />
          </div>

          <div
            v-else
            class="flex-1 flex flex-col glass rounded-t-[20px] shadow-2xl overflow-hidden"
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
              class="flex-1 overflow-y-auto overscroll-contain"
              :class="contentClass"
            >
              <slot />
            </div>

            <div v-if="$slots.footer" class="shrink-0 border-t border-white/20">
              <slot name="footer" />
            </div>
          </div>
        </div>

        <Transition
          v-else
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              v-if="customLayout"
              class="relative z-50 glass rounded-[20px] shadow-2xl w-full overflow-hidden flex flex-col"
              :class="desktopMaxWidth"
              :style="{ height: desktopHeight }"
            >
              <slot name="custom" :is-mobile="false" />
            </div>

            <div
              v-else
              class="relative z-50 glass rounded-[20px] shadow-2xl w-full overflow-hidden max-h-[90vh] flex flex-col"
              :class="desktopMaxWidth"
            >
              <div
                v-if="title"
                class="flex items-center justify-between p-6 border-b border-white/20 shrink-0"
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
    </Transition>
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
  initialHeightRatio: 0.55,
})

const emit = defineEmits<{
  close: []
}>()

const isDragging = ref(false)
const dragStartY = ref(0)
const dragStartHeight = ref(0)
const currentHeight = ref(0)
const isMobile = ref(false)

const HANDLE_HEIGHT = 42
const MIN_HEIGHT = 120
const TOP_OFFSET = 10

const checkMobile = () => {
  isMobile.value = window.innerWidth < 640
}

const maxHeight = computed(() => {
  return window.innerHeight - TOP_OFFSET - HANDLE_HEIGHT
})

const initialHeight = computed(() => {
  return Math.min(window.innerHeight * props.initialHeightRatio, 450)
})

const sheetStyle = computed(() => {
  const height = isDragging.value ? currentHeight.value : (currentHeight.value || initialHeight.value)

  return {
    height: `${height + HANDLE_HEIGHT}px`,
    transition: isDragging.value ? 'none' : 'height 0.3s ease-out',
  }
})

const backdropOpacity = computed(() => {
  if (!isDragging.value) return 1
  const height = currentHeight.value || initialHeight.value
  const dismissThreshold = initialHeight.value * 0.3
  if (height < dismissThreshold) {
    return Math.max(0, height / dismissThreshold)
  }
  return 1
})

const handleTouchStart = (e: TouchEvent) => {
  isDragging.value = true
  dragStartY.value = e.touches[0].clientY
  dragStartHeight.value = currentHeight.value || initialHeight.value
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return

  const deltaY = dragStartY.value - e.touches[0].clientY
  const newHeight = Math.max(MIN_HEIGHT, Math.min(maxHeight.value, dragStartHeight.value + deltaY))
  currentHeight.value = newHeight
}

const handleTouchEnd = () => {
  if (!isDragging.value) return

  const height = currentHeight.value
  const dismissThreshold = initialHeight.value * 0.35

  if (height < dismissThreshold) {
    handleClose()
  } else if (height > initialHeight.value * 1.3) {
    currentHeight.value = maxHeight.value
  } else {
    currentHeight.value = initialHeight.value
  }

  isDragging.value = false
}

const handleClose = () => {
  emit('close')
}

watch(() => props.isOpen, (open) => {
  if (open) {
    currentHeight.value = initialHeight.value
    document.body.style.overflow = 'hidden'
    checkMobile()
  } else {
    document.body.style.overflow = ''
    currentHeight.value = 0
  }
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  if (props.isOpen) {
    document.body.style.overflow = 'hidden'
    currentHeight.value = initialHeight.value
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.body.style.overflow = ''
})
</script>
