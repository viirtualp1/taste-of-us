<template>
  <div
    class="flex items-center gap-3 p-3 glass-nested border border-gray-200/50 rounded-[12px] hover:border-green-300/60 hover:bg-green-50/40 transition-all"
    :class="item.is_checked && 'opacity-60'"
  >
    <button
      class="shrink-0 w-6 h-6 rounded-[8px] border-2 flex items-center justify-center transition-all"
      :class="
        item.is_checked
          ? 'bg-green-500 border-green-500'
          : 'border-gray-300 hover:border-green-400'
      "
      @click="$emit('toggle')"
    >
      <Icon
        v-if="item.is_checked"
        name="heroicons:check"
        class="w-4 h-4 text-white"
      />
    </button>

    <div class="flex-1 min-w-0">
      <span
        class="text-sm font-medium text-gray-900 truncate block"
        :class="item.is_checked && 'line-through text-gray-500'"
      >
        {{ item.name }}
      </span>
      <span
        v-if="item.quantity || item.source_dish_name"
        class="text-xs text-gray-500 truncate block"
      >
        <template v-if="item.quantity">{{ item.quantity }}</template>
        <template v-if="item.quantity && item.source_dish_name"> · </template>
        <template v-if="item.source_dish_name">{{
          item.source_dish_name
        }}</template>
      </span>
    </div>

    <button
      class="shrink-0 p-1.5 rounded-[8px] hover:bg-red-50/50 transition-colors"
      @click="$emit('delete')"
    >
      <Icon name="heroicons:x-mark" class="w-4 h-4 text-red-500" />
    </button>
  </div>
</template>

<script setup lang="ts">
interface ShoppingListItem {
  id: string
  name: string
  quantity: string | null
  is_checked: boolean
  source_type: 'dish' | 'manual' | 'common'
  source_dish_id: string | null
  source_dish_name?: string | null
}

interface Props {
  item: ShoppingListItem
}

defineProps<Props>()

defineEmits<{
  toggle: []
  delete: []
}>()
</script>
