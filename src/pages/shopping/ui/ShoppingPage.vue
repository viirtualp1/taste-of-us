<template>
  <div>
    <h1 class="sr-only">{{ t('shopping.title') }}</h1>

    <div class="flex flex-wrap items-center justify-between gap-2 pb-4">
      <div class="shopping-week glass flex items-center rounded-full p-1">
        <button
          type="button"
          class="icon-btn icon-btn--sm text-accent-foreground"
          :aria-label="t('common.prev')"
          @click="goPrevWeek"
        >
          <TouIcon name="heroicons:chevron-left-20-solid" class="w-5 h-5" />
        </button>
        <span class="px-1 text-center text-ios font-medium">{{
          weekLabel
        }}</span>
        <button
          type="button"
          class="icon-btn icon-btn--sm text-accent-foreground"
          :aria-label="t('common.next')"
          @click="goNextWeek"
        >
          <TouIcon name="heroicons:chevron-right-20-solid" class="w-5 h-5" />
        </button>
      </div>

      <button
        type="button"
        class="btn btn--tinted btn--sm"
        :disabled="isGenerating"
        @click="generateFromMenu"
      >
        <TouIcon
          :name="
            isGenerating ? 'heroicons:arrow-path' : 'heroicons:sparkles-solid'
          "
          :class="['w-4 h-4', isGenerating && 'animate-spin']"
        />
        {{ isGenerating ? t('common.generating') : t('shopping.fromMenu') }}
      </button>
    </div>

    <div class="page-columns">
      <div class="min-w-0 space-y-6">
        <!-- New item row, Reminders-style -->
        <div class="list">
          <div class="list-row py-1.5! pr-1.5!">
            <TouIcon
              name="heroicons:plus-circle-solid"
              class="size-5.5 shrink-0 text-green-500"
            />
            <input
              v-model="newItemName"
              type="text"
              :placeholder="t('shopping.addItem')"
              class="material-text-field flex-1 min-w-0 h-10 bg-transparent text-ios-body outline-hidden placeholder:text-gray-400"
              @keydown.enter="addItem"
            />
            <input
              v-model="newItemQuantity"
              type="text"
              :placeholder="t('shopping.qtyPlaceholder')"
              class="field h-9! w-20! sm:w-24! px-3! text-ios"
              @keydown.enter="addItem"
            />
            <button
              type="button"
              class="btn btn--primary w-9! h-9! p-0! shrink-0"
              :disabled="!newItemName.trim() || isAddingItem"
              :aria-label="t('common.add')"
              @click="addItem"
            >
              <TouIcon
                :name="
                  isAddingItem
                    ? 'heroicons:arrow-path'
                    : 'heroicons:arrow-up-20-solid'
                "
                :class="['w-5 h-5', isAddingItem && 'animate-spin']"
              />
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="list">
          <div v-for="i in 5" :key="i" class="list-row">
            <tou-skeleton class="size-5.5 rounded-full!" />
            <tou-skeleton class="h-4 w-40" />
          </div>
        </div>

        <div v-else-if="items.length === 0" class="list">
          <TouEmptyState
            icon="heroicons:shopping-cart"
            :title="t('shopping.empty')"
            :description="t('shopping.emptyHint')"
            class="py-10 px-6"
          />
        </div>

        <template v-else>
          <section v-for="group in groups" :key="group.key">
            <h2 class="section-header flex items-center gap-1.5">
              <TouIcon :name="group.icon" class="w-3.5 h-3.5" />
              {{ group.title }}
            </h2>
            <div class="list shopping-list">
              <shopping-item
                v-for="item in group.items"
                :key="item.id"
                :item="item"
                :is-deleting="deletingId === item.id"
                @toggle="toggleItem(item)"
                @delete="deleteItem(item.id)"
              />
            </div>
          </section>
        </template>
      </div>

      <section class="min-w-0">
        <div class="flex items-center justify-between px-4 pb-1.5">
          <h2
            class="text-ios-caption uppercase tracking-wide text-muted-foreground"
          >
            {{ t('shopping.quickAdd') }}
          </h2>
          <button
            type="button"
            class="text-ios text-accent-foreground"
            :class="showCommonItemsManager && 'font-semibold'"
            @click="showCommonItemsManager = !showCommonItemsManager"
          >
            {{ showCommonItemsManager ? t('common.done') : t('common.edit') }}
          </button>
        </div>

        <div class="list quick-add-panel p-3">
          <div v-if="isLoadingCommonItems" class="flex gap-2 flex-wrap">
            <tou-skeleton
              v-for="i in 4"
              :key="i"
              class="h-8.5 w-20 rounded-full!"
            />
          </div>

          <div v-else-if="showCommonItemsManager" class="space-y-3">
            <div class="flex gap-2">
              <input
                v-model="newCommonItemName"
                type="text"
                :placeholder="t('shopping.itemName')"
                class="field h-9! px-3! text-ios flex-1 min-w-0"
                @keydown.enter="addCommonItem"
              />
              <input
                v-model="newCommonItemQuantity"
                type="text"
                :placeholder="t('shopping.qtyPlaceholder')"
                class="field h-9! px-3! text-ios w-24!"
                @keydown.enter="addCommonItem"
              />
              <button
                type="button"
                class="btn btn--primary w-9! h-9! p-0! shrink-0"
                :disabled="!newCommonItemName.trim()"
                :aria-label="t('common.add')"
                @click="addCommonItem"
              >
                <TouIcon name="heroicons:plus-20-solid" class="w-5 h-5" />
              </button>
            </div>
            <div class="flex gap-2 flex-wrap">
              <span
                v-for="item in commonItems"
                :key="item.id"
                class="chip pr-1.5!"
              >
                {{ item.name }}
                <button
                  type="button"
                  class="grid place-items-center w-6 h-6 rounded-full bg-gray-500/20 text-gray-500 hover:bg-red-500 hover:text-white transition-colors"
                  :aria-label="`× ${item.name}`"
                  @click="deleteCommonItem(item.id)"
                >
                  <TouIcon
                    name="heroicons:x-mark-20-solid"
                    class="w-3.5 h-3.5"
                  />
                </button>
              </span>
              <p
                v-if="commonItems.length === 0"
                class="text-ios text-muted-foreground px-1"
              >
                {{ t('shopping.noSavedItems') }}
              </p>
            </div>
          </div>

          <div v-else class="flex gap-2 flex-wrap">
            <button
              v-for="item in commonItems"
              :key="item.id"
              type="button"
              class="chip"
              @click="addCommonItemToList(item)"
            >
              <TouIcon
                name="heroicons:plus-20-solid"
                class="w-4 h-4 text-accent-foreground"
              />
              {{ item.name }}
            </button>
            <p
              v-if="commonItems.length === 0"
              class="text-ios text-muted-foreground px-1"
            >
              {{ t('shopping.editToAddCommon') }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTelegram, useApiFetch, useRequireAuth } from '@/entities/user'
import { useWeekNavigation } from '@/entities/menu'
import {
  useShoppingList,
  useCommonItems,
  type CommonItem,
} from '@/entities/shopping-list'
import { ShoppingItem } from '@/widgets/shopping-item'
import { TouIcon, TouSkeleton, TouEmptyState } from '@/shared/ui'

const { t } = useI18n()
const localePath = useLocalePath()
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
const showCommonItemsManager = ref(false)
const newCommonItemName = ref('')
const newCommonItemQuantity = ref('')

useRequireAuth({
  redirectTo: localePath('/'),
  onReady: () => loadCommonItems(),
})

const groups = computed(() =>
  [
    {
      key: 'dish',
      title: t('shopping.fromMenu'),
      icon: 'heroicons:clipboard-document-list',
      items: dishItems.value,
    },
    {
      key: 'common',
      title: t('shopping.commonItems'),
      icon: 'heroicons:star',
      items: commonListItems.value,
    },
    {
      key: 'manual',
      title: t('shopping.customItems'),
      icon: 'heroicons:pencil',
      items: manualItems.value,
    },
  ].filter((group) => group.items.length > 0),
)

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

onMounted(() => {
  initialize()
})
</script>
