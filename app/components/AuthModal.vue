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
        class="fixed inset-0 z-50 flex items-center justify-center"
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
            class="relative z-50 glass rounded-[20px] shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            style="border-radius: 20px;"
          >
            <div
              class="flex items-center justify-between p-4 border-b border-white/20"
            >
              <h2 class="text-xl font-bold text-gray-900">
                {{ isLogin ? 'Login' : 'Sign Up' }}
              </h2>
              <button
                class="flex items-center rounded-[12px] p-2 hover:bg-white/20 transition-colors"
                @click="closeModal"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div class="p-6 space-y-4">
              <div
                v-if="error"
                class="bg-red-50 border border-red-200 rounded-[16px] p-3"
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
                  class="w-full px-4 py-2 rounded-[12px] border glass-nested focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
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
                  class="w-full px-4 py-2 rounded-[12px] border glass-nested focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                  @keyup.enter="handleSubmit"
                />
              </div>

              <div class="flex gap-3">
                <button
                  class="flex-1 px-4 py-2 rounded-[12px] glass-nested text-gray-700 font-medium hover:bg-white/50 transition-colors"
                  @click="closeModal"
                >
                  Cancel
                </button>
                <button
                  class="flex-1 px-4 py-2 rounded-[12px] bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="isLoading"
                  @click="handleSubmit"
                >
                  {{ isLoading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up' }}
                </button>
              </div>

              <div class="text-center">
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
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

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
        // For signup, show email confirmation modal
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
