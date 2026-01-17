<template>
  <div class="relative">
    <select
      :class="cn('glass flex h-12 w-full rounded-xl border border-white/30 bg-white/20 px-4 py-3 text-sm font-medium text-gray-800 ring-offset-background transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:border-purple-400 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white/30 hover:border-white/40', props.class)"
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      v-bind="$attrs"
    >
      <slot />
    </select>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
</script>
