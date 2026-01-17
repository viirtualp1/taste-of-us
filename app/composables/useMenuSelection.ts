import { ref } from 'vue'
import type { MenuCategory, MenuSelection } from '@/utils/menu'
import type { WeekDay } from '@/utils/date'
import { useAuth } from './useAuth'

export function useMenuSelection(
  selectedMenu: { value: MenuSelection[] },
  weekDays: { value: WeekDay[] },
) {
  const { getAuthHeaders, isAuthenticated, handleAuthError } = useAuth()
  const isSending = ref(false)
  const message = ref('')
  const messageType = ref<'success' | 'error'>('success')

  const updateMenu = (
    dayIndex: number,
    category: MenuCategory,
    value: string,
  ) => {
    if (!selectedMenu.value[dayIndex]) {
      selectedMenu.value[dayIndex] = { brunch: '', dinner: '', dessert: '' }
    }

    selectedMenu.value[dayIndex][category] = value
  }

  const resetMenu = () => {
    selectedMenu.value = weekDays.value.map(() => ({
      brunch: '',
      dinner: '',
      dessert: '',
    }))

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

    try {
      await saveSchedule()

      const menuPayload = weekDays.value.map((day, index) => ({
        day: day.display,
        date: day.date,
        meals: selectedMenu.value[index] || { brunch: '', dinner: '', dessert: '' },
      }))

      const headers = getAuthHeaders() as Record<string, string>

      await $fetch('/api/send-menu', {
        method: 'POST',
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: { menu: menuPayload },
      })

      message.value = 'Menu sent successfully!'
      messageType.value = 'success'
    } catch (error: any) {
      if (handleAuthError(error)) {
        return
      }
      console.error('Error sending menu:', error)
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        'Error sending menu. Please try again.'
      message.value = errorMessage
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
    resetMenu,
    sendMenu,
  }
}
