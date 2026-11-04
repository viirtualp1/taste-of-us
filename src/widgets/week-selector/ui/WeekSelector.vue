<template>
  <section class="surface rounded-[22px] p-3 sm:p-4">
    <div class="flex items-center justify-between gap-2 pl-2 pb-2">
      <label class="relative flex items-center gap-1.5 min-w-0 cursor-pointer">
        <span class="text-[17px] font-semibold truncate">
          {{ t('week.weekOf', { label: weekLabel }) }}
        </span>
        <Icon
          name="heroicons:chevron-down-20-solid"
          class="w-4 h-4 text-green-700 shrink-0"
        />
        <!-- Native date picker sits invisibly over the title, as a tappable menu. -->
        <input
          class="absolute inset-0 opacity-0 cursor-pointer"
          type="date"
          :value="weekStartInput"
          :aria-label="t('week.pickDate')"
          @change="onInputChange"
        />
      </label>
      <div class="flex items-center gap-1 shrink-0">
        <button
          type="button"
          class="icon-btn icon-btn--sm text-green-700"
          :aria-label="t('common.prev')"
          @click="$emit('prev-week')"
        >
          <Icon name="heroicons:chevron-left-20-solid" class="w-5 h-5" />
        </button>
        <button
          type="button"
          class="icon-btn icon-btn--sm text-green-700"
          :aria-label="t('common.next')"
          @click="$emit('next-week')"
        >
          <Icon name="heroicons:chevron-right-20-solid" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1" role="tablist">
      <button
        v-for="(day, dayIndex) in weekDays"
        :key="day.date"
        type="button"
        role="tab"
        class="day"
        :aria-selected="dayIndex === activeDayIndex"
        :aria-label="`${day.display} — ${getDayLabel(dayIndex, selectedMenu)}`"
        :data-today="day.isToday || undefined"
        @click="$emit('select-day', dayIndex)"
      >
        <span class="day__weekday">{{ day.weekdayShort }}</span>
        <span class="day__num">{{ day.dayOfMonth }}</span>
        <span class="day__dot" :data-status="status(dayIndex)" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WeekDay } from '@/shared/lib/utils/date'
import { getDayCount, type MenuSelection, useMenuTranslations } from '@/entities/menu'

interface Props {
  weekLabel: string
  weekStartInput: string
  weekDays: WeekDay[]
  activeDayIndex: number
  selectedMenu: MenuSelection[]
}

const props = defineProps<Props>()

const { t } = useI18n()
const { categories, getDayLabel } = useMenuTranslations()

const emit = defineEmits<{
  'prev-week': []
  'next-week': []
  'select-day': [index: number]
  'week-input-change': [event: Event]
}>()

const status = (dayIndex: number) => {
  const count = getDayCount(dayIndex, props.selectedMenu, categories.value)
  if (count === 0) return 'empty'
  return count === categories.value.length ? 'complete' : 'partial'
}

const onInputChange = (event: Event) => {
  emit('week-input-change', event)
}
</script>

<style scoped>
/* Calendar-style day picker: weekday, date in a circle, a dot for how planned the day is. */
.day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 0 4px;
  border-radius: var(--r);
  transition: background-color 0.15s;
}
.day:active {
  background: rgb(var(--fill) / 0.12);
}
.day__weekday {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: rgb(var(--muted));
}
.day__num {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-size: 19px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  transition:
    background-color 0.2s,
    color 0.2s;
}
.day[data-today] .day__num,
.day[data-today] .day__weekday {
  color: rgb(var(--accent-ink));
  font-weight: 600;
}
.day[aria-selected='true'] .day__num {
  background: rgb(var(--ink));
  color: rgb(var(--bg));
  font-weight: 600;
}
.day[aria-selected='true'][data-today] .day__num {
  background: rgb(var(--accent));
  color: rgb(var(--on-accent));
}
.day__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: transparent;
}
.day__dot[data-status='partial'] {
  background: rgb(var(--orange-500));
}
.day__dot[data-status='complete'] {
  background: rgb(var(--accent));
}
</style>
