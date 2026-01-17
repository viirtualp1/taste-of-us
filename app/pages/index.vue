<template>
  <div class="space-y-10">
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
          @click="openAuthModal"
        >
          Get Started
        </button>
      </div>
    </div>
    <MenuPlanner v-else />
    <AuthModal
      :is-open="isAuthModalOpen"
      :default-mode="authMode"
      @close="closeAuthModal"
      @success="handleAuthSuccess"
      @email-confirmation="handleEmailConfirmation"
    />
    <EmailConfirmationModal
      :is-open="isEmailConfirmationModalOpen"
      :email="confirmationEmail"
      @close="closeEmailConfirmationModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MenuPlanner from '../components/MenuPlanner.vue'
import AuthModal from '../components/AuthModal.vue'
import EmailConfirmationModal from '../components/EmailConfirmationModal.vue'
import { useAuth } from '@/composables/useAuth'

definePageMeta({
  layout: 'default',
})

const { isAuthenticated, loadSession } = useAuth()
const isAuthModalOpen = ref(false)
const isEmailConfirmationModalOpen = ref(false)
const confirmationEmail = ref('')
const authMode = ref<'login' | 'signup'>('login')

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
</script>
