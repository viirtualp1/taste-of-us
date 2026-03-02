<template>
  <tou-card v-if="day" class="overflow-visible flex-1 flex flex-col min-w-0">
    <tou-card-header>
      <transition
        mode="out-in"
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          :key="`header-${day.date}`"
          class="flex flex-wrap items-center justify-between gap-4"
        >
          <div class="space-y-1">
            <p
              class="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-500"
            >
              Dish selector
            </p>
            <tou-card-title>{{ day.display }}</tou-card-title>
          </div>
          <div
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="badgeClass"
          >
            {{ dayLabel }}
          </div>
        </div>
      </transition>
    </tou-card-header>
    <tou-card-content class="pt-0 flex-1 flex flex-col overflow-visible">
      <transition
        mode="out-in"
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          :key="`content-${day.date}`"
          class="flex flex-col gap-4 md:gap-6 flex-1 overflow-visible"
        >
          <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"
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
              class="w-full p-4 rounded-[16px] text-left transition-all border border-gray-200/50 glass-nested hover:border-green-300/60 hover:bg-green-50/40"
              :class="
                selectedMenu?.[category.key]
                  ? 'bg-green-50/60'
                  : ''
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
                class="text-xs text-gray-500 block sm:inline sm:ml-1 mt-0.5 sm:mt-1"
              >
                Click to change
              </span>
            </button>
          </div>
          </div>
        <div
          class="pt-4 sm:pt-5 border-t border-gray-200/60"
        >
          <button
            type="button"
            class="w-full flex items-center justify-between gap-3 rounded-[16px] px-3 py-2.5 border border-gray-200/60 bg-white hover:border-green-400 hover:bg-green-50/60 text-gray-800 transition-colors"
            @click="openCookModal"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg select-none" aria-hidden="true">👨‍🍳</span>
              <span class="text-sm font-semibold">
                Responsible for cooking
              </span>
            </div>
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border border-gray-300 bg-gray-50 text-gray-700"
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="
                  cookSummary === 'Not set'
                    ? 'bg-gray-300'
                    : cookSummary === 'Me'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                "
              />
              <span>{{ cookSummary }}</span>
            </span>
          </button>
        </div>
        </div>
      </transition>
    </tou-card-content>
  </tou-card>

  <dish-selection-modal
    :is-open="isModalOpen"
    :category="selectedCategory"
    :dishes="props.dishes"
    :selected-dish-name="selectedMenu?.[selectedCategory]"
    @close="closeModal"
    @select="(dishName) => $emit('update-menu', selectedCategory, dishName)"
  />
  <CookAssignmentModal
    :is-open="isCookModalOpen"
    :selected-menu="selectedMenu"
    @close="closeCookModal"
    @update-cook="(field, value) => $emit('update-cook', field, value)"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import TouCard from '@/components/ui/TouCard/TouCard.vue'
import TouCardHeader from '@/components/ui/TouCard/TouCardHeader.vue'
import TouCardTitle from '@/components/ui/TouCard/TouCardTitle.vue'
import TouCardContent from '@/components/ui/TouCard/TouCardContent.vue'
import DishSelectionModal from '@/components/DishSelectionModal.vue'
import CookAssignmentModal from '@/components/CookAssignmentModal.vue'
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
  'update-cook': [
    field:
      | 'cook_day'
      | 'cook_brunch'
      | 'cook_dinner'
      | 'cook_dessert',
    value: '' | 'me' | 'partner',
  ]
}>()

const isModalOpen = ref(false)
const selectedCategory = ref<MenuCategory>('brunch')
const isCookModalOpen = ref(false)

const cookSummary = computed(() => {
  const menu = props.selectedMenu
  if (!menu) return 'Not set'

  const day = (menu.cook_day ?? '').trim()
  if (day === 'me') return 'Me'
  if (day === 'partner') return 'Partner'

  const hasPerMeal =
    !!(menu.cook_brunch ?? '').trim() ||
    !!(menu.cook_dinner ?? '').trim() ||
    !!(menu.cook_dessert ?? '').trim()

  if (hasPerMeal) return 'Per meal'

  return 'Not set'
})

const openModal = (category: MenuCategory) => {
  selectedCategory.value = category
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const openCookModal = () => {
  isCookModalOpen.value = true
}

const closeCookModal = () => {
  isCookModalOpen.value = false
}

const dayLabel = computed(() => {
  if (!props.selectedMenu) {
    return 'Not set'
  }

  return getDayLabel(props.dayIndex, [props.selectedMenu], CATEGORIES)
})

const badgeClass = computed(() => {
  if (!props.selectedMenu) {
    return 'bg-white/70 text-gray-600 border border-gray-200/50'
  }

  return getDayBadgeClass(props.dayIndex, [props.selectedMenu], CATEGORIES)
})
</script>
