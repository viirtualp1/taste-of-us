<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="glass rounded-[20px] p-8 max-w-md w-full text-center" style="border-radius: 20px;">
      <div v-if="isLoading" class="space-y-4">
        <div class="flex items-center justify-center">
          <div
            class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center animate-spin"
          >
            <Icon name="heroicons:arrow-path" class="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 class="text-xl font-bold text-gray-900">
          Confirming your email...
        </h2>
        <p class="text-sm text-gray-600">Please wait</p>
      </div>

      <div v-else-if="error" class="space-y-4">
        <div class="flex items-center justify-center">
          <div
            class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center"
          >
            <Icon name="heroicons:x-circle" class="w-8 h-8 text-red-600" />
          </div>
        </div>
        <h2 class="text-xl font-bold text-gray-900">Confirmation Failed</h2>
        <p class="text-sm text-gray-600">{{ error }}</p>
        <button
          class="mt-4 px-6 py-2 rounded-[12px] bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
          @click="$router.push('/')"
        >
          Go to Home
        </button>
      </div>

      <div v-else class="space-y-4">
        <div class="flex items-center justify-center">
          <div
            class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"
          >
            <Icon
              name="heroicons:check-circle"
              class="w-8 h-8 text-green-600"
            />
          </div>
        </div>
        <h2 class="text-xl font-bold text-gray-900">Email Confirmed!</h2>
        <p class="text-sm text-gray-600">
          Your email has been confirmed. Redirecting you...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const { confirmEmail, loadSession } = useAuth()

const isLoading = ref(true)
const error = ref('')

onMounted(async () => {
  // Supabase sends token as 'token' or 'token_hash' in query params
  const token =
    (route.query.token as string) || (route.query.token_hash as string)
  const type = (route.query.type as string) || 'email'

  if (!token) {
    error.value = 'Missing confirmation token'
    isLoading.value = false
    return
  }

  try {
    const result = await confirmEmail(token, type)

    if (result.success) {
      // Reload session to update auth state
      loadSession()
      // Wait a bit for user to see success message
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      error.value = result.error || 'Failed to confirm email'
    }
  } catch (err: unknown) {
    const apiError = err as { message?: string }
    error.value = apiError?.message || 'An error occurred'
  } finally {
    isLoading.value = false
  }
})
</script>
