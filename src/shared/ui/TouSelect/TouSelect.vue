<template>
  <div class="relative">
    <select
      :class="
        cn(
          'glass flex h-12 w-full rounded-[12px] border border-white/40 px-4 py-3 text-sm font-medium text-gray-800 ring-offset-background transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:border-green-400 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white/30 hover:border-white/50',
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

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
</script>
