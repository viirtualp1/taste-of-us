<template>
  <transition
    mode="out-in"
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-4"
  >
    <tou-card
      v-if="day"
      :key="`day-${day.date}`"
      class="overflow-visible flex-1 flex flex-col min-w-0"
    >
      <tou-card-header>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-1">
            <tou-card-title>{{ day.display }}</tou-card-title>
          </div>
          <div
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="badgeClass"
          >
            {{ dayLabel }}
          </div>
        </div>
      </tou-card-header>
      <tou-card-content class="pt-0 flex-1 flex flex-col overflow-visible">
        <div
          class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 flex-1 overflow-visible"
        >
          <div
            v-for="category in CATEGORIES"
            :key="category.key"
            class="space-y-2 sm:space-y-3 relative overflow-visible"
          >
            <tou-label class="flex items-center gap-2">
              <span class="text-base sm:text-lg">
                {{ getCategoryIcon(category.key) }}
              </span>
              <span class="text-sm sm:text-base">{{ category.label }}</span>
            </tou-label>
            <button
              class="w-full p-4 rounded-[16px] text-left transition-all border glass-nested"
              :class="
                selectedMenu?.[category.key]
                  ? 'border-pink-400/60 bg-pink-50/60'
                  : 'border-white/40 hover:border-pink-300/60 hover:bg-pink-50/40'
              "
              @click="openModal(category.key)"
            >
              <span class="font-semibold text-gray-900">
                {{
                  selectedMenu?.[category.key] ||
                  `Select ${category.label.toLowerCase()}`
                }}
              </span>
              <span
                v-if="selectedMenu?.[category.key]"
                class="text-xs text-gray-500 mt-1 ml-1"
              >
                Click to change
              </span>
            </button>
          </div>
        </div>
      </tou-card-content>
    </tou-card>
  </transition>

  <dish-selection-modal
    :is-open="isModalOpen"
    :category="selectedCategory"
    :dishes="dishesForCategory"
    :selected-dish-name="selectedMenu?.[selectedCategory]"
    @close="closeModal"
    @select="(dishName) => $emit('update-menu', selectedCategory, dishName)"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import TouCard from '@/components/ui/TouCard/TouCard.vue'
import TouCardHeader from '@/components/ui/TouCard/TouCardHeader.vue'
import TouCardTitle from '@/components/ui/TouCard/TouCardTitle.vue'
import TouCardContent from '@/components/ui/TouCard/TouCardContent.vue'
import TouLabel from '@/components/ui/TouLabel.vue'
import DishSelectionModal from '@/components/DishSelectionModal.vue'
import type { WeekDay } from '@/utils/date'
import type { MenuSelection, MenuData, MenuCategory, Dish } from '@/utils/menu'
import {
  getCategoryIcon,
  getDayLabel,
  getDayBadgeClass,
  CATEGORIES,
} from '@/utils/menu'

interface Props {
  day: WeekDay | null
  selectedMenu: MenuSelection | null
  menuData: MenuData | null
  dishes: Dish[]
  dayIndex: number
}

const props = defineProps<Props>()

defineEmits<{
  'update-menu': [category: MenuCategory, value: string]
}>()

const isModalOpen = ref(false)
const selectedCategory = ref<MenuCategory>('brunch')

const dishesForCategory = computed(() => {
  if (!props.dishes || !Array.isArray(props.dishes) || !selectedCategory.value)
    return []
  return props.dishes.filter((dish) => dish.category === selectedCategory.value)
})

const openModal = (category: MenuCategory) => {
  selectedCategory.value = category
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const dayLabel = computed(() => {
  if (!props.selectedMenu) {
    return 'Not set'
  }

  return getDayLabel(props.dayIndex, [props.selectedMenu], CATEGORIES)
})

const badgeClass = computed(() => {
  if (!props.selectedMenu) {
    return 'bg-white/70 text-gray-600 border border-white/60'
  }

  return getDayBadgeClass(props.dayIndex, [props.selectedMenu], CATEGORIES)
})
</script>
