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
        class="fixed inset-0 z-9999 flex flex-col justify-end sm:justify-center sm:items-center p-2 sm:p-4"
        style="padding-bottom: max(0.5rem, var(--safe-b))"
      >
        <div
          class="absolute inset-0 bg-black/30 dark:bg-black/50"
          aria-hidden="true"
          @click="handleClose"
        />
        <Transition
          enter-active-class="transition-transform ease-[cubic-bezier(0.32,0.72,0,1)] duration-380"
          enter-from-class="translate-y-[110%] sm:translate-y-0 sm:scale-95"
          enter-to-class="translate-y-0 sm:scale-100"
          leave-active-class="transition-transform ease-[cubic-bezier(0.32,0.72,0,1)] duration-200"
          leave-from-class="translate-y-0 sm:scale-100"
          leave-to-class="translate-y-[110%] sm:translate-y-0 sm:scale-95"
        >
          <div
            v-if="isOpen"
            v-glass="{ bezel: 24, refraction: 16, blur: 18, dispersion: 0.08 }"
            class="sheet glass relative z-10 w-full rounded-[32px] sm:rounded-[28px] flex flex-col text-foreground overflow-hidden"
            :class="[
              desktopMaxWidth && desktopMaxWidth !== 'max-w-md' ? desktopMaxWidth : (customLayout ? '' : 'sm:max-w-md'),
              customLayout && desktopHeight ? '' : 'max-h-[85vh] sm:max-h-[90vh]',
            ]"
            :style="customLayout && desktopHeight ? { maxHeight: desktopHeight } : {}"
            role="dialog"
            aria-modal="true"
            @click.stop
          >
            <div
              class="sm:hidden absolute top-[6px] left-1/2 -translate-x-1/2 w-9 h-[5px] rounded-full bg-gray-400/60 z-20"
              aria-hidden="true"
            />
            <template v-if="customLayout">
              <slot name="custom" :is-mobile="isMobile" :is-expanded="false" :expand="() => {}" />
            </template>
            <template v-else>
              <div
                v-if="title"
                class="grid grid-cols-[36px_1fr_36px] items-center gap-2 px-4 pt-5 pb-2 shrink-0"
              >
                <span aria-hidden="true" />
                <h2 class="text-[17px] font-semibold text-center text-foreground truncate">
                  {{ title }}
                </h2>
                <TouIconButton
                  v-if="showCloseButton"
                  variant="close"
                  icon="heroicons:x-mark-20-solid"
                  aria-label="Close"
                  @click="handleClose"
                />
              </div>
              <div
                class="flex-1 overflow-y-auto overscroll-contain min-h-0"
                :class="contentClass"
              >
                <slot />
              </div>
              <div
                v-if="$slots.footer"
                class="shrink-0"
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
import { vGlass } from '@/shared/lib/liquid-glass'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import TouIconButton from './TouIconButton.vue'

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
  contentClass: 'px-4 pb-4 pt-2 sm:px-5 sm:pb-5',
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

<style scoped>
/* iOS 26 sheet: a floating slab of Liquid Glass, concentric with the screen corners.
   Thicker tint than bars so long text stays readable; the page still shows through. */
.sheet {
  background: var(--glass-strong);
  -webkit-backdrop-filter: blur(22px) saturate(190%);
  backdrop-filter: blur(22px) saturate(190%);
  box-shadow:
    inset 0 0 14px var(--glass-glow),
    0 0 0 0.5px var(--glass-line),
    0 24px 70px rgb(0 0 0 / 0.28);
}
</style>
