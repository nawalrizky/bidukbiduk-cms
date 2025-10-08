"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { authService, User } from '@/lib/api/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false) // Start as false, no automatic checking

  // NO automatic auth checking on mount to prevent interference with login process
  // Auth will only be checked when user successfully logs in or when explicitly requested

  const login = async (username: string, password: string, rememberMe: boolean = false) => {
    try {
      setIsLoading(true)
      
      const loginResult = await authService.login(username, password, rememberMe)
      
      if (loginResult.success && loginResult.data) {
        // Create user object from response
        const user: User = {
          id: loginResult.data.user_id.toString(),
          username: loginResult.data.username,
          email: loginResult.data.email,
          full_name: loginResult.data.full_name,
          token: loginResult.data.token
        }
        
        setUser(user)
        return { success: true }
      } else {
        // Login failed - return the error message without throwing
        return { success: false, error: loginResult.error || 'Login gagal' }
      }
    } catch {
      // Only catch unexpected errors (network issues, etc.)
      authService.logout()
      setUser(null)
      return { success: false, error: 'Kesalahan jaringan. Silakan coba lagi.' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
