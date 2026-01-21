<template>
  <tou-card class="overflow-hidden flex flex-col h-full">
    <tou-card-content class="flex-1 flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <div class="space-y-1">
          <p class="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-500">
            Shopping List
          </p>
          <h3 class="text-xl sm:text-2xl font-bold text-gray-900">
            This Week
          </h3>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="flex items-center justify-center w-8 h-8 rounded-full glass-nested border border-gray-200/50 text-gray-700 hover:border-green-300/60 hover:bg-green-50/40 transition-all"
            @click="isAddModalOpen = true"
          >
            <Icon name="heroicons:plus" class="w-4 h-4" />
          </button>
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-nested border border-gray-200/50 text-gray-700 hover:border-green-300/60 hover:bg-green-50/40 transition-all text-xs sm:text-sm font-medium"
            @click="navigateToShopping"
          >
            <Icon name="heroicons:arrow-right" class="w-4 h-4" />
            <span class="hidden sm:inline">View All</span>
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="space-y-2 flex-1">
        <div
          v-for="i in 3"
          :key="i"
          class="h-10 glass-nested rounded-[12px] animate-pulse"
        />
      </div>

      <div v-else-if="uncheckedItems.length === 0" class="flex-1 flex items-center justify-center py-6">
        <div class="text-center">
          <Icon
            name="heroicons:check-circle"
            class="w-8 h-8 text-gray-400 mx-auto mb-2"
          />
          <p class="text-sm text-gray-500">All items checked!</p>
        </div>
      </div>

      <div v-else class="space-y-2 flex-1 overflow-y-auto">
        <div
          v-for="item in uncheckedItems.slice(0, 5)"
          :key="item.id"
          class="flex items-center gap-2 p-2.5 glass-nested border border-gray-200/50 rounded-[12px]"
        >
          <div class="shrink-0 w-5 h-5 rounded-[6px] border-2 border-gray-300 flex items-center justify-center">
            <Icon
              v-if="item.is_checked"
              name="heroicons:check"
              class="w-3 h-3 text-green-600"
            />
          </div>
          <div class="flex-1 min-w-0">
            <span class="text-sm font-medium text-gray-900 truncate block">
              {{ item.name }}
            </span>
            <span
              v-if="item.quantity"
              class="text-xs text-gray-500 truncate block"
            >
              {{ item.quantity }}
            </span>
          </div>
        </div>
        <div
          v-if="uncheckedItems.length > 5"
          class="text-center pt-2"
        >
          <p class="text-xs text-gray-500">
            +{{ uncheckedItems.length - 5 }} more items
          </p>
        </div>
      </div>
    </tou-card-content>
  </tou-card>

  <BottomSheet
    :is-open="isAddModalOpen"
    title="Add Item"
    content-class="p-4 sm:p-6 space-y-4"
    @close="closeAddModal"
  >
    <div>
      <label
        for="item-name"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        Item Name
      </label>
      <input
        id="item-name"
        v-model="newItemName"
        type="text"
        placeholder="Enter item name"
        class="w-full px-4 py-2.5 rounded-[12px] border border-gray-200/50 glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
        @keydown.enter="handleAddItem"
      />
    </div>

    <div>
      <label
        for="item-quantity"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        Quantity (Optional)
      </label>
      <input
        id="item-quantity"
        v-model="newItemQuantity"
        type="text"
        placeholder="e.g. 500g, 1kg"
        class="w-full px-4 py-2.5 rounded-[12px] border border-gray-200/50 glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
        @keydown.enter="handleAddItem"
      />
    </div>

    <template #footer>
      <div class="flex gap-3 p-4 sm:p-6">
        <button
          class="flex-1 px-4 py-2.5 rounded-[12px] glass-nested border border-gray-200/50 text-gray-700 font-medium hover:border-green-300/60 hover:bg-green-50/40 transition-all"
          @click="closeAddModal"
        >
          Cancel
        </button>
        <button
          class="flex-1 px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isAddingItem || !newItemName.trim()"
          @click="handleAddItem"
        >
          {{ isAddingItem ? 'Adding...' : 'Add' }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TouCard from '@/components/ui/TouCard/TouCard.vue'
import TouCardContent from '@/components/ui/TouCard/TouCardContent.vue'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import { useApiFetch } from '@/composables/useApiFetch'
import { useTelegram } from '@/composables/useTelegram'

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

interface Props {
  weekStart: string | null
}

const props = defineProps<Props>()

const router = useRouter()
const { apiFetch } = useApiFetch()
const { isAuthenticated, hapticFeedback } = useTelegram()
const isLoading = ref(false)
const items = ref<ShoppingListItem[]>([])
const isAddModalOpen = ref(false)
const newItemName = ref('')
const newItemQuantity = ref('')
const isAddingItem = ref(false)

const weekStartDate = computed(() => {
  if (!props.weekStart) return ''
  if (typeof props.weekStart === 'string') {
    return props.weekStart.split('T')[0]
  }
  return ''
})

const uncheckedItems = computed(() => {
  return items.value.filter((item) => !item.is_checked)
})

const loadItems = async () => {
  if (!isAuthenticated.value || !weekStartDate.value) {
    items.value = []
    return
  }

  isLoading.value = true
  try {
    const data = await apiFetch<ShoppingListItem[]>(
      `/api/shopping-list?week_start=${weekStartDate.value}`,
    )
    items.value = data || []
  } catch (error) {
    console.error('Error loading shopping list:', error)
    items.value = []
  } finally {
    isLoading.value = false
  }
}

const navigateToShopping = () => {
  router.push('/shopping')
}

const handleAddItem = async () => {
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
    closeAddModal()
  } catch (error) {
    console.error('Error adding item:', error)
  } finally {
    isAddingItem.value = false
  }
}

const closeAddModal = () => {
  isAddModalOpen.value = false
  newItemName.value = ''
  newItemQuantity.value = ''
}

watch([weekStartDate, isAuthenticated], () => {
  if (weekStartDate.value && isAuthenticated.value) {
    loadItems()
  } else {
    items.value = []
  }
}, { immediate: true })

onMounted(() => {
  if (weekStartDate.value && isAuthenticated.value) {
    loadItems()
  }
})
</script>
