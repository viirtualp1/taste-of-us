<template>
  <div class="relative">
    <select
      :class="
        cn(
          'glass flex h-12 w-full rounded-[12px] border border-border px-4 py-3 text-sm font-medium text-foreground ring-offset-background transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:border-green-400 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[var(--surface-hover)] hover:border-green-400/40',
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
