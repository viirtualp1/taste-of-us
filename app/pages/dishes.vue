<template>
  <div class="space-y-6 pb-14 sm:pb-0">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">My Dishes</h1>
        <p class="text-sm text-gray-600 mt-1">
          Create and manage your custom dishes menu
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-full glass text-gray-900 font-medium transition-opacity hover:opacity-70 active:scale-95"
          @click="openImportModal"
        >
          <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
          <span class="hidden sm:inline">Import</span>
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-full glass text-gray-900 font-medium transition-opacity hover:opacity-70 active:scale-95"
          @click="$router.push('/')"
        >
          <Icon name="heroicons:arrow-left" class="w-4 h-4" />
          <span class="hidden sm:inline">Back</span>
        </button>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-4 lg:gap-6">
      <div
        v-for="category in CATEGORIES"
        :key="category.key"
        class="glass rounded-[20px] px-6 py-4 flex-1 min-w-0"
      >
        <div class="flex items-center justify-between mb-4">
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
          <button
            class="flex items-center gap-2 px-4 py-2 rounded-full glass-nested text-gray-900 font-medium transition-opacity hover:opacity-70 active:scale-95"
            @click="openAddDishModal(category.key)"
          >
            <Icon name="heroicons:plus" class="w-4 h-4" />
            <span class="hidden sm:inline">Add Dish</span>
          </button>
        </div>

        <div v-if="isLoading" class="space-y-2">
          <div
            v-for="i in 3"
            :key="i"
            class="h-12 glass-nested rounded-[12px] animate-pulse"
          />
        </div>

        <div
          v-else-if="userDishes[category.key]?.length === 0"
          class="text-center py-8"
        >
          <p class="text-gray-500">No dishes yet. Add your first dish!</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="dish in userDishes[category.key]"
            :key="dish.id"
            class="flex items-center justify-between p-4 glass-nested rounded-[12px] hover:bg-white/50 transition-colors"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <span class="text-sm font-semibold text-gray-900 truncate">{{
                dish.name
              }}</span>
              <span
                v-if="dish.cuisine"
                class="hidden sm:inline-block px-2 py-0.5 rounded-[8px] text-xs font-medium bg-white/60 text-gray-600"
              >
                {{ getCuisineLabel(dish.cuisine) }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="p-2 rounded-[8px] hover:bg-white/50 transition-colors"
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
        </div>
      </div>
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
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import DishFormModal from '@/components/DishFormModal.vue'
import ImportDishesModal from '@/components/ImportDishesModal.vue'
import {
  CATEGORIES,
  type MenuCategory,
  type Dish,
  CUISINES,
} from '@/utils/menu'

const getCuisineLabel = (cuisine: string) => {
  return CUISINES.find((c) => c.key === cuisine)?.label || cuisine
}

definePageMeta({
  layout: 'default',
})

const router = useRouter()
const { isAuthenticated, isLoading: authLoading, authenticate } = useAuth()
const { apiFetch } = useApiFetch()

const isLoading = ref(false)
const userDishes = ref<Record<MenuCategory, Dish[]>>({
  brunch: [],
  dinner: [],
  dessert: [],
})

const isDishModalOpen = ref(false)
const isImportModalOpen = ref(false)
const editingDish = ref<Dish | null>(null)
const selectedCategory = ref<MenuCategory>('brunch')

const loadUserDishes = async () => {
  if (!isAuthenticated.value) {
    return
  }

  isLoading.value = true
  try {
    const response =
      await apiFetch<Record<MenuCategory, Dish[]>>('/api/user/dishes')

    userDishes.value = {
      brunch: response.brunch || [],
      dinner: response.dinner || [],
      dessert: response.dessert || [],
    }
  } catch (error) {
    console.error('[dishes] Error loading user dishes:', error)
  } finally {
    isLoading.value = false
  }
}

const openAddDishModal = (category: MenuCategory) => {
  selectedCategory.value = category
  editingDish.value = null
  isDishModalOpen.value = true
}

const openEditDishModal = (dish: Dish) => {
  editingDish.value = dish
  selectedCategory.value = dish.category
  isDishModalOpen.value = true
}

const closeDishModal = () => {
  isDishModalOpen.value = false
  editingDish.value = null
}

const handleSaveDish = async () => {
  await loadUserDishes()
  closeDishModal()
}

const openImportModal = () => {
  isImportModalOpen.value = true
}

const closeImportModal = () => {
  isImportModalOpen.value = false
}

const handleImportComplete = async () => {
  await loadUserDishes()
}

const confirmDeleteDish = async (dish: Dish) => {
  if (!confirm(`Are you sure you want to delete "${dish.name}"?`)) return

  try {
    await apiFetch(`/api/user/dishes/${dish.id}`, {
      method: 'DELETE',
    })

    await loadUserDishes()
  } catch (error) {
    console.error('Error deleting dish:', error)
    alert('Failed to delete dish. Please try again.')
  }
}

onMounted(async () => {
  if (!isAuthenticated.value && !authLoading.value) {
    try {
      const result = await authenticate()
      if (!result.success) {
        router.push('/')
        return
      }
    } catch (error) {
      console.error('Authentication error:', error)
      router.push('/')
      return
    }
  }

  if (isAuthenticated.value) {
    loadUserDishes()
  }
})
</script>
