<template>
  <tou-card class="overflow-hidden flex-shrink-0 min-w-0">
    <tou-card-content class="space-y-4 md:space-y-5">
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
          <tou-button
            variant="ghost"
            class="flex-1 sm:flex-none sm:shrink flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30"
            @click="$emit('prev-week')"
          >
            <Icon name="heroicons:chevron-left" class="w-4 h-4" />
            <span>Prev</span>
          </tou-button>
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
          <tou-button
            variant="ghost"
            class="flex-1 sm:flex-none sm:shrink-0 flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30"
            @click="$emit('next-week')"
          >
            <span>Next</span>
            <Icon name="heroicons:chevron-right" class="w-4 h-4" />
          </tou-button>
        </div>
      </div>

      <div
        class="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide rounded-[20px] py-2 -mx-2 px-2"
      >
        <button
          v-for="(day, dayIndex) in weekDays"
          :key="day.date"
          class="min-w-[100px] sm:min-w-[120px] lg:min-w-[110px] xl:min-w-[140px] flex-shrink-0 rounded-[16px] px-2 sm:px-3 lg:px-2 xl:px-4 py-2 sm:py-3 text-left transition-all flex flex-col gap-1"
          :class="
            dayIndex === activeDayIndex
              ? 'glass border border-pink-400/60 ring-2 ring-pink-200/50 bg-pink-50/60'
              : 'glass border border-white/40 hover:border-pink-300/60 hover:bg-pink-50/40'
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
            class="text-xs mt-1 transition-colors"
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
import TouCard from '@/components/ui/TouCard/TouCard.vue'
import TouCardContent from '@/components/ui/TouCard/TouCardContent.vue'
import TouButton from '@/components/ui/TouButton.vue'
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

const onInputChange = (event: Event) => {
  emit('week-input-change', event)
}

const getDayLabel = (dayIndex: number) => {
  return getDayLabelUtil(dayIndex, props.selectedMenu, CATEGORIES)
}

const getDayLabelColorClass = (dayIndex: number) => {
  return getDayLabelColor(dayIndex, props.selectedMenu, CATEGORIES)
}
</script>
