<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
        @keydown.esc="closeModal"
      >
        <div class="fixed inset-0 bg-black/50" @click="closeModal" />
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="relative z-50 glass rounded-[20px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div
              class="flex items-center justify-between p-4 sm:p-6 border-b border-white/20 flex-shrink-0"
            >
              <h2 class="text-xl font-bold text-gray-900">Import Dishes from JSON</h2>
              <button
                class="flex items-center rounded-[12px] p-2 hover:bg-white/20 transition-colors"
                @click="closeModal"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <div
                v-if="error"
                class="bg-red-50 border border-red-200 rounded-[12px] p-3"
              >
                <p class="text-sm text-red-800">{{ error }}</p>
              </div>

              <div
                ref="dropZoneRef"
                class="relative border-2 border-dashed rounded-[16px] p-8 text-center transition-all"
                :class="
                  isDragging
                    ? 'border-pink-400 bg-pink-50/30'
                    : 'border-gray-300 glass-nested hover:border-pink-300'
                "
                @drop="handleDrop"
                @dragover.prevent="isDragging = true"
                @dragleave="isDragging = false"
                @dragenter.prevent
              >
                <input
                  ref="fileInputRef"
                  type="file"
                  accept=".json,application/json"
                  class="hidden"
                  @change="handleFileSelect"
                />

                <div class="space-y-4">
                  <div class="flex justify-center">
                    <div
                      class="w-16 h-16 rounded-full glass flex items-center justify-center"
                    >
                      <Icon
                        name="heroicons:document-arrow-up"
                        class="w-8 h-8 text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <p class="text-sm font-medium text-gray-900 mb-1">
                      Drop your JSON file here
                    </p>
                    <p class="text-xs text-gray-500">or</p>
                  </div>

                  <button
                    class="px-4 py-2 rounded-full glass text-gray-900 font-medium transition-opacity hover:opacity-70 active:scale-95"
                    @click="fileInputRef?.click()"
                  >
                    Browse Files
                  </button>

                  <p class="text-xs text-gray-400">
                    Supported format: JSON file
                  </p>
                </div>
              </div>

              <div class="glass-nested rounded-[12px] p-4">
                <div class="flex items-start gap-3 mb-3">
                  <Icon
                    name="heroicons:information-circle"
                    class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  />
                  <div class="flex-1">
                    <h3 class="text-sm font-semibold text-blue-900 mb-2">
                      JSON Format Example
                    </h3>
                    <pre
                      class="text-xs bg-white/50 rounded-[8px] p-3 overflow-x-auto"
                    ><code>{{ jsonExample }}</code></pre>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="flex items-center gap-3 p-4 sm:p-6 border-t border-white/20 flex-shrink-0"
            >
              <button
                class="flex-1 px-4 py-2.5 rounded-[12px] glass-nested text-gray-700 font-medium hover:bg-white/50 transition-colors"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                class="flex-1 px-4 py-2.5 rounded-full glass text-gray-900 font-medium transition-opacity hover:opacity-70 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isLoading || !selectedFile"
                @click="handleImport"
              >
                {{ isLoading ? 'Importing...' : 'Import' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import type { MenuCategory } from '@/utils/menu'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  imported: []
}>()

const { getAuthHeaders } = useAuth()
const dropZoneRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const error = ref('')
const isLoading = ref(false)

const jsonExample = computed(() => {
  return JSON.stringify(
    [
      {
        name: 'Eggs Benedict',
        category: 'brunch',
        cuisine: 'european',
      },
      {
        name: 'Shawarma',
        category: 'dinner',
        cuisine: 'asian',
      },
      {
        name: 'Chocolate Brownie',
        category: 'dessert',
        cuisine: 'european',
      },
    ],
    null,
    2,
  )
})

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      selectedFile.value = file
      error.value = ''
    } else {
      error.value = 'Please select a JSON file'
    }
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      selectedFile.value = file
      error.value = ''
    } else {
      error.value = 'Please select a JSON file'
    }
  }
}

const handleImport = async () => {
  if (!selectedFile.value) return

  isLoading.value = true
  error.value = ''

  try {
    const text = await selectedFile.value.text()
    const dishes = JSON.parse(text)

    if (!Array.isArray(dishes)) {
      throw new Error('JSON must be an array of dishes')
    }

    const headers = getAuthHeaders()

    for (const dish of dishes) {
      if (!dish.name || !dish.category) {
        throw new Error(
          `Invalid dish: name and category are required. Found: ${JSON.stringify(dish)}`,
        )
      }

      if (!['brunch', 'dinner', 'dessert'].includes(dish.category)) {
        throw new Error(
          `Invalid category: ${dish.category}. Must be brunch, dinner, or dessert`,
        )
      }

      if (dish.cuisine && !['asian', 'european', 'slavic'].includes(dish.cuisine)) {
        throw new Error(
          `Invalid cuisine: ${dish.cuisine}. Must be asian, european, or slavic`,
        )
      }

      await $fetch('/api/user/dishes', {
        method: 'POST',
        headers,
        body: {
          name: dish.name.trim(),
          category: dish.category,
          cuisine: dish.cuisine || null,
        },
      })
    }

    emit('imported')
    closeModal()
  } catch (err: any) {
    error.value =
      err?.data?.message || err?.message || 'Failed to import dishes. Please check the JSON format.'
    console.error('Import error:', err)
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  selectedFile.value = null
  error.value = ''
  isDragging.value = false
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  emit('close')
}
</script>
