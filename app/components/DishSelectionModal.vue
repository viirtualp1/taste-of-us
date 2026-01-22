<template>
  <BottomSheet
    :is-open="isOpen"
    custom-layout
    desktop-max-width="max-w-4xl"
    desktop-height="85vh"
    :initial-height-ratio="0.7"
    @close="closeModal"
  >
    <template #custom="{ isMobile }">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0 bg-white">
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

      <template v-if="isMobile">
        <div class="flex items-center gap-2 p-3 border-b border-gray-200 overflow-x-auto flex-nowrap shrink-0 bg-gray-50">
          <button
            v-for="category in CATEGORIES"
            :key="category.key"
            class="px-4 py-2 rounded-[12px] text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 border"
            :class="
              selectedCategory === category.key
                ? 'bg-green-500 text-white border-green-500 shadow-sm'
                : 'bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50/50'
            "
            @click="selectedCategory = category.key"
          >
            {{ category.label }}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 overscroll-contain min-h-0 bg-white">
          <div
            v-if="filteredDishes.length === 0"
            class="text-center py-12 text-gray-500"
          >
            <p class="text-lg font-medium">No dishes found</p>
            <p class="text-sm mt-2">Try selecting a different category</p>
          </div>
          <div v-else class="grid grid-cols-1 gap-3">
            <button
              v-for="dish in filteredDishes"
              :key="dish.id || dish.name"
              class="p-4 rounded-[16px] text-left transition-all border flex flex-col gap-1"
              :class="
                selectedDish === dish.name
                  ? 'border-green-400 bg-green-50 shadow-sm'
                  : 'border-gray-200 bg-gray-50 hover:border-green-300 hover:bg-green-50/70'
              "
              @click="selectDish(dish.name)"
            >
              <span class="font-semibold text-gray-900">{{ dish.name }}</span>
              <div
                v-if="dish.id && dishIngredients[dish.id]?.length"
                class="text-xs text-gray-500 mt-1 line-clamp-2"
              >
                {{ (dishIngredients[dish.id] ?? []).map((i) => i.name).join(', ') }}
              </div>
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="flex-1 flex overflow-hidden min-h-0">
          <div class="flex flex-col w-48 border-r border-gray-200 shrink-0 bg-gray-50">
            <div class="p-4 space-y-2 overflow-y-auto">
              <button
                v-for="category in CATEGORIES"
                :key="category.key"
                class="w-full px-4 py-3 rounded-[12px] text-sm font-medium transition-all text-left border"
                :class="
                  selectedCategory === category.key
                    ? 'bg-green-500 text-white border-green-500 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50/50'
                "
                @click="selectedCategory = category.key"
              >
                {{ category.label }}
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-6 bg-white">
            <div
              v-if="filteredDishes.length === 0"
              class="text-center py-12 text-gray-500"
            >
              <p class="text-lg font-medium">No dishes found</p>
              <p class="text-sm mt-2">Try selecting a different category</p>
            </div>
            <div v-else class="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                v-for="dish in filteredDishes"
                :key="dish.id || dish.name"
                class="p-5 rounded-[16px] text-left transition-all border flex flex-col gap-2 min-h-[100px]"
                :class="
                  selectedDish === dish.name
                    ? 'border-green-400 bg-green-50 shadow-sm scale-[1.02]'
                    : 'border-gray-200 bg-gray-50 hover:border-green-300 hover:bg-green-50/70 hover:shadow'
                "
                @click="selectDish(dish.name)"
              >
                <span class="font-semibold text-gray-900 text-base">{{ dish.name }}</span>
                <div
                  v-if="dish.id && dishIngredients[dish.id]?.length"
                  class="text-xs text-gray-500 mt-1 line-clamp-2"
                >
                  {{ (dishIngredients[dish.id] ?? []).map((i) => i.name).join(', ') }}
                </div>
              </button>
            </div>
          </div>
        </div>
      </template>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { MenuCategory, Dish, Ingredient } from '@/utils/menu'
import { CATEGORIES } from '@/utils/menu'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { useApiFetch } from '@/composables/useApiFetch'

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
const dishIngredients = ref<Record<string, Ingredient[]>>({})

const categoryLabel = computed(() => {
  if (props.category === 'brunch') return 'Brunch'
  if (props.category === 'dinner') return 'Dinner'
  return 'Dessert'
})

const filteredDishes = computed(() => {
  if (!props.dishes || !Array.isArray(props.dishes)) return []
  return props.dishes.filter((dish) => dish.category === selectedCategory.value)
})

const loadIngredients = async () => {
  if (!props.dishes || !Array.isArray(props.dishes)) return

  const dishIds = props.dishes
    .filter((dish) => dish.id)
    .map((dish) => dish.id)

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
