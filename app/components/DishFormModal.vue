<template>
  <BottomSheet
    :is-open="isOpen"
    :title="dish ? 'Edit Dish' : 'Add Dish'"
    content-class="p-4 sm:p-6 space-y-4"
    @close="closeModal"
  >
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
        class="w-full px-4 py-2.5 rounded-[12px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
      />
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
          class="flex-1 min-w-0 px-3 py-2 text-sm rounded-[10px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
          @keydown.enter="addIngredient"
        />
        <input
          v-model="newIngredientQuantity"
          type="text"
          placeholder="Qty (e.g. 500g, 1kg)"
          class="w-24 sm:w-32 px-3 py-2 text-sm rounded-[10px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
          @keydown.enter="addIngredient"
        />
        <button
          class="w-9 h-9 flex items-center justify-center rounded-[10px] glass-nested border border-gray-200/50 text-gray-700 hover:border-green-300/60 hover:bg-green-50/40 transition-all disabled:opacity-50 shrink-0"
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

    <template #footer>
      <div class="flex gap-3 p-4 sm:p-6">
        <button
          class="flex-1 px-4 py-2.5 rounded-[12px] glass-nested border border-gray-200/50 text-gray-700 font-medium hover:border-green-300/60 hover:bg-green-50/40 transition-all"
          @click="closeModal"
        >
          Cancel
        </button>
        <button
          class="flex-1 px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading || !dishName.trim()"
          @click="handleSave"
        >
          {{ isLoading ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useApiFetch } from '@/composables/useApiFetch'
import BottomSheet from '@/components/ui/BottomSheet.vue'
import type { MenuCategory, Dish, Ingredient } from '@/utils/menu'

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
  if (!props.dish) {
    error.value = 'Please save the dish first before adding ingredients'
    return
  }

  if (!newIngredientName.value.trim()) {
    return
  }

  isAddingIngredient.value = true
  error.value = ''

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
  } catch (err: unknown) {
    console.error('Error adding ingredient:', err)
    const apiError = err as { data?: { message?: string }; message?: string }
    error.value =
      apiError?.data?.message || apiError?.message || 'Failed to add ingredient'
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
      loadIngredients(dish.id)
    } else {
      dishName.value = ''
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
      cuisine: null,
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
