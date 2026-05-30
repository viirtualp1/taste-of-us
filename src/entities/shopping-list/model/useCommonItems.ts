import { ref, type Ref } from 'vue'
import type { CommonItem } from '../model/types'

export function useCommonItems(
  apiFetch: <T = unknown>(
    url: string,
    options?: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
      body?: unknown
    },
  ) => Promise<T>,
  isAuthenticated: Ref<boolean>,
  hapticFeedback?: { light: () => void },
) {
  const items = ref<CommonItem[]>([])
  const isLoading = ref(false)

  const load = async () => {
    if (!isAuthenticated.value) {
      items.value = []
      return
    }

    isLoading.value = true
    try {
      const data = await apiFetch<CommonItem[]>('/api/common-items')
      items.value = data || []
    } catch (error) {
      console.error('Error loading common items:', error)
      items.value = []
    } finally {
      isLoading.value = false
    }
  }

  const addItem = async (name: string, defaultQuantity: string | null) => {
    if (!name.trim()) return false

    try {
      await apiFetch('/api/common-items', {
        method: 'POST',
        body: {
          name: name.trim(),
          default_quantity: defaultQuantity?.trim() || null,
        },
      })
      hapticFeedback?.light()
      await load()
      return true
    } catch (error) {
      console.error('Error adding common item:', error)
      return false
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      await apiFetch(`/api/common-items/${itemId}`, { method: 'DELETE' })
      items.value = items.value.filter((item) => item.id !== itemId)
      hapticFeedback?.light()
    } catch (error) {
      console.error('Error deleting common item:', error)
    }
  }

  const addToShoppingList = async (
    item: CommonItem,
    weekStartDate: string,
  ) => {
    try {
      await apiFetch('/api/shopping-list', {
        method: 'POST',
        body: {
          name: item.name,
          quantity: item.default_quantity,
          source_type: 'common',
          week_start: weekStartDate,
        },
      })
      hapticFeedback?.light()
      return true
    } catch (error) {
      console.error('Error adding common item to shopping list:', error)
      return false
    }
  }

  return {
    items,
    isLoading,
    load,
    addItem,
    removeItem,
    addToShoppingList,
  }
}
