<template>
  <div
    class="flex flex-col lg:flex-row lg:items-stretch gap-4 md:gap-6 min-w-0"
  >
    <div class="flex-shrink-0 lg:w-1/3 lg:max-w-[400px]">
      <menu-overview-skeleton v-if="isLoading || !menuData" />
      <menu-overview
        v-else
        :filled-slots="filledSlots"
        :total-slots="totalSlots"
        :completion="completion"
      />
    </div>

    <div
      class="flex-1 flex flex-col gap-4 md:gap-6 h-full min-w-0 overflow-hidden"
    >
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
      />

      <message-toast :message="message" :message-type="messageType" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, watch } from 'vue'
import MenuOverviewSkeleton from '@/components/MenuOverviewSkeleton.vue'
import MenuOverview from '@/components/MenuOverview.vue'
import WeekSelectorSkeleton from '@/components/WeekSelectorSkeleton.vue'
import WeekSelector from '@/components/WeekSelector.vue'
import DayCardSkeleton from '@/components/DayCardSkeleton.vue'
import DayCard from '@/components/DayCard.vue'
import MessageToast from '@/components/MessageToast.vue'
import { useWeekNavigation } from '@/composables/useWeekNavigation'
import { useMenuSchedule } from '@/composables/useMenuSchedule'
import { useMenuSelection } from '@/composables/useMenuSelection'
import { useMenuState } from '@/composables/useMenuState'
import { calculateStats, CATEGORIES, findNextIncompleteDay } from '@/utils/menu'
import type { MenuData, Dish, MenuCategory } from '@/utils/menu'

const { data: menuData } = await useFetch<MenuData>('/api/dishes', {
  default: () => ({
    brunch: [],
    dinner: [],
    dessert: [],
  }),
})

const { data: dishesData, error: dishesError } = await useFetch<Dish[]>(
  '/api/dishes/all',
  {
    default: () => [],
    onResponseError({ response }) {
      console.error(
        'Error fetching dishes:',
        response.status,
        response.statusText,
      )
    },
  },
)

const dishes = computed(() => {
  if (dishesError.value) {
    console.error('Error loading dishes:', dishesError.value)
    return []
  }
  if (!dishesData.value) return []
  if (typeof dishesData.value === 'string') {
    console.error('Received HTML instead of JSON for dishes')
    return []
  }
  if (Array.isArray(dishesData.value)) {
    return dishesData.value
  }
  console.error(
    'Invalid dishes data type:',
    typeof dishesData.value,
    dishesData.value,
  )
  return []
})

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

const { isSending, message, messageType, updateMenu, resetMenu, sendMenu } =
  useMenuSelection(selectedMenu, weekDays)

const { setWeekDays, setSelectedMenu, setIsSending } = useMenuState()

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

provide('menuActions', {
  resetMenu: () => resetMenu(),
  sendMenu: () => sendMenu(saveSchedule),
  isSending,
})

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

const stats = computed(() => {
  if (!weekDays.value.length) {
    return { totalSlots: 0, filledSlots: 0, completion: 0 }
  }
  return calculateStats(selectedMenu.value, weekDays.value.length, CATEGORIES)
})

const totalSlots = computed(() => stats.value.totalSlots)
const filledSlots = computed(() => stats.value.filledSlots)
const completion = computed(() => stats.value.completion)

onMounted(async () => {
  initialize()
  await loadSchedule()
})
</script>
