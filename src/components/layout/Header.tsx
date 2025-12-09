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
                Selamat datang kembali, {user.full_name || user.username}!
              </h2>
            </div>
          )}
        </div>
        
      </div>
    </header>
  )
}
