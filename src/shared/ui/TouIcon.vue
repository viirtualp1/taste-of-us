<template>
  <span
    class="tou-icon"
    :class="{ 'has-material-symbol': symbol }"
    aria-hidden="true"
  >
    <Icon :name="props.name" class="glass-icon" />
    <span v-if="symbol" class="material-symbol">{{ symbol }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
}>()

const symbols: Record<string, string> = {
  'arrow-down-tray': 'download',
  'arrow-path': 'refresh',
  'arrow-up-20-solid': 'arrow_upward',
  'book-open': 'menu_book',
  'cake-solid': 'cake',
  'calendar-days': 'calendar_month',
  'check-20-solid': 'check',
  'chevron-down-20-solid': 'expand_more',
  'chevron-left-20-solid': 'chevron_left',
  'chevron-right-20-solid': 'chevron_right',
  'clipboard-document-list': 'assignment',
  'document-arrow-up': 'upload_file',
  'exclamation-triangle': 'warning',
  'exclamation-triangle-20-solid': 'warning',
  'fire-solid': 'local_fire_department',
  'heart-solid': 'favorite',
  'information-circle': 'info',
  'magnifying-glass-20-solid': 'search',
  'moon-solid': 'dark_mode',
  'paper-airplane': 'send',
  pencil: 'edit',
  'pencil-square': 'edit_square',
  plus: 'add',
  'plus-20-solid': 'add',
  'plus-circle-solid': 'add_circle',
  'shopping-cart': 'shopping_cart',
  'sparkles-solid': 'auto_awesome',
  star: 'star',
  'sun-solid': 'light_mode',
  trash: 'delete',
  'user-circle': 'account_circle',
  'x-mark': 'close',
  'x-mark-20-solid': 'close',
}

const symbol = computed(() => symbols[props.name.replace(/^heroicons:/, '')])
</script>

<style scoped>
@layer components {
  .tou-icon {
    display: inline-grid;
    grid-template: 100% / 100%;
    flex: none;
    place-items: center;
    vertical-align: middle;
    line-height: 1;
    width: 1em;
    height: 1em;
  }
}

.glass-icon {
  width: 100%;
  height: 100%;
}

.material-symbol {
  display: none;
}
</style>
