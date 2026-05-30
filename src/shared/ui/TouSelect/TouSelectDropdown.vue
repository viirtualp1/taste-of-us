<template>
  <div ref="dropdownRef" class="relative" style="z-index: 9999">
    <button
      type="button"
      :class="
        cn(
          'glass flex h-12 w-full items-center justify-between rounded-[12px] border border-white/40 px-4 py-3 text-sm font-medium text-gray-800 transition-all duration-300 hover:bg-white/30 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          isOpen && 'ring-2 ring-green-400 border-green-300',
          props.class,
        )
      "
      :disabled="disabled"
      @click="toggleDropdown"
    >
      <span :class="modelValue ? 'text-gray-900' : 'text-gray-500'">
        {{ displayValue || placeholder }}
      </span>
      <svg
        class="h-5 w-5 text-gray-600 transition-transform duration-300"
        :class="isOpen && 'rotate-180'"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-2"
      >
        <div
          v-if="isOpen"
          ref="dropdownMenuRef"
          class="glass fixed rounded-[16px] border border-white/40 shadow-2xl max-h-64 overflow-hidden"
          :style="{
            zIndex: 99999,
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }"
        >
          <div class="max-h-64 overflow-y-auto scrollbar-hide">
            <button
              v-for="option in options"
              :key="option.value"
              type="button"
              :class="
                cn(
                  'w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-white/30 border-b border-white/10 last:border-b-0',
                  modelValue === option.value &&
                    'bg-green-100/50 text-green-700 font-semibold',
                )
              "
              @click="selectOption(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  options?: Option[]
  placeholder?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  placeholder: 'Select an option',
  disabled: false,
  class: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownMenuRef = ref<HTMLElement | null>(null)
const dropdownPosition = ref({ top: 0, left: 0, width: 0 })

const displayValue = computed(() => {
  const selected = props.options.find((opt) => opt.value === props.modelValue)
  return selected?.label || ''
})

const toggleDropdown = () => {
  if (!props.disabled) {
    if (!isOpen.value && dropdownRef.value) {
      const rect = dropdownRef.value.getBoundingClientRect()
      dropdownPosition.value = {
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      }
    }
    isOpen.value = !isOpen.value
  }
}

const selectOption = (value: string) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(target) &&
    dropdownMenuRef.value &&
    !dropdownMenuRef.value.contains(target)
  ) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
</script>
