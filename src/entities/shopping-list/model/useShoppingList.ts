import { computed, ref, watch, type Ref } from 'vue'
import { formatWeekStartDate } from '@/shared/lib/utils/date'
import type { ShoppingListItem } from '../model/types'

interface HapticFeedback {
  light: () => void
  selection: () => void
  success?: () => void
  error?: () => void
}

export function useShoppingList(
  apiFetch: <T = unknown>(
    url: string,
    options?: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
      body?: unknown
    },
  ) => Promise<T>,
  weekStartIso: Ref<string | null | undefined>,
  isAuthenticated: Ref<boolean>,
  hapticFeedback?: HapticFeedback,
) {
  const items = ref<ShoppingListItem[]>([])
  const isLoading = ref(false)
  const isAddingItem = ref(false)
  const isGenerating = ref(false)
  const deletingId = ref<string | null>(null)

  const weekStartDate = computed(() =>
    formatWeekStartDate(weekStartIso.value ?? ''),
  )

  const dishItems = computed(() =>
    items.value.filter((item) => item.source_type === 'dish'),
  )
  const commonListItems = computed(() =>
    items.value.filter((item) => item.source_type === 'common'),
  )
  const manualItems = computed(() =>
    items.value.filter((item) => item.source_type === 'manual'),
  )

  const load = async () => {
    if (!isAuthenticated.value || !weekStartDate.value) {
      items.value = []
      return
    }

    isLoading.value = true
    try {
      const data = await apiFetch<ShoppingListItem[]>(
        `/api/shopping-list?week_start=${weekStartDate.value}`,
      )
      items.value = data || []
    } catch (error) {
      console.error('Error loading shopping list:', error)
      items.value = []
    } finally {
      isLoading.value = false
    }
  }

  const addManualItem = async (name: string, quantity: string | null) => {
    if (!name.trim() || !weekStartDate.value) return false

    isAddingItem.value = true
    try {
      await apiFetch('/api/shopping-list', {
        method: 'POST',
        body: {
          name: name.trim(),
          quantity: quantity?.trim() || null,
          source_type: 'manual',
          week_start: weekStartDate.value,
        },
      })
      hapticFeedback?.light()
      await load()
      return true
    } catch (error) {
      console.error('Error adding shopping item:', error)
      return false
    } finally {
      isAddingItem.value = false
    }
  }

  const toggleItem = async (item: ShoppingListItem) => {
    const newChecked = !item.is_checked
    item.is_checked = newChecked
    hapticFeedback?.selection()

    try {
      await apiFetch(`/api/shopping-list/${item.id}`, {
        method: 'PATCH',
        body: { is_checked: newChecked },
      })
    } catch (error) {
      console.error('Error toggling shopping item:', error)
      item.is_checked = !newChecked
    }
  }

  const removeItem = async (itemId: string) => {
    deletingId.value = itemId
    hapticFeedback?.light()
    try {
      await apiFetch(`/api/shopping-list/${itemId}`, { method: 'DELETE' })
      items.value = items.value.filter((item) => item.id !== itemId)
    } catch (error) {
      console.error('Error deleting shopping item:', error)
    } finally {
      deletingId.value = null
    }
  }

  const generateFromMenu = async () => {
    if (!weekStartDate.value) return false

    isGenerating.value = true
    try {
      await apiFetch('/api/shopping-list/generate', {
        method: 'POST',
        body: { week_start: weekStartDate.value },
      })
      hapticFeedback?.success?.()
      await load()
      return true
    } catch (error) {
      console.error('Error generating shopping list from menu:', error)
      hapticFeedback?.error?.()
      return false
    } finally {
      isGenerating.value = false
    }
  }

  watch(
    [weekStartDate, isAuthenticated],
    () => {
      if (weekStartDate.value && isAuthenticated.value) {
        load()
      } else {
        items.value = []
      }
    },
    { immediate: true },
  )

  return {
    items,
    isLoading,
    isAddingItem,
    isGenerating,
    deletingId,
    weekStartDate,
    dishItems,
    commonListItems,
    manualItems,
    load,
    addManualItem,
    toggleItem,
    removeItem,
    generateFromMenu,
  }
}
