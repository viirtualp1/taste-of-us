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
            class="relative z-50 glass rounded-[20px] shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div
              class="flex items-center justify-between p-4 sm:p-6 border-b border-white/20"
            >
              <h2 class="text-xl font-bold text-gray-900">
                {{ editingDish ? 'Edit Dish' : 'Add Dish' }}
              </h2>
              <button
                class="flex items-center rounded-[12px] p-2 hover:bg-white/20 transition-colors"
                @click="closeModal"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div class="p-4 sm:p-6 space-y-4">
              <div
                v-if="error"
                class="bg-red-50 border border-red-200 rounded-[12px] p-3"
              >
                <p class="text-sm text-red-800">{{ error }}</p>
              </div>

              <div>
                <label
                  for="dish-name"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Dish Name
                </label>
                <input
                  id="dish-name"
                  v-model="dishName"
                  type="text"
                  placeholder="Enter dish name"
                  class="w-full px-4 py-2.5 rounded-[12px] border glass-nested focus:border-pink-400/60 focus:outline-none focus:ring-2 focus:ring-pink-200/50 transition-all"
                />
              </div>

              <div>
                <label
                  for="dish-cuisine"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Cuisine (Optional)
                </label>
                <select
                  id="dish-cuisine"
                  v-model="dishCuisine"
                  class="w-full px-4 py-2.5 rounded-[12px] border glass-nested focus:border-pink-400/60 focus:outline-none focus:ring-2 focus:ring-pink-200/50 transition-all"
                >
                  <option value="">None</option>
                  <option value="asian">Asian</option>
                  <option value="european">European</option>
                  <option value="slavic">Slavic</option>
                </select>
              </div>

              <div class="flex gap-3 pt-2">
                <button
                  class="flex-1 px-4 py-2.5 rounded-[12px] glass-nested text-gray-700 font-medium hover:bg-white/50 transition-colors"
                  @click="closeModal"
                >
                  Cancel
                </button>
                <button
                  class="flex-1 px-4 py-2.5 rounded-full glass text-gray-900 font-medium transition-opacity hover:opacity-70 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="isLoading || !dishName.trim()"
                  @click="handleSave"
                >
                  {{ isLoading ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import type { MenuCategory, Dish, CuisineType } from '@/utils/menu'

interface Props {
  isOpen: boolean
  dish: Dish | null
  category: MenuCategory
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: []
}>()

const { getAuthHeaders } = useAuth()
const dishName = ref('')
const dishCuisine = ref<CuisineType | ''>('')
const error = ref('')
const isLoading = ref(false)

watch(
  () => props.dish,
  (dish) => {
    if (dish) {
      dishName.value = dish.name
      dishCuisine.value = dish.cuisine || ''
    } else {
      dishName.value = ''
      dishCuisine.value = ''
    }
    error.value = ''
  },
  { immediate: true },
)

watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      dishName.value = ''
      dishCuisine.value = ''
      error.value = ''
    }
  },
)

const handleSave = async () => {
  if (!dishName.value.trim()) {
    error.value = 'Dish name is required'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const headers = getAuthHeaders()
    const payload = {
      name: dishName.value.trim(),
      category: props.category,
      cuisine: dishCuisine.value || null,
    }

    if (props.dish) {
      await $fetch(`/api/user/dishes/${props.dish.id}`, {
        method: 'PUT',
        headers,
        body: payload,
      })
    } else {
      await $fetch('/api/user/dishes', {
        method: 'POST',
        headers,
        body: payload,
      })
    }

    emit('save')
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Failed to save dish'
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  emit('close')
}
</script>
