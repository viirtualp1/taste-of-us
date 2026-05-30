import { ref } from 'vue'
import {
  createEmptyMenuSelection,
  createEmptyWeekMenu,
} from '@/entities/menu'
import type { MenuCategory, MenuSelection, CookSlot } from '@/entities/menu'
import type { WeekDay } from '@/shared/lib/utils/date'
import { getApiErrorMessage } from '@/shared/lib/utils/apiError'
import { useAuth, useApiFetch } from '@/entities/user'

export function useMenuSelection(
  selectedMenu: { value: MenuSelection[] },
  weekDays: { value: WeekDay[] },
) {
  const { isAuthenticated } = useAuth()
  const { apiFetch } = useApiFetch()
  const posthog = usePostHog()
  const isSending = ref(false)
  const message = ref('')
  const messageType = ref<'success' | 'error'>('success')
  let successToastTimer: ReturnType<typeof setTimeout> | null = null

  const updateMenu = (
    dayIndex: number,
    category: MenuCategory,
    value: string,
  ) => {
    if (!selectedMenu.value[dayIndex]) {
      selectedMenu.value[dayIndex] = createEmptyMenuSelection()
    }

    selectedMenu.value[dayIndex][category] = value
  }

  type CookField = 'cook_day' | 'cook_brunch' | 'cook_dinner' | 'cook_dessert'

  const updateCook = (dayIndex: number, field: CookField, value: CookSlot) => {
    if (!selectedMenu.value[dayIndex]) {
      selectedMenu.value[dayIndex] = createEmptyMenuSelection()
    }
    selectedMenu.value[dayIndex][field] = value
  }

  const resetMenu = () => {
    selectedMenu.value = createEmptyWeekMenu(weekDays.value.length)

    if (successToastTimer) {
      clearTimeout(successToastTimer)
      successToastTimer = null
    }
    message.value = ''
  }

  const sendMenu = async (saveSchedule: () => Promise<void>) => {
    if (!isAuthenticated.value) {
      message.value = 'Please log in to send menu'
      messageType.value = 'error'
      return
    }

    isSending.value = true
    message.value = ''
    if (successToastTimer) {
      clearTimeout(successToastTimer)
      successToastTimer = null
    }

    try {
      await saveSchedule()

      const menuPayload = weekDays.value.map((day, index) => {
        const sel = selectedMenu.value[index] || createEmptyMenuSelection()
        return {
          day: day.display,
          date: day.date,
          meals: {
            brunch: sel.brunch,
            dinner: sel.dinner,
            dessert: sel.dessert,
          },
          cook_day: sel.cook_day || undefined,
          cook_brunch: sel.cook_brunch || undefined,
          cook_dinner: sel.cook_dinner || undefined,
          cook_dessert: sel.cook_dessert || undefined,
        }
      })

      const response = await apiFetch<{
        success: boolean
        message: string
        pinned: boolean
      }>('/api/send-menu', {
        method: 'POST',
        body: { menu: menuPayload },
      })

      message.value = 'Menu sent successfully!'
      messageType.value = 'success'

      posthog?.capture('menu_sent', { pinned: response.pinned })

      successToastTimer = setTimeout(() => {
        message.value = ''
        successToastTimer = null
      }, 4000)
    } catch (error: unknown) {
      console.error('Error sending menu:', error)
      message.value = getApiErrorMessage(
        error,
        'Error sending menu. Please try again.',
      )
      messageType.value = 'error'
    } finally {
      isSending.value = false
    }
  }

  return {
    isSending,
    message,
    messageType,
    updateMenu,
    updateCook,
    resetMenu,
    sendMenu,
  }
}
