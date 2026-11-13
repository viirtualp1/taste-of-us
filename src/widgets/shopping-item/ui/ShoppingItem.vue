<script setup lang="ts">
import { TouIcon } from '@/shared/ui'
import type { ShoppingListItem } from '@/entities/shopping-list'

interface Props {
  item: ShoppingListItem
  isDeleting?: boolean
}

withDefaults(defineProps<Props>(), {
  isDeleting: false,
})

const emit = defineEmits<{
  toggle: []
  delete: []
}>()

function handleItemClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.closest('button')) return
  emit('toggle')
}
</script>

<template>
  <!-- A row of an inset grouped list (Reminders-style round checkbox). -->
  <div
    class="list-row cursor-pointer select-none py-2.5! pr-2!"
    role="checkbox"
    :aria-checked="item.is_checked"
    tabindex="0"
    @click="handleItemClick"
    @keydown.space.self.prevent="$emit('toggle')"
  >
    <span
      class="shopping-check shrink-0 grid place-items-center size-5.5 rounded-full transition-colors"
      :class="
        item.is_checked
          ? 'bg-green-500 text-white'
          : 'shadow-[inset_0_0_0_1.5px_rgb(var(--gray-300))]'
      "
    >
      <TouIcon
        v-if="item.is_checked"
        name="heroicons:check-20-solid"
        class="w-4 h-4"
      />
    </span>

    <div class="flex-1 min-w-0">
      <span
        class="block text-ios-body leading-snug truncate transition-colors"
        :class="item.is_checked && 'text-muted-foreground line-through'"
      >
        {{ item.name }}
      </span>
      <span
        v-if="item.quantity || item.source_dish_name"
        class="block text-ios-caption text-muted-foreground truncate"
      >
        <template v-if="item.quantity">{{ item.quantity }}</template>
        <template v-if="item.quantity && item.source_dish_name"> · </template>
        <template v-if="item.source_dish_name">{{
          item.source_dish_name
        }}</template>
      </span>
    </div>

    <button
      type="button"
      class="icon-btn shrink-0 grid place-items-center w-9 h-9 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
      :disabled="isDeleting"
      aria-label="Delete"
      @click.stop="$emit('delete')"
    >
      <TouIcon
        v-if="isDeleting"
        name="heroicons:arrow-path"
        class="w-4 h-4 animate-spin"
      />
      <TouIcon v-else name="heroicons:x-mark-20-solid" class="size-4.5" />
    </button>
  </div>
</template>
