<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-[minmax(260px,0.75fr)_2.25fr] auto-rows-auto lg:grid-rows-[auto_1fr] gap-4 md:gap-6 min-w-0 w-full overflow-x-hidden"
  >
    <div
      class="min-h-0 min-w-0 order-4 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:self-stretch"
    >
      <shopping-list-preview :week-start="weekStart" />
    </div>

    <div class="min-h-0 min-w-0 order-2 lg:col-start-2 lg:row-start-1">
      <week-selector-skeleton v-if="isLoading || !menuData" />
      <week-selector
        v-else
        :week-label="weekLabel"
        :week-start-input="weekStartInput || ''"
        :week-days="weekDays"
        :active-day-index="activeDayIndex"
        :selected-menu="selectedMenu"
        @prev-week="goPrevWeek"
        @next-week="goNextWeek"
        @select-day="focusDay"
        @week-input-change="onWeekInputChange"
      />
    </div>

    <div class="min-h-0 min-w-0 order-3 lg:col-start-2 lg:row-start-2">
      <day-card-skeleton
        v-if="isLoading || !menuData || !weekDays[activeDayIndex]"
      />
      <day-card
        v-else-if="weekDays[activeDayIndex]"
        :day="weekDays[activeDayIndex] || null"
        :selected-menu="selectedMenu[activeDayIndex] || null"
        :menu-data="menuData"
        :dishes="dishes"
        :day-index="activeDayIndex"
        @update-menu="
          (category, value) => handleMenuUpdate(activeDayIndex, category, value)
        "
        @update-cook="
          (field, value) => updateCook(activeDayIndex, field, value)
        "
      />
    </div>

    <TouToast :message="message" :type="messageType" />
    <action-buttons
      :is-sending="isSending"
      @reset="handleReset"
      @send="handleShowConfirm"
      @open-dishes="handleOpenDishes"
      @open-shopping="handleOpenShopping"
      @open-profile="$emit('open-profile')"
    />
    <confirm-menu-modal
      :is-open="isConfirmModalOpen"
      :week-days="weekDays"
      :selected-menu="selectedMenu"
      :is-sending="isSending"
      @edit="closeConfirmModal"
      @confirm="handleConfirmSend"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useWeekNavigation } from '@/composables/useWeekNavigation'
import { useTelegram } from '@/composables/useTelegram'
import { useMenuSchedule } from '@/composables/useMenuSchedule'
import { useApiFetch } from '@/composables/useApiFetch'
import { useMenuSelection } from '@/composables/useMenuSelection'
import { useMenuState } from '@/composables/useMenuState'
import { type MenuData, type Dish, type MenuCategory, type MenuSelection, CATEGORIES, findNextIncompleteDay } from '@/utils/menu'
import ShoppingListPreview from '@/components/ShoppingListPreview.vue'
import WeekSelectorSkeleton from '@/components/WeekSelectorSkeleton.vue'
import WeekSelector from '@/components/WeekSelector.vue'
import DayCardSkeleton from '@/components/DayCardSkeleton.vue'
import DayCard from '@/components/DayCard.vue'
import TouToast from '@/components/ui/TouToast.vue'
import ActionButtons from '@/components/ActionButtons.vue'
import ConfirmMenuModal from '@/components/ConfirmMenuModal.vue'

defineEmits<{ 'open-profile': [] }>()

const { data: menuData } = await useFetch<MenuData>('/api/dishes', {
  default: () => ({
    brunch: [],
    dinner: [],
    dessert: [],
  }),
})

const { apiFetch } = useApiFetch()
const dishes = ref<Dish[]>([])

const loadUserDishes = async () => {
  try {
    const data = await apiFetch<Record<MenuCategory, Dish[]>>('/api/user/dishes')
    const all: Dish[] = []

    for (const cat of ['brunch', 'dinner', 'dessert'] as const) {
      const list = data[cat] ?? []
      all.push(...list)
    }

    dishes.value = all
  } catch (e) {
    console.error('Error loading user dishes:', e)
    dishes.value = []
  }
}

