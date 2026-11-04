<template>
  <div
    class="fixed inset-x-0 bottom-0 z-40 pointer-events-none flex justify-center px-4"
    style="padding-bottom: max(12px, var(--safe-b))"
  >
    <div class="flex items-center gap-2.5 pointer-events-auto">
      <nav
        ref="navRef"
        v-glass="{ bezel: 20, refraction: 18 }"
        class="tabbar glass"
        :aria-label="t('nav.menu')"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="reset"
        @lostpointercapture="reset"
      >
        <a
          v-for="(tab, i) in tabs"
          :key="tab.to"
          :ref="(el) => setTabRef(el, i)"
          :href="localePath(tab.to)"
          class="tab"
          :data-tab="i"
          :aria-current="i === activeIndex ? 'page' : undefined"
          @click.prevent="onKeyboardClick(i, $event)"
        >
          <Icon
            :name="i === activeIndex ? tab.iconActive : tab.icon"
            class="w-5 h-5 shrink-0"
          />
          <span>{{ t(tab.label) }}</span>
        </a>

        <!-- The selection is a lens: a drop of glass that magnifies the tab under it. -->
        <span
          v-show="drop.visible"
          v-glass="{ bezel: 10, refraction: 5, magnify: 0.1, blur: 0, dispersion: 0.15 }"
          class="drop glass"
          :class="{
            'is-moving': isMoving,
            'is-pressed': isPressed,
            'is-dragging': isDragging,
          }"
          :style="{ '--x': `${drop.x}px`, '--w': `${drop.w}px` }"
          aria-hidden="true"
        />
      </nav>
      <!-- Page-specific primary action (e.g. «Send menu») teleports in here. -->
      <div id="tabbar-accessory" class="contents" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
  type ComponentPublicInstance,
} from 'vue'
import { vGlass } from '@/shared/lib/liquid-glass'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()

const tabs = [
  {
    to: '/',
    label: 'nav.menu',
    icon: 'heroicons:calendar-days',
    iconActive: 'heroicons:calendar-days-solid',
  },
  {
    to: '/dishes',
    label: 'nav.dishes',
    icon: 'heroicons:book-open',
    iconActive: 'heroicons:book-open-solid',
  },
  {
    to: '/shopping',
    label: 'nav.shopping',
    icon: 'heroicons:shopping-cart',
    iconActive: 'heroicons:shopping-cart-solid',
  },
] as const

const navRef = ref<HTMLElement | null>(null)
const tabEls: HTMLElement[] = []
const setTabRef = (el: Element | ComponentPublicInstance | null, i: number) => {
  if (el instanceof HTMLElement) tabEls[i] = el
}

const activeIndex = computed(() => {
  const current = route.path.replace(/\/$/, '')
  return tabs.findIndex(
    (tab) => localePath(tab.to).replace(/\/$/, '') === current,
  )
})

const drop = reactive({ x: 0, w: 0, visible: false })
const isMoving = ref(false)
const isPressed = ref(false)
const isDragging = ref(false)
let moveTimer: ReturnType<typeof setTimeout> | undefined

function snapTo(index: number) {
  const el = tabEls[index]
  if (!el) {
    drop.visible = false
    return
  }
  drop.x = el.offsetLeft
  drop.w = el.offsetWidth
  drop.visible = true
}

function flow() {
  isMoving.value = true
  clearTimeout(moveTimer)
  moveTimer = setTimeout(() => (isMoving.value = false), 450)
}

watch(activeIndex, (index, previous) => {
  if (previous !== undefined && previous >= 0 && index >= 0 && !isDragging.value) {
    flow()
  }
  nextTick(() => snapTo(index))
})

let resizeObserver: ResizeObserver | undefined
onMounted(() => {
  nextTick(() => snapTo(activeIndex.value))
  // Labels change width with the locale; keep the drop sized to its tab.
  resizeObserver = new ResizeObserver(() => {
    if (!isDragging.value) snapTo(activeIndex.value)
  })
  if (navRef.value) resizeObserver.observe(navRef.value)
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  clearTimeout(moveTimer)
})

function go(index: number) {
  const tab = tabs[index]
  if (!tab) return
  if (index === activeIndex.value) {
    snapTo(index)
    return
  }
  router.push(localePath(tab.to))
}

