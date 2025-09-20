import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

console.log('API_BASE_URL:', API_BASE_URL)

// Create axios instance for auth
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auth types
export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  full_name: string
  phone_number: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirmRequest {
  token: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  user_id: number
  username: string
  email: string
  full_name: string
  token: string
  last_login?: string
  refresh?: string
}

export interface LoginResult {
  success: boolean
  data?: AuthResponse
  error?: string
}

export interface User {
  id: string
  username: string
  email?: string
  full_name?: string
  phone_number?: string
}

// Auth API functions
export const authService = {
    // Login
  async login(credentials: LoginRequest): Promise<LoginResult> {
    try {
      const response = await authApi.post('/auth/login', credentials)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      // Type guard for axios error
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          // Handle authentication failures with user-friendly message
          const errorData = error.response.data
          if (errorData?.error === 'authentication_failed' || errorData?.detail?.includes('credentials')) {
            return {
              success: false,
              error: 'Username atau password salah. Silakan coba lagi.'
            }
          }
        }
        
        // Extract other error messages from the API response
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.detail ||
                            'Login gagal. Silakan coba lagi.'
        
        return {
          success: false,
          error: errorMessage
        }
      }
      
      return {
        success: false,
        error: 'Login gagal. Silakan coba lagi.'
      }
    }
  },

  // Register
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('Registering user with data:', userData)
      const response = await authApi.post('/auth/register', userData)
      return response.data
    } catch (error) {
      console.error('Registration error:', error)
      
      // Type guard for axios error
      if (axios.isAxiosError(error)) {
        console.error('Error response:', error.response?.data)
        
        // Handle validation errors with detailed field-specific messages
        if (error.response?.data?.error === 'validation_error' && error.response?.data?.detail) {
          const validationErrors = error.response.data.detail
          const errorMessages: string[] = []
          
          // Extract field-specific error messages
          Object.keys(validationErrors).forEach(field => {
            const fieldErrors = validationErrors[field]
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach(msg => {
                errorMessages.push(`${field}: ${msg}`)
              })
            }
          })
          
          throw new Error(errorMessages.join('\n'))
        }
        
        // Extract general error message
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            'Registration failed. Please try again.'
        
        throw new Error(errorMessage)
      }
      
      throw new Error('Registration failed. Please try again.')
    }
  },

  // Password reset request
  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    try {
      const response = await authApi.post('/auth/password/reset', data)
      return response.data
    } catch (error) {
      console.error('Password reset request error:', error)
      throw error
    }
  },

  // Password reset confirm
  async confirmPasswordReset(data: PasswordResetConfirmRequest): Promise<{ message: string }> {
    try {
      const response = await authApi.post('/auth/password/reset/confirm', data)
      return response.data
    } catch (error) {
      console.error('Password reset confirm error:', error)
      throw error
    }
  },

  // Logout
  logout(): void {
    console.log('Logging out user')
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      
      // Also remove cookies
      if (typeof document !== 'undefined') {
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      }
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user')
        console.log('Raw user data from localStorage:', userStr)
        
        // Check if userStr exists and is not 'undefined' string
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
          return JSON.parse(userStr)
        }
        return null
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
        // Clear invalid data
        localStorage.removeItem('user')
        return null
      }
    }
    return null
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      console.log('Checking authentication, token exists:', !!token)
      return !!(token && token !== 'undefined' && token !== 'null')
    }
    return false
  },

  // Store auth data
  storeAuthData(authResponse: AuthResponse): void {
    console.log('Storing auth data:', authResponse)
    
    if (typeof window !== 'undefined') {
      try {
        // Store the token as access_token
        localStorage.setItem('access_token', authResponse.token)
        if (authResponse.refresh) {
          localStorage.setItem('refresh_token', authResponse.refresh)
        }
        
        // Create user object from response
        const user: User = {
          id: authResponse.user_id.toString(),
          username: authResponse.username,
          email: authResponse.email,
          full_name: authResponse.full_name
        }
        localStorage.setItem('user', JSON.stringify(user))
        
        // Also set cookies for SSR middleware
        if (typeof document !== 'undefined') {
          document.cookie = `access_token=${authResponse.token}; path=/; max-age=86400; SameSite=strict`
          if (authResponse.refresh) {
            document.cookie = `refresh_token=${authResponse.refresh}; path=/; max-age=604800; SameSite=strict`
          }
        }
        
        console.log('Auth data stored successfully')
      } catch (error) {
        console.error('Error storing auth data:', error)
      }
    }
  },

  // Get access token
  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      return (token && token !== 'undefined' && token !== 'null') ? token : null
    }
    return null
  }
}

// Add request interceptor to include auth token
authApi.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`
    console.log('Making request to:', fullUrl)
    console.log('Request data:', config.data)
    
    const token = authService.getAccessToken()
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle token expiration
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only logout and clear tokens if this was an authenticated request
      // (i.e., request had Authorization header), not for login failures
      const hasAuthHeader = error.config?.headers?.Authorization;
      
      if (hasAuthHeader) {
        // This was an authenticated request that failed - token is invalid/expired
        authService.logout()
      }
      // If no auth header, this is likely a login failure - let the component handle it
    }
    return Promise.reject(error)
  }
)
