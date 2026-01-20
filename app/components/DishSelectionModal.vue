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
      <div class="flex items-center justify-between px-4 py-3 border-b border-white/20 shrink-0">
        <h2 class="text-lg sm:text-xl font-bold text-gray-900">
          Select {{ categoryLabel }}
        </h2>
        <button
          class="flex items-center rounded-[12px] p-2 hover:bg-white/20 transition-colors"
          @click="closeModal"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <template v-if="isMobile">
        <div class="flex items-center gap-2 p-3 border-b border-white/20 overflow-x-auto flex-nowrap shrink-0">
          <button
            v-for="cuisine in CUISINES"
            :key="cuisine.key"
            class="px-4 py-2 rounded-[12px] text-sm font-medium transition-all whitespace-nowrap flex-shrink-0"
            :class="
              selectedCuisine === cuisine.key
                ? 'bg-pink-500 text-white shadow-md'
                : 'glass-nested text-gray-700 hover:bg-white/50'
            "
            @click="selectedCuisine = cuisine.key"
          >
            {{ cuisine.label }}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 overscroll-contain">
          <div
            v-if="filteredDishes.length === 0"
            class="text-center py-12 text-gray-500"
          >
            <p class="text-lg font-medium">No dishes found</p>
            <p class="text-sm mt-2">Try selecting a different cuisine</p>
          </div>
          <div v-else class="grid grid-cols-1 gap-3">
            <button
              v-for="dish in filteredDishes"
              :key="dish.id || dish.name"
              class="p-4 rounded-[16px] text-left transition-all border glass-nested flex flex-col gap-1"
              :class="
                selectedDish === dish.name
                  ? 'border-pink-500/60 bg-pink-50/60 shadow-lg'
                  : 'border-white/40 hover:border-pink-300/60 hover:bg-pink-50/40'
              "
              @click="selectDish(dish.name)"
            >
              <span class="font-semibold text-gray-900">{{ dish.name }}</span>
              <span v-if="dish.cuisine" class="text-xs text-gray-500">
                {{ getCuisineLabel(dish.cuisine) }}
              </span>
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="flex-1 flex overflow-hidden">
          <div class="flex flex-col w-48 border-r border-white/30 shrink-0 bg-white/20">
            <div class="p-4 space-y-2 overflow-y-auto">
              <button
                v-for="cuisine in CUISINES"
                :key="cuisine.key"
                class="w-full px-4 py-3 rounded-[12px] text-sm font-medium transition-all text-left"
                :class="
                  selectedCuisine === cuisine.key
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'glass-nested text-gray-700 hover:bg-white/50'
                "
                @click="selectedCuisine = cuisine.key"
              >
                {{ cuisine.label }}
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <div
              v-if="filteredDishes.length === 0"
              class="text-center py-12 text-gray-500"
            >
              <p class="text-lg font-medium">No dishes found</p>
              <p class="text-sm mt-2">Try selecting a different cuisine</p>
            </div>
            <div v-else class="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                v-for="dish in filteredDishes"
                :key="dish.id || dish.name"
                class="p-5 rounded-[16px] text-left transition-all border glass-nested flex flex-col gap-2 min-h-[100px]"
                :class="
                  selectedDish === dish.name
                    ? 'border-pink-500/60 bg-pink-50/60 shadow-lg scale-[1.02]'
                    : 'border-white/40 hover:border-pink-300/60 hover:bg-pink-50/40 hover:shadow-md'
                "
                @click="selectDish(dish.name)"
              >
                <span class="font-semibold text-gray-900 text-base">{{ dish.name }}</span>
                <span v-if="dish.cuisine" class="text-xs text-gray-500 mt-auto">
                  {{ getCuisineLabel(dish.cuisine) }}
                </span>
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
import type { MenuCategory, CuisineType, Dish } from '@/utils/menu'
import { CUISINES } from '@/utils/menu'
import BottomSheet from '@/components/ui/BottomSheet.vue'

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

const selectedCuisine = ref<CuisineType>('all')
const selectedDish = ref<string | undefined>(props.selectedDishName)

const categoryLabel = computed(() => {
  if (props.category === 'brunch') return 'Brunch'
  if (props.category === 'dinner') return 'Dinner'
  return 'Dessert'
})

const filteredDishes = computed(() => {
  if (selectedCuisine.value === 'all') {
    return props.dishes
  }
  return props.dishes.filter((dish) => dish.cuisine === selectedCuisine.value)
})

const getCuisineLabel = (cuisine: CuisineType) => {
  return CUISINES.find((c) => c.key === cuisine)?.label || cuisine
}

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
