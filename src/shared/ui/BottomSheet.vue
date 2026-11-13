<template>
  <Teleport to="body">
    <Transition name="sheet-overlay">
      <div
        v-if="props.isOpen"
        class="fixed inset-0 z-9999 flex flex-col items-center justify-end"
      >
        <div
          class="sheet-backdrop absolute inset-0 bg-black/30"
          aria-hidden="true"
          @click="handleClose"
        />
        <div
          ref="sheet"
          class="sheet glass glass-strong relative z-10 flex w-full flex-col overflow-hidden text-foreground"
          :class="
            props.desktopMaxWidth === 'max-w-md'
              ? 'sheet-default'
              : props.desktopMaxWidth
          "
          :style="
            props.customLayout && props.desktopHeight !== 'auto'
              ? { maxHeight: props.desktopHeight }
              : undefined
          "
          role="dialog"
          aria-modal="true"
          :aria-labelledby="
            !props.customLayout && props.title ? headingId : undefined
          "
          :aria-label="props.customLayout ? props.title : undefined"
          tabindex="-1"
          @keydown.tab="trapFocus"
          @click.stop
        >
          <div class="handle" aria-hidden="true" />
          <template v-if="props.customLayout">
            <slot name="custom" />
          </template>
          <template v-else>
            <header
              v-if="props.title"
              class="flex shrink-0 items-center justify-between gap-2 px-4 pb-2"
            >
              <h2
                :id="headingId"
                class="text-ios-title font-bold text-foreground"
              >
                {{ props.title }}
              </h2>
              <TouIconButton
                v-if="props.showCloseButton"
                variant="close"
                icon="heroicons:x-mark-20-solid"
                aria-label="Close"
                @click="handleClose"
              />
            </header>
            <div
              class="flex-1 overflow-y-auto overscroll-contain min-h-0"
              :class="props.contentClass"
            >
              <slot />
            </div>
            <div v-if="$slots.footer" class="shrink-0">
              <slot name="footer" />
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useId, watch, nextTick, ref } from 'vue'
import TouIconButton from './TouIconButton.vue'

interface Props {
  isOpen: boolean
  title?: string
  showCloseButton?: boolean
  contentClass?: string
  desktopMaxWidth?: string
  desktopHeight?: string
  customLayout?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showCloseButton: true,
  contentClass: 'px-4 pb-4 pt-2 sm:px-5 sm:pb-5',
  desktopMaxWidth: 'max-w-md',
  desktopHeight: 'auto',
  customLayout: false,
})

const emit = defineEmits<{
  close: []
}>()

const focusableSelector = 'button, a[href], input, select, textarea, [tabindex]'
const headingId = useId()

const sheet = ref<HTMLElement | null>(null)

function handleClose() {
  emit('close')
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') handleClose()
}

function trapFocus(event: KeyboardEvent) {
  const panel = sheet.value
  if (!panel) return

  const controls = [
    ...panel.querySelectorAll<HTMLElement>(focusableSelector),
  ].filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.matches(':disabled') &&
      element.getClientRects().length,
  )
  const first = controls[0]
  const last = controls[controls.length - 1]
  const focused = document.activeElement

  if (!first || !last) {
    event.preventDefault()
    return
  }

  if (
    !panel.contains(focused) ||
    focused === panel ||
    focused === (event.shiftKey ? first : last)
  ) {
    event.preventDefault()
    const next = event.shiftKey ? last : first
    next.focus()
  }
}

watch(
  () => props.isOpen,
  async (open, _previous, onCleanup) => {
    if (!open || typeof document === 'undefined') return

    const trigger = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleEscape)

    onCleanup(() => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', handleEscape)
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus({ preventScroll: true })
    })

    await nextTick()
    if (props.isOpen && !sheet.value?.contains(document.activeElement))
      sheet.value?.focus({ preventScroll: true })
  },
  { immediate: true },
)
</script>

<style scoped>
.sheet {
  max-height: 90dvh;
  padding: 8px 0 var(--safe-b);
  border-radius: var(--r-sheet) var(--r-sheet) 0 0;
}

.handle {
  width: 36px;
  height: 5px;
  flex: none;
  margin: 0 auto 10px;
  border-radius: var(--r-pill);
  background: var(--well);
}

.sheet-overlay-enter-active,
.sheet-overlay-leave-active {
  transition: opacity 0.35s ease;
}

.sheet-overlay-enter-active .sheet,
.sheet-overlay-leave-active .sheet {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-overlay-enter-from,
.sheet-overlay-leave-to {
  opacity: 0;
}

.sheet-overlay-enter-from .sheet,
.sheet-overlay-leave-to .sheet {
  transform: translateY(100%);
}

@media (min-width: 600px) {
  .sheet-default {
    max-width: 480px;
  }
}
</style>