/* ---------- Touch: tap a tab, or grab the drop and slide it ---------- */
let startX = 0
let startDropX = 0
let pressedTab = -1

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return
  const tabEl = (e.target as HTMLElement).closest<HTMLElement>('[data-tab]')
  pressedTab = tabEl ? Number(tabEl.dataset.tab) : -1
  isPressed.value = true
  startX = e.clientX
  startDropX = drop.x
  navRef.value?.setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isPressed.value) return
  const dx = e.clientX - startX
  if (!isDragging.value && Math.abs(dx) > 6 && pressedTab === activeIndex.value) {
    isDragging.value = true
  }
  if (!isDragging.value) return
  const first = tabEls[0]
  const last = tabEls[tabEls.length - 1]
  if (!first || !last) return
  const min = first.offsetLeft
  const max = last.offsetLeft + last.offsetWidth - drop.w
  drop.x = Math.min(max, Math.max(min, startDropX + dx))
}

function nearestTab(): number {
  const center = drop.x + drop.w / 2
  let best = 0
  let bestDistance = Infinity
  tabEls.forEach((el, i) => {
    const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - center)
    if (d < bestDistance) {
      bestDistance = d
      best = i
    }
  })
  return best
}

function onPointerUp() {
  if (!isPressed.value) return
  const target = isDragging.value ? nearestTab() : pressedTab
  isPressed.value = false
  isDragging.value = false
  if (target >= 0) {
    flow()
    go(target)
  } else {
    snapTo(activeIndex.value)
  }
}

function reset() {
  if (!isPressed.value && !isDragging.value) return
  isPressed.value = false
  if (isDragging.value) {
    isDragging.value = false
    snapTo(activeIndex.value)
  }
}

// Pointer taps are handled above; a click with detail 0 comes from the keyboard.
function onKeyboardClick(index: number, e: MouseEvent) {
  if (e.detail === 0) go(index)
}
</script>

<style scoped>
/* iOS 26 tab bar: a floating capsule of Liquid Glass, icons left of the labels. */
.tabbar {
  display: flex;
  align-items: center;
  height: var(--tabbar);
  padding: 4px;
  border-radius: var(--r-pill);
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}
.tab {
  position: relative;
  z-index: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  padding: 0 13px;
  border-radius: var(--r-pill);
  color: rgb(var(--ink));
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.25s;
}
.tab[aria-current='page'] {
  color: rgb(var(--accent-ink));
}
.tab:focus-visible {
  outline-offset: -2px;
}

/* ---------- The drop ---------- */
.drop {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 0;
  z-index: 3;
  width: var(--w);
  translate: var(--x) 0;
  border-radius: var(--r-pill);
  pointer-events: none;
  background: rgb(var(--fill) / 0.14);
  -webkit-backdrop-filter: blur(2px) saturate(160%);
  backdrop-filter: blur(2px) saturate(160%);
  box-shadow:
    inset 0 0 8px rgb(255 255 255 / 0.25),
    0 4px 14px rgb(0 0 0 / 0.08);
  transition:
    translate 0.55s cubic-bezier(0.3, 1.3, 0.5, 1),
    width 0.55s cubic-bezier(0.3, 1.3, 0.5, 1),
    scale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color 0.25s;
}
.drop[data-liquid] {
  background: rgb(255 255 255 / 0.08);
}
:global(.dark) .drop[data-liquid] {
  background: rgb(255 255 255 / 0.06);
}
/* Under a finger the drop swells past the bar, like iOS. */
.drop.is-pressed {
  scale: 1.16 1.22;
  background: rgb(255 255 255 / 0.18);
}
.drop.is-dragging {
  transition:
    width 0.3s ease,
    scale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
/* In flight it stretches along the bar and settles with a wobble. */
.drop.is-moving:not(.is-pressed) {
  animation: drop-flow 0.5s cubic-bezier(0.3, 1.2, 0.5, 1);
}
@keyframes drop-flow {
  0% {
    scale: 1;
  }
  30% {
    scale: 1.22 0.84;
  }
  65% {
    scale: 0.95 1.06;
  }
  100% {
    scale: 1;
  }
}
</style>
