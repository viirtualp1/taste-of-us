<template>
  <div class="space-y-6 pb-14 sm:pb-0">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
          Shopping List
        </h1>
        <p class="text-sm text-gray-600 mt-1">
          {{ weekLabel }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-full glass border border-gray-300/60 text-gray-900 font-medium hover:border-green-300/60 hover:bg-green-50/40 transition-all active:scale-95 disabled:opacity-50"
          :disabled="isNavigating"
          @click="handleBack"
        >
          <Icon
            :name="isNavigating ? 'heroicons:arrow-path' : 'heroicons:arrow-left'"
            :class="['w-4 h-4', isNavigating && 'animate-spin']"
          />
          <span class="hidden sm:inline">{{ isNavigating ? 'Loading...' : 'Back' }}</span>
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between gap-2 sm:gap-4">
      <div class="flex items-center gap-1.5 sm:gap-2">
        <button
          class="h-[34px] w-[34px] flex items-center justify-center rounded-full glass border border-gray-300/60 hover:border-green-300/60 hover:bg-green-50/40 transition-all"
          @click="goPrevWeek"
        >
          <Icon name="heroicons:chevron-left" class="w-4 h-4" />
        </button>
        <button
          class="h-[34px] w-[34px] flex items-center justify-center rounded-full glass border border-gray-300/60 hover:border-green-300/60 hover:bg-green-50/40 transition-all"
          @click="goNextWeek"
        >
          <Icon name="heroicons:chevron-right" class="w-4 h-4" />
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="h-[34px] flex items-center gap-2 px-3 sm:px-4 rounded-full glass border border-gray-300/60 text-gray-900 font-medium hover:border-green-300/60 hover:bg-green-50/40 transition-all active:scale-95 disabled:opacity-50"
          :disabled="isGenerating"
          @click="generateFromMenu"
        >
          <Icon
            :name="isGenerating ? 'heroicons:arrow-path' : 'heroicons:sparkles'"
            :class="['w-4 h-4', isGenerating && 'animate-spin']"
          />
          <span class="hidden sm:inline text-sm">{{
            isGenerating ? 'Generating...' : 'From Menu'
          }}</span>
        </button>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-4 lg:items-stretch">
      <div class="flex-1 glass border border-gray-300/60 rounded-[20px] p-4 sm:p-6 space-y-4">
        <div class="flex gap-2">
          <input
            v-model="newItemName"
            type="text"
            placeholder="Add item..."
            class="flex-1 min-w-0 px-3 sm:px-4 py-2.5 rounded-[12px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
            @keydown.enter="addItem"
          />
          <input
            v-model="newItemQuantity"
            type="text"
            placeholder="Qty (e.g. 500g)"
            class="w-20 sm:w-[150px] px-2 sm:px-4 py-2.5 rounded-[12px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
            @keydown.enter="addItem"
          />
          <button
            class="px-3 sm:px-4 py-2.5 flex items-center justify-center rounded-[12px] glass-nested border border-gray-200/50 text-gray-700 hover:border-green-300/60 hover:bg-green-50/40 transition-all disabled:opacity-50 shrink-0 disabled:border-gray-200/50"
            :disabled="!newItemName.trim() || isAddingItem"
            @click="addItem"
          >
            <Icon
              :name="isAddingItem ? 'heroicons:arrow-path' : 'heroicons:plus'"
              :class="['w-5 h-5', isAddingItem && 'animate-spin']"
            />
          </button>
        </div>

        <div v-if="isLoading" class="space-y-3">
          <div
            v-for="i in 5"
            :key="i"
            class="h-12 glass-nested rounded-[12px] animate-pulse"
          />
        </div>

        <div v-else-if="items.length === 0" class="text-center py-12">
          <Icon
            name="heroicons:shopping-cart"
            class="w-12 h-12 text-gray-400 mx-auto mb-3"
          />
          <p class="text-gray-500">Your shopping list is empty</p>
          <p class="text-sm text-gray-400 mt-1">
            Add items or generate from your menu
          </p>
        </div>

        <div v-else class="space-y-4">
          <div v-if="dishItems.length > 0">
            <h3
              class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              <Icon name="heroicons:clipboard-document-list" class="w-4 h-4" />
              From Menu
            </h3>
            <div class="space-y-2">
              <shopping-item
                v-for="item in dishItems"
                :key="item.id"
                :item="item"
                @toggle="toggleItem(item)"
                @delete="deleteItem(item.id)"
              />
            </div>
          </div>

          <div v-if="commonListItems.length > 0">
            <h3
              class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              <Icon name="heroicons:star" class="w-4 h-4" />
              Common Items
            </h3>
            <div class="space-y-2">
              <shopping-item
                v-for="item in commonListItems"
                :key="item.id"
                :item="item"
                @toggle="toggleItem(item)"
                @delete="deleteItem(item.id)"
              />
            </div>
          </div>

          <div v-if="manualItems.length > 0">
            <h3
              class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              <Icon name="heroicons:pencil" class="w-4 h-4" />
              Custom Items
            </h3>
            <div class="space-y-2">
              <shopping-item
                v-for="item in manualItems"
                :key="item.id"
                :item="item"
                @toggle="toggleItem(item)"
                @delete="deleteItem(item.id)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="lg:w-1/4 shrink-0 glass border border-gray-300/60 rounded-[20px] p-4 sm:p-6 space-y-4 flex flex-col">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Icon name="heroicons:bookmark" class="w-5 h-5" />
            Quick Add
          </h3>
          <button
            class="px-4 py-1.5 text-sm font-medium text-gray-700 rounded-full glass-nested border border-gray-200/50 hover:border-green-300/60 hover:bg-green-50/40 transition-all"
            @click="showCommonItemsManager = !showCommonItemsManager"
          >
            {{ showCommonItemsManager ? 'Done' : 'Edit' }}
          </button>
        </div>

        <div v-if="isLoadingCommonItems" class="flex gap-2 flex-wrap">
          <div
            v-for="i in 4"
            :key="i"
            class="h-9 w-20 glass-nested rounded-full animate-pulse"
          />
        </div>

        <div v-else-if="showCommonItemsManager" class="space-y-3">
          <div class="flex gap-2">
            <input
              v-model="newCommonItemName"
              type="text"
              placeholder="Item name"
              class="flex-1 min-w-0 px-3 py-2 text-sm rounded-[10px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
              @keydown.enter="addCommonItem"
            />
            <input
              v-model="newCommonItemQuantity"
              type="text"
              placeholder="Qty (e.g. 500g)"
              class="w-20 sm:w-[150px] px-2 sm:px-3 py-2 text-sm rounded-[10px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
              @keydown.enter="addCommonItem"
            />
              <button
                class="w-9 h-9 flex items-center justify-center rounded-[10px] glass-nested border border-gray-200/50 text-gray-700 hover:border-green-300/60 hover:bg-green-50/40 transition-all disabled:opacity-50 shrink-0 disabled:border-gray-200/50"
                :disabled="!newCommonItemName.trim()"
                @click="addCommonItem"
              >
              <Icon name="heroicons:plus" class="w-4 h-4" />
            </button>
          </div>
          <div class="flex gap-2 flex-wrap">
            <div
              v-for="item in commonItems"
              :key="item.id"
              class="flex items-center gap-1 px-3 py-1.5 rounded-full glass-nested border border-gray-200/50 text-sm hover:border-green-300/60 hover:bg-green-50/40 transition-all"
            >
              <span>{{ item.name }}</span>
              <button
                class="p-0.5 rounded-full hover:bg-red-100 transition-colors"
                @click="deleteCommonItem(item.id)"
              >
                <Icon name="heroicons:x-mark" class="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
            <div v-if="commonItems.length === 0" class="text-sm text-gray-500">
              No saved items. Add your frequently bought items above.
            </div>
          </div>
        </div>

        <div v-else class="flex gap-2 flex-wrap">
          <button
            v-for="item in commonItems"
            :key="item.id"
            class="px-4 py-2 rounded-full glass-nested border border-gray-200/50 text-sm font-medium text-gray-700 hover:border-green-300/60 hover:bg-green-50/40 transition-all active:scale-95"
            @click="addCommonItemToList(item)"
          >
            + {{ item.name }}
          </button>
          <div v-if="commonItems.length === 0" class="text-sm text-gray-500">
            Click "Edit" to add frequently bought items
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTelegram } from '@/composables/useTelegram'
import { useWeekNavigation } from '@/composables/useWeekNavigation'
import ShoppingItem from '@/components/ShoppingItem.vue'

