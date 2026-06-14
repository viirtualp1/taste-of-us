<template>
  <tou-card class="overflow-hidden flex flex-col h-full">
    <tou-card-content class="flex-1 flex flex-col">
      <div
        class="flex flex-wrap items-start justify-between gap-3 mb-4 min-w-0"
      >
        <div class="space-y-1 min-w-0">
          <p
            class="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-500 whitespace-nowrap"
          >
            {{ t('shopping.previewTitle') }}
          </p>
          <h3 class="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            {{ t('shopping.thisWeek') }}
          </h3>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button
            class="flex items-center justify-center w-8 h-8 rounded-full glass-nested border border-gray-200/50 text-gray-700 hover:border-green-300/60 hover:bg-green-50/40 transition-all"
            @click="isAddModalOpen = true"
          >
            <Icon name="heroicons:plus" class="w-4 h-4" />
          </button>
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-nested border border-gray-200/50 text-gray-700 hover:border-green-300/60 hover:bg-green-50/40 transition-all text-xs sm:text-sm font-medium whitespace-nowrap"
            @click="navigateToShopping"
          >
            <Icon name="heroicons:arrow-right" class="w-4 h-4 shrink-0" />
            <span class="hidden sm:inline">{{ t('shopping.viewAll') }}</span>
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="space-y-2 flex-1">
        <tou-skeleton v-for="i in 3" :key="i" class="h-8" />
      </div>

      <div
        v-else-if="items.length === 0"
        class="flex-1 flex items-center justify-center py-6"
      >
        <div class="text-center">
          <Icon
            name="heroicons:shopping-cart"
            class="w-8 h-8 text-gray-400 mx-auto mb-2"
          />
          <p class="text-sm text-gray-500">{{ t('shopping.empty') }}</p>
        </div>
      </div>

      <div v-else class="space-y-2 flex-1 overflow-y-auto">
        <ShoppingItem
          v-for="item in previewItems"
          :key="item.id"
          :item="item"
          :is-deleting="deletingId === item.id"
          class="!p-2.5"
          @toggle="toggleItem(item)"
          @delete="removeItem(item.id)"
        />
        <div v-if="items.length > 5" class="text-center pt-2">
          <p class="text-xs text-gray-500">
            {{ t('shopping.moreItems', { count: items.length - 5 }) }}
          </p>
        </div>
      </div>
    </tou-card-content>
  </tou-card>

  <BottomSheet
    :is-open="isAddModalOpen"
    :title="t('shopping.addItemTitle')"
    content-class="p-4 sm:p-6 space-y-4"
    @close="closeAddModal"
  >
    <div>
      <TouFieldLabel for="item-name">
        {{ t('shopping.itemNameLabel') }}
      </TouFieldLabel>
      <TouInput
        id="item-name"
        v-model="newItemName"
        type="text"
        class="w-full"
        :placeholder="t('shopping.itemNamePlaceholder')"
        @keydown.enter="handleAddItem"
      />
    </div>

    <div>
      <TouFieldLabel for="item-quantity">
        {{ t('shopping.quantityOptional') }}
      </TouFieldLabel>
      <TouInput
        id="item-quantity"
        v-model="newItemQuantity"
        type="text"
        class="w-full"
        :placeholder="t('shopping.quantityExample')"
        @keydown.enter="handleAddItem"
      />
    </div>

    <template #footer>
      <TouModalFooter
        :cancel-label="t('common.cancel')"
        :confirm-label="t('common.add')"
        :loading-label="t('common.adding')"
        :loading="isAddingItem"
        :confirm-disabled="!newItemName.trim()"
        @cancel="closeAddModal"
        @confirm="handleAddItem"
      />
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useRouter } from 'vue-router'
import {
  TouCard,
  TouCardContent,
  BottomSheet,
  TouSkeleton,
  TouFieldLabel,
  TouInput,
  TouModalFooter,
} from '@/shared/ui'
import { useApiFetch, useTelegram } from '@/entities/user'
import { useShoppingList } from '@/entities/shopping-list'
import { ShoppingItem } from '@/widgets/shopping-item'

interface Props {
  weekStart: string | null
}

const props = defineProps<Props>()

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const { apiFetch } = useApiFetch()
const { isAuthenticated, hapticFeedback } = useTelegram()

const {
  items,
  isLoading,
  isAddingItem,
  deletingId,
  addManualItem,
  toggleItem,
  removeItem,
} = useShoppingList(
  apiFetch,
  toRef(props, 'weekStart'),
  isAuthenticated,
  hapticFeedback,
)

const previewItems = computed(() => items.value.slice(0, 5))

const isAddModalOpen = ref(false)
const newItemName = ref('')
const newItemQuantity = ref('')

const navigateToShopping = () => {
  router.push(localePath('/shopping'))
}

const handleAddItem = async () => {
  const added = await addManualItem(newItemName.value, newItemQuantity.value)
  if (added) {
    closeAddModal()
  }
}

const closeAddModal = () => {
  isAddModalOpen.value = false
  newItemName.value = ''
  newItemQuantity.value = ''
}
</script>
