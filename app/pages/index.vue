<template>
  <div class="space-y-10 pb-14 sm:pb-0">
    <div v-if="!isAuthenticated" class="flex justify-center">
      <div class="glass rounded-[20px] p-6 sm:p-8 max-w-md w-full">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Taste of Us
          </h2>
          <p class="text-gray-600 text-sm">
            Please log in or sign up to start planning your weekly menu.
          </p>
        </div>

        <div class="space-y-6">
          <div class="relative">
            <div class="flex gap-2 glass-nested rounded-[16px] p-1 relative">
              <div
                class="absolute top-1 bottom-1 rounded-[12px] bg-white shadow-sm transition-all duration-300 ease-out"
                :style="{
                  left: isLogin ? '0.25rem' : '50%',
                  width: 'calc(50% - 0.25rem)',
                }"
              />
              <button
                class="flex-1 relative z-10 px-4 py-2.5 rounded-[12px] text-sm font-medium transition-colors duration-300"
                :class="
                  isLogin
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                "
                @click="
                  () => {
                    isLogin = true
                    authError = ''
                  }
                "
              >
                Login
              </button>
              <button
                class="flex-1 relative z-10 px-4 py-2.5 rounded-[12px] text-sm font-medium transition-colors duration-300"
                :class="
                  !isLogin
                    ? 'text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                "
                @click="
                  () => {
                    isLogin = false
                    authError = ''
                  }
                "
              >
                Sign up
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-if="authError"
              class="bg-red-50 border border-red-200 rounded-[12px] p-3"
            >
              <p class="text-sm text-red-800">{{ authError }}</p>
            </div>

            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="w-full px-4 py-2.5 rounded-[12px] border glass-nested focus:border-pink-400/60 focus:outline-none focus:ring-2 focus:ring-pink-200/50 transition-all"
                @keyup.enter="handleSubmit"
              />
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-2.5 rounded-[12px] border glass-nested focus:border-pink-400/60 focus:outline-none focus:ring-2 focus:ring-pink-200/50 transition-all"
                @keyup.enter="handleSubmit"
              />
            </div>

            <button
              class="w-full px-4 py-2.5 rounded-full glass text-gray-900 font-medium transition-opacity hover:opacity-70 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isLoading"
              @click="handleSubmit"
            >
              {{ isLoading ? 'Loading...' : isLogin ? 'Login' : 'Sign up' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <menu-planner v-else />
    <action-buttons
      v-if="isAuthenticated && menuActions"
      :is-sending="isSending"
      @reset="handleReset"
      @send="handleShowConfirm"
      @open-dishes="handleOpenDishes"
      @open-profile="handleOpenProfile"
    />
    <confirm-menu-modal
      v-if="isAuthenticated"
      :is-open="isConfirmModalOpen"
      :week-days="weekDays"
      :selected-menu="selectedMenu"
      :is-sending="isSending"
      @edit="closeConfirmModal"
      @confirm="handleConfirmSend"
    />
    <profile-settings-modal
      :is-open="isProfileModalOpen"
      @close="closeProfileModal"
      @save="handleSaveProfileSettings"
    />
    <email-confirmation-modal
      :is-open="isEmailConfirmationModalOpen"
      :email="confirmationEmail"
      @close="closeEmailConfirmationModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useMenuState } from '@/composables/useMenuState'
import MenuPlanner from '../components/MenuPlanner.vue'
import ActionButtons from '../components/ActionButtons.vue'
import EmailConfirmationModal from '../components/EmailConfirmationModal.vue'
import ProfileSettingsModal from '../components/ProfileSettingsModal.vue'
import ConfirmMenuModal from '../components/ConfirmMenuModal.vue'

definePageMeta({
  layout: 'default',
})

const { isAuthenticated, loadSession, login, signup } = useAuth()
const isEmailConfirmationModalOpen = ref(false)
const isProfileModalOpen = ref(false)
const isConfirmModalOpen = ref(false)
const confirmationEmail = ref('')
const isLogin = ref(true)
const email = ref('')
const password = ref('')
const authError = ref('')
const isLoading = ref(false)

const menuActions = inject<{
  resetMenu: () => void
  sendMenu: () => Promise<void>
  isSending: { value: boolean }
}>('menuActions', {
  resetMenu: () => {},
  sendMenu: async () => {},
  isSending: { value: false },
})

const { weekDays, selectedMenu, isSending: isSendingState } = useMenuState()

const isSending = computed(
  () => isSendingState.value || (menuActions?.isSending?.value ?? false),
)

const handleReset = () => {
  menuActions?.resetMenu()
}

const handleShowConfirm = () => {
  isConfirmModalOpen.value = true
}

const closeConfirmModal = () => {
  isConfirmModalOpen.value = false
}

const handleConfirmSend = async () => {
  isConfirmModalOpen.value = false
  await menuActions?.sendMenu()
}

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

const handleOpenProfile = () => {
  isProfileModalOpen.value = true
}

const closeProfileModal = () => {
  isProfileModalOpen.value = false
}

const handleSaveProfileSettings = () => {
  closeProfileModal()
}

const handleOpenDishes = () => {
  navigateTo('/dishes')
}
</script>
