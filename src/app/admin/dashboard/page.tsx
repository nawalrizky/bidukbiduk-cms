import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, FileText, Users, TrendingUp } from 'lucide-react'

const stats = [
  {
    title: "Total Content",
    value: "156",
    description: "Published articles",
    icon: FileText,
    trend: "+12% from last month"
  },
  {
    title: "Page Views",
    value: "24,567",
    description: "This month",
    icon: BarChart3,
    trend: "+18% from last month"
  },
  {
    title: "Active Users",
    value: "1,234",
    description: "Monthly active users",
    icon: Users,
    trend: "+8% from last month"
  },
  {
    title: "Engagement Rate",
    value: "68%",
    description: "Average engagement",
    icon: TrendingUp,
    trend: "+5% from last month"
  }
]

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-gray-600">
            Overview of your content management system
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600">
                  {stat.description}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest content updates and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">New article published: &ldquo;Boat Safety Tips&rdquo;</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">User profile updated</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Content moderation required</p>
                    <p className="text-xs text-gray-500">6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Create New Article</div>
                  <div className="text-sm text-gray-500">Start writing a new blog post</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Manage Users</div>
                  <div className="text-sm text-gray-500">View and edit user accounts</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-sm text-gray-500">Check detailed performance metrics</div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