interface ShoppingListItem {
  id: string
  name: string
  quantity: string | null
  is_checked: boolean
  source_type: 'dish' | 'manual' | 'common'
  source_dish_id: string | null
  source_dish_name?: string | null
  week_start: string | null
}

interface CommonItem {
  id: string
  name: string
  default_quantity: string | null
}

definePageMeta({
  layout: 'default',
})

const router = useRouter()
const {
  isAuthenticated,
  isLoading: authLoading,
  authenticate,
  hapticFeedback,
} = useTelegram()
const { apiFetch } = useApiFetch()
const {
  weekStart,
  weekLabel,
  initialize,
  goPrevWeek: goWeekPrev,
  goNextWeek: goWeekNext,
} = useWeekNavigation()

const isLoading = ref(false)
const items = ref<ShoppingListItem[]>([])
const newItemName = ref('')
const newItemQuantity = ref('')
const isAddingItem = ref(false)
const isGenerating = ref(false)
const isNavigating = ref(false)

const commonItems = ref<CommonItem[]>([])
const isLoadingCommonItems = ref(false)
const showCommonItemsManager = ref(false)
const newCommonItemName = ref('')
const newCommonItemQuantity = ref('')

const dishItems = computed(() =>
  items.value.filter((i) => i.source_type === 'dish'),
)
const commonListItems = computed(() =>
  items.value.filter((i) => i.source_type === 'common'),
)
const manualItems = computed(() =>
  items.value.filter((i) => i.source_type === 'manual'),
)

