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
          class="pt-4 sm:pt-5 border-t border-gray-200/60 space-y-4 sm:space-y-5"
        >
          <label
            class="flex items-center gap-3 cursor-pointer touch-manipulation group"
          >
            <span
              class="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-[10px] border-2 transition-colors"
              :class="
                cookSectionEnabled
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-white'
              "
            >
              <input
                v-model="cookSectionEnabled"
                type="checkbox"
                class="absolute inset-0 cursor-pointer opacity-0"
              />
              <Icon
                v-if="cookSectionEnabled"
                name="heroicons:check"
                class="h-3 w-3 text-green-600"
              />
            </span>
            <span class="text-lg select-none" aria-hidden="true">👨‍🍳</span>
            <span
              class="text-sm font-semibold text-gray-800 group-hover:text-gray-900"
            >
              Responsible for cooking
            </span>
          </label>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 max-h-0 overflow-hidden"
            enter-to-class="opacity-100 max-h-[600px]"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 max-h-[600px]"
            leave-to-class="opacity-0 max-h-0 overflow-hidden"
          >
            <div
              v-show="cookSectionEnabled"
              class="space-y-4 sm:space-y-5 overflow-hidden"
            >
          <div
            role="tablist"
            aria-label="Assign by whole day or per meal"
            class="grid grid-cols-2 gap-2 p-1.5 rounded-[14px] bg-gray-100/80 border border-gray-200/60"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="isWholeDay"
              class="min-h-[44px] rounded-[10px] text-sm font-medium transition-all touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400/60 focus-visible:ring-offset-1"
              :class="
                isWholeDay
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200/80'
                  : 'text-gray-500 hover:text-gray-700 active:bg-gray-200/50'
              "
              @click="setWholeDay(true)"
            >
              Whole day
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="!isWholeDay"
              class="min-h-[44px] rounded-[10px] text-sm font-medium transition-all touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400/60 focus-visible:ring-offset-1"
              :class="
                !isWholeDay
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200/80'
                  : 'text-gray-500 hover:text-gray-700 active:bg-gray-200/50'
              "
              @click="setWholeDay(false)"
            >
              Per meal
            </button>
          </div>

          <div v-if="isWholeDay" class="space-y-2">
            <p class="text-xs text-gray-500 mb-2">Who cooks this day?</p>
            <div
              class="grid grid-cols-3 gap-2"
              role="group"
              aria-label="Cook for whole day"
            >
              <CookChip
                :selected="!(selectedMenu?.cook_day ?? '')"
                label="—"
                @select="onCookChange('cook_day', '')"
              />
              <CookChip
                :selected="(selectedMenu?.cook_day ?? '') === 'me'"
                label="Me"
                @select="onCookChange('cook_day', 'me')"
              />
              <CookChip
                :selected="(selectedMenu?.cook_day ?? '') === 'partner'"
                label="Partner"
                @select="onCookChange('cook_day', 'partner')"
              />
            </div>
          </div>

          <template v-else>
            <p class="text-xs text-gray-500 mb-3">Assign per meal</p>
            <div class="space-y-4">
              <div
                v-for="m in mealCookFields"
                :key="m.key"
                class="space-y-2"
                role="group"
                :aria-label="`Cook for ${m.label}`"
              >
                <span
                  class="flex items-center gap-1.5 text-sm font-medium text-gray-700"
                >
                  <span>{{ mealIcon(m.key) }}</span>
                  {{ m.label }}
                </span>
                <div class="grid grid-cols-3 gap-2">
                  <CookChip
                    :selected="!(selectedMenu?.[m.key] ?? '')"
                    label="—"
                    @select="onCookChange(m.key, '')"
                  />
                  <CookChip
                    :selected="(selectedMenu?.[m.key] ?? '') === 'me'"
                    label="Me"
                    @select="onCookChange(m.key, 'me')"
                  />
                  <CookChip
                    :selected="(selectedMenu?.[m.key] ?? '') === 'partner'"
                    label="Partner"
                    @select="onCookChange(m.key, 'partner')"
                  />
                </div>
              </div>
            </div>
          </template>
            </div>
          </Transition>
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
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TouCard from '@/components/ui/TouCard/TouCard.vue'
import TouCardHeader from '@/components/ui/TouCard/TouCardHeader.vue'
import TouCardTitle from '@/components/ui/TouCard/TouCardTitle.vue'
import TouCardContent from '@/components/ui/TouCard/TouCardContent.vue'
import TouLabel from '@/components/ui/TouLabel.vue'
import CookChip from '@/components/ui/CookChip.vue'
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

type CookField =
  | 'cook_day'
  | 'cook_brunch'
  | 'cook_dinner'
  | 'cook_dessert'

const mealCookFields: { key: CookField; label: string }[] = [
  { key: 'cook_brunch', label: 'Brunch' },
  { key: 'cook_dinner', label: 'Dinner' },
  { key: 'cook_dessert', label: 'Dessert' },
]

const assignByWholeDay = ref(true)
const isWholeDay = computed(() => assignByWholeDay.value)

const cookSectionEnabled = ref(false)

watch(
  () => props.selectedMenu,
  (menu) => {
    const hasAny =
      !!(menu?.cook_day ?? '').trim() ||
      mealCookFields.some((m) => !!(menu?.[m.key] ?? '').trim())
    if (hasAny) cookSectionEnabled.value = true
  },
  { immediate: true, deep: true },
)

watch(
  () => props.selectedMenu?.cook_day,
  (cookDay) => {
    const hasWhole = !!(cookDay ?? '').trim()
    const hasPerMeal = mealCookFields.some(
      (m) => !!(props.selectedMenu?.[m.key] ?? '').trim(),
    )
    if (hasWhole) assignByWholeDay.value = true
    else if (hasPerMeal) assignByWholeDay.value = false
  },
  { immediate: true },
)

function setWholeDay(v: boolean) {
  assignByWholeDay.value = v
  if (v) {
    mealCookFields.forEach((m) => emit('update-cook', m.key, ''))
  } else {
    emit('update-cook', 'cook_day', '')
  }
}

function mealIcon(key: CookField): string {
  const k = key.replace('cook_', '') as MenuCategory
  return getCategoryIcon(k)
}

const emit = defineEmits<{
  'update-menu': [category: MenuCategory, value: string]
  'update-cook': [field: CookField, value: '' | 'me' | 'partner']
}>()

function onCookChange(
  field: CookField,
  value: string,
) {
  const v = (value === 'me' || value === 'partner' ? value : '') as
    | ''
    | 'me'
    | 'partner'
  emit('update-cook', field, v)
}

const isModalOpen = ref(false)
const selectedCategory = ref<MenuCategory>('brunch')

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
    return 'bg-white/70 text-gray-600 border border-gray-200/50'
  }

  return getDayBadgeClass(props.dayIndex, [props.selectedMenu], CATEGORIES)
})
</script>
