<template>
  <div class="space-y-10 pb-14 sm:pb-0">
    <div v-if="!isAuthenticated" class="flex justify-center">
      <div class="glass border border-gray-300/60 rounded-[20px] p-6 sm:p-8 max-w-md w-full">
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
import { ref, onMounted } from 'vue'
import { useTelegram } from '@/composables/useTelegram'
import MenuPlanner from '../components/MenuPlanner.vue'
import ProfileSettingsModal from '../components/ProfileSettingsModal.vue'

definePageMeta({
  layout: 'default',
})

// OLD SUPABASE AUTH - COMMENTED OUT FOR TELEGRAM WEB APP MIGRATION
/*
const { isAuthenticated, loadSession, login, signup } = useAuth()
const isEmailConfirmationModalOpen = ref(false)
const isLogin = ref(true)
const email = ref('')
const password = ref('')
const authError = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    authError.value = 'Please fill in all fields'
    return
  }

  isLoading.value = true
  authError.value = ''

  try {
    const result = isLogin.value
      ? await login(email.value, password.value)
      : await signup(email.value, password.value)

    if (result.success) {
      if (isLogin.value) {
        loadSession()
        email.value = ''
        password.value = ''
      } else {
        confirmationEmail.value = email.value
        isEmailConfirmationModalOpen.value = true
        email.value = ''
        password.value = ''
      }
    } else {
      authError.value = result.error || 'An error occurred'
    }
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    authError.value = apiError?.message || 'An error occurred'
  } finally {
    isLoading.value = false
  }
}

const closeEmailConfirmationModal = () => {
  isEmailConfirmationModalOpen.value = false
  confirmationEmail.value = ''
}
*/

// NEW TELEGRAM AUTH
const { isAuthenticated, isLoading, authenticate, hapticFeedback } =
  useTelegram()
const authError = ref('')
const isProfileModalOpen = ref(false)

onMounted(async () => {
  if (!isAuthenticated.value && !isLoading.value) {
    try {
      const result = await authenticate()
      if (!result.success) {
        authError.value = result.error || 'Failed to authenticate with Telegram'
      } else {
        hapticFeedback.success()
      }
    } catch (error) {
      authError.value =
        'Failed to authenticate. Please open this app in Telegram.'
      console.error('Authentication error:', error)
    }
  }
})

const handleOpenProfile = () => {
  isProfileModalOpen.value = true
  hapticFeedback.light()
}

const closeProfileModal = () => {
  isProfileModalOpen.value = false
}

const handleSaveProfileSettings = () => {
  closeProfileModal()
  hapticFeedback.success()
}
</script>
