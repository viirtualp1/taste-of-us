import { computed, ref } from 'vue'
import {
  getStartOfWeek,
  buildWeekDays,
  formatWeekLabel,
  formatWeekStartDate,
  type WeekDay,
} from '@/shared/lib/utils/date'
import { LOCALE_DATE_MAP, type AppLocale } from '@/shared/i18n/constants'

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
    return new Date(weekStart.value)
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
    return formatWeekStartDate(weekStart.value)
  })

  const initialize = () => {
    isClient.value = true

    if (!weekStart.value) {
      weekStart.value = getStartOfWeek(new Date()).toISOString()

      const today = new Date()
      const currentWeekStart = getStartOfWeek(today)
      const dayOfWeek = (today.getDay() + 6) % 7

      if (weekStart.value === currentWeekStart.toISOString()) {
        activeDayIndex.value = dayOfWeek
      }
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
    weekStart.value = getStartOfWeek(date).toISOString()
    activeDayIndex.value = 0
  }

  const goNextWeek = () => {
    const date = new Date(weekStartDate.value)
    date.setDate(date.getDate() + 7)
    weekStart.value = getStartOfWeek(date).toISOString()
    activeDayIndex.value = 0
  }

  const onWeekInputChange = (event: Event) => {
    const value = (event.target as HTMLInputElement).value
    if (!value) return
    weekStart.value = getStartOfWeek(new Date(value)).toISOString()
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
