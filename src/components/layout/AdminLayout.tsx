"use client"

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/lib/api/auth'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const { isAuthenticated, setUser } = useAuth()
  const pathname = usePathname()

  // Check if current route is an auth route
  const isAuthRoute = pathname.startsWith('/auth')

  // Only check auth for non-auth routes, and only once
  useEffect(() => {
    if (!isAuthRoute && !authChecked) {
      console.log('AdminLayout: Checking auth for protected page:', pathname)
      
      try {
        const token = authService.getAccessToken()
        const currentUser = authService.getCurrentUser()
        
        if (token && currentUser) {
          console.log('User is authenticated, setting user in context')
          setUser(currentUser)
        } else {
          console.log('No valid auth found, redirecting to login')
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        authService.logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
      }
      
      setAuthChecked(true)
    }
  }, [isAuthRoute, authChecked, pathname, setUser])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // For auth routes, don't show admin layout at all
  if (isAuthRoute) {
    return <>{children}</>
  }

  // Show loading while auth is being checked for the first time
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // At this point, auth has been checked and user should be authenticated
  // If not authenticated, the useEffect above would have redirected
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Main content area */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
      }`}>
        <Header onMenuToggle={toggleSidebar} />
        
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
