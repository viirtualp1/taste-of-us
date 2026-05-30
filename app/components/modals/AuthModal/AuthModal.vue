<template>
  <BottomSheet
    :is-open="isOpen"
    :title="isLogin ? 'Login' : 'Sign Up'"
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
        class="w-full px-4 py-2.5 rounded-[12px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
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
        class="w-full px-4 py-2.5 rounded-[12px] border glass-nested focus:border-green-400/60 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all"
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
      <div class="flex gap-3 p-4 sm:p-6">
        <button
          class="flex-1 px-4 py-2.5 rounded-[12px] glass-nested border border-gray-200/50 text-gray-700 font-medium hover:border-green-300/60 hover:bg-green-50/40 transition-all"
          @click="closeModal"
        >
          Cancel
        </button>
        <button
          class="flex-1 px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading"
          @click="handleSubmit"
        >
          {{ isLoading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up' }}
        </button>
      </div>
    </template>
  </BottomSheet>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import BottomSheet from '@/components/ui/BottomSheet.vue'

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
