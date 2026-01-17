import { ref, computed } from 'vue'

interface User {
  id: string
  email?: string
}

interface Session {
  access_token: string
  refresh_token: string
  expires_at?: number
}

const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const isLoading = ref(true)

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value && !!session.value)

  const loadSession = () => {
    if (typeof window === 'undefined') return

    try {
      const storedSession = localStorage.getItem('supabase_session')
      const storedUser = localStorage.getItem('supabase_user')

      if (storedSession && storedUser) {
        session.value = JSON.parse(storedSession)
        user.value = JSON.parse(storedUser)
      }
    } catch (error) {
      console.error('Error loading session:', error)
      clearSession()
    } finally {
      isLoading.value = false
    }
  }

  const saveSession = (newUser: User, newSession: Session) => {
    if (typeof window === 'undefined') return

    user.value = newUser
    session.value = newSession

    localStorage.setItem('supabase_session', JSON.stringify(newSession))
    localStorage.setItem('supabase_user', JSON.stringify(newUser))
  }

  const clearSession = () => {
    if (typeof window === 'undefined') return

    user.value = null
    session.value = null

    localStorage.removeItem('supabase_session')
    localStorage.removeItem('supabase_user')
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await $fetch<{
        user: User
        session: Session
      }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })

      saveSession(response.user, response.session)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error?.data?.message || error?.message || 'Login failed',
      }
    }
  }

  const signup = async (email: string, password: string) => {
    try {
      const response = await $fetch<{
        user: User
        session: Session
      }>('/api/auth/signup', {
        method: 'POST',
        body: { email, password },
      })

      saveSession(response.user, response.session)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error?.data?.message || error?.message || 'Signup failed',
      }
    }
  }

  const logout = () => {
    clearSession()
    if (typeof window !== 'undefined') {
      navigateTo('/')
    }
  }

  const handleAuthError = (error: any) => {
    if (error?.statusCode === 401 || error?.data?.statusCode === 401) {
      logout()
      return true
    }
    return false
  }

  const confirmEmail = async (token: string, type?: string) => {
    try {
      // Exchange the confirmation token for a session
      const response = await $fetch<{
        user: User
        session: Session
      }>('/api/auth/confirm', {
        method: 'POST',
        body: { token, type },
      })

      if (response.user && response.session) {
        saveSession(response.user, response.session)
        return { success: true }
      } else {
        return {
          success: false,
          error: 'Failed to get session after confirmation',
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error:
          error?.data?.message || error?.message || 'Failed to confirm email',
      }
    }
  }

  const getAuthHeaders = (): Record<string, string> => {
    if (!session.value?.access_token) {
      return {}
    }

    return {
      Authorization: `Bearer ${session.value.access_token}`,
    }
  }

  // Load session on initialization
  if (typeof window !== 'undefined') {
    loadSession()
  }

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    confirmEmail,
    getAuthHeaders,
    loadSession,
    handleAuthError,
  }
}
