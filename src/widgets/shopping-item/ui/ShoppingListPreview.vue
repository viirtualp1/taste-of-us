<template>
  <section class="min-w-0">
    <div class="flex items-center justify-between gap-3 px-1 pb-3">
      <h2 class="text-[22px] font-bold leading-tight truncate">
        {{ t('shopping.thisWeek') }}
      </h2>
      <div class="flex items-center gap-1 shrink-0">
        <button
          type="button"
          class="icon-btn icon-btn--sm text-green-700"
          :aria-label="t('shopping.addItemTitle')"
          @click="isAddModalOpen = true"
        >
          <Icon name="heroicons:plus-circle-solid" class="w-7 h-7" />
        </button>
        <button
          type="button"
          class="btn btn--sm bg-transparent! px-2! text-green-700 font-normal text-[15px]"
          @click="navigateToShopping"
        >
          {{ t('shopping.viewAll') }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="list">
      <div v-for="i in 3" :key="i" class="list-row">
        <tou-skeleton class="h-[22px] w-[22px] rounded-full!" />
        <tou-skeleton class="h-4 w-32" />
      </div>
    </div>

    <div v-else-if="items.length === 0" class="list">
      <div class="flex flex-col items-center gap-2 py-8 px-4 text-center">
        <Icon name="heroicons:shopping-cart" class="w-8 h-8 text-gray-400" />
        <p class="text-[15px] text-muted-foreground">{{ t('shopping.empty') }}</p>
      </div>
    </div>

    <template v-else>
      <div class="list" style="--row-inset: 50px">
        <ShoppingItem
          v-for="item in previewItems"
          :key="item.id"
          :item="item"
          :is-deleting="deletingId === item.id"
          @toggle="toggleItem(item)"
          @delete="removeItem(item.id)"
        />
      </div>
      <p v-if="items.length > 5" class="section-footer">
        {{ t('shopping.moreItems', { count: items.length - 5 }) }}
      </p>
    </template>
  </section>

  <BottomSheet
    :is-open="isAddModalOpen"
    :title="t('shopping.addItemTitle')"
    content-class="px-4 pb-2 pt-2 sm:px-5 space-y-4"
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
