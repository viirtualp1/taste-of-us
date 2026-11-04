<template>
  <div>
    <PageHeader :title="t('dishes.title')" :subtitle="t('dishes.subtitle')">
      <template #actions>
        <button
          v-glass="{ bezel: 12, refraction: 10 }"
          type="button"
          class="icon-btn icon-btn--sm glass glass-press"
          :aria-label="t('common.import')"
          :title="t('common.import')"
          @click="openImportModal"
        >
          <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
        </button>
      </template>
    </PageHeader>

    <div class="grid gap-6 lg:grid-cols-3 lg:items-start">
      <section
        v-for="category in categories"
        :key="category.key"
        class="min-w-0"
      >
        <div class="flex items-center justify-between gap-2 px-1 pb-3">
          <div class="flex items-center gap-2 min-w-0">
            <h2 class="text-[22px] font-bold leading-tight truncate">
              {{ category.label }}
            </h2>
            <TouBadge>{{ userDishes[category.key]?.length || 0 }}</TouBadge>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button
              type="button"
              class="icon-btn icon-btn--sm transition-colors"
              :class="
                activeSearchCategory === category.key
                  ? 'bg-green-500/15 text-green-700'
                  : 'text-green-700'
              "
              :aria-pressed="activeSearchCategory === category.key"
              :aria-label="t('dishes.searchPlaceholder')"
              @click="
                activeSearchCategory =
                  activeSearchCategory === category.key ? null : category.key
              "
            >
              <Icon name="heroicons:magnifying-glass-20-solid" class="w-5 h-5" />
            </button>
            <button
              type="button"
              class="icon-btn icon-btn--sm text-green-700"
              :aria-label="t('dishes.addDish')"
              @click="openAddDishModal(category.key)"
            >
              <Icon name="heroicons:plus-circle-solid" class="w-7 h-7" />
            </button>
          </div>
        </div>

        <div v-if="activeSearchCategory === category.key" class="mb-3 relative">
          <Icon
            name="heroicons:magnifying-glass-20-solid"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          />
          <input
            v-model="searchQueries[category.key]"
            type="search"
            :placeholder="t('dishes.searchPlaceholder')"
            class="field h-9! pl-9! pr-9! text-[15px]"
          />
          <button
            v-if="searchQueries[category.key]"
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-5 h-5 rounded-full bg-gray-400 text-white"
            aria-label="Clear"
            @click="searchQueries[category.key] = ''"
          >
            <Icon name="heroicons:x-mark-20-solid" class="w-3.5 h-3.5" />
          </button>
        </div>

        <div v-if="isLoading" class="list">
          <div v-for="i in 3" :key="i" class="list-row">
            <tou-skeleton class="h-4 w-40" />
          </div>
        </div>

        <div v-else-if="userDishes[category.key]?.length === 0" class="list">
          <TouEmptyState
            icon="heroicons:book-open"
            :title="t('dishes.empty')"
            class="py-8 px-4"
          />
        </div>

        <template v-else>
          <div class="list">
            <div
              v-for="dish in displayedDishes(category.key)"
              :key="dish.id"
              class="list-row py-1.5! pr-1.5!"
            >
              <button
                type="button"
                class="flex-1 min-w-0 py-1.5 text-left text-[17px] truncate"
                @click="openEditDishModal(dish)"
              >
                {{ dish.name }}
              </button>
              <button
                type="button"
                class="grid place-items-center w-9 h-9 rounded-full text-gray-400 hover:text-green-700 hover:bg-gray-500/10 transition-colors"
                :aria-label="t('common.edit')"
                @click="openEditDishModal(dish)"
              >
                <Icon name="heroicons:pencil-square" class="w-[18px] h-[18px]" />
              </button>
              <button
                type="button"
                class="grid place-items-center w-9 h-9 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                :aria-label="`× ${dish.name}`"
                @click="confirmDeleteDish(dish)"
              >
                <Icon name="heroicons:trash" class="w-[18px] h-[18px]" />
              </button>
            </div>
            <button
              v-if="
                userDishes[category.key].length > 5 &&
                !searchQueries[category.key].trim()
              "
              type="button"
              class="list-row justify-center text-[15px] text-green-700"
              @click="
                expandedCategories[category.key] =
                  !expandedCategories[category.key]
              "
            >
              {{
                expandedCategories[category.key]
                  ? t('dishes.showLess')
                  : t('dishes.showAll', {
                    count: userDishes[category.key]?.length - 5,
                  })
              }}
            </button>
          </div>
        </template>
      </section>
    </div>

    <dish-form-modal
      :is-open="isDishModalOpen"
      :dish="editingDish"
      :category="selectedCategory"
      @close="closeDishModal"
      @save="handleSaveDish"
    />
    <import-dishes-modal
      :is-open="isImportModalOpen"
      @close="closeImportModal"
      @imported="handleImportComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { vGlass } from '@/shared/lib/liquid-glass'
