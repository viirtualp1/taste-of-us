import { ref, watch } from 'vue'
import { getStartOfWeek, formatWeekStartDate } from '@/shared/lib/utils/date'
import { debounce } from '@/shared/lib/utils/debounce'
import {
  createEmptyMenuSelection,
  createEmptyWeekMenu,
} from '../lib/menuHelpers'
import {
  applyRotationPreFill,
  type CookRotationFirst,
  type CookRotationMode,
} from '../lib/cookRotation'
import type { MenuSelection } from './types'
import type { WeekDay } from '@/shared/lib/utils/date'

const SAVE_DEBOUNCE_MS = 1500

interface Schedule {
  id: string
  week_start: string
  menu_data: MenuSelection[]
  created_at: string
  updated_at: string
}

type ApiFetch = <T = unknown>(
  url: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    body?: unknown
    query?: Record<string, string | number | boolean | undefined>
  },
) => Promise<T>

interface CookSettings {
  cook_rotation_mode: CookRotationMode
  cook_rotation_first: CookRotationFirst
  second_member_telegram_chat_id: string
}

async function loadCookSettings(apiFetch: ApiFetch): Promise<CookSettings> {
  try {
    const response = await apiFetch<CookSettings>('/api/user/settings')
    return {
      cook_rotation_mode: response?.cook_rotation_mode ?? 'none',
      cook_rotation_first: response?.cook_rotation_first ?? 'me',
      second_member_telegram_chat_id:
        response?.second_member_telegram_chat_id?.trim() ?? '',
    }
  } catch {
    return {
      cook_rotation_mode: 'none',
      cook_rotation_first: 'me',
      second_member_telegram_chat_id: '',
    }
  }
}

function withRotationPreFill(
  menu: MenuSelection[],
  settings: CookSettings,
): MenuSelection[] {
  const hasSecondMember = settings.second_member_telegram_chat_id.length > 0
  return applyRotationPreFill(
    menu,
    settings.cook_rotation_mode,
    settings.cook_rotation_first,
    hasSecondMember,
  )
}

function normalizeSavedDay(day: unknown): MenuSelection {
  const dayData = day as Partial<
    MenuSelection & { breakfast?: string; lunch?: string }
  >
  const base = {
    cook_day: (dayData.cook_day as MenuSelection['cook_day']) || '',
    cook_brunch: (dayData.cook_brunch as MenuSelection['cook_brunch']) || '',
    cook_dinner: (dayData.cook_dinner as MenuSelection['cook_dinner']) || '',
    cook_dessert: (dayData.cook_dessert as MenuSelection['cook_dessert']) || '',
  }

  if (dayData.brunch !== undefined && dayData.dinner !== undefined) {
    return {
      brunch: dayData.brunch || '',
      dinner: dayData.dinner || '',
      dessert: dayData.dessert || '',
      ...base,
    }
  }

  if (dayData.breakfast !== undefined || dayData.lunch !== undefined) {
    return {
      brunch: dayData.breakfast || dayData.lunch || '',
      dinner: dayData.dinner || '',
      dessert: dayData.dessert || '',
      ...base,
    }
  }

  return { ...createEmptyMenuSelection(), ...base }
}

export function useMenuSchedule(
  apiFetch: ApiFetch,
  weekStart: { value: string },
  isClient: { value: boolean },
  weekDays: { value: WeekDay[] },
) {
  const isLoading = ref(false)
  const selectedMenu = ref<MenuSelection[]>([])
  let cookSettings: CookSettings = {
    cook_rotation_mode: 'none',
    cook_rotation_first: 'me',
    second_member_telegram_chat_id: '',
  }

  const getWeekStartDate = () =>
    formatWeekStartDate(getStartOfWeek(new Date(weekStart.value)).toISOString())

  const resetToEmptyWeek = () => {
    if (!weekDays.value?.length) return
    selectedMenu.value = withRotationPreFill(
      createEmptyWeekMenu(weekDays.value.length),
      cookSettings,
    )
  }

  const loadSchedule = async () => {
    if (!weekStart.value || !isClient.value) return

    isLoading.value = true
    try {
      cookSettings = await loadCookSettings(apiFetch)

      const schedule = await apiFetch<Schedule[]>('/api/schedules', {
        query: { week_start: getWeekStartDate() },
      })

      const savedMenu = schedule?.[0]?.menu_data
      if (
        Array.isArray(savedMenu) &&
        weekDays.value?.length &&
        savedMenu.length === weekDays.value.length
      ) {
        selectedMenu.value = withRotationPreFill(
          savedMenu.map(normalizeSavedDay),
          cookSettings,
        )
        return
      }

      resetToEmptyWeek()
    } catch (error) {
      console.error('Error loading schedule:', error)
      resetToEmptyWeek()
    } finally {
      isLoading.value = false
    }
  }

  const saveSchedule = async () => {
    if (!weekStart.value || !isClient.value || !weekDays.value?.length) return

    try {
      await apiFetch('/api/schedules', {
        method: 'POST',
        body: {
          week_start: getWeekStartDate(),
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
      if (weekDays.value?.length) {
        await loadSchedule()
      }
    },
    { immediate: false },
  )

  const debouncedSave = debounce(saveSchedule, SAVE_DEBOUNCE_MS)

  watch(
    selectedMenu,
    () => {
      if (isClient.value && weekDays.value?.length) {
        debouncedSave()
      }
    },
    { deep: true },
  )

  watch(
    weekDays,
    (days) => {
      if (days?.length && selectedMenu.value.length !== days.length) {
        selectedMenu.value = withRotationPreFill(
          createEmptyWeekMenu(days.length),
          cookSettings,
        )
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
