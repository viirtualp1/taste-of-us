import { computed, ref } from 'vue'
import {
  buildWeekDays,
  formatWeekLabel,
  getWeekStartKey,
  parseDateKey,
  type WeekDay,
} from '@/shared/lib/utils/date'
import { LOCALE_DATE_MAP, type AppLocale } from '@/shared/i18n/constants'

/** Monday of the shown week as a local `YYYY-MM-DD` key. */
const weekStart = ref('')
const isClient = ref(false)
const activeDayIndex = ref(0)

export function useWeekNavigation() {
  const { locale, t } = useI18n()
  const dateLocale = computed(
    () => LOCALE_DATE_MAP[locale.value as AppLocale] ?? 'en-US',
  )

  const weekStartDate = computed(() => {
    if (!weekStart.value) return new Date()
    return parseDateKey(weekStart.value)
  })

  const weekDays = computed<WeekDay[]>(() => {
    if (!isClient.value || !weekStart.value) {
      return []
    }
    try {
      return buildWeekDays(weekStartDate.value, dateLocale.value)
    } catch {
      return []
    }
  })

  const weekLabel = computed(() => {
    if (!isClient.value || !weekStart.value) {
      return t('common.loading')
    }
    return formatWeekLabel(weekStartDate.value, dateLocale.value)
  })

  const weekStartInput = computed(() => {
    if (!isClient.value || !weekStart.value) {
      return ''
    }
    return weekStart.value
  })

  const initialize = () => {
    isClient.value = true

    if (!weekStart.value) {
      const today = new Date()
      weekStart.value = getWeekStartKey(today)
      activeDayIndex.value = (today.getDay() + 6) % 7
    }
  }

  const focusDay = (index: number) => {
    if (index >= 0 && index < weekDays.value.length) {
      activeDayIndex.value = index
    }
  }

  const goPrevWeek = () => {
    const date = new Date(weekStartDate.value)
    date.setDate(date.getDate() - 7)
    weekStart.value = getWeekStartKey(date)
    activeDayIndex.value = 0
  }

  const goNextWeek = () => {
    const date = new Date(weekStartDate.value)
    date.setDate(date.getDate() + 7)
    weekStart.value = getWeekStartKey(date)
    activeDayIndex.value = 0
  }

  const onWeekInputChange = (event: Event) => {
    const value = (event.target as HTMLInputElement).value
    if (!value) return
    weekStart.value = getWeekStartKey(parseDateKey(value))
    activeDayIndex.value = 0
  }

  return {
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
  }
}
