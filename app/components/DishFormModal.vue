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
            class="relative z-50 glass rounded-[20px] shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div
              class="flex items-center justify-between p-4 sm:p-6 border-b border-white/20 shrink-0"
            >
              <h2 class="text-xl font-bold text-gray-900">
                {{ dish ? 'Edit Dish' : 'Add Dish' }}
              </h2>
              <button
                class="flex items-center rounded-[12px] p-2 hover:bg-white/20 transition-colors"
                @click="closeModal"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div class="p-4 sm:p-6 space-y-4 overflow-y-auto">
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

              <div v-if="dish" class="pt-2">
                <div class="flex items-center justify-between mb-3">
                  <label class="block text-sm font-medium text-gray-700">
                    Ingredients
                  </label>
                  <span class="text-xs text-gray-500">
                    {{ ingredients.length }} item{{
                      ingredients.length !== 1 ? 's' : ''
                    }}
                  </span>
                </div>

                <div v-if="isLoadingIngredients" class="space-y-2">
                  <div
                    v-for="i in 2"
                    :key="i"
                    class="h-10 glass-nested rounded-[10px] animate-pulse"
                  />
                </div>

                <div v-else class="space-y-2">
                  <div
                    v-for="ingredient in ingredients"
                    :key="ingredient.id"
                    class="flex items-center gap-2 p-2.5 glass-nested rounded-[10px]"
                  >
                    <span class="flex-1 text-sm text-gray-800 truncate">
                      {{ ingredient.name }}
                      <span v-if="ingredient.quantity" class="text-gray-500">
                        ({{ ingredient.quantity }})
                      </span>
                    </span>
                    <button
                      class="p-1.5 rounded-[6px] hover:bg-red-50/50 transition-colors"
                      :disabled="isDeletingIngredient === ingredient.id"
                      @click="deleteIngredient(ingredient.id)"
                    >
                      <Icon
                        v-if="isDeletingIngredient === ingredient.id"
                        name="heroicons:arrow-path"
                        class="w-4 h-4 text-gray-400 animate-spin"
                      />
                      <Icon
                        v-else
                        name="heroicons:x-mark"
                        class="w-4 h-4 text-red-500"
                      />
                    </button>
                  </div>

                  <div
                    v-if="ingredients.length === 0"
                    class="text-center py-3 text-sm text-gray-500"
                  >
                    No ingredients yet
                  </div>
                </div>

                <div class="flex gap-2 mt-3">
                  <input
                    v-model="newIngredientName"
                    type="text"
                    placeholder="Ingredient name"
                    class="flex-1 px-3 py-2 text-sm rounded-[10px] border glass-nested focus:border-pink-400/60 focus:outline-none focus:ring-2 focus:ring-pink-200/50 transition-all"
                    @keydown.enter="addIngredient"
                  />
                  <input
                    v-model="newIngredientQuantity"
                    type="number"
                    inputmode="numeric"
                    min="0"
                    placeholder="Qty"
                    class="w-20 px-3 py-2 text-sm rounded-[10px] border glass-nested focus:border-pink-400/60 focus:outline-none focus:ring-2 focus:ring-pink-200/50 transition-all"
                    @keydown.enter="addIngredient"
                  />
                  <button
                    class="px-3 py-2 rounded-[10px] glass-nested text-gray-700 font-medium hover:bg-white/50 transition-colors disabled:opacity-50"
                    :disabled="!newIngredientName.trim() || isAddingIngredient"
                    @click="addIngredient"
                  >
                    <Icon
                      v-if="isAddingIngredient"
                      name="heroicons:arrow-path"
                      class="w-4 h-4 animate-spin"
                    />
                    <Icon v-else name="heroicons:plus" class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p v-else class="text-xs text-gray-500 italic">
                Save the dish first to add ingredients
              </p>

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
import { useApiFetch } from '@/composables/useApiFetch'
import type { MenuCategory, Dish, CuisineType, Ingredient } from '@/utils/menu'

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

const { apiFetch } = useApiFetch()
const dishName = ref('')
const dishCuisine = ref<CuisineType | ''>('')
const error = ref('')
const isLoading = ref(false)

const ingredients = ref<Ingredient[]>([])
const isLoadingIngredients = ref(false)
const newIngredientName = ref('')
const newIngredientQuantity = ref('')
const isAddingIngredient = ref(false)
const isDeletingIngredient = ref<string | null>(null)

const loadIngredients = async (dishId: string) => {
  isLoadingIngredients.value = true
  try {
    const data = await apiFetch<Ingredient[]>(
      `/api/user/dishes/${dishId}/ingredients`,
    )
    ingredients.value = data || []
  } catch (err) {
    console.error('Error loading ingredients:', err)
    ingredients.value = []
  } finally {
    isLoadingIngredients.value = false
  }
}

const addIngredient = async () => {
  if (!props.dish || !newIngredientName.value.trim()) return

  isAddingIngredient.value = true
  try {
    await apiFetch(`/api/user/dishes/${props.dish.id}/ingredients`, {
      method: 'POST',
      body: {
        name: newIngredientName.value.trim(),
        quantity: newIngredientQuantity.value.trim() || null,
      },
    })
    newIngredientName.value = ''
    newIngredientQuantity.value = ''
    await loadIngredients(props.dish.id)
  } catch (err) {
    console.error('Error adding ingredient:', err)
  } finally {
    isAddingIngredient.value = false
  }
}

const deleteIngredient = async (ingredientId: string) => {
  isDeletingIngredient.value = ingredientId
  try {
    await apiFetch(`/api/user/ingredients/${ingredientId}`, {
      method: 'DELETE',
    })
    ingredients.value = ingredients.value.filter((i) => i.id !== ingredientId)
  } catch (err) {
    console.error('Error deleting ingredient:', err)
  } finally {
    isDeletingIngredient.value = null
  }
}

watch(
  () => props.dish,
  (dish) => {
    if (dish) {
      dishName.value = dish.name
      dishCuisine.value = dish.cuisine || ''
      loadIngredients(dish.id)
    } else {
      dishName.value = ''
      dishCuisine.value = ''
      ingredients.value = []
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
      ingredients.value = []
      newIngredientName.value = ''
      newIngredientQuantity.value = ''
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
    const payload = {
      name: dishName.value.trim(),
      category: props.category,
      cuisine: dishCuisine.value || null,
    }

    if (props.dish) {
      await apiFetch(`/api/user/dishes/${props.dish.id}`, {
        method: 'PUT',
        body: payload,
      })
    } else {
      await apiFetch('/api/user/dishes', {
        method: 'POST',
        body: payload,
      })
    }

    emit('save')
  } catch (err: unknown) {
    const apiError = err as { data?: { message?: string }; message?: string }
    error.value =
      apiError?.data?.message || apiError?.message || 'Failed to save dish'
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  emit('close')
}
</script>
