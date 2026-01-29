<template>
  <tou-card class="overflow-hidden flex-shrink-0 min-w-0 h-full">
    <tou-card-content class="space-y-3 sm:space-y-5 md:space-y-6">
      <div
        class="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div class="space-y-1">
          <p
            class="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-500"
          >
            Week selector
          </p>
          <h3 class="text-xl sm:text-2xl font-bold text-gray-900">
            Week of {{ weekLabel }}
          </h3>
          <p class="text-xs sm:text-sm text-gray-600">
            Pick a date to jump to that week.
          </p>
        </div>
        <div class="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
          <button
            class="w-10 h-[42px] sm:w-auto sm:px-3 flex items-center justify-center gap-1.5 rounded-[18px] text-sm font-semibold text-gray-800 bg-white/50 border border-gray-200/50 hover:border-green-300/60 hover:bg-green-50/40 transition-all"
            @click="$emit('prev-week')"
          >
            <Icon name="heroicons:chevron-left" class="w-4 h-4 shrink-0" />
            <span class="hidden sm:inline">Prev</span>
          </button>
          <div
            class="flex-1 sm:flex-none glass-nested rounded-[12px] px-2 sm:px-4 py-2 border"
          >
            <input
              class="bg-transparent text-xs sm:text-sm font-semibold text-gray-800 outline-none w-full sm:w-[120px]"
              type="date"
              :value="weekStartInput"
              @change="onInputChange"
            />
          </div>
          <button
            class="w-10 h-[42px] sm:w-auto sm:px-3 flex items-center justify-center gap-1.5 rounded-[18px] text-sm font-semibold text-gray-800 bg-white/50 border border-gray-200/50 hover:border-green-300/60 hover:bg-green-50/40 transition-all"
            @click="$emit('next-week')"
          >
            <span class="hidden sm:inline">Next</span>
            <Icon name="heroicons:chevron-right" class="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      <div
        ref="daysContainerRef"
        class="flex items-stretch gap-2 sm:gap-3 overflow-x-auto scrollbar-hide rounded-[20px] py-3 -mx-2 px-2"
      >
        <button
          v-for="(day, dayIndex) in weekDays"
          :key="day.date"
          :ref="(el) => { if (el) dayButtonRefs[dayIndex] = el as HTMLElement }"
          class="flex-1 min-w-[80px] sm:min-w-[100px] lg:min-w-[90px] xl:min-w-[120px] rounded-[16px] px-2 sm:px-3 lg:px-2 xl:px-4 py-3 sm:py-4 text-left transition-all flex flex-col gap-1.5"
          :class="
            dayIndex === activeDayIndex
              ? 'glass border border-green-400/60 ring-2 ring-green-200/50 bg-green-50/60'
              : 'glass border border-gray-200/50 hover:border-green-300/60 hover:bg-green-50/40'
          "
          @click="$emit('select-day', dayIndex)"
        >
          <span class="text-xs text-gray-500 truncate">{{ day.name }}</span>
          <span
            class="text-base lg:text-sm xl:text-lg font-semibold text-gray-900 truncate"
          >
            {{ day.short }}
          </span>
          <span
            class="text-xs mt-1 transition-colors min-h-[16px] flex items-center"
            :class="getDayLabelColorClass(dayIndex)"
          >
            {{ getDayLabel(dayIndex) }}
          </span>
        </button>
      </div>
    </tou-card-content>
  </tou-card>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import TouCard from '@/components/ui/TouCard/TouCard.vue'
import TouCardContent from '@/components/ui/TouCard/TouCardContent.vue'
import type { WeekDay } from '@/utils/date'
import type { MenuSelection } from '@/utils/menu'
import {
  getDayLabel as getDayLabelUtil,
  getDayLabelColor,
  CATEGORIES,
} from '@/utils/menu'

interface Props {
  weekLabel: string
  weekStartInput: string
  weekDays: WeekDay[]
  activeDayIndex: number
  selectedMenu: MenuSelection[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'prev-week': []
  'next-week': []
  'select-day': [index: number]
  'week-input-change': [event: Event]
}>()

const daysContainerRef = ref<HTMLElement | null>(null)
const dayButtonRefs = ref<Record<number, HTMLElement>>({})

const scrollToActiveDay = async () => {
  await nextTick()
  if (!daysContainerRef.value) return

  const activeButton = dayButtonRefs.value[props.activeDayIndex]
  if (!activeButton) return

  const container = daysContainerRef.value
  const buttonRect = activeButton.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  const scrollLeft = container.scrollLeft + (buttonRect.left - containerRect.left) - (containerRect.width / 2) + (buttonRect.width / 2)

  container.scrollTo({
    left: scrollLeft,
    behavior: 'smooth',
  })
}

const tryScrollToActive = () => {
  nextTick(() => {
    if (!daysContainerRef.value) return
    const container = daysContainerRef.value
    if (container.scrollWidth > container.clientWidth) {
      scrollToActiveDay()
    }
  })
}
const onInputChange = (event: Event) => {
  emit('week-input-change', event)
}

const getDayLabel = (dayIndex: number) => {
  return getDayLabelUtil(dayIndex, props.selectedMenu, CATEGORIES)
}

const getDayLabelColorClass = (dayIndex: number) => {
  return getDayLabelColor(dayIndex, props.selectedMenu, CATEGORIES)
}

watch(() => props.activeDayIndex, tryScrollToActive)

onMounted(tryScrollToActive)

</script>
