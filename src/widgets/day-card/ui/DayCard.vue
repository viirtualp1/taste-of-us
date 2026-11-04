<template>
  <section v-if="day" class="min-w-0">
    <transition
      mode="out-in"
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div :key="day.date">
        <div class="flex items-center justify-between gap-3 px-1 pb-3">
          <h2 class="text-[22px] font-bold leading-tight capitalize truncate">
            {{ day.display }}
          </h2>
          <span
            class="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="badgeClass"
          >
            {{ dayLabel }}
          </span>
        </div>

        <div class="list list--icons">
          <button
            v-for="category in categories"
            :key="category.key"
            type="button"
            class="list-row"
            @click="openModal(category.key)"
          >
            <span class="row-icon" :style="{ background: meta[category.key].color }">
              <Icon :name="meta[category.key].icon" class="w-[18px] h-[18px]" />
            </span>
            <span class="flex-1 min-w-0">
              <span class="block text-[13px] leading-tight text-muted-foreground">
                {{ category.label }}
              </span>
              <span
                v-if="selectedMenu?.[category.key]"
                class="block text-[17px] leading-snug truncate"
              >
                {{ selectedMenu[category.key] }}
              </span>
              <span v-else class="block text-[17px] leading-snug text-green-700">
                {{
                  t('menu.selectCategory', {
                    category: category.label.toLowerCase(),
                  })
                }}
              </span>
            </span>
            <Icon name="heroicons:chevron-right-20-solid" class="chevron" />
          </button>
        </div>

        <div class="list list--icons mt-4">
          <button type="button" class="list-row" @click="openCookModal">
            <span class="row-icon" style="background: #ff9500">
              <Icon name="heroicons:fire-solid" class="w-[18px] h-[18px]" />
            </span>
            <span class="flex-1 min-w-0 text-[17px] truncate">
              {{ t('menu.responsibleForCooking') }}
            </span>
            <span class="flex items-center gap-1.5 text-[15px] text-muted-foreground shrink-0">
              <span
                class="w-2 h-2 rounded-full"
                :class="
                  cookSummaryKey === 'not_set'
                    ? 'bg-gray-300'
                    : cookSummaryKey === 'me'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                "
              />
              {{ cookSummary }}
            </span>
            <Icon name="heroicons:chevron-right-20-solid" class="chevron" />
          </button>
        </div>
      </div>
    </transition>
  </section>

  <dish-selection-modal
    :is-open="isModalOpen"
    :category="selectedCategory"
    :dishes="dishes"
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
import { useMenuTranslations } from '@/entities/menu'
import { computed, ref } from 'vue'
import type {
  MenuSelection,
  MenuCategory,
  Dish,
} from '@/entities/menu'
import type { WeekDay } from '@/shared/lib/utils/date'
import { CookAssignmentModal } from '@/features/menu/assign-cook'
import { DishSelectionModal } from '@/features/menu/select-dish'

interface Props {
  day: WeekDay | null
  selectedMenu: MenuSelection | null
  dishes: Dish[]
  dayIndex: number
}

const props = defineProps<Props>()

defineEmits<{
  (e: 'update-menu', category: MenuCategory, value: string): void
  (
    e: 'update-cook',
    field: 'cook_day' | 'cook_brunch' | 'cook_dinner' | 'cook_dessert',
    value: '' | 'me' | 'partner',
  ): void
}>()

const { t } = useI18n()
const { categories, getDayLabel, getDayBadgeClass, getCookLabel } =
  useMenuTranslations()

// Settings-style row icons: white glyph on a system-colour tile.
const meta: Record<MenuCategory, { icon: string; color: string }> = {
  brunch: { icon: 'heroicons:sun-solid', color: '#ffcc00' },
  dinner: { icon: 'heroicons:moon-solid', color: '#5856d6' },
  dessert: { icon: 'heroicons:cake-solid', color: '#ff2d55' },
}

const isModalOpen = ref(false)
const selectedCategory = ref<MenuCategory>('brunch')
const isCookModalOpen = ref(false)

const cookSummaryKey = computed(() => {
  const menu = props.selectedMenu
  if (!menu) return 'not_set' as const

  const day = (menu.cook_day ?? '').trim()
  if (day === 'me') return 'me' as const
  if (day === 'partner') return 'partner' as const

  const hasPerMeal =
    !!(menu.cook_brunch ?? '').trim() ||
    !!(menu.cook_dinner ?? '').trim() ||
    !!(menu.cook_dessert ?? '').trim()

  if (hasPerMeal) return 'per_meal' as const

  return 'not_set' as const
})

const cookSummary = computed(() => getCookLabel(cookSummaryKey.value))

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
    return t('common.notSet')
  }

  return getDayLabel(0, [props.selectedMenu])
})

const badgeClass = computed(() => {
  if (!props.selectedMenu) {
    return 'bg-gray-500/[0.14] text-gray-500'
  }

  return getDayBadgeClass(0, [props.selectedMenu], categories.value)
})
</script>
