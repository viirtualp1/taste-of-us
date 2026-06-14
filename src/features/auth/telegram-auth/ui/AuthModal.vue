<template>
  <BottomSheet
    :is-open="isOpen"
    :title="isLogin ? 'Login' : 'Sign Up'"
    content-class="p-4 sm:p-6 space-y-4"
    @close="closeModal"
  >
    <TouAlert v-if="error">{{ error }}</TouAlert>

    <div>
      <TouFieldLabel for="email">Email</TouFieldLabel>
      <TouInput
        id="email"
        v-model="email"
        type="email"
        placeholder="your@email.com"
        @keyup.enter="handleSubmit"
      />
    </div>

    <div>
      <TouFieldLabel for="password">Password</TouFieldLabel>
      <TouInput
        id="password"
        v-model="password"
        type="password"
        placeholder="••••••••"
        @keyup.enter="handleSubmit"
      />
    </div>

    <div class="text-center pt-2">
      <button
        class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        @click="toggleMode"
      >
        {{
          isLogin
            ? "Don't have an account? Sign up"
            : 'Already have an account? Login'
        }}
      </button>
    </div>

    <template #footer>
      <TouModalFooter
        cancel-label="Cancel"
        :confirm-label="isLogin ? 'Login' : 'Sign Up'"
        loading-label="Loading..."
        :loading="isLoading"
        @cancel="closeModal"
        @confirm="handleSubmit"
      />
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/entities/user'
import {
  BottomSheet,
  TouAlert,
  TouFieldLabel,
  TouInput,
  TouModalFooter,
} from '@/shared/ui'

interface Props {
  isOpen: boolean
  defaultMode?: 'login' | 'signup'
}

const props = withDefaults(defineProps<Props>(), {
  defaultMode: 'login',
})

const emit = defineEmits<{
  close: []
  success: []
  'email-confirmation': [email: string]
}>()

const { login, signup } = useAuth()
const isLogin = ref(props.defaultMode === 'login')
const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
}

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const result = isLogin.value
      ? await login(email.value, password.value)
      : await signup(email.value, password.value)

    if (result.success) {
      if (isLogin.value) {
        emit('success')
        closeModal()
      } else {
        emit('email-confirmation', email.value)
        closeModal()
      }
    } else {
      error.value = result.error || 'An error occurred'
    }
  } catch (err: any) {
    error.value = err?.message || 'An error occurred'
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  email.value = ''
  password.value = ''
  error.value = ''
  emit('close')
}
</script>
