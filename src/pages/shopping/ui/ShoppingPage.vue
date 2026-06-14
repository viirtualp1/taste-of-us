<template>
  <div class="space-y-6 pb-14 sm:pb-0">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
          {{ t('shopping.title') }}
        </h1>
        <p class="text-sm text-gray-600 mt-1">
          {{ weekLabel }}
        </p>
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
            isGenerating ? t('common.generating') : t('shopping.fromMenu')
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
            :placeholder="t('shopping.addItem')"
            class="flex-1 min-w-0 px-3 sm:px-4 py-2.5 rounded-[12px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
            @keydown.enter="addItem"
          />
          <input
            v-model="newItemQuantity"
            type="text"
            :placeholder="t('shopping.qtyPlaceholder')"
            class="w-28 sm:w-[150px] px-3 sm:px-4 py-2.5 rounded-[12px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
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
          <tou-skeleton
            v-for="i in 5"
            :key="i"
            class="h-12 rounded-[12px]"
          />
        </div>

        <TouEmptyState
          v-else-if="items.length === 0"
          icon="heroicons:shopping-cart"
          :title="t('shopping.empty')"
          :description="t('shopping.emptyHint')"
        />

        <div v-else class="space-y-4">
          <div v-if="dishItems.length > 0">
            <h3
              class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              <Icon name="heroicons:clipboard-document-list" class="w-4 h-4" />
              {{ t('shopping.fromMenu') }}
            </h3>
            <div class="space-y-2">
              <shopping-item
                v-for="item in dishItems"
                :key="item.id"
                :item="item"
                :is-deleting="deletingId === item.id"
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
              {{ t('shopping.commonItems') }}
            </h3>
            <div class="space-y-2">
              <shopping-item
                v-for="item in commonListItems"
                :key="item.id"
                :item="item"
                :is-deleting="deletingId === item.id"
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
              {{ t('shopping.customItems') }}
            </h3>
            <div class="space-y-2">
              <shopping-item
                v-for="item in manualItems"
                :key="item.id"
                :item="item"
                :is-deleting="deletingId === item.id"
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
            {{ t('shopping.quickAdd') }}
          </h3>
          <button
            class="px-4 py-1.5 text-sm font-medium text-gray-700 rounded-full glass-nested border border-gray-200/50 hover:border-green-300/60 hover:bg-green-50/40 transition-all"
            @click="showCommonItemsManager = !showCommonItemsManager"
          >
            {{ showCommonItemsManager ? t('common.done') : t('common.edit') }}
          </button>
        </div>

        <div v-if="isLoadingCommonItems" class="flex gap-2 flex-wrap">
          <tou-skeleton
            v-for="i in 4"
            :key="i"
            class="h-9 w-20 rounded-full"
          />
        </div>

        <div v-else-if="showCommonItemsManager" class="space-y-3">
          <div class="flex gap-2">
            <input
              v-model="newCommonItemName"
              type="text"
              :placeholder="t('shopping.itemName')"
              class="flex-1 min-w-0 px-3 py-2 text-sm rounded-[10px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
              @keydown.enter="addCommonItem"
            />
            <input
              v-model="newCommonItemQuantity"
              type="text"
              :placeholder="t('shopping.qtyPlaceholder')"
              class="w-28 sm:w-[150px] px-3 sm:px-3 py-2 text-sm rounded-[10px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
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
              {{ t('shopping.noSavedItems') }}
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
            {{ t('shopping.editToAddCommon') }}
          </div>
        </div>
      </div>
    </div>

    <floating-actions-bar>
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTelegram, useApiFetch, useRequireAuth } from '@/entities/user'
import { useWeekNavigation } from '@/entities/menu'
import {
  useShoppingList,
  useCommonItems,
  type CommonItem,
} from '@/entities/shopping-list'
import { ShoppingItem } from '@/widgets/shopping-item'
import { TouSkeleton, TouEmptyState } from '@/shared/ui'
import { FloatingActionsBar } from '@/widgets/floating-actions-bar'

definePageMeta({
  layout: 'default',
})

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const { isAuthenticated, hapticFeedback } = useTelegram()
const { apiFetch } = useApiFetch()
const {
  weekStart,
  weekLabel,
  initialize,
  goPrevWeek: goWeekPrev,
  goNextWeek: goWeekNext,
} = useWeekNavigation()

const {
  items,
  isLoading,
  isAddingItem,
  isGenerating,
  deletingId,
  weekStartDate,
  dishItems,
  commonListItems,
  manualItems,
  load: loadItems,
  addManualItem,
  toggleItem,
  removeItem,
  generateFromMenu,
} = useShoppingList(apiFetch, weekStart, isAuthenticated, hapticFeedback)

const {
  items: commonItems,
  isLoading: isLoadingCommonItems,
  load: loadCommonItems,
  addItem: addCommonItemToLibrary,
  removeItem: deleteCommonItem,
  addToShoppingList: addCommonItemToListRequest,
} = useCommonItems(apiFetch, isAuthenticated, hapticFeedback)

const newItemName = ref('')
const newItemQuantity = ref('')
const isNavigating = ref(false)
const showCommonItemsManager = ref(false)
const newCommonItemName = ref('')
const newCommonItemQuantity = ref('')

useRequireAuth({
  redirectTo: localePath('/'),
  onReady: () => loadCommonItems(),
})

async function addItem() {
  const added = await addManualItem(newItemName.value, newItemQuantity.value)
  if (added) {
    newItemName.value = ''
    newItemQuantity.value = ''
  }
}

async function deleteItem(itemId: string) {
  await removeItem(itemId)
}

async function addCommonItem() {
  const added = await addCommonItemToLibrary(
    newCommonItemName.value,
    newCommonItemQuantity.value,
  )
  if (added) {
    newCommonItemName.value = ''
    newCommonItemQuantity.value = ''
  }
}

async function addCommonItemToList(item: CommonItem) {
  const added = await addCommonItemToListRequest(item, weekStartDate.value)
  if (added) {
    await loadItems()
  }
}

function goPrevWeek() {
  goWeekPrev()
  hapticFeedback.light()
}

function goNextWeek() {
  goWeekNext()
  hapticFeedback.light()
}

function handleBack() {
  if (isNavigating.value) return
  isNavigating.value = true
  router.push(localePath('/'))
}

onMounted(() => {
  initialize()
})
</script>
