import { ref, watch } from 'vue'
import { getStartOfWeek } from '@/utils/date'
import type { MenuSelection } from '@/utils/menu'
import type { WeekDay } from '@/utils/date'

interface Schedule {
  id: string
  week_start: string
  menu_data: MenuSelection[]
  created_at: string
  updated_at: string
}

export function useMenuSchedule(
  weekStart: { value: string },
  isClient: { value: boolean },
  weekDays: { value: WeekDay[] },
) {
  const isLoading = ref(false)
  const selectedMenu = ref<MenuSelection[]>([])

  const loadSchedule = async () => {
    if (!weekStart.value || !isClient.value) return

    isLoading.value = true
    try {
      const weekStartDate = getStartOfWeek(new Date(weekStart.value))
        .toISOString()
        .split('T')[0]
      const schedule = await $fetch<Schedule[]>('/api/schedules', {
        query: { week_start: weekStartDate },
      })

      if (
        schedule &&
        Array.isArray(schedule) &&
        schedule.length > 0 &&
        schedule[0]?.menu_data
      ) {
        const savedMenu = schedule[0].menu_data
        if (
          Array.isArray(savedMenu) &&
          savedMenu.length === weekDays.value.length
        ) {
          selectedMenu.value = savedMenu.map((day: any) => {
            if (day.brunch !== undefined && day.dinner !== undefined) {
              return { brunch: day.brunch || '', dinner: day.dinner || '' }
            }
            if (day.breakfast !== undefined || day.lunch !== undefined) {
              const brunch = day.breakfast || day.lunch || ''
              return { brunch, dinner: day.dinner || '' }
            }
            return { brunch: '', dinner: '' }
          })
          isLoading.value = false
          return
        }
      }

      selectedMenu.value = weekDays.value.map(() => ({
        brunch: '',
        dinner: '',
      }))
    } catch (error) {
      console.error('Error loading schedule:', error)
      selectedMenu.value = weekDays.value.map(() => ({
        brunch: '',
        dinner: '',
      }))
    } finally {
      isLoading.value = false
    }
  }

  const saveSchedule = async () => {
    if (!weekStart.value || !isClient.value || weekDays.value.length === 0)
      return

    try {
      const weekStartDate = getStartOfWeek(new Date(weekStart.value))
        .toISOString()
        .split('T')[0]
      await $fetch('/api/schedules', {
        method: 'POST',
        body: {
          week_start: weekStartDate,
          menu_data: selectedMenu.value,
        },
      })
    } catch (error) {
      console.error('Error saving schedule:', error)
    }
  }

  watch(
    weekStart,
    async () => {
      if (weekDays.value.length > 0) {
        await loadSchedule()
      }
    },
    { immediate: false },
  )

  watch(
    selectedMenu,
    () => {
      if (isClient.value && weekDays.value.length > 0) {
        const timeoutId = setTimeout(() => {
          saveSchedule()
        }, 1000)
        return () => clearTimeout(timeoutId)
      }
    },
    { deep: true },
  )

  watch(
    weekDays,
    (days) => {
      if (days.length > 0 && selectedMenu.value.length !== days.length) {
        selectedMenu.value = days.map(() => ({
          brunch: '',
          dinner: '',
        }))
      }
    },
    { immediate: true },
  )

  return {
    selectedMenu,
    isLoading,
    loadSchedule,
    saveSchedule,
  }
}
