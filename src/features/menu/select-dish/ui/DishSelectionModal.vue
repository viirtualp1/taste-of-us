<template>
  <BottomSheet
    :is-open="isOpen"
    custom-layout
    desktop-max-width="max-w-2xl"
    desktop-height="85vh"
    :initial-height-ratio="0.7"
    @close="closeModal"
  >
    <template #custom>
      <div class="grid grid-cols-[36px_1fr_36px] items-center gap-2 px-4 pt-5 pb-2 shrink-0">
        <span aria-hidden="true" />
        <h2 class="text-[17px] font-semibold text-center truncate">
          {{ t('dishes.selectTitle', { category: categoryLabel }) }}
        </h2>
        <TouIconButton
          variant="close"
          icon="heroicons:x-mark-20-solid"
          :aria-label="t('common.close')"
          @click.stop="closeModal"
        />
      </div>

      <div class="px-4 pt-1 pb-3 space-y-3 shrink-0">
        <div class="segmented" role="tablist">
          <button
            v-for="menuCategory in categories"
            :key="menuCategory.key"
            type="button"
            role="tab"
            :aria-selected="selectedCategory === menuCategory.key"
            @click="selectedCategory = menuCategory.key"
          >
            {{ menuCategory.label }}
          </button>
        </div>
        <div class="relative">
          <Icon
            name="heroicons:magnifying-glass-20-solid"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="t('dishes.searchDishes')"
            class="field h-9! pl-9! text-[15px]"
            :aria-label="t('dishes.searchDishes')"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-4 pb-6 overscroll-contain min-h-0">
        <TouEmptyState
          v-if="filteredDishes.length === 0"
          :title="t('dishes.noDishesFound')"
          :description="
            searchQuery
              ? t('dishes.tryDifferentSearch')
              : t('dishes.tryDifferentCategory')
          "
        />

        <div v-else class="list">
          <button
            v-for="dish in filteredDishes"
            :key="dish.id || dish.name"
            type="button"
            class="list-row"
            :aria-pressed="selectedDish === dish.name"
            @click="selectDish(dish.name)"
          >
            <span class="flex-1 min-w-0">
              <span class="block text-[17px] leading-snug">{{ dish.name }}</span>
              <span
                v-if="dish.id && dishIngredients[dish.id]?.length"
                class="block text-[13px] text-muted-foreground line-clamp-1"
              >
                {{
                  (dishIngredients[dish.id] ?? [])
                    .map((ingredient) => ingredient.name)
                    .join(', ')
                }}
              </span>
            </span>
            <Icon
              v-if="selectedDish === dish.name"
              name="heroicons:check-20-solid"
              class="w-5 h-5 shrink-0 text-green-700"
            />
          </button>
        </div>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { useMenuTranslations } from '@/entities/menu'
import { ref, computed, watch } from 'vue'
import type { MenuCategory, Dish, Ingredient } from '@/entities/menu'
import { BottomSheet, TouIconButton, TouEmptyState } from '@/shared/ui'
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

const { t } = useI18n()
const { categories, getCategoryLabel } = useMenuTranslations()
const { apiFetch } = useApiFetch()
const selectedCategory = ref<MenuCategory>(props.category)
const selectedDish = ref<string | undefined>(props.selectedDishName)
const searchQuery = ref('')
const dishIngredients = ref<Record<string, Ingredient[]>>({})

const categoryLabel = computed(() => getCategoryLabel(props.category))

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