import { ref } from 'vue'
import { useAuth, useApiFetch, useRequireAuth } from '@/entities/user'
import {
  useUserDishes,
  type MenuCategory,
  type Dish,
  useMenuTranslations,
} from '@/entities/menu'
import { DishFormModal } from '@/features/dish/manage-dish'
import { ImportDishesModal } from '@/features/dish/import-dishes'
import { TouSkeleton, TouBadge, TouEmptyState } from '@/shared/ui'
import { PageHeader } from '@/widgets/page-header'
import { getApiErrorMessage } from '@/shared/lib/utils/apiError'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const localePath = useLocalePath()
const { isAuthenticated } = useAuth()
const { apiFetch } = useApiFetch()
const { categories } = useMenuTranslations()
const {
  dishesByCategory: userDishes,
  isLoading,
  load: loadUserDishes,
} = useUserDishes(apiFetch, isAuthenticated)

useRequireAuth({
  redirectTo: localePath('/'),
  onReady: () => loadUserDishes(),
})

const isDishModalOpen = ref(false)
const isImportModalOpen = ref(false)
const editingDish = ref<Dish | null>(null)
const selectedCategory = ref<MenuCategory>('brunch')
const expandedCategories = ref<Record<MenuCategory, boolean>>({
  brunch: false,
  dinner: false,
  dessert: false,
})

const searchQueries = ref<Record<MenuCategory, string>>({
  brunch: '',
  dinner: '',
  dessert: '',
})

const activeSearchCategory = ref<MenuCategory | null>(null)

function displayedDishes(category: MenuCategory) {
  const q = searchQueries.value[category].trim().toLowerCase()
  const base = (userDishes.value[category] || []).slice().sort((a, b) =>
    a.name.localeCompare(b.name),
  )
  const filtered = q
    ? base.filter((dish) => dish.name.toLowerCase().includes(q))
    : base

  if (filtered.length <= 5 || expandedCategories.value[category]) {
    return filtered
  }

  return filtered.slice(0, 5)
}

function openAddDishModal(category: MenuCategory) {
  selectedCategory.value = category
  editingDish.value = null
  isDishModalOpen.value = true
}

function openEditDishModal(dish: Dish) {
  editingDish.value = dish
  selectedCategory.value = dish.category
  isDishModalOpen.value = true
}

function closeDishModal() {
  isDishModalOpen.value = false
  editingDish.value = null
}

async function handleSaveDish() {
  await loadUserDishes()
  closeDishModal()
}

function openImportModal() {
  isImportModalOpen.value = true
}

function closeImportModal() {
  isImportModalOpen.value = false
}

async function handleImportComplete() {
  await loadUserDishes()
}

async function confirmDeleteDish(dish: Dish) {
  if (!confirm(t('dishes.deleteConfirm', { name: dish.name }))) return

  try {
    await apiFetch(`/api/user/dishes/${dish.id}`, {
      method: 'DELETE',
    })
    await loadUserDishes()
  } catch (error) {
    console.error('Error deleting dish:', error)
    alert(getApiErrorMessage(error, t('dishes.deleteFailed')))
  }
}
</script>
