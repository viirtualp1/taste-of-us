<template>
  <div>
    <h1 class="sr-only">{{ t('dishes.title') }}</h1>

    <div class="dish-grid grid items-start gap-6">
      <section
        v-for="category in categories"
        :key="category.key"
        class="min-w-0"
      >
        <div class="section-label">
          <div class="flex items-center gap-2 min-w-0">
            <h2 class="truncate">
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
                  ? 'bg-primary/15 text-accent-foreground'
                  : 'text-accent-foreground'
              "
              :aria-pressed="activeSearchCategory === category.key"
              :aria-label="t('dishes.searchPlaceholder')"
              @click="
                activeSearchCategory =
                  activeSearchCategory === category.key ? null : category.key
              "
            >
              <TouIcon
                name="heroicons:magnifying-glass-20-solid"
                class="w-5 h-5"
              />
            </button>
            <button
              type="button"
              class="icon-btn icon-btn--sm text-accent-foreground"
              :aria-label="t('dishes.addDish')"
              @click="openAddDishModal(category.key)"
            >
              <TouIcon name="heroicons:plus-circle-solid" class="w-7 h-7" />
            </button>
          </div>
        </div>

        <div v-if="activeSearchCategory === category.key" class="mb-3 relative">
          <TouIcon
            name="heroicons:magnifying-glass-20-solid"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          />
          <input
            v-model="searchQueries[category.key]"
            type="search"
            :placeholder="t('dishes.searchPlaceholder')"
            class="field h-9! pl-9! pr-9! text-ios"
          />
          <button
            v-if="searchQueries[category.key]"
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-5 h-5 rounded-full bg-gray-400 text-white"
            aria-label="Clear"
            @click="searchQueries[category.key] = ''"
          >
            <TouIcon name="heroicons:x-mark-20-solid" class="w-3.5 h-3.5" />
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
                class="flex-1 min-w-0 py-1.5 text-left text-ios-body truncate"
                @click="openEditDishModal(dish)"
              >
                {{ dish.name }}
              </button>
              <button
                type="button"
                class="grid place-items-center w-9 h-9 rounded-full text-gray-400 hover:text-accent-foreground hover:bg-gray-500/10 transition-colors"
                :aria-label="t('common.edit')"
                @click="openEditDishModal(dish)"
              >
                <TouIcon name="heroicons:pencil-square" class="size-4.5" />
              </button>
              <button
                type="button"
                class="grid place-items-center w-9 h-9 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                :aria-label="`× ${dish.name}`"
                @click="confirmDeleteDish(dish)"
              >
                <TouIcon name="heroicons:trash" class="size-4.5" />
              </button>
            </div>
            <button
              v-if="
                userDishes[category.key].length > 5 &&
                !searchQueries[category.key].trim()
              "
              type="button"
              class="list-row justify-center text-ios text-accent-foreground"
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

    <footer class="mt-6 flex justify-end">
      <TouButton type="button" variant="secondary" @click="openImportModal">
        <TouIcon name="heroicons:arrow-down-tray" class="size-5" />
        {{ t('common.import') }}
      </TouButton>
    </footer>

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
import { useAuth, useApiFetch, useRequireAuth } from '@/entities/user'
import {
  useUserDishes,
  type MenuCategory,
  type Dish,
  useMenuTranslations,
} from '@/entities/menu'
import { DishFormModal } from '@/features/dish/manage-dish'
import { ImportDishesModal } from '@/features/dish/import-dishes'
import {
  TouButton,
  TouIcon,
  TouSkeleton,
  TouBadge,
  TouEmptyState,
} from '@/shared/ui'
import { getApiErrorMessage } from '@/shared/lib/utils'

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
  const base = (userDishes.value[category] || [])
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
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

<style scoped>
@media (min-width: 600px) {
  .dish-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 900px) {
  .dish-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