const weekStartDate = computed(() => {
  if (!weekStart.value) return ''
  return weekStart.value.split('T')[0]
})

const loadItems = async () => {
  if (!isAuthenticated.value || !weekStartDate.value) return

  isLoading.value = true
  try {
    const data = await apiFetch<ShoppingListItem[]>(
      `/api/shopping-list?week_start=${weekStartDate.value}`,
    )
    items.value = data || []
  } catch (error) {
    console.error('Error loading shopping list:', error)
  } finally {
    isLoading.value = false
  }
}

const loadCommonItems = async () => {
  if (!isAuthenticated.value) return

  isLoadingCommonItems.value = true
  try {
    const data = await apiFetch<CommonItem[]>('/api/common-items')
    commonItems.value = data || []
  } catch (error) {
    console.error('Error loading common items:', error)
  } finally {
    isLoadingCommonItems.value = false
  }
}

const addItem = async () => {
  if (!newItemName.value.trim()) return

  isAddingItem.value = true
  try {
    await apiFetch('/api/shopping-list', {
      method: 'POST',
      body: {
        name: newItemName.value.trim(),
        quantity: newItemQuantity.value.trim() || null,
        source_type: 'manual',
        week_start: weekStartDate.value,
      },
    })
    newItemName.value = ''
    newItemQuantity.value = ''
    hapticFeedback.light()
    await loadItems()
  } catch (error) {
    console.error('Error adding item:', error)
  } finally {
    isAddingItem.value = false
  }
}

const toggleItem = async (item: ShoppingListItem) => {
  const newChecked = !item.is_checked
  item.is_checked = newChecked
  hapticFeedback.selection()

  try {
    await apiFetch(`/api/shopping-list/${item.id}`, {
      method: 'PATCH',
      body: { is_checked: newChecked },
    })
  } catch (error) {
    console.error('Error toggling item:', error)
    item.is_checked = !newChecked
  }
}

const deleteItem = async (itemId: string) => {
  try {
    await apiFetch(`/api/shopping-list/${itemId}`, {
      method: 'DELETE',
    })
    items.value = items.value.filter((i) => i.id !== itemId)
    hapticFeedback.light()
  } catch (error) {
    console.error('Error deleting item:', error)
  }
}

const generateFromMenu = async () => {
  isGenerating.value = true
  try {
    await apiFetch<{ added: number; message: string }>(
      '/api/shopping-list/generate',
      {
        method: 'POST',
        body: { week_start: weekStartDate.value },
      },
    )
    hapticFeedback.success()
    await loadItems()
  } catch (error) {
    console.error('Error generating from menu:', error)
    hapticFeedback.error()
  } finally {
    isGenerating.value = false
  }
}


const addCommonItem = async () => {
  if (!newCommonItemName.value.trim()) return

  try {
    await apiFetch('/api/common-items', {
      method: 'POST',
      body: {
        name: newCommonItemName.value.trim(),
        default_quantity: newCommonItemQuantity.value.trim() || null,
      },
    })
    newCommonItemName.value = ''
    newCommonItemQuantity.value = ''
    hapticFeedback.light()
    await loadCommonItems()
  } catch (error) {
    console.error('Error adding common item:', error)
  }
}

const deleteCommonItem = async (itemId: string) => {
  try {
    await apiFetch(`/api/common-items/${itemId}`, {
      method: 'DELETE',
    })
    commonItems.value = commonItems.value.filter((i) => i.id !== itemId)
    hapticFeedback.light()
  } catch (error) {
    console.error('Error deleting common item:', error)
  }
}

const addCommonItemToList = async (item: CommonItem) => {
  try {
    await apiFetch('/api/shopping-list', {
      method: 'POST',
      body: {
        name: item.name,
        quantity: item.default_quantity,
        source_type: 'common',
        week_start: weekStartDate.value,
      },
    })
    hapticFeedback.light()
    await loadItems()
  } catch (error) {
    console.error('Error adding common item to list:', error)
  }
}

const goPrevWeek = () => {
  goWeekPrev()
  hapticFeedback.light()
}

const goNextWeek = () => {
  goWeekNext()
  hapticFeedback.light()
}

const handleBack = () => {
  if (isNavigating.value) return
  isNavigating.value = true
  router.push('/')
}

watch(weekStartDate, () => {
  if (weekStartDate.value && isAuthenticated.value) {
    loadItems()
  }
})

onMounted(async () => {
  initialize()

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
    loadItems()
    loadCommonItems()
  }
})
</script>
