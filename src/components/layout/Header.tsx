"use client"

import React, { useState } from 'react'
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <header className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden mr-2 text-black hover:bg-blue-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {user && (
            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold text-black">
                Welcome back, {user.full_name || user.username}!
              </h2>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          
          
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-black hover:bg-blue-50"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <User className="h-5 w-5" />
            </Button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="py-1">
                  {user && (
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-black">{user.full_name || user.username}</p>
                      {user.email && <p className="text-xs text-gray-500">{user.email}</p>}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      // Add settings navigation here
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Pengaturan
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      handleLogout()
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
