<template>
  <tou-card class="overflow-hidden h-full flex flex-col">
    <tou-card-content class="flex-1 flex flex-col">
      <div class="flex items-start justify-between mb-4">
        <div class="space-y-2 flex-1">
          <p
            class="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-500"
          >
            Overview
          </p>
          <h3 class="text-xl sm:text-2xl font-bold text-gray-900">
            Plan the week together
          </h3>
          <p class="text-xs sm:text-sm text-gray-600">
            Choose what your partner can cook. Skip any meal if you want a
            lighter day.
          </p>
        </div>
        <button
          class="flex items-center justify-center w-10 h-10 rounded-lg glass border-2 border-white/30 hover:border-pink-300/50 hover:bg-pink-50/20 transition-all flex-shrink-0"
          title="Profile Settings"
          @click="openProfileModal"
        >
          <Icon name="heroicons:user-circle" class="w-6 h-6 text-gray-700" />
        </button>
      </div>
      <div class="mt-4 sm:mt-6 flex items-center justify-around gap-2 sm:gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ filledSlots }}</div>
          <div class="text-xs font-semibold text-gray-500">Selected</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ totalSlots }}</div>
          <div class="text-xs font-semibold text-gray-500">Total slots</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ completion }}%</div>
          <div class="text-xs font-semibold text-gray-500">Completion</div>
        </div>
      </div>
      <div class="mt-4 sm:mt-6">
        <div class="h-2 rounded-full bg-white/40 overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 transition-all duration-500"
            :style="{ width: `${completion}%` }"
          />
        </div>
        <div class="mt-2 text-xs text-gray-600 text-center">
          {{ filledSlots }} of {{ totalSlots }} meal slots selected
        </div>
      </div>
    </tou-card-content>
  </tou-card>

  <ProfileSettingsModal
    :is-open="isProfileModalOpen"
    @close="closeProfileModal"
    @save="handleSaveSettings"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import TouCard from '@/components/ui/TouCard/TouCard.vue'
import TouCardContent from '@/components/ui/TouCard/TouCardContent.vue'
import ProfileSettingsModal from '@/components/ProfileSettingsModal.vue'
import { useAuth } from '@/composables/useAuth'

interface Props {
  filledSlots: number
  totalSlots: number
  completion: number
}

defineProps<Props>()

const { isAuthenticated, getAuthHeaders } = useAuth()
const isProfileModalOpen = ref(false)
const telegramId = ref<string>('')
const isLoading = ref(false)

const loadTelegramId = async () => {
  if (!isAuthenticated.value) {
    telegramId.value = ''
    return
  }

  isLoading.value = true

  try {
    const headers = getAuthHeaders()
    const response = await $fetch<{ telegram_chat_id: string | null }>(
      '/api/user/settings',
      {
        headers,
      },
    )

    telegramId.value = response.telegram_chat_id || ''
  } catch (err: any) {
    console.error('Error loading Telegram ID:', err)
    telegramId.value = ''
  } finally {
    isLoading.value = false
  }
}

const saveTelegramId = async (id: string) => {
  if (!isAuthenticated.value) {
    console.warn('Cannot save Telegram ID: user not authenticated')
    return
  }

  isLoading.value = true

  try {
    const headers = getAuthHeaders()
    await $fetch('/api/user/settings', {
      method: 'POST',
      headers,
      body: {
        telegram_chat_id: id || null,
      },
    })

    telegramId.value = id
  } catch (err: any) {
    console.error('Error saving Telegram ID:', err)
    throw err
  } finally {
    isLoading.value = false
  }
}

const openProfileModal = () => {
  isProfileModalOpen.value = true
}

const closeProfileModal = () => {
  isProfileModalOpen.value = false
}

const handleSaveSettings = async (id: string) => {
  try {
    await saveTelegramId(id)
  } catch (err) {
    console.error('Failed to save Telegram ID:', err)
  }
}

watch(isAuthenticated, (newValue) => {
  if (newValue) {
    loadTelegramId()
  } else {
    telegramId.value = ''
  }
})

onMounted(() => {
  if (isAuthenticated.value) {
    loadTelegramId()
  }
})
</script>
