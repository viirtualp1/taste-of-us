import { ref } from 'vue'
import type { MenuCategory, MenuSelection } from '@/utils/menu'
import type { WeekDay } from '@/utils/date'
import { useAuth } from './useAuth'
import { useApiFetch } from './useApiFetch'

export function useMenuSelection(
  selectedMenu: { value: MenuSelection[] },
  weekDays: { value: WeekDay[] },
) {
  const { isAuthenticated } = useAuth()
  const { apiFetch } = useApiFetch()
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

      const menuPayload = weekDays.value.map((day, index) => ({
        day: day.display,
        date: day.date,
        meals: selectedMenu.value[index] || {
          brunch: '',
          dinner: '',
          dessert: '',
        },
      }))

      const response = await apiFetch<{
        success: boolean
        message: string
        pdfSent: boolean
        pinned: boolean
        pdfError?: string
      }>('/api/send-menu', {
        method: 'POST',
        body: { menu: menuPayload },
      })

      if (response.pdfSent) {
        message.value = 'Меню успешно отправлено!'
        messageType.value = 'success'
      } else if (response.pdfError) {
        message.value = `Меню отправлено, но PDF не создан: ${response.pdfError}`
        messageType.value = 'error'
      } else {
        message.value = 'Меню успешно отправлено!'
        messageType.value = 'success'
      }

      successToastTimer = setTimeout(
        () => {
          message.value = ''
          successToastTimer = null
        },
        response.pdfError ? 8000 : 4000,
      )
    } catch (error: unknown) {
      console.error('Error sending menu:', error)
      const apiError = error as {
        data?: { message?: string }
        message?: string
      }

      message.value =
        apiError?.data?.message ||
        apiError?.message ||
        'Error sending menu. Please try again.'
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
