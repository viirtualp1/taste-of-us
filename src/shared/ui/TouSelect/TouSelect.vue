<template>
  <div class="relative">
    <select
      :class="
        cn(
          'field font-medium disabled:cursor-not-allowed disabled:opacity-50',
          props.class,
        )
      "
      :value="modelValue"
      v-bind="$attrs"
      @change="
        $emit('update:modelValue', ($event.target as HTMLSelectElement).value)
      "
    >
      <slot />
    </select>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/shared/lib/utils'

interface Props {
  modelValue?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  class: '',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
