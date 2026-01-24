import { ref } from 'vue'
import type { MenuCategory, MenuSelection, CookSlot } from '@/utils/menu'
import type { WeekDay } from '@/utils/date'
import { useAuth } from './useAuth'
import { useApiFetch } from './useApiFetch'

const emptyCook = (): Pick<
  MenuSelection,
  'cook_day' | 'cook_brunch' | 'cook_dinner' | 'cook_dessert'
> => ({
  cook_day: '',
  cook_brunch: '',
  cook_dinner: '',
  cook_dessert: '',
})

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
      selectedMenu.value[dayIndex] = {
        brunch: '',
        dinner: '',
        dessert: '',
        ...emptyCook(),
      }
    }

    selectedMenu.value[dayIndex][category] = value
  }

  type CookField = 'cook_day' | 'cook_brunch' | 'cook_dinner' | 'cook_dessert'

  const updateCook = (dayIndex: number, field: CookField, value: CookSlot) => {
    if (!selectedMenu.value[dayIndex]) {
      selectedMenu.value[dayIndex] = {
        brunch: '',
        dinner: '',
        dessert: '',
        ...emptyCook(),
      }
    }
    selectedMenu.value[dayIndex][field] = value
  }

  const resetMenu = () => {
    selectedMenu.value = weekDays.value.map(() => ({
      brunch: '',
      dinner: '',
      dessert: '',
      ...emptyCook(),
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

      const menuPayload = weekDays.value.map((day, index) => {
        const sel = selectedMenu.value[index] || {
          brunch: '',
          dinner: '',
          dessert: '',
          ...emptyCook(),
        }
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

      posthog?.capture('menu_sent', {
        pdf_sent: response.pdfSent,
        pinned: response.pinned,
        pdf_error: response.pdfError ?? undefined,
      })

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
    updateCook,
    resetMenu,
    sendMenu,
  }
}
