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
      <week-selector-skeleton v-if="isPageLoading" />
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
      <day-card-skeleton v-if="isPageLoading || !weekDays[activeDayIndex]" />
      <day-card
        v-else-if="weekDays[activeDayIndex]"
        :day="weekDays[activeDayIndex] || null"
        :selected-menu="selectedMenu[activeDayIndex] || null"
        :dishes="allDishes"
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
import { computed, onMounted, ref } from 'vue'
import {
  useWeekNavigation,
  useMenuSchedule,
  useUserDishes,
  type MenuCategory,
  type MenuSelection,
  CATEGORIES,
  findNextIncompleteDay,
} from '@/entities/menu'
import { useTelegram, useApiFetch } from '@/entities/user'
import { useMenuSelection } from '@/features/menu/send-menu'
import { ShoppingListPreview } from '@/widgets/shopping-item'
import { WeekSelectorSkeleton, WeekSelector } from '@/widgets/week-selector'
import { DayCardSkeleton, DayCard } from '@/widgets/day-card'
import { TouToast } from '@/shared/ui'
import { ActionButtons } from '@/widgets/action-buttons'
import { ConfirmMenuModal } from '@/features/menu/confirm-menu'

defineEmits<{ 'open-profile': [] }>()

const { apiFetch } = useApiFetch()
const { isAuthenticated, hapticFeedback } = useTelegram()
const { allDishes, isLoading: isDishesLoading, load: loadUserDishes } =
  useUserDishes(apiFetch, isAuthenticated)

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

const { selectedMenu, isLoading: isScheduleLoading, loadSchedule, saveSchedule } =
  useMenuSchedule(apiFetch, weekStart, isClient, weekDays)

const {
  isSending,
  message,
  messageType,
  updateMenu,
  updateCook,
  sendMenu,
} = useMenuSelection(selectedMenu, weekDays)

const isPageLoading = computed(
  () => isScheduleLoading.value || isDishesLoading.value,
)

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

const handleMenuUpdate = (
  dayIndex: number,
  category: MenuCategory,
  value: string,
) => {
  updateMenu(dayIndex, category, value)

  const currentMenu = selectedMenu.value[dayIndex]
  if (!currentMenu) return

  const isDayFullySelected =
    !!currentMenu.brunch && !!currentMenu.dinner && !!currentMenu.dessert

  if (!isDayFullySelected) return

  const nextIncompleteDay = findNextIncompleteDay(
    dayIndex,
    selectedMenu.value,
    weekDays.value.length,
    CATEGORIES,
  )

  if (nextIncompleteDay !== null) {
    setTimeout(() => focusDay(nextIncompleteDay), 300)
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
