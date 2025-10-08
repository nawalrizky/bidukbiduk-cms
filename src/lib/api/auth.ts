import axios from 'axios'
import { CookieManager } from '@/lib/utils/cookies'

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
  rememberMe?: boolean
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
  token?: string
}

// Auth API functions
export const authService = {
    // Login
  async login(username: string, password: string, rememberMe: boolean = false): Promise<LoginResult> {
    try {
      const response = await authApi.post('/auth/login', { username, password })
      
      // Store auth data with new token structure
      if (response.data) {
        this.storeAuthData(response.data, rememberMe)
      }
      
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

  // Logout - clear all auth data
  logout(): void {
    console.log('Logging out user')
    
    if (typeof window !== 'undefined') {
      // Clear all storage methods
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('user_data')
      
      CookieManager.deleteCookie('auth_token')
      CookieManager.deleteCookie('user_data')
      
      // Also remove old cookies for compatibility
      if (typeof document !== 'undefined') {
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      }
    }
  },

  // Clear invalid auth data
  clearInvalidData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      sessionStorage.removeItem('user_data')
      CookieManager.deleteCookie('user_data')
    }
  },

  // Get current user (check cookies first, then sessionStorage, then localStorage for compatibility)
  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      try {
        // Check cookies first (persistent login)
        let userStr = CookieManager.getCookie('user_data')
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
          const userData = JSON.parse(userStr)
          return {
            id: userData.user_id.toString(),
            username: userData.username,
            email: userData.email,
            full_name: userData.full_name
          }
        }
        
        // Check sessionStorage (session login)
        userStr = sessionStorage.getItem('user_data')
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
          const userData = JSON.parse(userStr)
          return {
            id: userData.user_id.toString(),
            username: userData.username,
            email: userData.email,
            full_name: userData.full_name
          }
        }
        
        // Fallback to localStorage for compatibility
        userStr = localStorage.getItem('user')
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
          return JSON.parse(userStr)
        }
        
        return null
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Clear invalid data
        this.clearInvalidData()
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
  storeAuthData(authResponse: AuthResponse, rememberMe: boolean = false): void {
    console.log('Storing auth data:', authResponse, 'Remember me:', rememberMe)
    
    if (typeof window !== 'undefined') {
      try {
        // Use the token from the response (current API structure)
        const token = authResponse.token
        
        if (rememberMe) {
          // Store in cookies for persistent login (30 days)
          CookieManager.setCookie('auth_token', token, 30)
          CookieManager.setCookie('user_data', JSON.stringify({
            user_id: authResponse.user_id,
            username: authResponse.username,
            email: authResponse.email,
            full_name: authResponse.full_name,
            last_login: authResponse.last_login
          }), 30)
          console.log('Auth data stored in cookies for 30 days')
        } else {
          // Store in sessionStorage for session-only login
          sessionStorage.setItem('auth_token', token)
          sessionStorage.setItem('user_data', JSON.stringify({
            user_id: authResponse.user_id,
            username: authResponse.username,
            email: authResponse.email,
            full_name: authResponse.full_name,
            last_login: authResponse.last_login
          }))
          console.log('Auth data stored in sessionStorage')
        }
        
        // Also store in localStorage for compatibility (will be removed later)
        localStorage.setItem('access_token', token)
        const user: User = {
          id: authResponse.user_id.toString(),
          username: authResponse.username,
          email: authResponse.email,
          full_name: authResponse.full_name
        }
        localStorage.setItem('user', JSON.stringify(user))
        
        console.log('Auth data stored successfully')
      } catch (error) {
        console.error('Error storing auth data:', error)
      }
    }
  },

  // Get access token (check cookies first, then sessionStorage, then localStorage for compatibility)
  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      // Check cookies first (persistent login)
      let token = CookieManager.getCookie('auth_token')
      if (token && token !== 'undefined' && token !== 'null') {
        return token
      }
      
      // Check sessionStorage (session login)
      token = sessionStorage.getItem('auth_token')
      if (token && token !== 'undefined' && token !== 'null') {
        return token
      }
      
      // Fallback to localStorage for compatibility
      token = localStorage.getItem('access_token')
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
