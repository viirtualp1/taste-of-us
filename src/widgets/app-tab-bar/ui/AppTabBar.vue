<template>
  <div
    class="dock"
    :class="{
      'has-action': props.hasAction,
      'material-dock': design === 'material',
    }"
  >
    <MaterialNavigation
      v-if="design === 'material'"
      :account-open="props.accountOpen"
      @account="emit('account')"
    />
    <nav
      v-else
      ref="bar"
      class="tabbar glass"
      :class="{ 'is-dragging': drag?.moved }"
      :aria-label="t('nav.sections')"
      :style="{ '--nav-count': accountIndex + 1 }"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="resetDrag"
      @lostpointercapture="resetDrag"
      @click.capture="onClickCapture"
    >
      <span
        v-show="props.accountOpen || active >= 0"
        class="lens"
        :style="{ '--selection': selection }"
        aria-hidden="true"
      >
        <span
          ref="blob"
          class="blob"
          :style="{ transform: stretchTo(stretch, -stretch / 2) }"
        />
      </span>
      <NuxtLink
        v-for="(link, index) in destinations"
        :key="link.to"
        :to="localePath(link.to)"
        class="nav-link"
        :class="{ 'is-active': index === Math.round(selection) }"
        :aria-current="index === active ? 'page' : undefined"
        draggable="false"
      >
        <TouIcon :name="link.icon" class="nav-icon" aria-hidden="true" />
        <span>{{ t(link.label) }}</span>
      </NuxtLink>
      <TouButton
        type="button"
        variant="ghost"
        class="nav-link account-link"
        aria-haspopup="dialog"
        :aria-expanded="props.accountOpen"
        @click="emit('account')"
      >
        <TouIcon name="heroicons:user-circle" class="nav-icon" />
        <span>{{ t('nav.account') }}</span>
      </TouButton>
    </nav>
    <div id="tabbar-accessory" class="dock-action" />
  </div>
</template>

<script setup lang="ts">
import { TouButton, TouIcon } from '@/shared/ui'
import { useAppearance } from '@/shared/lib/theme'
import MaterialNavigation from './MaterialNavigation.vue'
import { destinations } from './destinations'

interface Drag {
  index: number
  moved: boolean
  pointerId: number
  start: number
  last: number
  lastTime: number
  vertical: boolean
}

const props = defineProps<{
  hasAction: boolean
  accountOpen: boolean
}>()

const emit = defineEmits<{
  account: []
}>()

const accountIndex = destinations.length
const inset = 4
let suppressClick = false
let clickTimer: ReturnType<typeof setTimeout> | undefined
let stretchTimer: ReturnType<typeof setTimeout> | undefined

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { design } = useAppearance()

const bar = useTemplateRef<HTMLElement>('bar')
const blob = useTemplateRef<HTMLElement>('blob')
const drag = ref<Drag | null>(null)
const stretch = ref(0)

const active = computed(() =>
  destinations.findIndex(
    (link) =>
      localePath(link.to).replace(/\/$/, '') === route.path.replace(/\/$/, ''),
  ),
)
const selection = computed(() =>
  props.accountOpen
    ? accountIndex
    : drag.value?.moved
      ? drag.value.index
      : Math.max(0, active.value),
)

function stretchTo(along: number, across: number) {
  return drag.value?.vertical
    ? `scale(${1 + across}, ${1 + along})`
    : `scale(${1 + along}, ${1 + across})`
}

