<template>
  <div class="space-y-10 pb-14 sm:pb-0">
    <div v-if="!isAuthenticated" class="flex justify-center">
      <div
        class="glass border border-gray-300/60 rounded-[20px] p-6 sm:p-8 max-w-md w-full"
      >
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Taste of Us
          </h2>
          <p class="text-gray-600 text-sm">
            Please open this app in Telegram to start planning your weekly menu.
          </p>
        </div>

        <div v-if="isLoading" class="text-center py-8">
          <p class="text-gray-600">Initializing Telegram Web App...</p>
        </div>

        <div
          v-else-if="authError"
          class="bg-red-50 border border-red-200 rounded-[12px] p-3"
        >
          <p class="text-sm text-red-800">{{ authError }}</p>
        </div>
      </div>
    </div>

    <menu-planner v-else @open-profile="handleOpenProfile" />
    <profile-settings-modal
      :is-open="isProfileModalOpen"
      @close="closeProfileModal"
      @save="handleSaveProfileSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTelegram, useRequireAuth } from '@/entities/user'
import { MenuPlanner } from '@/widgets/menu-planner'
import { ProfileSettingsModal } from '@/features/profile/settings'

definePageMeta({
  layout: 'default',
})

const { isAuthenticated, isLoading, hapticFeedback } = useTelegram()
const authError = ref('')
const isProfileModalOpen = ref(false)

useRequireAuth({
  onFailure: (message) => {
    authError.value = message
  },
  onReady: ({ didAuthenticate }) => {
    if (didAuthenticate) {
      hapticFeedback.success()
    }
  },
})

function handleOpenProfile() {
  isProfileModalOpen.value = true
  hapticFeedback.light()
}

function closeProfileModal() {
  isProfileModalOpen.value = false
}

function handleSaveProfileSettings() {
  closeProfileModal()
  hapticFeedback.success()
}
</script>
