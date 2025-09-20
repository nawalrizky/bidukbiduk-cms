import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react'

const analyticsData = [
  {
    title: "Page Views",
    value: "24,567",
    change: "+12.5%",
    trend: "up",
    icon: Eye
  },
  {
    title: "Unique Visitors",
    value: "8,293",
    change: "+8.2%",
    trend: "up",
    icon: Users
  },
  {
    title: "Bounce Rate",
    value: "34.2%",
    change: "-2.1%",
    trend: "down",
    icon: TrendingUp
  },
  {
    title: "Avg. Session",
    value: "4m 32s",
    change: "+15.3%",
    trend: "up",
    icon: BarChart3
  }
]

const topContent = [
  { title: "Boat Safety Tips", views: 5420, engagement: "68%" },
  { title: "Traditional Fishing Methods", views: 4280, engagement: "72%" },
  { title: "Marine Conservation", views: 3890, engagement: "65%" },
  { title: "Boat Maintenance Guide", views: 3560, engagement: "70%" },
  { title: "Fishing Equipment Reviews", views: 2980, engagement: "63%" }
]

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-gray-600">
            Track your content performance and user engagement
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {analyticsData.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <metric.icon className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                } mt-1`}>
                  {metric.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Overview</CardTitle>
              <CardDescription>
                Website traffic for the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization would go here</p>
                  <p className="text-sm text-gray-400">Integration with chart library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>
                Most viewed articles this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topContent.map((content, index) => (
                  <div key={content.title} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{content.title}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{content.views.toLocaleString()} views</span>
                        <span>{content.engagement} engagement</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Organic Search</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div className="w-12 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Direct</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div className="w-8 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">30%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Social Media</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div className="w-6 h-2 bg-purple-600 rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Age 18-24</span>
                  <span className="text-sm font-medium">22%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Age 25-34</span>
                  <span className="text-sm font-medium">35%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Age 35-44</span>
                  <span className="text-sm font-medium">28%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Age 45+</span>
                  <span className="text-sm font-medium">15%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Device Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Desktop</span>
                  <span className="text-sm font-medium">52%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mobile</span>
                  <span className="text-sm font-medium">38%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tablet</span>
                  <span className="text-sm font-medium">10%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
