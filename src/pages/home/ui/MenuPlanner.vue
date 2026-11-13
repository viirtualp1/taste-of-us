<template>
  <div class="page-columns planner-grid">
    <div class="planner-week min-w-0">
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

    <div class="planner-day min-w-0">
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

    <div class="planner-shopping min-w-0">
      <shopping-list-preview :week-start="weekStart" />
    </div>

    <TouToast :message="message" :type="messageType" />
    <action-buttons :is-sending="isSending" @send="handleShowConfirm" />
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
import {
  useWeekNavigation,
  useMenuSchedule,
  useUserDishes,
  type MenuCategory,
  type MenuSelection,
  findNextIncompleteDay,
  useMenuTranslations,
} from '@/entities/menu'
import { useTelegram, useApiFetch } from '@/entities/user'
import { useProfileSettingsRevision } from '@/features/profile/settings'
import { useMenuSelection } from '@/features/menu/send-menu'
import { ShoppingListPreview } from '@/widgets/shopping-item'
import { WeekSelectorSkeleton, WeekSelector } from '@/widgets/week-selector'
import { DayCardSkeleton, DayCard } from '@/widgets/day-card'
import { TouToast } from '@/shared/ui'
import { ActionButtons } from '@/widgets/action-buttons'
import { ConfirmMenuModal } from '@/features/menu/confirm-menu'

let toastClearTimer: ReturnType<typeof setTimeout> | null = null
let dayFocusTimer: ReturnType<typeof setTimeout> | undefined

const { t } = useI18n()
const settingsRevision = useProfileSettingsRevision()
const { categories } = useMenuTranslations()
const { apiFetch } = useApiFetch()
const { isAuthenticated, hapticFeedback } = useTelegram()
const {
  allDishes,
  isLoading: isDishesLoading,
  load: loadUserDishes,
} = useUserDishes(apiFetch, isAuthenticated)

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

const {
  selectedMenu,
  isLoading: isScheduleLoading,
  loadSchedule,
  saveSchedule,
} = useMenuSchedule(apiFetch, weekStart, isClient, weekDays)

const { isSending, message, messageType, updateMenu, updateCook, sendMenu } =
  useMenuSelection(selectedMenu, weekDays)

const isConfirmModalOpen = ref(false)
const initialSelectedMenu = ref<MenuSelection[]>([])
const isPageLoading = computed(
  () => isScheduleLoading.value || isDishesLoading.value,
)

function showToast(msg: string) {
  if (toastClearTimer) clearTimeout(toastClearTimer)
  message.value = msg
  messageType.value = 'error'
  toastClearTimer = setTimeout(() => {
    message.value = ''
    toastClearTimer = null
  }, 4000)
}

function handleShowConfirm() {
  const hasAnyDish = selectedMenu.value.some((day) => {
    if (!day) return false
    return !!(day.brunch || day.dinner || day.dessert)
  })

  if (!hasAnyDish) {
    showToast(t('menu.addDishBeforeSend'))
    hapticFeedback.light()
    return
  }

  const initialJson =
    initialSelectedMenu.value.length > 0
      ? JSON.stringify(initialSelectedMenu.value)
      : null
  const currentJson = JSON.stringify(selectedMenu.value)

  if (initialJson && initialJson === currentJson) {
    showToast(t('menu.menuNotChanged'))
    hapticFeedback.light()
    return
  }

  isConfirmModalOpen.value = true
  hapticFeedback.light()
}

function closeConfirmModal() {
  isConfirmModalOpen.value = false
}

async function handleConfirmSend() {
  isConfirmModalOpen.value = false
  await sendMenu(saveSchedule)
  hapticFeedback.success()
}

function handleMenuUpdate(
  dayIndex: number,
  category: MenuCategory,
  value: string,
) {
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
    categories.value,
  )

  if (nextIncompleteDay !== null) {
    clearTimeout(dayFocusTimer)
    dayFocusTimer = setTimeout(() => focusDay(nextIncompleteDay), 300)
  }
}

watch(settingsRevision, loadSchedule)

onMounted(async () => {
  initialize()
  await Promise.all([loadUserDishes(), loadSchedule()])
  initialSelectedMenu.value = JSON.parse(
    JSON.stringify(selectedMenu.value),
  ) as MenuSelection[]
})

onBeforeUnmount(() => {
  clearTimeout(toastClearTimer ?? undefined)
  clearTimeout(dayFocusTimer)
})
</script>

<style scoped>
@media (min-width: 900px) {
  .planner-grid {
    grid-template-areas: 'week shopping' 'day shopping';
  }

  .planner-week {
    grid-area: week;
  }
  .planner-day {
    grid-area: day;
  }
  .planner-shopping {
    grid-area: shopping;
  }
}
</style>
