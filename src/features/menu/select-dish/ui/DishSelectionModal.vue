<template>
  <BottomSheet
    :is-open="isOpen"
    custom-layout
    desktop-max-width="max-w-4xl"
    desktop-height="85vh"
    :initial-height-ratio="0.7"
    @close="closeModal"
  >
    <template #custom>
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0 bg-white"
      >
        <h2 class="text-lg sm:text-xl font-bold text-gray-900">
          Select {{ categoryLabel }}
        </h2>
        <button
          class="w-10 h-10 shrink-0 flex items-center justify-center rounded-[12px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Close"
          @click.stop="closeModal"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>

      <div class="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-0">
        <div
          class="shrink-0 border-b sm:border-b-0 sm:border-r border-gray-200 bg-white sm:bg-gray-50 sm:w-48"
        >
          <div class="p-3 sm:p-4 space-y-3">
            <div class="relative">
              <Icon
                name="heroicons:magnifying-glass"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              />
              <input
                v-model="searchQuery"
                type="search"
                placeholder="Search dishes..."
                class="w-full pl-9 pr-4 py-2.5 sm:py-2 rounded-[12px] border border-gray-200 bg-gray-50 sm:bg-white focus:bg-white focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-200/50 text-gray-900 placeholder-gray-400 text-sm"
                aria-label="Search dishes"
              />
            </div>

            <div
              class="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible flex-nowrap sm:flex-wrap pb-0.5 sm:pb-0"
            >
              <button
                v-for="menuCategory in CATEGORIES"
                :key="menuCategory.key"
                class="px-4 py-2 sm:py-3 rounded-[12px] text-sm font-medium transition-all whitespace-nowrap sm:whitespace-normal flex-shrink-0 sm:flex-shrink sm:w-full border text-left"
                :class="
                  selectedCategory === menuCategory.key
                    ? 'bg-green-500 text-white border-green-500 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50/50'
                "
                @click="selectedCategory = menuCategory.key"
              >
                {{ menuCategory.label }}
              </button>
            </div>
          </div>
        </div>

        <div
          class="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain min-h-0 bg-white"
        >
          <div
            v-if="filteredDishes.length === 0"
            class="text-center py-12 text-gray-500"
          >
            <p class="text-lg font-medium">No dishes found</p>
            <p class="text-sm mt-2">
              {{
                searchQuery
                  ? 'Try a different search or category'
                  : 'Try selecting a different category'
              }}
            </p>
          </div>

          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          >
            <button
              v-for="dish in filteredDishes"
              :key="dish.id || dish.name"
              class="p-4 sm:p-5 rounded-[16px] text-left transition-all border flex flex-col gap-1 sm:gap-2 sm:min-h-[100px]"
              :class="
                selectedDish === dish.name
                  ? 'border-green-400 bg-green-50 shadow-sm sm:scale-[1.02]'
                  : 'border-gray-200 bg-gray-50 hover:border-green-300 hover:bg-green-50/70 sm:hover:shadow'
              "
              @click="selectDish(dish.name)"
            >
              <span class="font-semibold text-gray-900 sm:text-base">{{
                dish.name
              }}</span>
              <div
                v-if="dish.id && dishIngredients[dish.id]?.length"
                class="text-xs text-gray-500 mt-1 line-clamp-2"
              >
                {{
                  (dishIngredients[dish.id] ?? [])
                    .map((ingredient) => ingredient.name)
                    .join(', ')
                }}
              </div>
            </button>
          </div>
        </div>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { MenuCategory, Dish, Ingredient } from '@/entities/menu'
import { CATEGORIES } from '@/entities/menu'
import { BottomSheet } from '@/shared/ui'
import { useApiFetch } from '@/entities/user'

interface Props {
  isOpen: boolean
  category: MenuCategory
  dishes: Dish[]
  selectedDishName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  select: [dishName: string]
}>()

const { apiFetch } = useApiFetch()
const selectedCategory = ref<MenuCategory>(props.category)
const selectedDish = ref<string | undefined>(props.selectedDishName)
const searchQuery = ref('')
const dishIngredients = ref<Record<string, Ingredient[]>>({})

const categoryLabel = computed(
  () => CATEGORIES.find((item) => item.key === props.category)?.label ?? 'Dish',
)

const filteredDishes = computed(() => {
  if (!props.dishes || !Array.isArray(props.dishes)) return []
  const byCategory = props.dishes.filter(
    (dish) => dish.category === selectedCategory.value,
  )
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return byCategory
  return byCategory.filter((dish) => {
    if (dish.name.toLowerCase().includes(q)) return true
    const ingredients = dishIngredients.value[dish.id ?? '']
    if (ingredients?.length) {
      return ingredients.some((ingredient) =>
        ingredient.name.toLowerCase().includes(q),
      )
    }
    return false
  })
})

const loadIngredients = async () => {
  if (!props.dishes || !Array.isArray(props.dishes)) return

  const dishIds = props.dishes.filter((dish) => dish.id).map((dish) => dish.id)

  if (dishIds.length === 0) return

  try {
    const data = await apiFetch<Record<string, Ingredient[]>>(
      '/api/dishes/ingredients',
      {
        method: 'POST',
        body: { dish_ids: dishIds },
      },
    )
    dishIngredients.value = data || {}
  } catch (error) {
    console.error('Error loading ingredients:', error)
    dishIngredients.value = {}
  }
}

watch(
  () => props.category,
  (newCategory) => {
    selectedCategory.value = newCategory
  },
)

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      searchQuery.value = ''
      loadIngredients()
    }
  },
  { immediate: true },
)

watch(
  () => props.dishes,
  () => {
    if (props.isOpen) {
      loadIngredients()
    }
  },
)

const selectDish = (dishName: string) => {
  selectedDish.value = dishName
  emit('select', dishName)
  emit('close')
}

const closeModal = () => {
  emit('close')
}

watch(
  () => props.selectedDishName,
  (newValue) => {
    selectedDish.value = newValue
  },
)
</script>
