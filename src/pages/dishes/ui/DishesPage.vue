<template>
  <div class="space-y-6 pb-14 sm:pb-0">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
          {{ t('dishes.title') }}
        </h1>
        <p class="text-sm text-gray-600 mt-1">
          {{ t('dishes.subtitle') }}
        </p>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-4 lg:gap-6">
      <div
        v-for="category in categories"
        :key="category.key"
        class="glass border border-gray-300/60 rounded-[20px] px-6 py-4 flex-1 min-w-0"
      >
        <div class="flex items-center justify-between mb-3 gap-2">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold text-gray-900">
              {{ category.label }}
            </h2>
            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-semibold glass-nested"
            >
              {{ userDishes[category.key]?.length || 0 }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="h-9 w-9 flex items-center justify-center rounded-full glass-nested border text-gray-600 hover:border-green-300/60 hover:bg-green-50/40 transition-all active:scale-95"
              :class="
                activeSearchCategory === category.key
                  ? 'border-green-400 bg-green-50/70 text-green-700'
                  : 'border-gray-200/50'
              "
              :aria-pressed="activeSearchCategory === category.key"
              @click="
                activeSearchCategory =
                  activeSearchCategory === category.key ? null : category.key
              "
            >
              <Icon
                name="heroicons:magnifying-glass"
                class="w-4 h-4"
              />
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2 rounded-full glass-nested border border-gray-200/50 text-gray-900 font-medium hover:border-green-300/60 hover:bg-green-50/40 transition-all active:scale-95"
              @click="openAddDishModal(category.key)"
            >
              <Icon name="heroicons:plus" class="w-4 h-4" />
              <span class="hidden sm:inline">{{ t('dishes.addDish') }}</span>
            </button>
          </div>
        </div>

        <div v-if="activeSearchCategory === category.key" class="mb-3 relative">
          <input
            v-model="searchQueries[category.key]"
            type="text"
            :placeholder="t('dishes.searchPlaceholder')"
            class="w-full pr-9 pl-3 py-2 text-sm rounded-[10px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
          />
          <button
            v-if="searchQueries[category.key]"
            class="absolute right-0 top-1/2 -translate-y-1/2 px-3 flex items-center text-gray-400 hover:text-gray-600"
            @click="searchQueries[category.key] = ''"
          >
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </button>
        </div>

        <div v-if="isLoading" class="space-y-2">
          <tou-skeleton
            v-for="i in 3"
            :key="i"
            class="h-12 rounded-[12px]"
          />
        </div>

        <div
          v-else-if="userDishes[category.key]?.length === 0"
          class="text-center py-8"
        >
          <p class="text-gray-500">{{ t('dishes.empty') }}</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="dish in displayedDishes(category.key)"
            :key="dish.id"
            class="flex items-center justify-between p-4 glass-nested border border-gray-200/50 rounded-[12px] hover:border-green-300/60 hover:bg-green-50/40 transition-all"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <span class="text-sm font-semibold text-gray-900 truncate">{{
                dish.name
              }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="p-2 rounded-[8px] hover:bg-green-50/40 transition-colors"
                @click="openEditDishModal(dish)"
              >
                <Icon name="heroicons:pencil" class="w-4 h-4 text-gray-600" />
              </button>
              <button
                class="p-2 rounded-[8px] hover:bg-red-50/50 transition-colors"
                @click="confirmDeleteDish(dish)"
              >
                <Icon name="heroicons:trash" class="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
          <button
            v-if="
              userDishes[category.key].length > 5 &&
              !expandedCategories[category.key] &&
              !searchQueries[category.key].trim()
            "
            class="w-full p-3 rounded-[12px] glass-nested border border-gray-200/50 text-gray-700 font-medium hover:border-green-300/60 hover:bg-green-50/40 transition-all text-sm"
            @click="expandedCategories[category.key] = true"
          >
            {{
              t('dishes.showAll', {
                count: userDishes[category.key]?.length - 5,
              })
            }}
          </button>
          <button
            v-if="
              userDishes[category.key].length > 5 &&
              expandedCategories[category.key] &&
              !searchQueries[category.key].trim()
            "
            class="w-full p-3 rounded-[12px] glass-nested border border-gray-200/50 text-gray-700 font-medium hover:border-green-300/60 hover:bg-green-50/40 transition-all text-sm"
            @click="expandedCategories[category.key] = false"
          >
            {{ t('dishes.showLess') }}
          </button>
        </div>
      </div>
    </div>

    <floating-actions-bar>
      <button
        class="flex items-center gap-2 text-gray-900 transition-opacity hover:opacity-70 active:scale-95 whitespace-nowrap"
        @click="openImportModal"
      >
        <Icon name="heroicons:arrow-down-tray" class="w-5 h-5 shrink-0" />
        <span class="hidden sm:inline">{{ t('common.import') }}</span>
      </button>
      <div class="h-4 w-px bg-gray-300/50 shrink-0" />
      <button
        class="flex items-center gap-2 text-gray-900 transition-opacity hover:opacity-70 active:scale-95 whitespace-nowrap"
        :disabled="isNavigating"
        @click="handleBack"
      >
        <Icon
          :name="isNavigating ? 'heroicons:arrow-path' : 'heroicons:arrow-left'"
          :class="['w-5 h-5', isNavigating && 'animate-spin']"
        />
        <span class="hidden sm:inline">{{
          isNavigating ? t('common.loading') : t('common.back')
        }}</span>
      </button>
    </floating-actions-bar>

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, useApiFetch, useRequireAuth } from '@/entities/user'
import {
  useUserDishes,
  type MenuCategory,
  type Dish,
} from '@/entities/menu'
import { DishFormModal } from '@/features/dish/manage-dish'
import { ImportDishesModal } from '@/features/dish/import-dishes'
import { TouSkeleton } from '@/shared/ui'
import { FloatingActionsBar } from '@/widgets/floating-actions-bar'
import { getApiErrorMessage } from '@/shared/lib/utils/apiError'
import { useMenuTranslations } from '@/shared/i18n'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
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

const isNavigating = ref(false)
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

function handleBack() {
  if (isNavigating.value) return
  isNavigating.value = true
  router.push(localePath('/'))
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
