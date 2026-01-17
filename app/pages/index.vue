<template>
  <div class="space-y-10 pb-14 sm:pb-0">
    <div v-if="!isAuthenticated" class="flex justify-center">
      <div class="glass rounded-xl p-8 max-w-md w-full text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Taste of Us
        </h2>
        <p class="text-gray-600 mb-6">
          Please log in or sign up to start planning your weekly menu.
        </p>
        <button
          class="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          @click="() => openAuthModal()"
        >
          Get Started
        </button>
      </div>
    </div>

    <menu-planner v-else />
    <action-buttons
      v-if="isAuthenticated && menuActions"
      :is-sending="isSending"
      @reset="handleReset"
      @send="handleShowConfirm"
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
    <auth-modal
      :is-open="isAuthModalOpen"
      :default-mode="authMode"
      @close="closeAuthModal"
      @success="handleAuthSuccess"
      @email-confirmation="handleEmailConfirmation"
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
import AuthModal from '../components/AuthModal.vue'
import EmailConfirmationModal from '../components/EmailConfirmationModal.vue'
import ProfileSettingsModal from '../components/ProfileSettingsModal.vue'
import ConfirmMenuModal from '../components/ConfirmMenuModal.vue'

definePageMeta({
  layout: 'default',
})

const { isAuthenticated, loadSession } = useAuth()
const isAuthModalOpen = ref(false)
const isEmailConfirmationModalOpen = ref(false)
const isProfileModalOpen = ref(false)
const isConfirmModalOpen = ref(false)
const confirmationEmail = ref('')
const authMode = ref<'login' | 'signup'>('login')

const menuActions = inject<{
  resetMenu: () => void
  sendMenu: () => Promise<void>
  isSending: { value: boolean }
}>(
  'menuActions',
  {
    resetMenu: () => {},
    sendMenu: async () => {},
    isSending: { value: false },
  },
)

const { weekDays, selectedMenu, isSending: isSendingState } = useMenuState()

const isSending = computed(() => isSendingState.value || (menuActions?.isSending?.value ?? false))

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

const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
  authMode.value = mode
  isAuthModalOpen.value = true
}

const closeAuthModal = () => {
  isAuthModalOpen.value = false
}

const handleAuthSuccess = () => {
  loadSession()
  closeAuthModal()
}

const handleEmailConfirmation = (email: string) => {
  confirmationEmail.value = email
  isEmailConfirmationModalOpen.value = true
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
</script>