const {
  weekStart,
  isClient,
  activeDayIndex,
  weekDays,
  weekLabel,
  weekStartInput,
  initialize,
  focusDay,
  goPrevWeek,
  goNextWeek,
  onWeekInputChange,
} = useWeekNavigation()

const { selectedMenu, isLoading, loadSchedule, saveSchedule } = useMenuSchedule(
  weekStart,
  isClient,
  weekDays,
)

const {
  isSending,
  message,
  messageType,
  updateMenu,
  updateCook,
  resetMenu,
  sendMenu,
} = useMenuSelection(selectedMenu, weekDays)

const { setWeekDays, setSelectedMenu, setIsSending } = useMenuState()
const { hapticFeedback } = useTelegram()

const isConfirmModalOpen = ref(false)
const initialSelectedMenu = ref<MenuSelection[]>([])
let toastClearTimer: ReturnType<typeof setTimeout> | null = null

const showToast = (msg: string) => {
  if (toastClearTimer) clearTimeout(toastClearTimer)
  message.value = msg
  messageType.value = 'error'
  toastClearTimer = setTimeout(() => {
    message.value = ''
    toastClearTimer = null
  }, 4000)
}

const handleReset = () => {
  resetMenu()
  hapticFeedback.light()
}

const handleShowConfirm = () => {
  const hasAnyDish = selectedMenu.value.some((day) => {
    if (!day) return false
    return !!(day.brunch || day.dinner || day.dessert)
  })

  if (!hasAnyDish) {
    showToast('Add at least one dish to the menu before sending.')
    hapticFeedback.light()
    return
  }

  const initialJson =
    initialSelectedMenu.value.length > 0
      ? JSON.stringify(initialSelectedMenu.value)
      : null
  const currentJson = JSON.stringify(selectedMenu.value)

  if (initialJson && initialJson === currentJson) {
    showToast('Menu for this week has not changed.')
    hapticFeedback.light()
    return
  }

  isConfirmModalOpen.value = true
  hapticFeedback.light()
}

const closeConfirmModal = () => {
  isConfirmModalOpen.value = false
}

const handleConfirmSend = async () => {
  isConfirmModalOpen.value = false
  await sendMenu(saveSchedule)
  hapticFeedback.success()
}

const handleOpenDishes = () => {
  navigateTo('/dishes')
  hapticFeedback.light()
}

const handleOpenShopping = () => {
  navigateTo('/shopping')
  hapticFeedback.light()
}

watch(
  weekDays,
  (days) => {
    setWeekDays(days)
  },
  { immediate: true },
)

watch(
  selectedMenu,
  (menu) => {
    setSelectedMenu(menu)
  },
  { immediate: true, deep: true },
)

watch(
  () => isSending.value,
  (sending) => {
    setIsSending(sending)
  },
  { immediate: true },
)

const handleMenuUpdate = (
  dayIndex: number,
  category: MenuCategory,
  value: string,
) => {
  updateMenu(dayIndex, category, value)

  const currentMenu = selectedMenu.value[dayIndex]
  if (currentMenu) {
    const hasBrunch = !!currentMenu.brunch
    const hasDinner = !!currentMenu.dinner
    const hasDessert = !!currentMenu.dessert

    if (hasBrunch && hasDinner && hasDessert) {
      const nextIncompleteDay = findNextIncompleteDay(
        dayIndex,
        selectedMenu.value,
        weekDays.value.length,
        CATEGORIES,
      )

      if (nextIncompleteDay !== null) {
        setTimeout(() => {
          focusDay(nextIncompleteDay)
        }, 300)
      }
    }
  }
}

onMounted(async () => {
  initialize()
  await Promise.all([loadUserDishes(), loadSchedule()])
  initialSelectedMenu.value = JSON.parse(
    JSON.stringify(selectedMenu.value),
  ) as MenuSelection[]
})
</script>
