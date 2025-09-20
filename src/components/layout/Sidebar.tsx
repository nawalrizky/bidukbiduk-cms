"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Camera, 
  BarChart3, 
  Upload, 
  Globe,
  MapPin,
  Building,
  Package,
  MessageCircle,
  Map,
  LogOut,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  {
    name: 'Gallery',
    href: '/gallery',
    icon: Camera,
  },
  {
    name: 'Socmed Analytics',
    href: '/socmed-analytics',
    icon: BarChart3,
  },
  {
    name: 'Socmed Uploader',
    href: '/socmed-uploader',
    icon: Upload,
  },
  {
    name: 'Website Analytics',
    href: '/website-analytics',
    icon: Globe,
  },
  {
    name: 'Destination',
    href: '/destination',
    icon: MapPin,
  },
  {
    name: 'Hotel',
    href: '/hotel',
    icon: Building,
  },
  {
    name: 'Package',
    href: '/package',
    icon: Package,
  },
  {
    name: 'Chatbot',
    href: '/chatbot',
    icon: MessageCircle,
  },
  {
    name: 'GIS',
    href: '/gis',
    icon: Map,
  },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-sm",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <Link href='/' className="text-xl font-semibold text-black">CMS Dashboard</Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden text-black hover:bg-blue-50"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mx-2",
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                        : "text-black hover:bg-blue-50 hover:text-blue-700"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <Button
            variant="ghost"
            className="w-full justify-start text-black hover:bg-blue-50 hover:text-blue-700"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </>
  )
}
