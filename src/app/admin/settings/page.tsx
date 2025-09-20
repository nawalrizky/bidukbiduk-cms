import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, User, Shield, Globe, Bell, Database } from 'lucide-react'

const settingsCategories = [
  {
    title: "General Settings",
    description: "Basic site configuration and preferences",
    icon: Settings,
    items: [
      { label: "Site Name", value: "BidukBiduk CMS" },
      { label: "Site Description", value: "Traditional boat content management" },
      { label: "Admin Email", value: "admin@bidukbiduk.com" },
      { label: "Timezone", value: "UTC+7 (Jakarta)" }
    ]
  },
  {
    title: "User Management",
    description: "Manage user roles and permissions",
    icon: User,
    items: [
      { label: "Default User Role", value: "Contributor" },
      { label: "Registration", value: "Admin Approval Required" },
      { label: "Password Policy", value: "Strong (8+ chars, mixed case)" },
      { label: "Session Timeout", value: "24 hours" }
    ]
  },
  {
    title: "Security",
    description: "Security and privacy settings",
    icon: Shield,
    items: [
      { label: "Two-Factor Auth", value: "Enabled" },
      { label: "Login Attempts", value: "5 max attempts" },
      { label: "IP Whitelist", value: "Disabled" },
      { label: "SSL Certificate", value: "Active" }
    ]
  },
  {
    title: "Content Settings",
    description: "Content publishing and moderation",
    icon: Globe,
    items: [
      { label: "Auto-publish", value: "Disabled" },
      { label: "Content Moderation", value: "Manual Review" },
      { label: "SEO Optimization", value: "Enabled" },
      { label: "Comment System", value: "Enabled with Moderation" }
    ]
  }
]

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-gray-600">
            Configure your CMS settings and preferences
          </p>
        </div>
        
        <div className="grid gap-6">
          {settingsCategories.map((category) => (
            <Card key={category.title}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <category.icon className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {category.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm text-gray-600">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">
                    Edit {category.title}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-orange-600" />
                <div>
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <CardDescription>Manage email and system notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive updates via email</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Push Notifications</p>
                    <p className="text-xs text-gray-500">Browser push notifications</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Weekly Reports</p>
                    <p className="text-xs text-gray-500">Automated analytics reports</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-green-600" />
                <div>
                  <CardTitle className="text-lg">Data Management</CardTitle>
                  <CardDescription>Backup and data export options</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Automatic Backups</p>
                    <p className="text-xs text-gray-500">Daily at 2:00 AM UTC</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Last Backup</p>
                    <p className="text-xs text-gray-500">Today at 2:00 AM</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Export Data</p>
                    <p className="text-xs text-gray-500">Export all content as JSON/CSV</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <p className="text-sm font-medium text-red-800">Reset All Settings</p>
                  <p className="text-xs text-red-600">Restore all settings to default values</p>
                </div>
                <Button variant="destructive" size="sm">
                  Reset Settings
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <p className="text-sm font-medium text-red-800">Delete All Content</p>
                  <p className="text-xs text-red-600">Permanently delete all articles and media</p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Content
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
