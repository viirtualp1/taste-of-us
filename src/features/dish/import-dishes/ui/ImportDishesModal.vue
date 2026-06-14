<template>
  <BottomSheet
    :is-open="isOpen"
    :title="t('dishes.importTitle')"
    content-class="p-4 sm:p-6 space-y-6"
    desktop-max-width="max-w-2xl"
    @close="closeModal"
  >
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
          ? 'border-green-400 bg-green-50/30'
          : 'border-gray-300 glass-nested hover:border-green-300'
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
            {{ t('dishes.dropJson') }}
          </p>
          <p class="text-xs text-gray-500">{{ t('dishes.or') }}</p>
        </div>

        <button
          class="px-4 py-2 rounded-full glass text-gray-900 font-medium transition-opacity hover:opacity-70 active:scale-95"
          @click="fileInputRef?.click()"
        >
          {{ t('dishes.browseFiles') }}
        </button>

        <p v-if="selectedFile" class="text-sm text-green-600 font-medium">
          {{ t('dishes.selectedFile', { name: selectedFile.name }) }}
        </p>
        <p v-else class="text-xs text-gray-400">
          {{ t('dishes.supportedFormat') }}
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
            {{ t('dishes.jsonFormatExample') }}
          </h3>
          <pre
            class="text-xs bg-white/50 rounded-[8px] p-3 overflow-x-auto"
          ><code>{{ jsonExample }}</code></pre>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center gap-3 p-4 sm:p-6">
        <button
          class="flex-1 px-4 py-2.5 rounded-[12px] glass-nested border border-gray-200/50 text-gray-700 font-medium hover:border-green-300/60 hover:bg-green-50/40 transition-all"
          @click="closeModal"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          class="flex-1 px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading || !selectedFile"
          @click="handleImport"
        >
          {{ isLoading ? t('common.importing') : t('common.import') }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useApiFetch } from '@/entities/user'
import { BottomSheet } from '@/shared/ui'
import { getApiErrorMessage } from '@/shared/lib/utils/apiError'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  imported: []
}>()

const { t } = useI18n()
const { apiFetch } = useApiFetch()
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
      },
      {
        name: 'Shawarma',
        category: 'dinner',
      },
      {
        name: 'Chocolate Brownie',
        category: 'dessert',
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

    if (!file) return

    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      selectedFile.value = file
      error.value = ''
    } else {
      error.value = t('dishes.selectJsonFile')
    }
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    const file = files[0]

    if (!file) return

    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      selectedFile.value = file
      error.value = ''
    } else {
      error.value = t('dishes.selectJsonFile')
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
      throw new Error(t('dishes.jsonMustBeArray'))
    }

    const validCategories = ['brunch', 'dinner', 'dessert'] as const

    for (const dish of dishes) {
      if (!dish.name || !dish.category) {
        throw new Error(
          t('dishes.invalidDish', { dish: JSON.stringify(dish) }),
        )
      }

      if (!validCategories.includes(dish.category)) {
        throw new Error(
          t('dishes.invalidCategory', { category: dish.category }),
        )
      }
    }

    await Promise.all(
      dishes.map((dish) =>
        apiFetch('/api/user/dishes', {
          method: 'POST',
          body: {
            name: dish.name.trim(),
            category: dish.category,
            cuisine: null,
          },
        }),
      ),
    )

    emit('imported')
    closeModal()
  } catch (err: unknown) {
    error.value = getApiErrorMessage(err, t('dishes.importFailed'))
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