function onDown(event: PointerEvent) {
  if (
    event.button !== 0 ||
    !event.isPrimary ||
    (event.target instanceof Element && event.target.closest('button')) ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return

  const vertical = window.matchMedia('(min-width: 900px)').matches
  const start = vertical ? event.clientY : event.clientX

  drag.value = {
    index: active.value,
    moved: false,
    pointerId: event.pointerId,
    start,
    last: start,
    lastTime: event.timeStamp,
    vertical,
  }
}

function onMove(event: PointerEvent) {
  const current = drag.value
  const element = bar.value
  if (!current || !element || current.pointerId !== event.pointerId) return

  const position = current.vertical ? event.clientY : event.clientX
  if (!current.moved && Math.abs(position - current.start) < 6) return

  if (!current.moved) {
    element.setPointerCapture(event.pointerId)
    current.moved = true
  }

  const rect = element.getBoundingClientRect()
  const start = current.vertical ? rect.top : rect.left
  const size = current.vertical ? rect.height : rect.width
  const tabSize = (size - inset * 2) / (accountIndex + 1)

  current.index = Math.min(
    Math.max((position - start - inset) / tabSize - 0.5, 0),
    destinations.length - 1,
  )
  stretch.value = Math.min(
    (Math.abs(position - current.last) /
      Math.max(event.timeStamp - current.lastTime, 1)) *
      0.35,
    0.4,
  )
  current.last = position
  current.lastTime = event.timeStamp

  clearTimeout(stretchTimer)
  stretchTimer = setTimeout(() => {
    stretch.value = 0
  }, 90)
}

function resetDrag() {
  drag.value = null
  stretch.value = 0
  clearTimeout(stretchTimer)
}

async function onUp(event: PointerEvent) {
  const current = drag.value
  if (current?.pointerId !== event.pointerId) return

  resetDrag()
  if (!current.moved) return

  suppressClick = true
  clearTimeout(clickTimer)
  clickTimer = setTimeout(() => {
    suppressClick = false
  }, 0)

  const target = destinations[Math.round(current.index)]
  if (target) await navigateTo(localePath(target.to))
}

function onClickCapture(event: MouseEvent) {
  if (!suppressClick) return

  event.preventDefault()
  event.stopPropagation()
}

watch(active, (index, previous) => {
  if (
    index < 0 ||
    previous < 0 ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
    return

  const vertical = window.matchMedia('(min-width: 900px)').matches
  blob.value?.animate(
    [
      { transform: 'scale(1)' },
      {
        transform: vertical ? 'scale(0.8, 1.35)' : 'scale(1.35, 0.8)',
        offset: 0.35,
      },
      {
        transform: vertical ? 'scale(1.06, 0.94)' : 'scale(0.94, 1.06)',
        offset: 0.7,
      },
      { transform: 'scale(1)' },
    ],
    { duration: 480, easing: 'ease-out' },
  )
})

onBeforeUnmount(() => {
  clearTimeout(clickTimer)
  clearTimeout(stretchTimer)
})
</script>

<style scoped>
.dock {
  position: fixed;
  left: 50%;
  bottom: calc(var(--safe-b) + 12px);
  z-index: 30;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  width: min(420px, calc(100% - 24px));
}

.tabbar {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(var(--nav-count), minmax(0, 1fr));
  height: var(--tabbar);
  padding: 4px;
  border-radius: var(--r-pill);
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.dock-action {
  display: none;
}

.has-action .dock-action {
  display: block;
  flex: none;
}

.lens {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  z-index: 1;
  width: calc((100% - 8px) / var(--nav-count));
  transform: translateX(calc(var(--selection) * 100%));
  transition: transform 0.5s cubic-bezier(0.3, 1.35, 0.5, 1);
  pointer-events: none;
}

.is-dragging .lens {
  transition: none;
}

.blob {
  display: block;
  height: 100%;
  border-radius: var(--r-pill);
  background: color-mix(in srgb, rgb(var(--accent)) 16%, var(--well));
  transition:
    transform 0.25s cubic-bezier(0.3, 1.5, 0.5, 1),
    background 0.2s,
    box-shadow 0.2s;
}

.is-dragging .blob {
  scale: 1.12;
  background: rgb(255 255 255 / 0.35);
  box-shadow:
    inset 0 0.5px 0 var(--glass-rim),
    0 0 0 0.5px var(--glass-line),
    0 6px 18px rgb(0 0 0 / 0.14);
  transition:
    transform 0.12s ease-out,
    background 0.2s,
    box-shadow 0.2s,
    scale 0.2s;
}

:global(.dark) .is-dragging .blob {
  background: rgb(255 255 255 / 0.12);
}

.nav-link {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: var(--r-pill);
  font-size: 10px;
  font-weight: 600;
  color: rgb(var(--ink));
  transition: color 0.2s;
}

.account-link {
  width: 100%;
  height: 100%;
  padding: 0;
}

.nav-icon {
  width: 22px;
  height: 22px;
  flex: none;
  transition: transform 0.25s cubic-bezier(0.3, 1.5, 0.5, 1);
}

.nav-link:is(.is-active, [aria-expanded='true']) {
  color: rgb(var(--accent-ink));
}

.is-dragging .nav-link.is-active .nav-icon {
  transform: scale(1.12);
}

@media (min-width: 900px) {
  .dock {
    left: max(16px, calc((100% - var(--content-max)) / 2 + 16px));
    top: calc(var(--safe-t) + 16px);
    bottom: auto;
    transform: none;
    width: var(--sidebar);
    flex-direction: column;
  }

  .tabbar {
    flex: none;
    height: auto;
    grid-template-columns: 1fr;
    grid-auto-rows: var(--tap);
    border-radius: var(--r-lg);
  }

  .lens {
    right: 4px;
    bottom: auto;
    width: auto;
    height: var(--tap);
    transform: translateY(calc(var(--selection) * 100%));
  }

  .blob,
  .nav-link {
    border-radius: var(--r);
  }

  .nav-link {
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;
    padding: 0 12px;
    font-size: 14px;
    font-weight: 500;
  }

  .nav-icon {
    width: 19px;
    height: 19px;
  }
}
.material-dock {
  inset: auto 0 0;
  transform: none;
  width: 100%;
  background: var(--md-surface-container);
  box-shadow: 0 -1px 0 var(--md-outline-variant);
}

.material-dock .dock-action {
  position: absolute;
  right: 16px;
  bottom: calc(100% + 16px);
}

@media (min-width: 600px) {
  .material-dock {
    inset: 0 auto 0 0;
    width: var(--md-rail-width);
    flex-direction: column;
    align-items: center;
    padding: calc(var(--safe-t) + 16px) 0 var(--safe-b);
    gap: 16px;
    box-shadow: 1px 0 0 var(--md-outline-variant);
  }

  .material-dock .dock-action {
    position: static;
    order: -1;
  }
}

@media (min-width: 1200px) {
  .material-dock {
    align-items: stretch;
  }

  .material-dock .dock-action {
    padding-inline: 16px;
  }
}
</style>
