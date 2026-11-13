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
        <div class="section-label">
          <h2 class="capitalize truncate">
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
            <span class="row-icon" :class="meta[category.key].color">
              <TouIcon :name="meta[category.key].icon" class="size-4.5" />
            </span>
            <span class="flex-1 min-w-0">
              <span
                class="block text-ios-caption leading-tight text-muted-foreground"
              >
                {{ category.label }}
              </span>
              <span
                v-if="selectedMenu?.[category.key]"
                class="block text-ios-body leading-snug truncate"
              >
                {{ selectedMenu[category.key] }}
              </span>
              <span
                v-else
                class="block text-ios-body leading-snug text-accent-foreground"
              >
                {{
                  t('menu.selectCategory', {
                    category: category.label.toLowerCase(),
                  })
                }}
              </span>
            </span>
            <TouIcon name="heroicons:chevron-right-20-solid" class="chevron" />
          </button>
        </div>

        <div class="list list--icons mt-4">
          <button type="button" class="list-row" @click="openCookModal">
            <span class="row-icon bg-orange-500">
              <TouIcon name="heroicons:fire-solid" class="size-4.5" />
            </span>
            <span
              class="flex-1 min-w-0 text-ios-body leading-tight wrap-break-word"
            >
              {{ t('menu.responsibleForCooking') }}
            </span>
            <span
              class="flex max-w-2/5 items-center gap-1.5 text-right text-ios text-muted-foreground"
            >
              <span
                class="size-2 shrink-0 rounded-full"
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
            <TouIcon name="heroicons:chevron-right-20-solid" class="chevron" />
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
import { TouIcon } from '@/shared/ui'
import { useMenuTranslations } from '@/entities/menu'
import type { MenuSelection, MenuCategory, Dish } from '@/entities/menu'
import type { WeekDay } from '@/shared/lib/utils'
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

// Settings-style row icons: white glyph on a system-colour tile.
const meta: Record<MenuCategory, { icon: string; color: string }> = {
  brunch: { icon: 'heroicons:sun-solid', color: 'bg-amber-500' },
  dinner: { icon: 'heroicons:moon-solid', color: 'bg-primary' },
  dessert: { icon: 'heroicons:cake-solid', color: 'bg-rose-500' },
}

const { t } = useI18n()
const { categories, getDayLabel, getDayBadgeClass, getCookLabel } =
  useMenuTranslations()

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

function openModal(category: MenuCategory) {
  selectedCategory.value = category
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function openCookModal() {
  isCookModalOpen.value = true
}

function closeCookModal() {
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
