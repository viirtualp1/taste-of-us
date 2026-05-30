import { computed, ref, type Ref } from 'vue'
import type { MenuCategory, Dish } from '../model/types'

const EMPTY_DISHES: Record<MenuCategory, Dish[]> = {
  brunch: [],
  dinner: [],
  dessert: [],
}

export function useUserDishes(
  apiFetch: <T = unknown>(
    url: string,
    options?: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
      body?: unknown
    },
  ) => Promise<T>,
  isAuthenticated: Ref<boolean>,
) {
  const dishesByCategory = ref<Record<MenuCategory, Dish[]>>({
    ...EMPTY_DISHES,
  })
  const isLoading = ref(false)

  const allDishes = computed(() => {
    const result: Dish[] = []
    for (const category of ['brunch', 'dinner', 'dessert'] as const) {
      result.push(...(dishesByCategory.value[category] ?? []))
    }
    return result
  })

  const load = async () => {
    if (!isAuthenticated.value) {
      dishesByCategory.value = { ...EMPTY_DISHES }
      return
    }

    isLoading.value = true
    try {
      const response = await apiFetch<Record<MenuCategory, Dish[]>>(
        '/api/user/dishes',
      )
      dishesByCategory.value = {
        brunch: response.brunch || [],
        dinner: response.dinner || [],
        dessert: response.dessert || [],
      }
    } catch (error) {
      console.error('Error loading user dishes:', error)
      dishesByCategory.value = { ...EMPTY_DISHES }
    } finally {
      isLoading.value = false
    }
  }

  return {
    dishesByCategory,
    allDishes,
    isLoading,
    load,
  }
}
